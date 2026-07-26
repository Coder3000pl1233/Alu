"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { useSyncExternalStore } from "react";
import { materials } from "@/lib/mock-data";
import {
  getReadingProgressSnapshot,
  parseReadingProgress,
  subscribeToReadingProgress
} from "@/lib/reading-progress";

export function ContinueReading() {
  const snapshot = useSyncExternalStore(
    subscribeToReadingProgress,
    getReadingProgressSnapshot,
    () => ""
  );
  const progress = parseReadingProgress(snapshot);
  const material = progress ? materials.find(item => item.id === progress.documentId) : undefined;

  if (!progress || !material) {
    return (
      <div className="card continue-empty">
        <span><BookOpen size={22}/></span>
        <div>
          <strong>Todavía no empezaste una lectura</strong>
          <p>Abrí un material para guardar automáticamente la última página consultada.</p>
        </div>
        <Link className="btn btn-primary" href="#biblioteca">Explorar materias <ArrowRight size={15}/></Link>
      </div>
    );
  }

  const page = Math.min(progress.page, material.pages);
  const percentage = Math.round((page / material.pages) * 100);

  return (
    <article className="card continue-card">
      <div className="continue-cover" style={{ background: material.color }}><BookOpen size={25}/></div>
      <div className="continue-content">
        <span className="continue-meta"><Clock3 size={13}/>{material.category} · Página {page} de {material.pages}</span>
        <h3>{material.title}</h3>
        <div className="progress"><span style={{ width: `${percentage}%` }}/></div>
      </div>
      <Link className="btn btn-primary" href={`/app/material/${material.id}/visor?page=${page}`}>Continuar <ArrowRight size={15}/></Link>
    </article>
  );
}
