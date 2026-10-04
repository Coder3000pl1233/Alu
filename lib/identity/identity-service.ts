import { createHmac } from "node:crypto";
import type { User } from "@/lib/db/schema";
import type { ApiErrorCode } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/security/authorization";
import { generateInitialPassword, hashPassword, verifyPassword, type PasswordPolicy } from "@/lib/security/passwords";
import type { IdentityStore } from "@/lib/identity/identity-store";

export class IdentityError extends Error {
  constructor(readonly code: ApiErrorCode, readonly status: number) {
    super(code);
    this.name = "IdentityError";
  }
}

export type LoginRatePolicy = {
  maximumFailures: number;
  windowMs: number;
};

export type IdentityServiceOptions = {
  rateLimitPepper: string;
  ratePolicy?: LoginRatePolicy;
  passwordPolicy?: PasswordPolicy;
  now?: () => Date;
};

export type LoginInput = {
  email: string;
  password: string;
  ip: string;
  requestId: string;
};

export type CreateManagedUserInput = {
  name: string;
  email: string;
  accessUntil: Date;
  requestId: string;
};

const DEFAULT_RATE_POLICY: LoginRatePolicy = { maximumFailures: 5, windowMs: 15 * 60_000 };

const safeUser = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    accessUntil: user.accessUntil,
    mustChangePassword: user.mustChangePassword,
    sessionVersion: user.sessionVersion,
    suspendedAt: user.suspendedAt,
    revokedAt: user.revokedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export class IdentityService {
  private dummyHash?: Promise<string>;
  private readonly now: () => Date;
  private readonly ratePolicy: LoginRatePolicy;

  constructor(private readonly store: IdentityStore, private readonly options: IdentityServiceOptions) {
    if (options.rateLimitPepper.length < 32) throw new Error("rateLimitPepper debe tener al menos 32 caracteres");
    this.now = options.now ?? (() => new Date());
    this.ratePolicy = options.ratePolicy ?? DEFAULT_RATE_POLICY;
  }

  private signalHash(value: string) {
    return createHmac("sha256", this.options.rateLimitPepper).update(value).digest("hex");
  }

  private getDummyHash() {
    this.dummyHash ??= hashPassword("Dummy-login-secret-2026!", this.options.passwordPolicy);
    return this.dummyHash;
  }

  async login(input: LoginInput) {
    const now = this.now();
    const email = input.email.trim().toLowerCase();
    const subjectHash = this.signalHash(`email:${email}`);
    const ipHash = this.signalHash(`ip:${input.ip}`);
    const since = new Date(now.getTime() - this.ratePolicy.windowMs);
    const failures = await this.store.countRecentFailedLogins(subjectHash, ipHash, since);

    if (failures >= this.ratePolicy.maximumFailures) {
      await this.store.recordAudit({ action: "auth.login", objectType: "user", result: "rate_limited", requestId: input.requestId });
      throw new IdentityError("RATE_LIMITED", 429);
    }

    const user = await this.store.findUserByEmail(email);
    const valid = await verifyPassword(user?.passwordHash ?? await this.getDummyHash(), input.password);
    const succeeded = Boolean(user && valid);
    await this.store.recordLoginAttempt(
      { subjectHash, ipHash, succeeded, attemptedAt: now },
      { actorId: succeeded ? user!.id : null, action: "auth.login", objectType: "user", objectId: succeeded ? user!.id : null, result: succeeded ? "success" : "failure", requestId: input.requestId },
    );

    if (!succeeded) throw new IdentityError("AUTH_INVALID_CREDENTIALS", 401);
    return safeUser(user!);
  }

  async listUsers(actor: User, limit?: number) {
    requireAdmin(actor);
    return (await this.store.listUsers(limit)).map(safeUser);
  }

  async getUser(actor: User, userId: string) {
    requireAdmin(actor);
    const user = await this.store.findUserById(userId);
    if (!user) throw new IdentityError("RESOURCE_NOT_FOUND", 404);
    return safeUser(user);
  }

  async createUser(actor: User, input: CreateManagedUserInput) {
    requireAdmin(actor);
    if (input.accessUntil.getTime() <= this.now().getTime()) throw new IdentityError("VALIDATION_FAILED", 422);
    const initialPassword = generateInitialPassword();
    const passwordHash = await hashPassword(initialPassword, this.options.passwordPolicy);
    const user = await this.store.createUser({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      accessUntil: input.accessUntil,
      passwordHash,
      mustChangePassword: true,
    }, {
      actorId: actor.id,
      action: "admin.user.create",
      objectType: "user",
      result: "success",
      requestId: input.requestId,
    });
    return { user: safeUser(user), initialPassword };
  }

  async updateUser(actor: User, userId: string, input: { name?: string; status?: User["status"]; reason?: string; requestId: string }) {
    requireAdmin(actor);
    if (input.status && input.status !== "active" && !input.reason?.trim()) throw new IdentityError("VALIDATION_FAILED", 422);
    const now = this.now();
    const user = await this.store.updateUser(userId, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.status === "suspended" ? { suspendedAt: now, revokedAt: null } : {}),
      ...(input.status === "revoked" ? { revokedAt: now, suspendedAt: null } : {}),
      ...(input.status === "active" ? { revokedAt: null, suspendedAt: null } : {}),
    }, {
      actorId: actor.id,
      action: "admin.user.update",
      objectType: "user",
      objectId: userId,
      result: "success",
      requestId: input.requestId,
      reason: input.reason?.trim() ?? null,
    });
    if (!user) throw new IdentityError("RESOURCE_NOT_FOUND", 404);
    return safeUser(user);
  }

  async extendAccess(actor: User, userId: string, accessUntil: Date, reason: string, requestId: string) {
    requireAdmin(actor);
    if (accessUntil.getTime() <= this.now().getTime() || reason.trim().length < 3) throw new IdentityError("VALIDATION_FAILED", 422);
    const user = await this.store.extendUserAccess(userId, accessUntil, {
      actorId: actor.id,
      action: "admin.user.access.extend",
      objectType: "user",
      objectId: userId,
      result: "success",
      requestId,
      reason: reason.trim(),
    });
    if (!user) throw new IdentityError("RESOURCE_NOT_FOUND", 404);
    return safeUser(user);
  }

  async changePassword(user: User, currentPassword: string, newPassword: string, requestId: string) {
    const currentValid = await verifyPassword(user.passwordHash, currentPassword);
    if (!currentValid) throw new IdentityError("AUTH_INVALID_CREDENTIALS", 401);
    const passwordHash = await hashPassword(newPassword, this.options.passwordPolicy);
    const updated = await this.store.changePassword(user.id, passwordHash, {
      actorId: user.id,
      action: "auth.password.change",
      objectType: "user",
      objectId: user.id,
      result: "success",
      requestId,
    });
    if (!updated) throw new IdentityError("RESOURCE_NOT_FOUND", 404);
    return safeUser(updated);
  }
}
