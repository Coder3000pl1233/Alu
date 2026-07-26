"use client";

import { MaterialCard } from "@/components/material-card";
import type { Material } from "@/lib/mock-data";
import { BookOpen, Heart, Search, X } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { filterMaterials, type MaterialFilterType } from "@/lib/material-filters";
import { getFavoritesSnapshot, parseFavorites, subscribeToFavorites } from "@/lib/favorites";

const types = ["Todos", "Apunte", "Guía", "Libro", "Simulacro"] as const;

export function SubjectMaterials({ materials }: { materials: Material[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MaterialFilterType>("Todos");
  const [visibleCount, setVisibleCount] = useState(3);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favoritesSnapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, () => "[]");
  const favoriteIds = useMemo(() => parseFavorites(favoritesSnapshot), [favoritesSnapshot]);

  const filteredMaterials = useMemo(() => {
    const filtered = filterMaterials(materials, query, type);
    return favoritesOnly ? filtered.filter(material => favoriteIds.includes(material.id)) : filtered;
  }, [favoriteIds, favoritesOnly, materials, query, type]);
  const visibleMaterials = filteredMaterials.slice(0, visibleCount);

  const resetFilters = () => {
    setQuery("");
    setType("Todos");
    setVisibleCount(3);
    setFavoritesOnly(false);
  };

  return (
    <>
      <div className="material-tools">
        <label className="material-search">
          <Search size={17} />
          <input
            aria-label="Buscar materiales"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(3);
            }}
            placeholder="Buscar apuntes, guías o simulacros"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setVisibleCount(3); }} aria-label="Limpiar búsqueda">
              <X size={16} />
            </button>
          )}
        </label>

        <div className="filter-tabs" aria-label="Filtrar por tipo de material">
          <button type="button" className={favoritesOnly ? "active" : ""} aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(current => !current); setVisibleCount(3); }}><Heart size={13}/>Mis favoritos</button>
          {types.map((filterType) => (
            <button
              type="button"
              key={filterType}
              className={type === filterType ? "active" : ""}
              aria-pressed={type === filterType}
              onClick={() => { setType(filterType); setVisibleCount(3); }}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      <div className="results-summary">
        <strong>{filteredMaterials.length}</strong>{" "}
        {filteredMaterials.length === 1 ? "material encontrado" : "materiales encontrados"}
        {type !== "Todos" && <span> · {type}</span>}
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid">
          {visibleMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><BookOpen size={25} /></span>
          <h2>{favoritesOnly ? "Todavía no tenés favoritos" : "No encontramos materiales"}</h2>
          <p>{favoritesOnly ? "Marcá el corazón de un material para encontrarlo rápidamente acá." : "Probá con otra búsqueda o seleccioná un tipo diferente."}</p>
          <button type="button" className="btn btn-secondary" onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      {filteredMaterials.length > visibleCount && (
        <div className="load-more">
          <span>Mostrando {visibleCount} de {filteredMaterials.length} materiales</span>
          <button type="button" className="btn btn-secondary" onClick={() => setVisibleCount(current => current + 3)}>
            Cargar más materiales
          </button>
        </div>
      )}
    </>
  );
}
