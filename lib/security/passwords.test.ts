import { describe, expect, it } from "vitest";
import { generateInitialPassword, hashPassword, validatePassword, verifyPassword } from "@/lib/security/passwords";

describe("password security", () => {
  it("genera un hash Argon2id verificable y no reversible", async () => {
    const password = "Clave-inicial-Segura-2026!";
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain(password);
    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, "Clave-incorrecta-2026!")).resolves.toBe(false);
  });

  it("rechaza claves débiles con códigos estables", () => {
    expect(validatePassword("corta")).toEqual(expect.arrayContaining(["too_short", "missing_uppercase", "missing_number", "missing_symbol"]));
  });

  it("genera contraseñas iniciales que cumplen la política", () => {
    const password = generateInitialPassword();
    expect(validatePassword(password)).toEqual([]);
    expect(password.length).toBeGreaterThanOrEqual(20);
  });
});
