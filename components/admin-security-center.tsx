"use client";

import { AlertTriangle, CheckCircle2, Laptop, Search, ShieldX, Smartphone, X } from "lucide-react";
import { useMemo, useState } from "react";

type Session = { id: string; student: string; device: string; location: string; started: string; active: boolean };
type Device = { id: string; student: string; name: string; kind: "desktop" | "mobile"; status: "Activo" | "Pendiente" | "Revocado"; lastSeen: string };
type SecurityEvent = { id: string; student: string; document: string; date: string; severity: "Bajo" | "Medio" | "Alto"; title: string; detail: string; resolved: boolean };

const initialSessions: Session[] = [
  { id: "SES-1048", student: "Lucía Fernández", device: "Chrome · Windows", location: "Buenos Aires, AR", started: "Hoy · 14:22", active: true },
  { id: "SES-1047", student: "Mateo Ruiz", device: "Safari · iPhone", location: "Córdoba, AR", started: "Hoy · 12:08", active: true },
  { id: "SES-1039", student: "Sofía Acosta", device: "Chrome · Android", location: "Rosario, AR", started: "Ayer · 20:41", active: false }
];

const initialDevices: Device[] = [
  { id: "DEV-81", student: "Lucía Fernández", name: "Notebook personal", kind: "desktop", status: "Activo", lastSeen: "Ahora" },
  { id: "DEV-82", student: "Lucía Fernández", name: "iPhone 15", kind: "mobile", status: "Pendiente", lastSeen: "Hace 8 min" },
  { id: "DEV-66", student: "Mateo Ruiz", name: "iPhone de Mateo", kind: "mobile", status: "Activo", lastSeen: "Hace 2 h" },
  { id: "DEV-44", student: "Sofía Acosta", name: "Equipo anterior", kind: "desktop", status: "Revocado", lastSeen: "Hace 12 días" }
];

const initialEvents: SecurityEvent[] = [
  { id: "EV-901", student: "Lucía Fernández", document: "Anatomía general", date: "2026-07-25", severity: "Medio", title: "Velocidad de navegación elevada", detail: "18 páginas consultadas en un minuto", resolved: false },
  { id: "EV-897", student: "Mateo Ruiz", document: "Biología celular", date: "2026-07-25", severity: "Alto", title: "Sesión vencida reutilizada", detail: "La solicitud fue rechazada por la simulación", resolved: false },
  { id: "EV-870", student: "Sofía Acosta", document: "Histología general", date: "2026-07-23", severity: "Bajo", title: "Cambio frecuente de página", detail: "Se registró para revisión administrativa", resolved: true }
];

