import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { auditEvents, loginAttempts, users, type NewUser } from "@/lib/db/schema";
import { userAuditSnapshot, type AuditWrite, type IdentityStore, type LoginAttemptWrite, type UserUpdate } from "@/lib/identity/identity-store";

const auditRow = (audit: AuditWrite) => ({
  actorId: audit.actorId ?? null,
  action: audit.action,
  objectType: audit.objectType,
  objectId: audit.objectId ?? null,
  result: audit.result,
  requestId: audit.requestId,
  before: audit.before ?? null,
  after: audit.after ?? null,
  reason: audit.reason ?? null,
});

export class PostgresIdentityStore implements IdentityStore {
  constructor(private readonly db: Database) {}

  async findUserByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(sql`lower(${users.email}) = ${email.toLowerCase()}`).limit(1);
    return user ?? null;
  }

  async findUserById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  listUsers(limit = 50) {
    return this.db.select().from(users).orderBy(desc(users.createdAt)).limit(Math.min(Math.max(limit, 1), 100));
  }

  async createUser(user: NewUser, audit: AuditWrite) {
    return this.db.transaction(async (tx) => {
      const [created] = await tx.insert(users).values(user).returning();
      await tx.insert(auditEvents).values(auditRow({ ...audit, objectId: created.id, after: userAuditSnapshot(created) }));
      return created;
    });
  }

  async updateUser(userId: string, update: UserUpdate, audit: Omit<AuditWrite, "before" | "after">) {
    return this.db.transaction(async (tx) => {
      const [before] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
      if (!before) return null;
      const [after] = await tx.update(users).set({ ...update, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
      await tx.insert(auditEvents).values(auditRow({ ...audit, objectId: userId, before: userAuditSnapshot(before), after: userAuditSnapshot(after) }));
      return after;
    });
  }

  async extendUserAccess(userId: string, accessUntil: Date, audit: Omit<AuditWrite, "before" | "after">) {
    return this.db.transaction(async (tx) => {
      const [before] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
      if (!before) return null;
      const [after] = await tx.update(users).set({ accessUntil, status: "active", suspendedAt: null, revokedAt: null, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
      await tx.insert(auditEvents).values(auditRow({ ...audit, objectId: userId, before: userAuditSnapshot(before), after: userAuditSnapshot(after) }));
      return after;
    });
  }

  async changePassword(userId: string, passwordHash: string, audit: Omit<AuditWrite, "before" | "after">) {
    return this.db.transaction(async (tx) => {
      const [before] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
      if (!before) return null;
      const [after] = await tx.update(users).set({ passwordHash, mustChangePassword: false, sessionVersion: before.sessionVersion + 1, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
      await tx.insert(auditEvents).values(auditRow({ ...audit, objectId: userId, before: userAuditSnapshot(before), after: userAuditSnapshot(after) }));
      return after;
    });
  }

  async countRecentFailedLogins(subjectHash: string, ipHash: string, since: Date) {
    const [row] = await this.db.select({ value: sql<number>`count(*)::int` }).from(loginAttempts).where(and(
      eq(loginAttempts.succeeded, false),
      gte(loginAttempts.attemptedAt, since),
      or(eq(loginAttempts.subjectHash, subjectHash), eq(loginAttempts.ipHash, ipHash)),
    ));
    return row?.value ?? 0;
  }

  async recordLoginAttempt(attempt: LoginAttemptWrite, audit: AuditWrite) {
    await this.db.transaction(async (tx) => {
      await tx.insert(loginAttempts).values(attempt);
      await tx.insert(auditEvents).values(auditRow(audit));
    });
  }

  async recordAudit(audit: AuditWrite) {
    await this.db.insert(auditEvents).values(auditRow(audit));
  }
}
