import { describe, expect, it, vi } from "vitest";
import type { User } from "@/lib/db/schema";
import { IdentityError } from "@/lib/identity/identity-service";
import { buildApi } from "@/server/app";

const admin = {
  id: "fc4fe825-bd42-4baa-9a9f-1fb8d7d98277",
  name: "Admin",
  email: "admin@aula.test",
  role: "admin",
  status: "active",
  accessUntil: null,
  passwordHash: "hash",
  mustChangePassword: false,
  sessionVersion: 1,
  suspendedAt: null,
  revokedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

const identity = () => ({
  login: vi.fn(async () => ({ ...admin, passwordHash: undefined })),
  listUsers: vi.fn(async () => []),
  getUser: vi.fn(async () => admin),
  createUser: vi.fn(async () => ({ user: admin, initialPassword: "Aula-inicial-2026!" })),
  updateUser: vi.fn(async () => admin),
  extendAccess: vi.fn(async () => admin),
  changePassword: vi.fn(async () => ({ ...admin, sessionVersion: 2 })),
});

const sessions = (actor: User | null = admin) => ({
  create: vi.fn(async () => ({ token: "opaque-token", record: { session: { id: "session", absoluteExpiresAt: new Date("2026-09-01T00:00:00Z") } } })),
  rotate: vi.fn(async () => ({ token: "rotated-token", record: { session: { id: "rotated", absoluteExpiresAt: new Date("2026-09-01T00:00:00Z") } } })),
  resolve: actor ? vi.fn(async () => ({ user: actor, device: { id: "device", name: "Chrome" } })) : vi.fn(async () => { throw new (await import("@/lib/sessions/session-service")).SessionError("AUTH_REQUIRED", 401); }),
  revoke: vi.fn(async () => undefined),
  toPublicSession: vi.fn(() => ({ id: "session" })),
});

describe("M07 API integration", () => {
  it("crea una cookie __Host- opaca y segura al iniciar sesión", async () => {
    const sessionService = sessions(admin);
    const app = buildApi({ identity: identity() as never, sessions: sessionService as never });
    const response = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: "admin@aula.test", password: "Clave-segura-2026!", device_id: "60e746de-1887-49a1-91ea-b0768f8b1208", device_name: "Chrome" } });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toEqual(expect.stringContaining("__Host-aula_session=opaque-token"));
    expect(response.headers["set-cookie"]).toEqual(expect.stringContaining("HttpOnly"));
    expect(response.headers["set-cookie"]).toEqual(expect.stringContaining("Secure"));
    expect(response.headers["set-cookie"]).toEqual(expect.stringContaining("SameSite=Lax"));
    expect(response.headers["set-cookie"]).not.toContain("Domain=");
    await app.close();
  });

  it("responde login no enumerativo y conserva request_id", async () => {
    const service = identity();
    service.login.mockRejectedValueOnce(new IdentityError("AUTH_INVALID_CREDENTIALS", 401) as never);
    const app = buildApi({ identity: service as never, sessions: sessions(null) as never });
    const requestId = "9b191d15-c7f7-4b2a-97a0-190681a74fa8";
    const response = await app.inject({ method: "POST", url: "/api/v1/auth/login", headers: { "x-request-id": requestId }, payload: { email: "nadie@aula.test", password: "incorrecta", device_id: "60e746de-1887-49a1-91ea-b0768f8b1208", device_name: "Chrome" } });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "AUTH_INVALID_CREDENTIALS", request_id: requestId });
    expect(response.headers["x-request-id"]).toBe(requestId);
    await app.close();
  });

  it("bloquea las rutas administrativas sin rol admin", async () => {
    const actor = { ...admin, role: "student" as const, accessUntil: new Date("2026-09-01T00:00:00Z") };
    const app = buildApi({ identity: identity() as never, sessions: sessions(actor) as never });
    const response = await app.inject({ method: "GET", url: "/api/v1/admin/users" });
    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("ADMIN_REQUIRED");
    await app.close();
  });

  it("permite CRUD administrativo a un actor autorizado", async () => {
    const service = identity();
    const app = buildApi({ identity: service as never, sessions: sessions(admin) as never });
    const response = await app.inject({ method: "POST", url: "/api/v1/admin/users", cookies: { "__Host-aula_session": "opaque" }, payload: { name: "Lucía", email: "lucia@aula.test", access_until: "2026-10-01T00:00:00Z" } });
    expect(response.statusCode).toBe(201);
    expect(response.json().data.initial_password).toBe("Aula-inicial-2026!");
    expect(service.createUser).toHaveBeenCalled();
    await app.close();
  });

  it("rota la sesión después de cambiar la contraseña", async () => {
    const service = identity();
    const sessionService = sessions(admin);
    const app = buildApi({ identity: service as never, sessions: sessionService as never });
    const response = await app.inject({ method: "POST", url: "/api/v1/auth/password", cookies: { "__Host-aula_session": "old-token" }, payload: { current_password: "Anterior-segura-2026!", new_password: "Nueva-segura-2026!" } });
    expect(response.statusCode).toBe(204);
    expect(service.changePassword).toHaveBeenCalled();
    expect(sessionService.revoke).toHaveBeenCalledWith("old-token", expect.any(String), "password_changed");
    expect(sessionService.rotate).toHaveBeenCalled();
    expect(response.headers["set-cookie"]).toEqual(expect.stringContaining("__Host-aula_session=rotated-token"));
    await app.close();
  });
});
