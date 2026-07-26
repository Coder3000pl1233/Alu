"use client";

import { AlertTriangle, Check, Info, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ContentSkeleton } from "@/components/ui-state";

export function DesignSystemGallery() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="design-gallery">
      <DesignSection title="Colores" description="Tokens principales utilizados por toda la interfaz.">
        <div className="color-grid">
          <ColorToken name="Navy" value="#162540"/>
          <ColorToken name="Blue" value="#356EE8"/>
          <ColorToken name="Canvas" value="#F5F7FB" bordered/>
          <ColorToken name="Success" value="#16805B"/>
          <ColorToken name="Warning" value="#A15C08"/>
          <ColorToken name="Danger" value="#B42318"/>
        </div>
      </DesignSection>

      <DesignSection title="Botones" description="Acciones primarias, secundarias y destructivas.">
        <div className="component-row">
          <button className="btn btn-primary"><Plus size={16}/>Acción principal</button>
          <button className="btn btn-secondary">Acción secundaria</button>
          <button className="btn btn-danger"><Trash2 size={16}/>Acción destructiva</button>
          <button className="btn btn-primary" disabled>Deshabilitado</button>
        </div>
      </DesignSection>

      <DesignSection title="Campos" description="Controles con label visible, foco consistente y mensajes de ayuda.">
        <div className="field-grid">
          <div className="field"><label htmlFor="demo-text">Nombre del material</label><input className="input" id="demo-text" placeholder="Ej. Anatomía general"/><small>Usá un título fácil de reconocer.</small></div>
          <div className="field"><label htmlFor="demo-select">Tipo de material</label><select className="input" id="demo-select"><option>Apunte</option><option>Guía</option><option>Libro</option></select></div>
          <div className="field"><label htmlFor="demo-error">Campo con error</label><input className="input input-error" id="demo-error" defaultValue="valor inválido"/><small className="field-error">Revisá el valor ingresado.</small></div>
        </div>
      </DesignSection>

      <DesignSection title="Badges y estados" description="Indicadores breves; nunca dependen únicamente del color.">
        <div className="component-row">
          <span className="status green"><Check size={13}/>Activo</span>
          <span className="status amber"><AlertTriangle size={13}/>Por vencer</span>
          <span className="status red"><X size={13}/>Suspendido</span>
          <span className="tag">Apunte</span>
        </div>
      </DesignSection>

      <DesignSection title="Alertas" description="Mensajes informativos, preventivos, exitosos y críticos.">
        <div className="alert-stack">
          <div className="ui-alert info"><Info size={18}/><div><strong>Información</strong><span>Este material se encuentra disponible para la demo.</span></div></div>
          <div className="ui-alert success"><Check size={18}/><div><strong>Operación completada</strong><span>Los cambios fueron guardados correctamente.</span></div></div>
          <div className="ui-alert warning"><AlertTriangle size={18}/><div><strong>Revisión necesaria</strong><span>Confirmá los datos antes de continuar.</span></div></div>
          <div className="ui-alert danger"><ShieldCheck size={18}/><div><strong>Acceso revocado</strong><span>El contenido ya no está disponible.</span></div></div>
        </div>
      </DesignSection>

      <DesignSection title="Tabla" description="Estructura responsive para datos administrativos.">
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Estudiante</th><th>Estado</th><th>Acceso hasta</th><th>Acción</th></tr></thead>
            <tbody>
              <tr><td><strong>Lucía Fernández</strong><div className="muted table-secondary">lucia.f@email.com</div></td><td><span className="status green">Activo</span></td><td>25 ago 2026</td><td><button className="btn btn-secondary compact-button">Gestionar</button></td></tr>
              <tr><td><strong>Mateo Ruiz</strong><div className="muted table-secondary">mateo.r@email.com</div></td><td><span className="status amber">Por vencer</span></td><td>02 ago 2026</td><td><button className="btn btn-secondary compact-button">Gestionar</button></td></tr>
            </tbody>
          </table>
        </div>
      </DesignSection>

      <DesignSection title="Modal" description="Diálogo con título, acción principal, cancelación y cierre explícito.">
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Abrir modal de ejemplo</button>
      </DesignSection>

      <DesignSection title="Skeletons" description="Reservan el espacio durante la carga y evitan saltos de layout.">
        <ContentSkeleton/>
      </DesignSection>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="design-modal-title">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={18}/></button>
            <div className="modal-icon"><Info size={21}/></div>
            <h2 id="design-modal-title">Confirmar operación</h2>
            <p className="muted modal-description">Este diálogo demuestra la estructura y los espaciados definidos para las operaciones del frontend.</p>
            <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button className="btn btn-primary" onClick={() => setModalOpen(false)}>Confirmar</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

function DesignSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="design-section">
      <div className="design-section-head"><h2>{title}</h2><p>{description}</p></div>
      <div className="design-section-content">{children}</div>
    </section>
  );
}

function ColorToken({ name, value, bordered = false }: { name: string; value: string; bordered?: boolean }) {
  return (
    <div className="color-token">
      <span style={{ background: value, border: bordered ? "1px solid #d0d5dd" : undefined }}/>
      <div><strong>{name}</strong><code>{value}</code></div>
    </div>
  );
}
