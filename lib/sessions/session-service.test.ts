import { describe, expect, it } from "vitest";
import type { Device, Session, User } from "@/lib/db/schema";
import { SessionService } from "@/lib/sessions/session-service";
import type { CreateSessionInput, SessionRecord, SessionResolution, SessionStore } from "@/lib/sessions/session-store";

const NOW = new Date("2026-08-02T12:00:00Z");
const PEPPER = "session-token-pepper-with-at-least-32-characters";
const REQUEST_ID = "9b191d15-c7f7-4b2a-97a0-190681a74fa8";

const user: User = {
  id: "27f55be0-4f16-4562-9d11-553ad4ab92d9",
  name: "Lucía",
  email: "lucia@aula.test",
  role: "student",
  status: "active",
  accessUntil: new Date("2026-09-01T00:00:00Z"),
  passwordHash: "hash",
  mustChangePassword: false,
  sessionVersion: 1,
  suspendedAt: null,
  revokedAt: null,
  createdAt: NOW,
  updatedAt: NOW,
};

class MemorySessionStore implements SessionStore {
  records = new Map<string, SessionRecord>();
  createdInputs: CreateSessionInput[] = [];
  revokeCount = 0;

  async createReplacingSession(input: CreateSessionInput) {
    this.createdInputs.push(input);
    for (const record of this.records.values()) {
      if (record.user.id === input.user.id && !record.session.revokedAt) {
        record.session = { ...record.session, revokedAt: input.now, revocationReason: "replaced_by_login" };
        this.revokeCount++;
      }
    }
    const existing = input.existingDeviceId ? [...this.records.values()].find((record) => record.device.id === input.existingDeviceId)?.device : undefined;
    const device: Device = existing ?? {
      id: crypto.randomUUID(), userId: input.user.id, identifierHash: input.deviceIdentifierHash!,
      name: input.deviceName, status: "active", firstSeenAt: input.now, lastSeenAt: input.now, revokedAt: null,
    };
    const session: Session = {
      id: crypto.randomUUID(), userId: input.user.id, deviceId: device.id, tokenHash: input.tokenHash,
      userSessionVersion: input.user.sessionVersion, idleExpiresAt: input.idleExpiresAt,
      absoluteExpiresAt: input.absoluteExpiresAt, lastSeenAt: input.now, revokedAt: null,
      revocationReason: null, createdAt: input.now,
    };
    const record = { session, user: { ...input.user, passwordHash: "not-persisted-here" }, device };
    this.records.set(input.tokenHash, record);
    return record;
  }

  async resolveAndTouch(tokenHash: string, now: Date, idleDurationMs: number): Promise<SessionResolution> {
    const record = this.records.get(tokenHash);
    if (!record) return { ok: false, reason: "missing" };
    if (record.session.revokedAt) return { ok: false, reason: "revoked" };
    if (record.device.status === "revoked") return { ok: false, reason: "device_revoked" };
    if (record.session.userSessionVersion !== record.user.sessionVersion) return { ok: false, reason: "version_mismatch" };
    if (record.session.idleExpiresAt <= now || record.session.absoluteExpiresAt <= now) return { ok: false, reason: "expired" };
    const requested = new Date(now.getTime() + idleDurationMs);
    record.session = { ...record.session, lastSeenAt: now, idleExpiresAt: requested < record.session.absoluteExpiresAt ? requested : record.session.absoluteExpiresAt };
    return { ok: true, record };
  }

  async revokeByTokenHash(tokenHash: string, now: Date, reason: string) {
    const record = this.records.get(tokenHash);
    if (record) record.session = { ...record.session, revokedAt: now, revocationReason: reason };
  }
}

describe("opaque sessions", () => {
  it("solo persiste hashes del token y del identificador de dispositivo", async () => {
    const store = new MemorySessionStore();
    const service = new SessionService(store, { tokenPepper: PEPPER, now: () => NOW });
    const created = await service.create(user, "60e746de-1887-49a1-91ea-b0768f8b1208", "Chrome en Windows", REQUEST_ID);
    const input = store.createdInputs[0];
    expect(created.token.length).toBeGreaterThanOrEqual(40);
    expect(input.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(input.tokenHash).not.toBe(created.token);
    expect(input.deviceIdentifierHash).toMatch(/^[a-f0-9]{64}$/);
    expect(input.deviceIdentifierHash).not.toContain("60e746de");
  });

  it("reemplaza la sesión anterior pero permite múltiples pestañas con el mismo token", async () => {
    const store = new MemorySessionStore();
    const service = new SessionService(store, { tokenPepper: PEPPER, now: () => NOW });
    const first = await service.create(user, "device-1", "Notebook", REQUEST_ID);
    await expect(service.resolve(first.token)).resolves.toBeTruthy();
    await expect(service.resolve(first.token)).resolves.toBeTruthy();
    await service.create(user, "device-2", "Teléfono", REQUEST_ID);
    expect(store.revokeCount).toBe(1);
    await expect(service.resolve(first.token)).rejects.toMatchObject({ code: "SESSION_REVOKED" });
  });

  it("aplica expiración por inactividad y absoluta", async () => {
    const store = new MemorySessionStore();
    let now = NOW;
    const service = new SessionService(store, { tokenPepper: PEPPER, now: () => now, policy: { idleDurationMs: 1_000, absoluteDurationMs: 3_000 } });
    const created = await service.create(user, "device-1", "Notebook", REQUEST_ID);
    now = new Date(NOW.getTime() + 1_001);
    await expect(service.resolve(created.token)).rejects.toMatchObject({ code: "SESSION_EXPIRED" });

    now = NOW;
    const second = await service.create(user, "device-1", "Notebook", REQUEST_ID);
    now = new Date(NOW.getTime() + 500);
    const resolved = await service.resolve(second.token);
    expect(resolved.session.idleExpiresAt).toEqual(new Date(NOW.getTime() + 1_500));
    now = new Date(NOW.getTime() + 1_400);
    await service.resolve(second.token);
    now = new Date(NOW.getTime() + 2_300);
    const capped = await service.resolve(second.token);
    expect(capped.session.idleExpiresAt).toEqual(new Date(NOW.getTime() + 3_000));
  });

  it("invalida una sesión cuando cambia session_version", async () => {
    const store = new MemorySessionStore();
    const service = new SessionService(store, { tokenPepper: PEPPER, now: () => NOW });
    const created = await service.create(user, "device-1", "Notebook", REQUEST_ID);
    created.record.user = { ...created.record.user, sessionVersion: 2 };
    await expect(service.resolve(created.token)).rejects.toMatchObject({ code: "SESSION_REVOKED" });
  });
});
