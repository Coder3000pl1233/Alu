"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileWarning,
  Maximize2,
  Minus,
  PanelTop,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  LogOut,
  ListTree,
  Gauge,
  Grid2X2,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { securityCopy } from "@/lib/product-policy";
import { clampPage, nextZoom } from "@/lib/viewer-utils";
import { saveReadingProgress } from "@/lib/reading-progress";
import { readViewerEvents, storeViewerEvent, type ViewerTelemetryEvent } from "@/lib/viewer-telemetry";
import { activeResourceLimit, type ViewerSourceMode } from "@/lib/viewer-source";

type ProtectedViewerProps = {
  documentId: string;
  title: string;
  pageCount: number;
  imageWidth: number;
  imageHeight: number;
  initialPage?: number;
  initialSourceMode?: ViewerSourceMode;
  tileCapable?: boolean;
};

type ViewerState = "ready" | "image-error" | "expired" | "revoked" | "reprocessing";

const pageSource = (documentId: string, page: number) =>
  `/demo-content/${documentId}/page-${String(page).padStart(3, "0")}.jpg`;

export function ProtectedViewer({
  documentId,
  title,
  pageCount,
  imageWidth,
  imageHeight,
  initialPage = 1,
  initialSourceMode = "page",
  tileCapable = false
}: ProtectedViewerProps) {
  const [page, setPage] = useState(() => clampPage(initialPage, pageCount));
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [viewerState, setViewerState] = useState<ViewerState>("ready");
  const [retryKey, setRetryKey] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [events, setEvents] = useState<ViewerTelemetryEvent[]>(() => readViewerEvents());
  const [showEvents, setShowEvents] = useState(false);
  const [frictionNotice, setFrictionNotice] = useState("");
  const [sourceMode, setSourceMode] = useState<ViewerSourceMode>(initialSourceMode);
  const [lastLoadMs, setLastLoadMs] = useState<number | null>(null);
  const loadStartedAt = useRef(0);
  const stageRef = useRef<HTMLElement>(null);
  const initialSessionPage = useRef(page);

  const reportEvent = useCallback((event: Parameters<typeof storeViewerEvent>[0]) => {
    const stored = storeViewerEvent(event);
    setEvents(current => [...current, stored].slice(-30));
  }, []);

  const changePage = (nextPage: number) => {
    const safePage = clampPage(nextPage, pageCount);
    if (safePage === page) return;
    setLoading(true);
    loadStartedAt.current = performance.now();
    setPage(safePage);
    if (sessionActive) reportEvent({ type: "page_viewed", documentId, page: safePage });
    stageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeZoom = (amount: number) => {
    setFitWidth(false);
    setZoom(current => nextZoom(current, amount));
  };

  const finishPageLoad = () => {
    setLoading(false);
    if (loadStartedAt.current > 0) setLastLoadMs(Math.round(performance.now() - loadStartedAt.current));
  };

  useEffect(() => {
    saveReadingProgress({ documentId, page, updatedAt: new Date().toISOString() });
  }, [documentId, page]);

  useEffect(() => {
    storeViewerEvent({ type: "session_started", documentId, page: initialSessionPage.current });
    const handleVisibility = () => setSessionPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [documentId]);

  useEffect(() => {
    if (!sessionActive || sessionPaused) return;
    const heartbeat = window.setInterval(
      () => reportEvent({ type: "heartbeat", documentId, page }),
      15000
    );
    return () => window.clearInterval(heartbeat);
  }, [documentId, page, reportEvent, sessionActive, sessionPaused]);

  useEffect(() => {
    const preloadPages = [page - 1, page + 1].filter(item => item >= 1 && item <= pageCount);
    preloadPages.forEach(item => {
      const image = new window.Image();
      image.src = pageSource(documentId, item);
    });
  }, [documentId, page, pageCount]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["p", "s"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        const reason = event.key.toLowerCase() === "p" ? "print" : "save";
        setFrictionNotice(reason === "print" ? "La impresión está deshabilitada en esta demo." : "El guardado directo está deshabilitado en esta demo.");
        reportEvent({ type: "friction_triggered", documentId, page, reason });
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") changePage(page - 1);
      if (event.key === "ArrowRight" || event.key === "PageDown") changePage(page + 1);
      if (event.key === "+" || event.key === "=") changeZoom(0.1);
      if (event.key === "-") changeZoom(-0.1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (!frictionNotice) return;
    const timeout = window.setTimeout(() => setFrictionNotice(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [frictionNotice]);

  const triggerFriction = (reason: "drag" | "context_menu") => {
    setFrictionNotice(reason === "drag" ? "El arrastre de páginas está deshabilitado." : "El menú contextual está deshabilitado sobre el documento.");
    reportEvent({ type: "friction_triggered", documentId, page, reason });
  };

  const closeViewerSession = () => {
    reportEvent({ type: "session_closed", documentId, page });
    setSessionActive(false);
    setSessionPaused(false);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const retryPage = () => {
    setRetryKey(current => current + 1);
    setViewerState("ready");
    setLoading(true);
  };

  const restoreSession = () => {
    setViewerState("ready");
    setLoading(true);
    setRetryKey(current => current + 1);
  };

  return (
    <main className="viewer-shell">
      <header className="viewer-bar">
        <div className="viewer-document">
          <Link href={`/app/material/${documentId}`} aria-label="Cerrar visor"><X size={20}/></Link>
          <div>
            <strong>{title}</strong>
            <div title={securityCopy.watermark}><ShieldCheck size={11}/>Imagen protegida · watermark incorporado</div>
          </div>
        </div>

        <div className="viewer-controls" aria-label="Controles de zoom">
          <button className="viewer-button" onClick={() => changeZoom(-0.1)} aria-label="Alejar" disabled={zoom <= 0.5 && !fitWidth}><Minus size={16}/></button>
          <button className={`viewer-fit ${fitWidth ? "active" : ""}`} onClick={() => setFitWidth(true)} title="Ajustar al ancho">
            <PanelTop size={15}/>Ajustar
          </button>
          <span>{fitWidth ? "Ancho" : `${Math.round(zoom * 100)}%`}</span>
          <button className="viewer-button" onClick={() => changeZoom(0.1)} aria-label="Acercar" disabled={zoom >= 1.75}><Plus size={16}/></button>
          <button className="viewer-button" onClick={toggleFullscreen} aria-label="Pantalla completa"><Maximize2 size={16}/></button>
        </div>

        <div className="viewer-controls" aria-label="Navegación de páginas">
          <button className="viewer-button" onClick={() => changePage(page - 1)} aria-label="Página anterior" disabled={page === 1}><ChevronLeft size={17}/></button>
          <label className="page-control">
            <span className="sr-only">Página actual</span>
            <input
              value={page}
              inputMode="numeric"
              onChange={event => {
                const value = Number(event.target.value);
                if (Number.isInteger(value)) changePage(value);
              }}
            />
            <span>de {pageCount}</span>
          </label>
          <button className="viewer-button" onClick={() => changePage(page + 1)} aria-label="Página siguiente" disabled={page === pageCount}><ChevronRight size={17}/></button>
        </div>

        <label className="viewer-state-control">
          <span>Simular</span>
          <select
            value={viewerState}
            onChange={event => setViewerState(event.target.value as ViewerState)}
            aria-label="Simular estado del visor"
          >
            <option value="ready">Normal</option>
            <option value="image-error">Error de imagen</option>
            <option value="expired">Sesión vencida</option>
            <option value="revoked">Acceso revocado</option>
            <option value="reprocessing">En reproceso</option>
          </select>
        </label>
      </header>

      <div className="viewer-session-strip">
        <span className={`session-indicator ${sessionActive && !sessionPaused ? "active" : ""}`}><Activity size={13}/>{!sessionActive ? "Sesión cerrada" : sessionPaused ? "Heartbeat pausado" : "Sesión activa · heartbeat 15 s"}</span>
        <button type="button" onClick={() => setShowEvents(current => !current)}><ListTree size={14}/>Eventos ({events.length})</button>
        {tileCapable && <button type="button" aria-pressed={sourceMode === "tiles"} onClick={() => { setLoading(true); loadStartedAt.current = performance.now(); setSourceMode(current => current === "page" ? "tiles" : "page"); }}><Grid2X2 size={14}/>{sourceMode === "tiles" ? "Tiles activos" : "Usar tiles"}</button>}
        <span className="viewer-performance"><Gauge size={13}/>{activeResourceLimit(sourceMode)} recursos máx. · {lastLoadMs === null ? "midiendo" : `${lastLoadMs} ms`}</span>
        {sessionActive && <button type="button" onClick={closeViewerSession}><LogOut size={14}/>Cerrar sesión de lectura</button>}
      </div>

      {showEvents && (
        <aside className="telemetry-panel" aria-label="Telemetría simulada">
          <div><strong>Telemetría local segura</strong><button type="button" onClick={() => setShowEvents(false)} aria-label="Cerrar telemetría"><X size={16}/></button></div>
          <p>Solo registra tipo, documento, página, motivo permitido y fecha. No guarda imágenes, texto, credenciales ni tokens.</p>
          <ul>
            {events.slice(-8).reverse().map(event => (
              <li key={event.id}><span>{event.type}</span><small>{event.page ? `p. ${event.page} · ` : ""}{new Date(event.createdAt).toLocaleTimeString("es-AR")}</small></li>
            ))}
          </ul>
        </aside>
      )}

      {frictionNotice && <div className="friction-toast" role="status"><ShieldCheck size={16}/>{frictionNotice}</div>}

      <section
        className="viewer-stage"
        ref={stageRef}
        aria-busy={loading}
        onContextMenu={event => { event.preventDefault(); triggerFriction("context_menu"); }}
        onDragStart={event => { event.preventDefault(); triggerFriction("drag"); }}
      >
        {viewerState === "ready" ? (
          <>
            {loading && <div className="page-loader"><span/>Cargando página {page}…</div>}
            <div
              className={`protected-page ${fitWidth ? "fit-width" : ""}`}
              style={!fitWidth ? { width: `${820 * zoom}px` } : undefined}
            >
              {sourceMode === "tiles" ? (
                <TilePage src={pageSource(documentId, page)} title={title} page={page} imageWidth={imageWidth} imageHeight={imageHeight} retryKey={retryKey} onLoad={finishPageLoad} onError={() => { setLoading(false); setViewerState("image-error"); reportEvent({ type: "page_error", documentId, page }); }}/>
              ) : (
                <Image key={`${page}-${retryKey}`} src={pageSource(documentId, page)} width={imageWidth} height={imageHeight} alt={`Página ${page} de ${title}`} priority unoptimized onLoad={finishPageLoad} onError={() => { setLoading(false); setViewerState("image-error"); reportEvent({ type: "page_error", documentId, page }); }}/>
              )}
            </div>
          </>
        ) : (
          <ViewerStatus
            state={viewerState}
            documentId={documentId}
            onRetry={retryPage}
            onRestoreSession={restoreSession}
          />
        )}
      </section>
    </main>
  );
}

function TilePage({ src, title, page, imageWidth, imageHeight, retryKey, onLoad, onError }: { src: string; title: string; page: number; imageWidth: number; imageHeight: number; retryKey: number; onLoad: () => void; onError: () => void }) {
  return <div className="tile-page" style={{ aspectRatio: `${imageWidth}/${imageHeight}` }} aria-label={`Página ${page} de ${title} en modo tiles`}>
    {["top-left", "top-right", "bottom-left", "bottom-right"].map((position, index) => <div className={`page-tile ${position}`} key={`${retryKey}-${position}`}>
      <Image src={src} width={imageWidth} height={imageHeight} alt="" aria-hidden unoptimized priority={index === 0} onLoad={index === 0 ? onLoad : undefined} onError={onError}/>
    </div>)}
  </div>;
}

function ViewerStatus({
  state,
  documentId,
  onRetry,
  onRestoreSession
}: {
  state: Exclude<ViewerState, "ready">;
  documentId: string;
  onRetry: () => void;
  onRestoreSession: () => void;
}) {
  const content = {
    "image-error": {
      icon: <AlertTriangle size={29}/>,
      tone: "warning",
      title: "No pudimos cargar esta página",
      description: "La conexión se interrumpió o la imagen no está disponible temporalmente.",
      action: <button className="btn btn-primary" onClick={onRetry}><RefreshCw size={16}/>Reintentar página</button>
    },
    expired: {
      icon: <Clock3 size={29}/>,
      tone: "warning",
      title: "La sesión de lectura venció",
      description: "Por seguridad, necesitás renovar la sesión antes de seguir consultando el material.",
      action: <button className="btn btn-primary" onClick={onRestoreSession}><RefreshCw size={16}/>Renovar sesión de prueba</button>
    },
    revoked: {
      icon: <ShieldX size={29}/>,
      tone: "danger",
      title: "El acceso fue revocado",
      description: "Esta sesión ya no tiene permiso para visualizar el material. Volvé a la ficha para continuar.",
      action: <Link className="btn btn-primary" href={`/app/material/${documentId}`}>Cerrar visor</Link>
    },
    reprocessing: {
      icon: <FileWarning size={29}/>,
      tone: "neutral",
      title: "El documento se está reprocesando",
      description: "Estamos preparando una nueva versión. El material volverá a estar disponible cuando finalice el proceso.",
      action: <Link className="btn btn-secondary" href={`/app/material/${documentId}`}>Volver a la ficha</Link>
    }
  }[state];

  return (
    <div className={`viewer-status ${content.tone}`} role="alert">
      <span className="viewer-status-icon">{content.icon}</span>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      <div className="viewer-status-actions">{content.action}</div>
      <span className="viewer-status-code">Estado simulado · M04-05</span>
    </div>
  );
}
