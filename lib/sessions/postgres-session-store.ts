import { and, eq, gt, isNull } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { auditEvents, devices, sessions, users } from "@/lib/db/schema";
import type { CreateSessionInput, SessionResolution, SessionStore } from "@/lib/sessions/session-store";

export class PostgresSessionStore implements SessionStore {
  constructor(private readonly db: Database) {}

  async createReplacingSession(input: CreateSessionInput) {
    return this.db.transaction(async (tx) => {
      const [lockedUser] = await tx.select().from(users).where(eq(users.id, input.user.id)).for("update").limit(1);
      if (!lockedUser) throw new Error("session_user_not_found");

      const [device] = input.existingDeviceId
        ? await tx.update(devices).set({ name: input.deviceName, lastSeenAt: input.now }).where(and(eq(devices.id, input.existingDeviceId), eq(devices.userId, input.user.id), eq(devices.status, "active"))).returning()
        : await tx.insert(devices).values({
          userId: input.user.id,
          identifierHash: input.deviceIdentifierHash!,
          name: input.deviceName,
          status: "active",
          firstSeenAt: input.now,
          lastSeenAt: input.now,
        }).onConflictDoUpdate({
          target: [devices.userId, devices.identifierHash],
          set: { name: input.deviceName, status: "active", revokedAt: null, lastSeenAt: input.now },
        }).returning();
      if (!device) throw new Error("session_device_not_found");

      const replaced = await tx.update(sessions).set({ revokedAt: input.now, revocationReason: "replaced_by_login" }).where(and(eq(sessions.userId, input.user.id), isNull(sessions.revokedAt))).returning({ id: sessions.id });

      const [session] = await tx.insert(sessions).values({
        userId: input.user.id,
        deviceId: device.id,
        tokenHash: input.tokenHash,
        userSessionVersion: input.user.sessionVersion,
        idleExpiresAt: input.idleExpiresAt,
        absoluteExpiresAt: input.absoluteExpiresAt,
        lastSeenAt: input.now,
        createdAt: input.now,
      }).returning();

      await tx.insert(auditEvents).values({
        actorId: input.user.id,
        action: "session.create",
        objectType: "session",
        objectId: session.id,
        result: "success",
        requestId: input.requestId,
        after: { device_id: device.id, replaced_sessions: replaced.length, idle_expires_at: input.idleExpiresAt.toISOString(), absolute_expires_at: input.absoluteExpiresAt.toISOString() },
      });
      return { session, user: lockedUser, device };
    });
  }

  async resolveAndTouch(tokenHash: string, now: Date, idleDurationMs: number): Promise<SessionResolution> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.select({ session: sessions, user: users, device: devices })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .innerJoin(devices, eq(devices.id, sessions.deviceId))
        .where(eq(sessions.tokenHash, tokenHash))
        .for("update")
        .limit(1);
      if (!row) return { ok: false, reason: "missing" };
      if (row.session.revokedAt) return { ok: false, reason: "revoked" };
      if (row.device.status === "revoked") return { ok: false, reason: "device_revoked" };
      if (row.session.userSessionVersion !== row.user.sessionVersion) return { ok: false, reason: "version_mismatch" };
      if (row.session.idleExpiresAt <= now || row.session.absoluteExpiresAt <= now) {
        await tx.update(sessions).set({ revokedAt: now, revocationReason: "expired" }).where(eq(sessions.id, row.session.id));
        return { ok: false, reason: "expired" };
      }

      const requestedIdle = new Date(now.getTime() + idleDurationMs);
      const idleExpiresAt = requestedIdle < row.session.absoluteExpiresAt ? requestedIdle : row.session.absoluteExpiresAt;
      const [session] = await tx.update(sessions).set({ lastSeenAt: now, idleExpiresAt }).where(and(
        eq(sessions.id, row.session.id),
        isNull(sessions.revokedAt),
        gt(sessions.idleExpiresAt, now),
        gt(sessions.absoluteExpiresAt, now),
      )).returning();
      if (!session) return { ok: false, reason: "expired" };
      await tx.update(devices).set({ lastSeenAt: now }).where(eq(devices.id, row.device.id));
      return { ok: true, record: { session, user: row.user, device: { ...row.device, lastSeenAt: now } } };
    });
  }

  async revokeByTokenHash(tokenHash: string, now: Date, reason: string, requestId: string) {
    await this.db.transaction(async (tx) => {
      const [session] = await tx.update(sessions).set({ revokedAt: now, revocationReason: reason }).where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt))).returning();
      if (!session) return;
      await tx.insert(auditEvents).values({ actorId: session.userId, action: "session.revoke", objectType: "session", objectId: session.id, result: "success", requestId, reason });
    });
  }
}
