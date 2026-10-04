import type { NewUser, User } from "@/lib/db/schema";

export type AuditWrite = {
  actorId?: string | null;
  action: string;
  objectType: string;
  objectId?: string | null;
  result: "success" | "failure" | "rate_limited";
  requestId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
};

export type LoginAttemptWrite = {
  subjectHash: string;
  ipHash: string;
  succeeded: boolean;
  attemptedAt: Date;
};

export type UserUpdate = {
  name?: string;
  status?: User["status"];
  suspendedAt?: Date | null;
  revokedAt?: Date | null;
};

export interface IdentityStore {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  listUsers(limit?: number): Promise<User[]>;
  createUser(user: NewUser, audit: AuditWrite): Promise<User>;
  updateUser(userId: string, update: UserUpdate, audit: Omit<AuditWrite, "before" | "after">): Promise<User | null>;
  extendUserAccess(userId: string, accessUntil: Date, audit: Omit<AuditWrite, "before" | "after">): Promise<User | null>;
  changePassword(userId: string, passwordHash: string, audit: Omit<AuditWrite, "before" | "after">): Promise<User | null>;
  countRecentFailedLogins(subjectHash: string, ipHash: string, since: Date): Promise<number>;
  recordLoginAttempt(attempt: LoginAttemptWrite, audit: AuditWrite): Promise<void>;
  recordAudit(audit: AuditWrite): Promise<void>;
}

export function userAuditSnapshot(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    access_until: user.accessUntil?.toISOString() ?? null,
    must_change_password: user.mustChangePassword,
    session_version: user.sessionVersion,
  };
}
