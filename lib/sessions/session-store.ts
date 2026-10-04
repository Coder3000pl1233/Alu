import type { Device, Session, User } from "@/lib/db/schema";

export type SessionIdentity = Omit<User, "passwordHash">;

export type SessionRecord = { session: Session; user: User; device: Device };
export type SessionFailure = "missing" | "revoked" | "expired" | "version_mismatch" | "device_revoked";
export type SessionResolution = { ok: true; record: SessionRecord } | { ok: false; reason: SessionFailure };

export type CreateSessionInput = {
  user: SessionIdentity;
  deviceIdentifierHash?: string;
  existingDeviceId?: string;
  deviceName: string;
  tokenHash: string;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  now: Date;
  requestId: string;
};

export interface SessionStore {
  createReplacingSession(input: CreateSessionInput): Promise<SessionRecord>;
  resolveAndTouch(tokenHash: string, now: Date, idleDurationMs: number): Promise<SessionResolution>;
  revokeByTokenHash(tokenHash: string, now: Date, reason: string, requestId: string): Promise<void>;
}
