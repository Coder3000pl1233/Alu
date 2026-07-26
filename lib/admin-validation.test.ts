import { describe, expect, it } from "vitest";
import { validatePdfUpload } from "@/lib/admin-validation";

describe("validatePdfUpload", () => {
  it("acepta PDF dentro del límite", () => {
    expect(validatePdfUpload("anatomia.pdf", 4 * 1024 * 1024)).toBeNull();
  });

  it("rechaza extensiones incorrectas", () => {
    expect(validatePdfUpload("anatomia.exe", 1024)).toMatch(/PDF válido/);
  });

  it("rechaza archivos superiores a 25 MB", () => {
    expect(validatePdfUpload("anatomia.pdf", 26 * 1024 * 1024)).toMatch(/25 MB/);
  });
});
