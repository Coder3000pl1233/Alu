import { describe, expect, it } from "vitest";
import { shouldNeverCache } from "@/lib/pwa-policy";

describe("política offline", () => {
  it("excluye visor e imágenes protegidas", () => {
    expect(shouldNeverCache("/app/material/anatomia-general/visor")).toBe(true);
    expect(shouldNeverCache("/demo-content/anatomia-general/page-001.jpg")).toBe(true);
  });

  it("permite recursos públicos del shell", () => {
    expect(shouldNeverCache("/offline")).toBe(false);
    expect(shouldNeverCache("/pwa-icon.svg")).toBe(false);
  });
});
