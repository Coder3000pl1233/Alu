import { describe, expect, it } from "vitest";
import { activeResourceLimit, resolveViewerSource } from "@/lib/viewer-source";

describe("fuentes del visor", () => {
  it("activa tiles solo en documentos habilitados", () => {
    expect(resolveViewerSource("anatomia-general", "tiles")).toBe("tiles");
    expect(resolveViewerSource("biologia-celular", "tiles")).toBe("page");
  });

  it("mantiene acotada la ventana de recursos", () => {
    expect(activeResourceLimit("page")).toBe(3);
    expect(activeResourceLimit("tiles")).toBe(12);
  });
});
