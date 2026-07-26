import { describe, expect, it } from "vitest";
import { parseFavorites, updateFavoriteIds } from "@/lib/favorites";

describe("favoritos", () => {
  it("agrega y quita un material sin duplicados", () => {
    expect(updateFavoriteIds([], "anatomia-general")).toEqual(["anatomia-general"]);
    expect(updateFavoriteIds(["anatomia-general"], "anatomia-general")).toEqual([]);
  });

  it("normaliza la persistencia local", () => {
    expect(parseFavorites('["a","a",4,"b"]')).toEqual(["a", "b"]);
    expect(parseFavorites("corrupto")).toEqual([]);
  });
});
