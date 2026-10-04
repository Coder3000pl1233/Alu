import { describe, expect, it } from "vitest";
import { dismissRecommendation, parseRecommendationPreferences } from "@/lib/recommendations";

describe("preferencias de recomendaciones", () => {
  it("requiere consentimiento explícito", () => expect(parseRecommendationPreferences("{}").enabled).toBe(false));
  it("permite descartar sin duplicar", () => expect(dismissRecommendation({ enabled: true, dismissedIds: ["a"] }, "a").dismissedIds).toEqual(["a"]));
});
