"use client";

import Link from "next/link";
import { BookOpen, EyeOff, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useSyncExternalStore } from "react";
import { materials, subjects } from "@/lib/mock-data";
import { dismissRecommendation, getRecommendationSnapshot, parseRecommendationPreferences, saveRecommendationPreferences, subscribeToRecommendations } from "@/lib/recommendations";

export function Recommendations() {
  const snapshot = useSyncExternalStore(subscribeToRecommendations, getRecommendationSnapshot, () => JSON.stringify({ enabled: false, dismissedIds: [] }));
  const preferences = parseRecommendationPreferences(snapshot);
  const suggestions = materials.filter(material => material.progress > 0 && !preferences.dismissedIds.includes(material.id)).slice(0, 3);

  return <section className="recommendations-section" aria-labelledby="recommendations-title">
    <div className="section-head"><div><h2 id="recommendations-title">Colecciones para explorar</h2><div className="muted section-description">Selección editorial; no modifica tus permisos</div></div></div>
    <div className="collection-row">{subjects.map(subject => <Link href={`/app/materia/${subject.id}`} className="card collection-card" key={subject.id} style={{ background: subject.color }}><BookOpen size={21}/><strong>Esenciales de {subject.name}</strong><span>Materiales seleccionados por materia</span></Link>)}</div>

    <div className="section-head"><div><h2>Recomendado para vos</h2><div className="muted section-description">Preferencia opcional basada solo en actividad local</div></div></div>
    {!preferences.enabled ? <div className="card consent-card"><span><Sparkles size={21}/></span><div><strong>¿Querés recibir recomendaciones?</strong><p>Usaremos únicamente favoritos y lecturas recientes guardados en este navegador. Podés desactivarlas cuando quieras.</p></div><button className="btn btn-primary" onClick={() => saveRecommendationPreferences({ ...preferences, enabled: true })}>Activar recomendaciones</button></div> : <>
      <div className="recommendation-toolbar"><span><ShieldCheck size={14}/>Personalización local activada</span><button onClick={() => saveRecommendationPreferences({ enabled: false, dismissedIds: [] })}><EyeOff size={14}/>Desactivar</button></div>
      {suggestions.length ? <div className="grid">{suggestions.map(material => <article className="card recommendation-card" key={material.id}><span className="recommendation-icon"><Heart size={18}/></span><div><span className="tag">Porque consultaste {material.category}</span><h3>{material.title}</h3><p>No cambia el acceso disponible para tu cuenta.</p></div><div><Link className="btn btn-primary" href={`/app/material/${material.id}`}>Ver material</Link><button className="btn-link" onClick={() => saveRecommendationPreferences(dismissRecommendation(preferences, material.id))}>No recomendar</button></div></article>)}</div> : <div className="card recommendation-empty"><Sparkles size={23}/><h3>No quedan sugerencias</h3><p>Podés seguir explorando las colecciones editoriales.</p></div>}
    </>}
  </section>;
}
