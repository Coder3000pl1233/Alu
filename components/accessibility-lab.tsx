"use client";

import { AlertTriangle, CheckCircle2, Eye, Focus, Keyboard, ListTree, Monitor, ScanText, Volume2 } from "lucide-react";
import { useState } from "react";
import { recommendedWatermarkPreset, watermarkPresets, type WatermarkPresetId } from "@/lib/accessibility-lab";

export function AccessibilityLab() {
  const [preset, setPreset] = useState<WatermarkPresetId>("equilibrado");
  const [minutes, setMinutes] = useState(30);
  const [reducedContrast, setReducedContrast] = useState(false);
  const [alternativeAvailable, setAlternativeAvailable] = useState(true);
  const selected = watermarkPresets[preset];
  const recommended = recommendedWatermarkPreset(minutes, reducedContrast);

  return <div className="accessibility-lab">
    <section className="design-section">
      <div className="design-section-head"><div><h2>Laboratorio de watermark y legibilidad</h2><p>Comparación visual para lectura prolongada. El visor productivo seguirá usando la marca horneada en la imagen.</p></div><span className="status blue">M00-07</span></div>
      <div className="design-section-content watermark-lab-grid">
        <div className="watermark-controls">
          <fieldset><legend>Intensidad de la marca</legend><div className="preset-options">{Object.entries(watermarkPresets).map(([id, option]) => <button type="button" key={id} className={preset === id ? "active" : ""} aria-pressed={preset === id} onClick={() => setPreset(id as WatermarkPresetId)}><strong>{option.label}</strong><span>Contraste {option.contrast.toLowerCase()}</span></button>)}</div></fieldset>
          <label className="field"><span>Duración de lectura: {minutes} minutos</span><input type="range" min="5" max="60" step="5" value={minutes} onChange={event => setMinutes(Number(event.target.value))}/></label>
          <label className="policy-check"><input type="checkbox" checked={reducedContrast} onChange={event => setReducedContrast(event.target.checked)}/><span><strong>Preferir menor contraste</strong><small>Simula sensibilidad visual o lectura prolongada.</small></span></label>
          <div className="lab-recommendation"><CheckCircle2 size={17}/><p>Configuración recomendada: <strong>{watermarkPresets[recommended].label}</strong>. Mantiene trazabilidad con menor interferencia durante sesiones de {minutes} minutos.</p></div>
        </div>
        <article className="watermark-preview" aria-label={`Vista previa de watermark ${selected.label}`}>
          <div className="preview-watermarks" style={{ opacity: selected.opacity, gap: selected.spacing / 3 }}>{Array.from({ length: 12 }).map((_, index) => <span key={index}>LF · ANATOMÍA · SESIÓN 1048</span>)}</div>
          <div className="preview-content"><span>ANATOMÍA GENERAL</span><h3>Organización del cuerpo humano</h3><p>El cuerpo humano se organiza en niveles relacionados entre sí. Las células forman tejidos; los tejidos forman órganos y los órganos participan en sistemas.</p><h4>Posición anatómica</h4><p>La descripción utiliza referencias constantes para indicar ubicación, dirección y relación entre estructuras.</p></div>
        </article>
      </div>
    </section>

    <section className="design-section">
      <div className="design-section-head"><div><h2>Propuesta de alternativa accesible</h2><p>Experiencia equivalente, controlada por permisos y sin exponer el PDF original.</p></div><span className="status blue">M00-08</span></div>
      <div className="design-section-content accessible-proposal">
        <div className="accessible-principles">
          <Principle icon={Keyboard} title="Teclado completo" text="Orden de foco predecible, salto a contenido y navegación anterior/siguiente."/>
          <Principle icon={Volume2} title="Anuncios semánticos" text="Página, título, estado y errores anunciados sin repetir controles."/>
          <Principle icon={Eye} title="Baja visión" text="Zoom, contraste y espaciado sin pérdida de contenido ni desplazamiento inesperado."/>
          <Principle icon={Focus} title="Foco visible" text="El foco vuelve al encabezado de la página después de navegar."/>
        </div>
        <div className="accessible-viewer-prototype">
          <div className="accessible-prototype-bar"><span><ScanText size={17}/>Modo accesible propuesto</span><label><input type="checkbox" checked={alternativeAvailable} onChange={event => setAlternativeAvailable(event.target.checked)}/>Disponible</label></div>
          {alternativeAvailable ? <div className="accessible-document">
            <aside aria-label="Índice del material"><strong><ListTree size={15}/>Contenido</strong><a href="#intro">1. Introducción</a><a href="#posicion">2. Posición anatómica</a><a href="#planos">3. Planos y ejes</a></aside>
            <main><div className="accessible-page-status" aria-live="polite">Página 1 de 60 · acceso personal</div><h3 id="intro" tabIndex={-1}>Introducción a la Anatomía</h3><p>Versión estructurada de demostración. El contenido real deberá ser generado y autorizado por el backend.</p><h4 id="posicion">Posición anatómica</h4><p>Texto semántico, encabezados y listas conservan el orden lógico del material.</p><div className="accessible-actions"><button className="btn btn-secondary" disabled>Anterior</button><button className="btn btn-primary">Página siguiente</button></div></main>
          </div> : <div className="accessible-unavailable" role="status"><AlertTriangle size={26}/><h3>La alternativa accesible todavía no está disponible</h3><p>Podés continuar en el visor de imágenes o solicitar una versión equivalente al equipo responsable.</p><button className="btn btn-secondary">Volver al visor</button></div>}
        </div>
        <div className="policy-note"><Monitor size={19}/><div><strong>Mismos permisos, diferente presentación</strong><p>La propuesta no descarga el PDF, no funciona offline y debe validar la misma sesión antes de entregar contenido estructurado.</p></div></div>
      </div>
    </section>
  </div>;
}

function Principle({ icon: Icon, title, text }: { icon: typeof Keyboard; title: string; text: string }) {
  return <article className="card accessible-principle"><span><Icon size={19}/></span><h3>{title}</h3><p>{text}</p></article>;
}
