import { describe, expect, it } from "vitest";
import { recommendedWatermarkPreset } from "@/lib/accessibility-lab";

describe("configuración de watermark", () => {
  it("recomienda equilibrio para lectura prolongada", () => {
    expect(recommendedWatermarkPreset(30, false)).toBe("equilibrado");
    expect(recommendedWatermarkPreset(10, false)).toBe("intenso");
  });

  it("respeta la preferencia de contraste reducido", () => {
    expect(recommendedWatermarkPreset(10, true)).toBe("equilibrado");
  });
});
