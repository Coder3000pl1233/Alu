import { describe, expect, it } from "vitest";
import { initialSecurityRules, publishRuleVersion, validateRuleChange } from "@/lib/admin-rules";

describe("versionado de reglas", () => {
  it("incrementa la versión sin mutar la regla previa", () => {
    const original = initialSecurityRules[0];
    const next = publishRuleVersion(original, 20);
    expect(next.version).toBe(original.version + 1);
    expect(original.value).toBe(18);
  });
  it("exige umbral y motivo válidos", () => {
    expect(validateRuleChange(0, "cambio válido")).toBeTruthy();
    expect(validateRuleChange(10, "no")).toBeTruthy();
    expect(validateRuleChange(10, "Ajuste operativo")).toBeNull();
  });
});
