"use client";

import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { MarketplaceListingCard } from "@/components/marketplace-listing-card";
import { getFavoritesSnapshot, parseFavorites, subscribeToFavorites } from "@/lib/favorites";
import { materials } from "@/lib/mock-data";

export function FavoritesGrid() {
  const [query, setQuery] = useState("");
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, () => "[]");
  const favoriteIds = useMemo(() => parseFavorites(snapshot), [snapshot]);
  const favorites = materials.filter(material => favoriteIds.includes(material.id) && material.title.toLowerCase().includes(query.toLowerCase()));

  if (favoriteIds.length === 0) return (
    <div className="empty-state favorites-empty"><span className="empty-icon"><Heart size={25}/></span><h2>Todavía no guardaste apuntes</h2><p>Usá el corazón de cada publicación para armar tu lista y volver cuando quieras.</p><Link className="btn btn-primary" href="/app">Explorar apuntes</Link></div>
  );

  return <>
    <label className="standalone-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar en mis favoritos"/></label>
    <div className="results-summary"><strong>{favorites.length}</strong> {favorites.length === 1 ? "apunte guardado" : "apuntes guardados"}</div>
    {favorites.length ? <div className="featured-listings favorites-listings">{favorites.map(material => <MarketplaceListingCard key={material.id} material={material}/>)}</div> : <div className="empty-state"><h2>No encontramos coincidencias</h2><p>Probá con otra búsqueda.</p></div>}
  </>;
}
