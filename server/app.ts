import { randomUUID } from "node:crypto";
import Fastify, { type FastifyRequest, type preHandlerHookHandler } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import type { User } from "@/lib/db/schema";
import { IdentityError, type IdentityService } from "@/lib/identity/identity-service";
import { AuthorizationError, authorizeContent, requireAdmin } from "@/lib/security/authorization";
import { SessionError, type SessionService } from "@/lib/sessions/session-service";
import { DocumentUploadError, type DocumentUploadService } from "@/lib/documents/upload-service";

declare module "fastify" {
  interface FastifyRequest {
    authUser: User | null;
  }
}

type IdentityOperations = Pick<IdentityService, "login" | "listUsers" | "getUser" | "createUser" | "updateUser" | "extendAccess" | "changePassword">;
type SessionOperations = Pick<SessionService, "create" | "rotate" | "resolve" | "revoke" | "toPublicSession">;

export type ApiDependencies = {
  identity: IdentityOperations;
  sessions: SessionOperations;
  documents?: Pick<DocumentUploadService, "upload">;
};

export const SESSION_COOKIE = "__Host-aula_session";
const sessionCookieOptions = { path: "/", httpOnly: true, secure: true, sameSite: "lax" as const };

const problemTitles: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "No pudimos iniciar sesión",
  AUTH_REQUIRED: "Necesitás iniciar sesión",
  ADMIN_REQUIRED: "No tenés permiso para esta acción",
  ACCOUNT_SUSPENDED: "Tu cuenta está suspendida",
  ACCOUNT_REVOKED: "Tu acceso fue revocado",
  ACCESS_EXPIRED: "Tu acceso está vencido",
  RATE_LIMITED: "Demasiados intentos",
  VALIDATION_FAILED: "Revisá los datos ingresados",
  RESOURCE_NOT_FOUND: "No encontramos este recurso",
  PAYLOAD_TOO_LARGE: "El archivo supera el límite permitido",
  UNSUPPORTED_MEDIA_TYPE: "El formato del archivo no es válido",
};

