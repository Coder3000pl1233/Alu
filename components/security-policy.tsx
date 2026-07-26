"use client";

import { securityCopy, defaultDevicePolicy } from "@/lib/product-policy";
import { Check, Eye, Laptop, LockKeyhole, MonitorSmartphone, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function SecurityPolicy() {
  const [maximumDevices, setMaximumDevices] = useState(defaultDevicePolicy.maximumRegisteredDevices);
  const [closePrevious, setClosePrevious] = useState(defaultDevicePolicy.closePreviousSessionOnLogin);
  const [saved, setSaved] = useState(false);

  const savePolicy = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="security-policy-page">
      <section className="policy-lead card">
        <span className="policy-lead-icon"><ShieldCheck size={27}/></span>
        <div>
          <div className="eyebrow">Protección y transparencia</div>
          <h2>Qué protegemos y cuáles son los límites</h2>
          <p>Usamos controles de acceso, páginas rasterizadas y marcas de agua para proteger los materiales sin prometer capacidades que un navegador no posee.</p>
        </div>
      </section>

      <div className="policy-grid">
        <PolicyCard icon={LockKeyhole} title="Acceso personal" text={securityCopy.personalAccess}/>
        <PolicyCard icon={Eye} title="Marca trazable" text={securityCopy.watermark}/>
        <PolicyCard icon={MonitorSmartphone} title="Actividad registrada" text={securityCopy.monitoring}/>
        <PolicyCard icon={TriangleAlert} title="Límite técnico" text={securityCopy.limitation}/>
      </div>

      <section className="design-section">
        <div className="design-section-head">
          <h2>Política de dispositivos y sesiones</h2>
          <p>Configuración simulada para validar cómo se comunicará esta regla antes de conectarla al backend.</p>
        </div>
        <div className="design-section-content policy-settings">
          <div className="policy-current">
            <span className="policy-device-icon"><Laptop size={24}/></span>
            <div><strong>{maximumDevices} dispositivos registrados</strong><p>El estudiante puede reconocer y reemplazar sus dispositivos autorizados.</p></div>
          </div>
          <div className="policy-current">
            <span className="policy-device-icon"><ShieldCheck size={24}/></span>
            <div><strong>1 sesión activa</strong><p>No se permiten dos sesiones de lectura simultáneas para una misma cuenta.</p></div>
          </div>

          <div className="policy-form">
            <div className="field">
              <label htmlFor="maximum-devices">Máximo de dispositivos registrados</label>
              <select className="input" id="maximum-devices" value={maximumDevices} onChange={event => setMaximumDevices(Number(event.target.value))}>
                <option value={1}>1 dispositivo</option>
                <option value={2}>2 dispositivos</option>
                <option value={3}>3 dispositivos</option>
              </select>
            </div>
            <label className="policy-check">
              <input type="checkbox" checked={closePrevious} onChange={event => setClosePrevious(event.target.checked)}/>
              <span><strong>Permitir cerrar la sesión anterior</strong><small>Al ingresar desde otro dispositivo, el usuario podrá cerrar la sesión que estaba activa.</small></span>
            </label>
            <label className="policy-check">
              <input type="checkbox" checked readOnly/>
              <span><strong>Verificar dispositivos nuevos</strong><small>La futura integración solicitará una comprobación adicional antes de autorizarlos.</small></span>
            </label>
          </div>

          <div className="policy-save">
            <span>{saved && <><Check size={15}/>Configuración simulada actualizada</>}</span>
            <button className="btn btn-primary" onClick={savePolicy}>Guardar configuración demo</button>
          </div>
        </div>
      </section>

      <section className="policy-note">
        <TriangleAlert size={20}/>
        <div><strong>Importante</strong><p>{securityCopy.limitation} {securityCopy.purpose}</p></div>
      </section>

      <section className="design-section">
        <div className="design-section-head">
          <h2>Simulador de guards</h2>
          <p>Permite comprobar cómo se comportan las rutas protegidas ante distintos estados visuales.</p>
        </div>
        <div className="design-section-content component-row">
          <Link className="btn btn-secondary" href="/app">Sesión activa</Link>
          <Link className="btn btn-secondary" href="/app?demoSession=missing">Sin sesión</Link>
          <Link className="btn btn-secondary" href="/app?demoSession=expired">Sesión vencida</Link>
          <Link className="btn btn-danger" href="/app?demoSession=revoked">Sesión revocada</Link>
        </div>
      </section>
    </div>
  );
}

function PolicyCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <article className="card policy-card">
      <span><Icon size={20}/></span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
