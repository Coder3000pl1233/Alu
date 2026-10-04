import { beforeAll, describe, expect, it } from "vitest";
import type { NewUser, User } from "@/lib/db/schema";
import { IdentityService } from "@/lib/identity/identity-service";
import { userAuditSnapshot, type AuditWrite, type IdentityStore, type LoginAttemptWrite, type UserUpdate } from "@/lib/identity/identity-store";
import { hashPassword, verifyPassword } from "@/lib/security/passwords";

const REQUEST_ID = "9b191d15-c7f7-4b2a-97a0-190681a74fa8";
const NOW = new Date("2026-08-02T12:00:00Z");
const PEPPER = "rate-limit-pepper-with-at-least-32-characters";

class MemoryIdentityStore implements IdentityStore {
  users: User[] = [];
  attempts: LoginAttemptWrite[] = [];
  audits: AuditWrite[] = [];

  async findUserByEmail(email: string) { return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null; }
  async findUserById(id: string) { return this.users.find((user) => user.id === id) ?? null; }
  async listUsers(limit = 50) { return this.users.slice(0, limit); }
  async createUser(input: NewUser, audit: AuditWrite) {
    const user = makeUser({ ...input, id: crypto.randomUUID() });
    this.users.push(user);
    this.audits.push({ ...audit, objectId: user.id, after: userAuditSnapshot(user) });
    return user;
  }
  async updateUser(userId: string, update: UserUpdate, audit: Omit<AuditWrite, "before" | "after">) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index < 0) return null;
    const before = this.users[index];
    const after = { ...before, ...update, updatedAt: NOW };
    this.users[index] = after;
    this.audits.push({ ...audit, before: userAuditSnapshot(before), after: userAuditSnapshot(after) });
    return after;
  }
  async extendUserAccess(userId: string, accessUntil: Date, audit: Omit<AuditWrite, "before" | "after">) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index < 0) return null;
    const before = this.users[index];
    const after = { ...before, accessUntil, status: "active" as const, suspendedAt: null, revokedAt: null, updatedAt: NOW };
    this.users[index] = after;
    this.audits.push({ ...audit, before: userAuditSnapshot(before), after: userAuditSnapshot(after) });
    return after;
  }
  async changePassword(userId: string, passwordHash: string, audit: Omit<AuditWrite, "before" | "after">) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index < 0) return null;
    const before = this.users[index];
    const after = { ...before, passwordHash, mustChangePassword: false, sessionVersion: before.sessionVersion + 1, updatedAt: NOW };
    this.users[index] = after;
    this.audits.push({ ...audit, before: userAuditSnapshot(before), after: userAuditSnapshot(after) });
    return after;
  }
  async countRecentFailedLogins(subjectHash: string, ipHash: string, since: Date) {
    return this.attempts.filter((attempt) => !attempt.succeeded && attempt.attemptedAt >= since && (attempt.subjectHash === subjectHash || attempt.ipHash === ipHash)).length;
  }
  async recordLoginAttempt(attempt: LoginAttemptWrite, audit: AuditWrite) { this.attempts.push(attempt); this.audits.push(audit); }
  async recordAudit(audit: AuditWrite) { this.audits.push(audit); }
}

function makeUser(input: Partial<User> & Pick<User, "id">): User {
  return {
    id: input.id,
    name: input.name ?? "Estudiante",
    email: input.email ?? "estudiante@aula.test",
    role: input.role ?? "student",
    status: input.status ?? "active",
    accessUntil: input.accessUntil === undefined ? new Date("2026-09-01T00:00:00Z") : input.accessUntil,
    passwordHash: input.passwordHash ?? "hash",
    mustChangePassword: input.mustChangePassword ?? true,
    sessionVersion: input.sessionVersion ?? 1,
    suspendedAt: input.suspendedAt ?? null,
    revokedAt: input.revokedAt ?? null,
    createdAt: input.createdAt ?? NOW,
    updatedAt: input.updatedAt ?? NOW,
  };
}

