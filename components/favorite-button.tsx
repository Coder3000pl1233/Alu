"use client";

import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getFavoritesSnapshot, parseFavorites, subscribeToFavorites, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({ materialId, title }: { materialId: string; title: string }) {
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, () => "[]");
  const active = parseFavorites(snapshot).includes(materialId);

  return (
    <button
      type="button"
      className={`favorite-button ${active ? "active" : ""}`}
      aria-label={active ? `Quitar ${title} de favoritos` : `Agregar ${title} a favoritos`}
      aria-pressed={active}
      onClick={() => toggleFavorite(materialId)}
    >
      <Heart size={17} fill={active ? "currentColor" : "none"}/>
    </button>
  );
}
