import { describe, expect, it } from "vitest";
import { authorizeContent, requireAdmin } from "@/lib/security/authorization";

const user = (overrides = {}) => ({ id: "user-1", role: "student" as const, status: "active" as const, accessUntil: new Date("2026-09-01T00:00:00Z"), ...overrides });

describe("central authorization", () => {
  it("autoriza contenido con acceso vigente comparado en UTC", () => {
    expect(authorizeContent(user(), new Date("2026-08-31T23:59:59Z")).id).toBe("user-1");
  });

  it("rechaza acceso al llegar exactamente al vencimiento", () => {
    expect(() => authorizeContent(user(), new Date("2026-09-01T00:00:00Z"))).toThrowError(expect.objectContaining({ code: "ACCESS_EXPIRED" }));
  });

  it.each(["suspended", "revoked"] as const)("rechaza cuentas %s", (status) => {
    expect(() => authorizeContent(user({ status }))).toThrowError(expect.objectContaining({ code: status === "suspended" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_REVOKED" }));
  });

  it("aplica RBAC administrativo", () => {
    expect(() => requireAdmin(user())).toThrowError(expect.objectContaining({ code: "ADMIN_REQUIRED" }));
    expect(() => requireAdmin(user({ role: "admin", accessUntil: null }))).not.toThrow();
  });
});