function validRequestId(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type RequestAuthenticator = (request: FastifyRequest) => Promise<User | null>;

export function adminAuthorizationHook(authenticateRequest: RequestAuthenticator): preHandlerHookHandler {
  return async (request) => {
    request.authUser = await authenticateRequest(request);
    requireAdmin(request.authUser);
  };
}

export function contentAuthorizationHook(authenticateRequest: RequestAuthenticator): preHandlerHookHandler {
  return async (request) => {
    request.authUser = await authenticateRequest(request);
    authorizeContent(request.authUser, new Date());
  };
}

export function buildApi(dependencies: ApiDependencies) {
  const app = Fastify({ logger: false, trustProxy: true });
  app.register(fastifyCookie);
  app.register(fastifyMultipart, { limits: { files: 1, fields: 3, fileSize: 25 * 1024 * 1024 } });
  app.decorateRequest("authUser", null);

  const authenticateRequest = async (request: FastifyRequest) => {
    const record = await dependencies.sessions.resolve(request.cookies[SESSION_COOKIE]);
    return record.user;
  };

  app.addHook("onRequest", async (request, reply) => {
    const incoming = request.headers["x-request-id"];
    const requestId = validRequestId(incoming) ? incoming as string : randomUUID();
    request.id = requestId;
    reply.header("X-Request-Id", requestId);
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof IdentityError || error instanceof AuthorizationError || error instanceof SessionError || error instanceof DocumentUploadError) {
      const status = error instanceof DocumentUploadError ? error.code === "PAYLOAD_TOO_LARGE" ? 413 : error.code === "UNSUPPORTED_MEDIA_TYPE" ? 415 : 422 : error.status;
      return reply.status(status).type("application/problem+json").send({
        type: `https://api.aula.test/problems/${error.code.toLowerCase().replaceAll("_", "-")}`,
        title: problemTitles[error.code] ?? "No pudimos completar la operación",
        status,
        code: error.code,
        request_id: request.id,
      });
    }
    request.log.error({ err: error, request_id: request.id }, "request_failed");
    return reply.status(500).type("application/problem+json").send({
      type: "https://api.aula.test/problems/internal-error",
      title: "No pudimos completar la operación",
      status: 500,
      code: "INTERNAL_ERROR",
      request_id: request.id,
    });
  });

  app.post<{ Body: { email: string; password: string; device_id: string; device_name: string; remember_me?: boolean } }>("/api/v1/auth/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password", "device_id", "device_name"],
        additionalProperties: false,
        properties: {
          email: { type: "string", format: "email", maxLength: 254 },
          password: { type: "string", minLength: 1, maxLength: 1024 },
          device_id: { type: "string", format: "uuid" },
          device_name: { type: "string", minLength: 1, maxLength: 100 },
          remember_me: { type: "boolean" },
        },
      },
    },
  }, async (request, reply) => {
    const user = await dependencies.identity.login({ email: request.body.email, password: request.body.password, ip: request.ip, requestId: request.id });
    const created = await dependencies.sessions.create(user, request.body.device_id, request.body.device_name, request.id);
    const maxAge = Math.max(1, Math.floor((created.record.session.absoluteExpiresAt.getTime() - Date.now()) / 1000));
    reply.setCookie(SESSION_COOKIE, created.token, { ...sessionCookieOptions, maxAge });
    return { data: dependencies.sessions.toPublicSession(created.record) };
  });

  app.get("/api/v1/auth/session", async (request) => ({ data: dependencies.sessions.toPublicSession(await dependencies.sessions.resolve(request.cookies[SESSION_COOKIE])) }));

  app.post("/api/v1/auth/logout", async (request, reply) => {
    await dependencies.sessions.revoke(request.cookies[SESSION_COOKIE], request.id);
    reply.clearCookie(SESSION_COOKIE, sessionCookieOptions);
    return reply.status(204).send();
  });

  app.post<{ Body: { current_password: string; new_password: string } }>("/api/v1/auth/password", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    const current = await dependencies.sessions.resolve(token);
    const updated = await dependencies.identity.changePassword(current.user, request.body.current_password, request.body.new_password, request.id);
    await dependencies.sessions.revoke(token, request.id, "password_changed");
    const rotated = await dependencies.sessions.rotate(updated, current.device, request.id);
    const maxAge = Math.max(1, Math.floor((rotated.record.session.absoluteExpiresAt.getTime() - Date.now()) / 1000));
    reply.setCookie(SESSION_COOKIE, rotated.token, { ...sessionCookieOptions, maxAge });
    return reply.status(204).send();
  });

  const adminOnly = adminAuthorizationHook(authenticateRequest);

  app.post("/api/v1/admin/documents", { preHandler: adminOnly }, async (request, reply) => {
    if (!dependencies.documents) throw new Error("document_upload_not_configured");
    const fields: Record<string, string> = {};
    let file: { name: string; bytes: Uint8Array } | undefined;
    for await (const part of request.parts()) {
      if (part.type === "file") {
        const bytes = await part.toBuffer();
        if (part.file.truncated) throw new DocumentUploadError("PAYLOAD_TOO_LARGE");
        file = { name: part.filename, bytes };
      } else fields[part.fieldname] = String(part.value);
    }
    if (!file) throw new DocumentUploadError("VALIDATION_FAILED");
    const result = await dependencies.documents.upload({
      title: fields.title ?? "", subjectId: fields.subject_id ?? "", type: fields.type as "note" | "guide" | "book" | "mock_exam",
      fileName: file.name, bytes: file.bytes, createdBy: request.authUser!.id,
      idempotencyKey: String(request.headers["idempotency-key"] ?? ""), requestId: request.id,
    });
    return reply.status(202).send({ data: result.document });
  });

  app.get("/api/v1/admin/users", { preHandler: adminOnly }, async (request) => ({ data: await dependencies.identity.listUsers(request.authUser!), meta: { page_size: 50, has_more: false, next_cursor: null } }));

  app.get<{ Params: { userId: string } }>("/api/v1/admin/users/:userId", { preHandler: adminOnly }, async (request) => ({ data: await dependencies.identity.getUser(request.authUser!, request.params.userId) }));

  app.post<{ Body: { name: string; email: string; access_until: string } }>("/api/v1/admin/users", { preHandler: adminOnly }, async (request, reply) => {
    const result = await dependencies.identity.createUser(request.authUser!, { name: request.body.name, email: request.body.email, accessUntil: new Date(request.body.access_until), requestId: request.id });
    return reply.status(201).send({ data: { user: result.user, initial_password: result.initialPassword } });
  });

  app.patch<{ Params: { userId: string }; Body: { name?: string; status?: User["status"]; reason?: string } }>("/api/v1/admin/users/:userId", { preHandler: adminOnly }, async (request) => ({
    data: await dependencies.identity.updateUser(request.authUser!, request.params.userId, { ...request.body, requestId: request.id }),
  }));

  app.post<{ Params: { userId: string }; Body: { access_until: string; reason: string } }>("/api/v1/admin/users/:userId/access-extensions", { preHandler: adminOnly }, async (request) => ({
    data: await dependencies.identity.extendAccess(request.authUser!, request.params.userId, new Date(request.body.access_until), request.body.reason, request.id),
  }));

  return app;
}