describe("identity service", () => {
  let studentHash: string;
  beforeAll(async () => { studentHash = await hashPassword("Clave-estudiante-2026!"); });

  const setup = () => {
    const store = new MemoryIdentityStore();
    const student = makeUser({ id: "27f55be0-4f16-4562-9d11-553ad4ab92d9", passwordHash: studentHash });
    const admin = makeUser({ id: "fc4fe825-bd42-4baa-9a9f-1fb8d7d98277", email: "admin@aula.test", role: "admin", accessUntil: null, passwordHash: studentHash, mustChangePassword: false });
    store.users.push(student, admin);
    const service = new IdentityService(store, { rateLimitPepper: PEPPER, now: () => NOW });
    return { store, service, student, admin };
  };

  it("autentica sin devolver password_hash y audita sin secretos", async () => {
    const { service, store } = setup();
    const result = await service.login({ email: "ESTUDIANTE@AULA.TEST", password: "Clave-estudiante-2026!", ip: "192.0.2.1", requestId: REQUEST_ID });
    expect(result.email).toBe("estudiante@aula.test");
    expect(result).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(store.audits)).not.toContain("Clave-estudiante");
    expect(store.audits.at(-1)).toMatchObject({ action: "auth.login", result: "success", requestId: REQUEST_ID });
  });

  it("usa el mismo error para correo inexistente y clave incorrecta", async () => {
    const first = setup();
    await expect(first.service.login({ email: "nadie@aula.test", password: "Clave-incorrecta-2026!", ip: "192.0.2.2", requestId: REQUEST_ID })).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS", status: 401 });
    const second = setup();
    await expect(second.service.login({ email: "estudiante@aula.test", password: "Clave-incorrecta-2026!", ip: "192.0.2.3", requestId: REQUEST_ID })).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS", status: 401 });
  });

  it("bloquea temporalmente después del límite configurable", async () => {
    const { store, student } = setup();
    const service = new IdentityService(store, { rateLimitPepper: PEPPER, now: () => NOW, ratePolicy: { maximumFailures: 1, windowMs: 60_000 } });
    await expect(service.login({ email: student.email, password: "Clave-incorrecta-2026!", ip: "192.0.2.4", requestId: REQUEST_ID })).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS" });
    await expect(service.login({ email: student.email, password: "Clave-incorrecta-2026!", ip: "192.0.2.4", requestId: REQUEST_ID })).rejects.toMatchObject({ code: "RATE_LIMITED", status: 429 });
    expect(store.audits.at(-1)?.result).toBe("rate_limited");
  });

  it("solo un administrador crea usuarios y la clave inicial nunca se persiste en claro", async () => {
    const { service, store, student, admin } = setup();
    const input = { name: "Nueva Alumna", email: "nueva@aula.test", accessUntil: new Date("2026-10-01T00:00:00Z"), requestId: REQUEST_ID };
    await expect(service.createUser(student, input)).rejects.toMatchObject({ code: "ADMIN_REQUIRED" });
    const result = await service.createUser(admin, input);
    const stored = store.users.find((user) => user.id === result.user.id)!;
    expect(result.initialPassword).toBeTruthy();
    expect(stored).not.toHaveProperty("temporaryPassword");
    expect(stored.passwordHash).not.toBe(result.initialPassword);
    await expect(verifyPassword(stored.passwordHash, result.initialPassword)).resolves.toBe(true);
  });

  it("suspende con motivo y registra before/after", async () => {
    const { service, store, student, admin } = setup();
    await expect(service.updateUser(admin, student.id, { status: "suspended", requestId: REQUEST_ID })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    const updated = await service.updateUser(admin, student.id, { status: "suspended", reason: "Solicitud administrativa", requestId: REQUEST_ID });
    expect(updated.status).toBe("suspended");
    expect(store.audits.at(-1)).toMatchObject({ before: { status: "active" }, after: { status: "suspended" }, reason: "Solicitud administrativa" });
  });

  it("extiende acceso transaccionalmente y reactiva la cuenta", async () => {
    const { service, store, student, admin } = setup();
    store.users[0] = { ...student, status: "suspended", suspendedAt: NOW };
    const until = new Date("2026-11-01T00:00:00Z");
    const updated = await service.extendAccess(admin, student.id, until, "Renovación confirmada", REQUEST_ID);
    expect(updated).toMatchObject({ status: "active", accessUntil: until, suspendedAt: null });
    expect(store.audits.at(-1)).toMatchObject({ action: "admin.user.access.extend", before: { status: "suspended" }, after: { status: "active", access_until: until.toISOString() } });
  });

  it("cambia la contraseña, elimina must_change y aumenta session_version", async () => {
    const { service, store, student } = setup();
    const updated = await service.changePassword(student, "Clave-estudiante-2026!", "Nueva-clave-estudiante-2026!", REQUEST_ID);
    expect(updated).toMatchObject({ mustChangePassword: false, sessionVersion: 2 });
    await expect(verifyPassword(store.users[0].passwordHash, "Nueva-clave-estudiante-2026!")).resolves.toBe(true);
    expect(store.audits.at(-1)?.action).toBe("auth.password.change");
  });
});
