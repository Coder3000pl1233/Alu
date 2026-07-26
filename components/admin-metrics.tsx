"use client";

import { AlertTriangle, BarChart3, Database, FileCheck2, Gauge, RefreshCw, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { filterMetricRecords, metricRecords, summarizeMetrics, type MetricsPeriod, type MetricsSubject } from "@/lib/admin-metrics";

type DemoState = "datos" | "cargando" | "vacio" | "error";
const formatNumber = new Intl.NumberFormat("es-AR");

export function AdminMetrics() {
  const [period, setPeriod] = useState<MetricsPeriod>("30 días");
  const [subject, setSubject] = useState<MetricsSubject>("Todas");
  const [demoState, setDemoState] = useState<DemoState>("datos");
  const filtered = useMemo(() => filterMetricRecords(metricRecords, period, subject), [period, subject]);
  const summary = useMemo(() => summarizeMetrics(filtered), [filtered]);
  const maximumPages = Math.max(...filtered.map(record => record.pagesServed), 1);

  return (
    <section className="admin-metrics" id="metricas">
      <div className="section-head">
        <div><h2>Métricas de procesamiento y consumo</h2><div className="muted section-description">Datos simulados para validar la operación y estimar costos</div></div>
        <div className="metrics-filters">
          <select className="input" aria-label="Período de métricas" value={period} onChange={event => setPeriod(event.target.value as MetricsPeriod)}><option>7 días</option><option>30 días</option><option>90 días</option></select>
          <select className="input" aria-label="Materia de métricas" value={subject} onChange={event => setSubject(event.target.value as MetricsSubject)}><option>Todas</option><option>Anatomía</option><option>Biología</option><option>Histología</option></select>
          <select className="input demo-state-select" aria-label="Simular estado de métricas" value={demoState} onChange={event => setDemoState(event.target.value as DemoState)}><option value="datos">Datos</option><option value="cargando">Cargando</option><option value="vacio">Vacío</option><option value="error">Error</option></select>
        </div>
      </div>

      {demoState === "cargando" ? <MetricsLoading/> : demoState === "error" ? <MetricsMessage kind="error" onRetry={() => setDemoState("datos")}/> : demoState === "vacio" || !filtered.length ? <MetricsMessage kind="empty" onRetry={() => { setSubject("Todas"); setDemoState("datos"); }}/> : <>
        <div className="metrics-summary">
          <MetricCard icon={<FileCheck2 size={18}/>} value={summary.processed} label="Documentos procesados" note={`${summary.pending} pendientes · ${summary.failed} fallidos`}/>
          <MetricCard icon={<BarChart3 size={18}/>} value={formatNumber.format(summary.pagesServed)} label="Páginas servidas" note={`Últimos ${period.toLowerCase()}`}/>
          <MetricCard icon={<UsersRound size={18}/>} value={summary.sessions} label="Sesiones de lectura" note="Sesiones simuladas únicas"/>
          <MetricCard icon={<Database size={18}/>} value={`${(summary.storageMb / 1024).toFixed(1)} GB`} label="Almacenamiento estimado" note="Derivados de demostración"/>
        </div>

        <div className="metrics-layout">
          <article className="card metrics-chart">
            <div className="metrics-card-head"><div><strong>Páginas servidas</strong><span>Tendencia por materia</span></div><span className="status blue">Simulado</span></div>
            <div className="bar-chart" role="img" aria-label="Gráfico simulado de páginas servidas por materia">
              {filtered.map((record, index) => <div className="bar-column" key={`${record.subject}-${record.day}`}><span className="bar-value">{formatNumber.format(record.pagesServed)}</span><div style={{ height: `${Math.max(16, record.pagesServed / maximumPages * 150)}px` }} className={`metric-bar tone-${index % 3}`}/><small>{record.subject.slice(0, 4)}</small></div>)}
            </div>
          </article>
          <article className="card consumption-card">
            <div className="metrics-card-head"><div><strong>Señales operativas</strong><span>Valores orientativos de la demo</span></div><Gauge size={18}/></div>
            <div className="consumption-row"><span>Tasa de procesamiento correcto</span><strong>{Math.round(summary.processed / Math.max(summary.processed + summary.failed, 1) * 100)}%</strong></div>
            <div className="consumption-row"><span>Páginas por sesión</span><strong>{Math.round(summary.pagesServed / Math.max(summary.sessions, 1))}</strong></div>
            <div className="consumption-row"><span>Documentos pendientes</span><strong className={summary.pending > 5 ? "metric-warning" : ""}>{summary.pending}</strong></div>
            <div className="metrics-note"><AlertTriangle size={15}/><p>Estas métricas no representan facturación ni consumo real. Se reemplazarán por datos de API.</p></div>
          </article>
        </div>
      </>}
    </section>
  );
}

function MetricCard({ icon, value, label, note }: { icon: React.ReactNode; value: string | number; label: string; note: string }) {
  return <article className="card metric-card"><span>{icon}</span><strong>{value}</strong><h3>{label}</h3><small>{note}</small></article>;
}

function MetricsLoading() {
  return <div className="metrics-summary" aria-label="Cargando métricas" aria-busy="true">{Array.from({ length: 4 }).map((_, index) => <div className="card metric-skeleton" key={index}><span/><span/><span/></div>)}</div>;
}

function MetricsMessage({ kind, onRetry }: { kind: "empty" | "error"; onRetry: () => void }) {
  return <div className="card metrics-message"><span>{kind === "error" ? <AlertTriangle size={24}/> : <BarChart3 size={24}/>}</span><h3>{kind === "error" ? "No pudimos cargar las métricas" : "No hay datos para estos filtros"}</h3><p>{kind === "error" ? "Se simuló un error del futuro servicio de métricas." : "Probá ampliando el período o seleccionando todas las materias."}</p><button className="btn btn-secondary" onClick={onRetry}><RefreshCw size={15}/>{kind === "error" ? "Reintentar" : "Restablecer filtros"}</button></div>;
}
