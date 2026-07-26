const STORAGE_KEY = "aula-segura:favorites";
const EVENT_NAME = "aula-segura:favorites-updated";

export function parseFavorites(snapshot: string): string[] {
  try {
    const value = JSON.parse(snapshot);
    return Array.isArray(value) ? [...new Set(value.filter(item => typeof item === "string"))] : [];
  } catch {
    return [];
  }
}

export function updateFavoriteIds(ids: string[], materialId: string): string[] {
  return ids.includes(materialId) ? ids.filter(id => id !== materialId) : [...ids, materialId];
}

export function getFavoritesSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

export function subscribeToFavorites(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function toggleFavorite(materialId: string) {
  if (typeof window === "undefined") return [];
  const next = updateFavoriteIds(parseFavorites(getFavoritesSnapshot()), materialId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
  return next;
}
