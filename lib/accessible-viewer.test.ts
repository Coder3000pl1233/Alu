import { describe, expect, it } from "vitest";
import { sectionForPage } from "@/lib/accessible-viewer";

describe("navegación accesible", () => {
  it("asocia cada página con su sección semántica", () => {
    expect(sectionForPage(1).id).toBe("introduccion");
    expect(sectionForPage(24).id).toBe("planos");
    expect(sectionForPage(60).id).toBe("repaso");
  });
});
