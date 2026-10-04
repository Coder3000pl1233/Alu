import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { users } from "@/lib/db/schema";

describe("users schema", () => {
  const columns = getTableColumns(users);

  it("contiene las reglas centrales de identidad y acceso", () => {
    expect(columns).toHaveProperty("status");
    expect(columns).toHaveProperty("accessUntil");
    expect(columns).toHaveProperty("passwordHash");
    expect(columns).toHaveProperty("mustChangePassword");
  });

  it("no permite modelar contraseñas en claro o temporales", () => {
    const names = Object.keys(columns).map((name) => name.toLowerCase());
    expect(names).not.toContain("password");
    expect(names).not.toContain("temporarypassword");
    expect(names).not.toContain("temporary_password");
  });

  it("almacena access_until como timestamp con zona horaria", () => {
    expect(columns.accessUntil.columnType).toBe("PgTimestamp");
    expect(columns.accessUntil.withTimezone).toBe(true);
  });
});
