import { describe, expect, it } from "vitest";
import { createViewerEvent } from "@/lib/viewer-telemetry";

describe("createViewerEvent", () => {
  it("crea un evento con los campos permitidos", () => {
    const event = createViewerEvent({
      type: "page_viewed",
      documentId: "anatomia-general",
      page: 12
    });

    expect(event).toMatchObject({
      type: "page_viewed",
      documentId: "anatomia-general",
      page: 12
    });
    expect(Object.keys(event).sort()).toEqual(["createdAt", "documentId", "id", "page", "type"]);
  });

  it("descarta páginas inválidas", () => {
    const event = createViewerEvent({
      type: "heartbeat",
      documentId: "anatomia-general",
      page: 0
    });
    expect(event).not.toHaveProperty("page");
  });
});
