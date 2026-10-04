export type RecommendationPreferences = { enabled: boolean; dismissedIds: string[] };

const STORAGE_KEY = "aula-segura:recommendations";
const EVENT_NAME = "aula-segura:recommendations-updated";
export const defaultRecommendationPreferences: RecommendationPreferences = { enabled: false, dismissedIds: [] };

export function parseRecommendationPreferences(snapshot: string): RecommendationPreferences {
  try {
    const value = JSON.parse(snapshot) as Partial<RecommendationPreferences>;
    return { enabled: value.enabled === true, dismissedIds: Array.isArray(value.dismissedIds) ? value.dismissedIds.filter(id => typeof id === "string") : [] };
  } catch { return defaultRecommendationPreferences; }
}

export function getRecommendationSnapshot() {
  if (typeof window === "undefined") return JSON.stringify(defaultRecommendationPreferences);
  return window.localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(defaultRecommendationPreferences);
}

export function subscribeToRecommendations(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT_NAME, callback); window.removeEventListener("storage", callback); };
}

export function saveRecommendationPreferences(value: RecommendationPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function dismissRecommendation(value: RecommendationPreferences, materialId: string) {
  return { ...value, dismissedIds: [...new Set([...value.dismissedIds, materialId])] };
}