export function AdminSecurityCenter() {
  const [sessions, setSessions] = useState(initialSessions);
  const [devices, setDevices] = useState(initialDevices);
  const [events, setEvents] = useState(initialEvents);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("Todas");
  const [date, setDate] = useState("");
  const [documentName, setDocumentName] = useState("Todos");

  const filteredEvents = useMemo(() => events.filter(event => {
    const term = query.toLocaleLowerCase("es");
    return (!term || event.student.toLocaleLowerCase("es").includes(term)) &&
      (severity === "Todas" || event.severity === severity) &&
      (!date || event.date === date) &&
      (documentName === "Todos" || event.document === documentName);
  }), [date, documentName, events, query, severity]);

  const revokeSession = (session: Session) => {
    if (!window.confirm(`¿Revocar la sesión ${session.id} de ${session.student}?`)) return;
    setSessions(items => items.map(item => item.id === session.id ? { ...item, active: false } : item));
    setSelectedSession(null);
  };

  const revokeAllSessions = () => {
    if (!window.confirm("¿Revocar todas las sesiones activas? Esta acción afectará a todos los estudiantes de la demo.")) return;
    setSessions(items => items.map(item => ({ ...item, active: false })));
  };

  const revokeDevice = (device: Device) => {
    if (!window.confirm(`¿Revocar el dispositivo “${device.name}” de ${device.student}?`)) return;
    setDevices(items => items.map(item => item.id === device.id ? { ...item, status: "Revocado" } : item));
    setSelectedDevice(null);
  };

  const resolveEvent = (event: SecurityEvent) => {
    setEvents(items => items.map(item => item.id === event.id ? { ...item, resolved: true } : item));
    setSelectedEvent(null);
  };

  return (
    <section id="seguridad" className="security-center">
      <div className="section-head"><div><h2>Sesiones activas</h2><div className="muted section-description">Detalle y revocación simulada</div></div><button className="btn btn-danger" onClick={revokeAllSessions}>Revocar todas</button></div>
      <div className="security-admin-grid">
        {sessions.map(session => <button className="card security-admin-card" key={session.id} onClick={() => setSelectedSession(session)}>
          <span className={`status ${session.active ? "green" : "red"}`}>{session.active ? "Activa" : "Cerrada"}</span><strong>{session.student}</strong><small>{session.device}</small><small>{session.started} · {session.id}</small>
        </button>)}
      </div>

      <div className="section-head"><div><h2>Dispositivos registrados</h2><div className="muted section-description">Estados activo, pendiente y revocado</div></div></div>
      <div className="security-admin-grid">
        {devices.map(device => <button className="card security-admin-card" key={device.id} onClick={() => setSelectedDevice(device)}>
          <span className="security-device-icon">{device.kind === "mobile" ? <Smartphone size={19}/> : <Laptop size={19}/>}</span><strong>{device.name}</strong><small>{device.student}</small><span className={`status ${device.status === "Activo" ? "green" : device.status === "Pendiente" ? "amber" : "red"}`}>{device.status}</span>
        </button>)}
      </div>

      <div className="section-head"><div><h2>Eventos de seguridad</h2><div className="muted section-description">Filtros e investigación administrativa simulada</div></div></div>
      <div className="card event-console">
        <div className="event-filters">
          <label className="material-search"><Search size={16}/><input aria-label="Filtrar por estudiante" value={query} onChange={e => setQuery(e.target.value)} placeholder="Estudiante"/></label>
          <select className="input" aria-label="Filtrar por severidad" value={severity} onChange={e => setSeverity(e.target.value)}><option>Todas</option><option>Bajo</option><option>Medio</option><option>Alto</option></select>
          <select className="input" aria-label="Filtrar por documento" value={documentName} onChange={e => setDocumentName(e.target.value)}><option>Todos</option>{Array.from(new Set(events.map(event => event.document))).map(item => <option key={item}>{item}</option>)}</select>
          <input className="input" aria-label="Filtrar por fecha" type="date" value={date} onChange={e => setDate(e.target.value)}/>
        </div>
        <div className="security-list">
          {filteredEvents.map(event => <button key={event.id} onClick={() => setSelectedEvent(event)}><div><strong>{event.title}</strong><div className="muted table-secondary">{event.student} · {event.document} · {event.date}</div></div><span className={`status ${event.resolved ? "green" : event.severity === "Alto" ? "red" : "amber"}`}>{event.resolved ? "Resuelto" : event.severity}</span></button>)}
          {!filteredEvents.length && <div className="event-empty">No hay eventos para estos filtros.</div>}
        </div>
      </div>

      {selectedSession && <DetailModal title={`Sesión ${selectedSession.id}`} onClose={() => setSelectedSession(null)}><p>{selectedSession.student} · {selectedSession.device}</p><p>{selectedSession.location} · Inicio: {selectedSession.started}</p>{selectedSession.active && <button className="btn btn-danger" onClick={() => revokeSession(selectedSession)}><ShieldX size={15}/>Revocar sesión</button>}</DetailModal>}
      {selectedDevice && <DetailModal title={selectedDevice.name} onClose={() => setSelectedDevice(null)}><p>{selectedDevice.student} · {selectedDevice.id}</p><p>Última actividad: {selectedDevice.lastSeen}</p><span className={`status ${selectedDevice.status === "Activo" ? "green" : selectedDevice.status === "Pendiente" ? "amber" : "red"}`}>{selectedDevice.status}</span>{selectedDevice.status !== "Revocado" && <button className="btn btn-danger" onClick={() => revokeDevice(selectedDevice)}><ShieldX size={15}/>Revocar dispositivo</button>}</DetailModal>}
      {selectedEvent && <DetailModal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}><p>{selectedEvent.student} · {selectedEvent.document} · {selectedEvent.date}</p><p>{selectedEvent.detail}</p>{selectedEvent.resolved ? <span className="status green"><CheckCircle2 size={13}/>Resuelto</span> : <button className="btn btn-primary" onClick={() => resolveEvent(selectedEvent)}><CheckCircle2 size={15}/>Marcar como investigado</button>}</DetailModal>}
    </section>
  );
}

function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation"><section className="modal-card security-detail" role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={18}/></button><div className="modal-icon"><AlertTriangle size={20}/></div><h2>{title}</h2>{children}</section></div>;
}
