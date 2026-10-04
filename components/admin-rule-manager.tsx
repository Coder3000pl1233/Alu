"use client";

import { AlertTriangle, CheckCircle2, History, RotateCcw, Settings2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { initialSecurityRules, publishRuleVersion, validateRuleChange, type RuleAudit, type SecurityRule } from "@/lib/admin-rules";

type DemoState = "datos" | "cargando" | "vacio" | "error" | "conflicto";

export function AdminRuleManager() {
  const [rules, setRules] = useState(initialSecurityRules);
  const [history, setHistory] = useState<RuleAudit[]>([]);
  const [selected, setSelected] = useState<SecurityRule | null>(null);
  const [demoState, setDemoState] = useState<DemoState>("datos");
  const [error, setError] = useState("");

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const value = Number(data.get("value"));
    const reason = String(data.get("reason") ?? "");
    const validation = validateRuleChange(value, reason);
    if (validation) { setError(validation); return; }
    if (!window.confirm(`¿Publicar la versión ${selected.version + 1} de “${selected.name}”?`)) return;
    const next = publishRuleVersion(selected, value);
    setRules(current => current.map(rule => rule.id === selected.id ? next : rule));
    setHistory(current => [{ id: crypto.randomUUID(), ruleId: selected.id, version: next.version, before: selected.value, after: value, reason, actor: "Admin General", createdAt: new Date().toISOString() }, ...current]);
    setSelected(null);
    setError("");
  };

  const restore = (audit: RuleAudit) => {
    const reason = window.prompt(`Motivo para restaurar el valor ${audit.before}:`);
    if (!reason || reason.trim().length < 5) return;
    if (!window.confirm("¿Confirmás la restauración como una nueva versión?")) return;
    setRules(current => current.map(rule => rule.id === audit.ruleId ? publishRuleVersion(rule, audit.before) : rule));
  };

  return <section className="rule-manager" id="configuracion">
    <div className="section-head"><div><h2>Reglas y umbrales</h2><div className="muted section-description">Versionado y auditoría local simulada</div></div><select className="input demo-state-select" aria-label="Simular estado de reglas" value={demoState} onChange={event => setDemoState(event.target.value as DemoState)}><option value="datos">Datos</option><option value="cargando">Cargando</option><option value="vacio">Vacío</option><option value="error">Error</option><option value="conflicto">Conflicto</option></select></div>
    {demoState === "cargando" ? <div className="card rule-state">Cargando reglas…</div> : demoState !== "datos" ? <div className="card rule-state"><AlertTriangle size={25}/><h3>{demoState === "vacio" ? "No hay reglas configuradas" : demoState === "conflicto" ? "Existe una versión más reciente" : "No pudimos cargar las reglas"}</h3><p>{demoState === "conflicto" ? "Actualizá la vista antes de publicar para evitar sobrescribir cambios." : "Estado simulado con recuperación accionable."}</p><button className="btn btn-secondary" onClick={() => setDemoState("datos")}>Recuperar vista</button></div> : <>
      <div className="rules-grid">{rules.map(rule => <article className="card rule-card" key={rule.id}><div><span className={`status ${rule.severity === "Alta" ? "red" : rule.severity === "Media" ? "amber" : "green"}`}>{rule.severity}</span><span className="status blue">v{rule.version}</span></div><Settings2 size={21}/><h3>{rule.name}</h3><strong>{rule.value} <small>{rule.unit}</small></strong><button className="btn btn-secondary" onClick={() => { setSelected(rule); setError(""); }}>Editar regla</button></article>)}</div>
      <div className="card rule-history"><div className="metrics-card-head"><div><strong>Historial de versiones</strong><span>Quién cambió qué y por qué</span></div><History size={18}/></div>{history.length ? history.map(audit => <div className="audit-row" key={audit.id}><div><strong>{rules.find(rule => rule.id === audit.ruleId)?.name} · v{audit.version}</strong><span>{audit.before} → {audit.after} · {audit.reason} · {audit.actor}</span></div><button className="btn btn-secondary compact-button" onClick={() => restore(audit)}><RotateCcw size={14}/>Restaurar</button></div>) : <p className="muted rule-empty-history">Todavía no hay cambios publicados en esta demo.</p>}</div>
    </>}
    {selected && <div className="modal-backdrop" role="presentation"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="rule-edit-title"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar"><X size={18}/></button><div className="modal-icon"><Settings2 size={20}/></div><h2 id="rule-edit-title">Editar {selected.name}</h2><p className="muted modal-description">Se creará la versión {selected.version + 1}. La versión actual no se modifica hasta confirmar.</p><form onSubmit={publish}><div className="rule-comparison"><div><span>Valor actual</span><strong>{selected.value}</strong></div><div className="field"><label htmlFor="rule-value">Nuevo valor</label><input className="input" id="rule-value" name="value" type="number" min="1" defaultValue={selected.value} required/></div></div><div className="field"><label htmlFor="rule-reason">Motivo obligatorio</label><textarea className="input" id="rule-reason" name="reason" rows={3} placeholder="Explicá por qué se modifica el umbral" required/></div>{error && <div className="form-error"><AlertTriangle size={15}/>{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Cancelar</button><button className="btn btn-primary"><CheckCircle2 size={15}/>Publicar versión</button></div></form></section></div>}
  </section>;
}
