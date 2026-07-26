import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Ban, CalendarX, FolderOpen, LockKeyhole, RefreshCw, ShieldX } from "lucide-react";
import Link from "next/link";

export type UiStateKind = "empty" | "error" | "forbidden" | "suspended" | "expired" | "revoked";

const stateContent: Record<UiStateKind, {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  tone: string;
}> = {
  empty: {
    icon: FolderOpen,
    eyebrow: "Sin contenido",
    title: "Todavía no hay materiales",
    description: "Cuando se publiquen materiales para esta materia, aparecerán en este espacio.",
    tone: "neutral"
  },
  error: {
    icon: AlertTriangle,
    eyebrow: "Error temporal",
    title: "No pudimos cargar la información",
    description: "Revisá tu conexión e intentá nuevamente. Si el problema continúa, probá más tarde.",
    tone: "warning"
  },
  forbidden: {
    icon: LockKeyhole,
    eyebrow: "Sin permiso",
    title: "No tenés acceso a esta sección",
    description: "Tu cuenta no cuenta con permisos para consultar este espacio.",
    tone: "warning"
  },
  suspended: {
    icon: Ban,
    eyebrow: "Cuenta suspendida",
    title: "Tu acceso fue suspendido",
    description: "No podés visualizar materiales mientras la cuenta esté suspendida. Contactá al administrador para revisar el estado.",
    tone: "danger"
  },
  expired: {
    icon: CalendarX,
    eyebrow: "Acceso vencido",
    title: "Tu período de acceso finalizó",
    description: "El acceso venció el 18 de julio de 2026. Informá tu próximo pago al administrador para solicitar la renovación.",
    tone: "warning"
  },
  revoked: {
    icon: ShieldX,
    eyebrow: "Acceso revocado",
    title: "Esta sesión ya no está habilitada",
    description: "El contenido fue ocultado y la sesión debe cerrarse. Volvé al inicio para continuar.",
    tone: "danger"
  }
};

export function UiState({
  kind,
  onRetry
}: {
  kind: UiStateKind;
  onRetry?: () => void;
}) {
  const content = stateContent[kind];
  const Icon = content.icon;

  return (
    <section className={`ui-state ${content.tone}`} role={kind === "error" ? "alert" : "status"}>
      <span className="ui-state-icon"><Icon size={27}/></span>
      <div className="eyebrow">{content.eyebrow}</div>
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <div className="ui-state-actions">
        {kind === "error" && <button className="btn btn-primary" onClick={onRetry}><RefreshCw size={16}/>Reintentar</button>}
        {kind === "empty" && <Link className="btn btn-secondary" href="/app">Volver a materias</Link>}
        {kind === "forbidden" && <Link className="btn btn-primary" href="/app">Ir a mi biblioteca</Link>}
        {kind === "suspended" && <button className="btn btn-secondary">Contactar al administrador</button>}
        {kind === "expired" && <button className="btn btn-primary">Ver instrucciones de renovación</button>}
        {kind === "revoked" && <Link className="btn btn-primary" href="/login">Cerrar sesión</Link>}
      </div>
    </section>
  );
}

export function ContentSkeleton({ type = "cards" }: { type?: "cards" | "table" }) {
  if (type === "table") {
    return (
      <div className="skeleton-table" aria-label="Cargando tabla" aria-busy="true">
        <div className="skeleton-line wide"/>
        {Array.from({ length: 4 }, (_, index) => (
          <div className="skeleton-row" key={index}>
            <span/><span/><span/><span/>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid" aria-label="Cargando materiales" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="card skeleton-card" key={index}>
          <div className="skeleton-cover"/>
          <div className="skeleton-body"><span/><span/><span/></div>
        </div>
      ))}
    </div>
  );
}
