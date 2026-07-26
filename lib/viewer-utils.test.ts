import { describe, expect, it } from "vitest";
import { clampPage, nextZoom } from "@/lib/viewer-utils";

describe("viewer utils", () => {
  it("mantiene la página dentro del documento", () => {
    expect(clampPage(0, 60)).toBe(1);
    expect(clampPage(61, 60)).toBe(60);
    expect(clampPage(18, 60)).toBe(18);
  });

  it("limita el zoom entre 50% y 175%", () => {
    expect(nextZoom(0.5, -0.1)).toBe(0.5);
    expect(nextZoom(1.75, 0.1)).toBe(1.75);
    expect(nextZoom(1, 0.1)).toBe(1.1);
  });
});
