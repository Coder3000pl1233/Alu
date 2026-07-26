"use client";

import { ContentSkeleton, UiState, type UiStateKind } from "@/components/ui-state";
import { useState } from "react";

const states: Array<{ id: "loading-cards" | "loading-table" | UiStateKind; label: string }> = [
  { id: "loading-cards", label: "Carga de materiales" },
  { id: "loading-table", label: "Carga de tabla" },
  { id: "empty", label: "Contenido vacío" },
  { id: "error", label: "Error recuperable" },
  { id: "forbidden", label: "Sin permiso" },
  { id: "suspended", label: "Cuenta suspendida" },
  { id: "expired", label: "Acceso vencido" },
  { id: "revoked", label: "Acceso revocado" }
];

export function InterfaceStates() {
  const [selected, setSelected] = useState<(typeof states)[number]["id"]>("loading-cards");
  const [retryCount, setRetryCount] = useState(0);

  return (
    <>
      <div className="state-tabs" aria-label="Estados de interfaz">
        {states.map(state => (
          <button
            key={state.id}
            className={selected === state.id ? "active" : ""}
            aria-pressed={selected === state.id}
            onClick={() => setSelected(state.id)}
          >
            {state.label}
          </button>
        ))}
      </div>

      <div className="state-demo">
        <div className="state-demo-head">
          <div><strong>Vista previa</strong><span>Estado: {states.find(state => state.id === selected)?.label}</span></div>
          {selected === "error" && retryCount > 0 && <span className="status green">Reintentos: {retryCount}</span>}
        </div>
        <div className="state-demo-canvas">
          {selected === "loading-cards" && <ContentSkeleton/>}
          {selected === "loading-table" && <ContentSkeleton type="table"/>}
          {!selected.startsWith("loading") && (
            <UiState kind={selected as UiStateKind} onRetry={() => setRetryCount(current => current + 1)}/>
          )}
        </div>
      </div>
    </>
  );
}
