import type { User } from "@/lib/db/schema";

export type AuthorizationCode = "AUTH_REQUIRED" | "ADMIN_REQUIRED" | "ACCOUNT_SUSPENDED" | "ACCOUNT_REVOKED" | "ACCESS_EXPIRED";

export class AuthorizationError extends Error {
  constructor(readonly code: AuthorizationCode, readonly status: 401 | 403) {
    super(code);
    this.name = "AuthorizationError";
  }
}

export type AuthorizationUser = Pick<User, "id" | "role" | "status" | "accessUntil">;

export function requireAuthenticated(user: AuthorizationUser | null | undefined): asserts user is AuthorizationUser {
  if (!user) throw new AuthorizationError("AUTH_REQUIRED", 401);
}

export function requireActiveAccount(user: AuthorizationUser, now = new Date()) {
  if (user.status === "suspended") throw new AuthorizationError("ACCOUNT_SUSPENDED", 403);
  if (user.status === "revoked") throw new AuthorizationError("ACCOUNT_REVOKED", 403);
  if (user.role === "student" && (!user.accessUntil || user.accessUntil.getTime() <= now.getTime())) {
    throw new AuthorizationError("ACCESS_EXPIRED", 403);
  }
}

export function requireAdmin(user: AuthorizationUser | null | undefined): asserts user is AuthorizationUser & { role: "admin" } {
  requireAuthenticated(user);
  requireActiveAccount(user);
  if (user.role !== "admin") throw new AuthorizationError("ADMIN_REQUIRED", 403);
}

export function authorizeContent(user: AuthorizationUser | null | undefined, now = new Date()) {
  requireAuthenticated(user);
  requireActiveAccount(user, now);
  return user;
}
