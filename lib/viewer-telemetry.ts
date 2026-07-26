export type ViewerEventType =
  | "session_started"
  | "heartbeat"
  | "page_viewed"
  | "page_error"
  | "friction_triggered"
  | "session_closed";

export type ViewerTelemetryEvent = {
  id: string;
  type: ViewerEventType;
  documentId: string;
  page?: number;
  reason?: "print" | "save" | "drag" | "context_menu";
  createdAt: string;
};

export type ViewerTelemetryInput = Omit<ViewerTelemetryEvent, "id" | "createdAt">;

const STORAGE_KEY = "aula-segura:viewer-telemetry";
const ALLOWED_REASONS = new Set(["print", "save", "drag", "context_menu"]);

export function createViewerEvent(input: ViewerTelemetryInput): ViewerTelemetryEvent {
  const page = Number.isInteger(input.page) && Number(input.page) > 0 ? input.page : undefined;
  const reason = input.reason && ALLOWED_REASONS.has(input.reason) ? input.reason : undefined;
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    type: input.type,
    documentId: input.documentId,
    ...(page ? { page } : {}),
    ...(reason ? { reason } : {}),
    createdAt: new Date().toISOString()
  };
}

export function storeViewerEvent(input: ViewerTelemetryInput) {
  const event = createViewerEvent(input);
  if (typeof window === "undefined") return event;
  const current = readViewerEvents();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, event].slice(-30)));
  return event;
}

export function readViewerEvents(): ViewerTelemetryEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
