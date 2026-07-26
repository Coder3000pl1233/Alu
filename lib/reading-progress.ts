export type ReadingProgress = {
  documentId: string;
  page: number;
  updatedAt: string;
};

const STORAGE_KEY = "aula-segura:reading-progress";
const EVENT_NAME = "aula-segura:progress-updated";

export function saveReadingProgress(progress: ReadingProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getReadingProgressSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function subscribeToReadingProgress(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function parseReadingProgress(snapshot: string): ReadingProgress | null {
  try {
    const value = JSON.parse(snapshot) as Partial<ReadingProgress>;
    if (
      typeof value.documentId !== "string" ||
      !Number.isInteger(value.page) ||
      Number(value.page) < 1 ||
      typeof value.updatedAt !== "string"
    ) return null;
    return value as ReadingProgress;
  } catch {
    return null;
  }
}
