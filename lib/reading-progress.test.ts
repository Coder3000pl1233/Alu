import { describe, expect, it } from "vitest";
import { parseReadingProgress } from "@/lib/reading-progress";

describe("parseReadingProgress", () => {
  it("recupera un progreso válido", () => {
    expect(parseReadingProgress('{"documentId":"anatomia-general","page":12,"updatedAt":"2026-07-25T10:00:00.000Z"}'))
      .toEqual({ documentId: "anatomia-general", page: 12, updatedAt: "2026-07-25T10:00:00.000Z" });
  });

  it("descarta datos incompletos o corruptos", () => {
    expect(parseReadingProgress('{"documentId":"anatomia-general","page":0}')).toBeNull();
    expect(parseReadingProgress("no-es-json")).toBeNull();
  });
});
