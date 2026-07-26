export type ViewerSourceMode = "page" | "tiles";

const tileEnabledDocuments = new Set(["anatomia-general"]);

export const VIEWER_RESOURCE_WINDOW = 3;
export const TILES_PER_PAGE = 4;

export function supportsTiles(documentId: string) {
  return tileEnabledDocuments.has(documentId);
}

export function resolveViewerSource(documentId: string, requestedMode?: string): ViewerSourceMode {
  return requestedMode === "tiles" && supportsTiles(documentId) ? "tiles" : "page";
}

export function activeResourceLimit(mode: ViewerSourceMode) {
  return VIEWER_RESOURCE_WINDOW * (mode === "tiles" ? TILES_PER_PAGE : 1);
}
