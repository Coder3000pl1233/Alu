import { createHmac, randomBytes } from "node:crypto";
import type { ApiErrorCode } from "@/lib/api-errors";
import type { SessionIdentity, SessionRecord, SessionStore } from "@/lib/sessions/session-store";
import type { Device } from "@/lib/db/schema";

export class SessionError extends Error {
  constructor(readonly code: ApiErrorCode, readonly status: 401 | 403) {
    super(code);
    this.name = "SessionError";
  }
}

export type SessionPolicy = {
  idleDurationMs: number;
  absoluteDurationMs: number;
};

export type SessionServiceOptions = {
  tokenPepper: string;
  policy?: SessionPolicy;
  now?: () => Date;
};

export const DEFAULT_SESSION_POLICY: SessionPolicy = {
  idleDurationMs: 30 * 60_000,
  absoluteDurationMs: 7 * 24 * 60 * 60_000,
};

export class SessionService {
  private readonly now: () => Date;
  private readonly policy: SessionPolicy;

  constructor(private readonly store: SessionStore, private readonly options: SessionServiceOptions) {
    if (options.tokenPepper.length < 32) throw new Error("tokenPepper debe tener al menos 32 caracteres");
    this.now = options.now ?? (() => new Date());
    this.policy = options.policy ?? DEFAULT_SESSION_POLICY;
  }

  private tokenHash(token: string) {
    return createHmac("sha256", this.options.tokenPepper).update(token).digest("hex");
  }

  private deviceHash(userId: string, identifier: string) {
    return createHmac("sha256", this.options.tokenPepper).update(`device:${userId}:${identifier}`).digest("hex");
  }

  async create(user: SessionIdentity, deviceIdentifier: string, deviceName: string, requestId: string) {
    return this.createInternal(user, { deviceIdentifierHash: this.deviceHash(user.id, deviceIdentifier), deviceName }, requestId);
  }

  async rotate(user: SessionIdentity, device: Device, requestId: string) {
    return this.createInternal(user, { existingDeviceId: device.id, deviceName: device.name }, requestId);
  }

  private async createInternal(user: SessionIdentity, device: { deviceIdentifierHash?: string; existingDeviceId?: string; deviceName: string }, requestId: string) {
    const now = this.now();
    const token = randomBytes(32).toString("base64url");
    const record = await this.store.createReplacingSession({
      user,
      deviceIdentifierHash: device.deviceIdentifierHash,
      existingDeviceId: device.existingDeviceId,
      deviceName: device.deviceName.trim().slice(0, 100),
      tokenHash: this.tokenHash(token),
      idleExpiresAt: new Date(now.getTime() + this.policy.idleDurationMs),
      absoluteExpiresAt: new Date(now.getTime() + this.policy.absoluteDurationMs),
      now,
      requestId,
    });
    return { token, record };
  }

  async resolve(token: string | undefined | null) {
    if (!token) throw new SessionError("AUTH_REQUIRED", 401);
    const result = await this.store.resolveAndTouch(this.tokenHash(token), this.now(), this.policy.idleDurationMs);
    if (!result.ok) {
      if (result.reason === "expired") throw new SessionError("SESSION_EXPIRED", 401);
      throw new SessionError("SESSION_REVOKED", 403);
    }
    return result.record;
  }

  async revoke(token: string | undefined | null, requestId: string, reason = "logout") {
    if (!token) return;
    await this.store.revokeByTokenHash(this.tokenHash(token), this.now(), reason, requestId);
  }

  toPublicSession(record: SessionRecord) {
    const accessState = record.user.status === "suspended" ? "suspended"
      : record.user.status === "revoked" ? "revoked"
      : record.user.role === "student" && (!record.user.accessUntil || record.user.accessUntil <= this.now()) ? "expired"
      : "active";
    return {
      id: record.session.id,
      user: {
        id: record.user.id,
        name: record.user.name,
        email: record.user.email,
        role: record.user.role,
        status: record.user.status,
        access_state: accessState,
        access_until: record.user.accessUntil?.toISOString() ?? null,
        must_change_password: record.user.mustChangePassword,
      },
      device_id: record.device.id,
      created_at: record.session.createdAt.toISOString(),
      idle_expires_at: record.session.idleExpiresAt.toISOString(),
      absolute_expires_at: record.session.absoluteExpiresAt.toISOString(),
    };
  }
}
