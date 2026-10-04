"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { validatePdfUpload } from "@/lib/admin-validation";
import dynamic from "next/dynamic";

const AdminMetrics = dynamic(() => import("@/components/admin-metrics").then(module => module.AdminMetrics), { loading: () => <div className="card lazy-panel">Cargando métricas…</div> });
const AdminSecurityCenter = dynamic(() => import("@/components/admin-security-center").then(module => module.AdminSecurityCenter), { loading: () => <div className="card lazy-panel">Cargando seguridad…</div> });
const AdminRuleManager = dynamic(() => import("@/components/admin-rule-manager").then(module => module.AdminRuleManager), { loading: () => <div className="card lazy-panel">Cargando reglas…</div> });

type StudentStatus = "Activo" | "Por vencer" | "Vencido" | "Suspendido";
type Student = {
  id: number;
  name: string;
  email: string;
  until: string;
  status: StudentStatus;
  device: string;
  suspensionReason?: string;
};

type DocumentStatus = "Listo" | "Procesando" | "Requiere revisión";
type AdminDocument = {
  id: number;
  title: string;
  subject: string;
  pages: number | null;
  status: DocumentStatus;
  progress?: number;
  detail: string;
};

const initialStudents: Student[] = [
  { id: 1, name: "Lucía Fernández", email: "lucia.f@email.com", until: "2026-08-25", status: "Activo", device: "Chrome · Windows" },
  { id: 2, name: "Mateo Ruiz", email: "mateo.r@email.com", until: "2026-08-02", status: "Por vencer", device: "Safari · iPhone" },
  { id: 3, name: "Sofía Acosta", email: "sofia.a@email.com", until: "2026-09-19", status: "Activo", device: "Chrome · Android" },
  { id: 4, name: "Tomás Silva", email: "tomas.s@email.com", until: "2026-07-18", status: "Vencido", device: "Edge · Windows" }
];

const initialDocuments: AdminDocument[] = [
  { id: 1, title: "Bloque 1 · Anatomía", subject: "Anatomía", pages: 60, status: "Listo", detail: "60 páginas · imágenes protegidas" },
  { id: 2, title: "Biología celular", subject: "Biología", pages: 112, status: "Procesando", progress: 68, detail: "Generando páginas protegidas" },
  { id: 3, title: "Histología · Anexo", subject: "Histología", pages: null, status: "Requiere revisión", detail: "El archivo supera el límite configurado" }
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

const makeTemporaryPassword = () =>
  `Aula-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

export function AdminDashboard() {
  const [students, setStudents] = useState(initialStudents);
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [manageError, setManageError] = useState("");
  const uploadTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return students;
    return students.filter(student =>
      student.name.toLocaleLowerCase("es").includes(normalized) ||
      student.email.toLocaleLowerCase("es").includes(normalized)
    );
  }, [query, students]);

  const createStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = makeTemporaryPassword();
    const newStudent: Student = {
      id: Date.now(),
      name: String(data.get("name")),
      email: String(data.get("email")),
      until: String(data.get("until")),
      status: "Activo",
      device: "Sin dispositivos"
    };
    setStudents(current => [newStudent, ...current]);
    setTemporaryPassword(password);
  };

  const updateStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;
    const data = new FormData(event.currentTarget);
    const action = String(data.get("action"));
    const newUntil = String(data.get("until"));
    const reason = String(data.get("reason") ?? "").trim();

    if (action === "suspend" && !reason) {
      setManageError("Ingresá un motivo antes de suspender la cuenta.");
      return;
    }
    if (action === "suspend" && !window.confirm(`¿Confirmás la suspensión de ${selectedStudent.name}?`)) return;
    if (action === "reactivate" && !window.confirm(`¿Confirmás la reactivación de ${selectedStudent.name}?`)) return;

    setManageError("");
    setStudents(current => current.map(student => {
      if (student.id !== selectedStudent.id) return student;
      if (action === "suspend") return { ...student, status: "Suspendido", suspensionReason: reason };
      if (action === "reactivate") return { ...student, status: "Activo", suspensionReason: undefined };
      return { ...student, until: newUntil, status: "Activo" };
    }));
    setSelectedStudent(null);
  };

  const startUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get("file");
    const title = String(data.get("title"));
    const subject = String(data.get("subject"));

    if (!(file instanceof File)) {
      setUploadError("Seleccioná un archivo PDF válido.");
      return;
    }
    const validationError = validatePdfUpload(file.name, file.size);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError("");
    setUploadProgress(5);
    if (uploadTimer.current) clearInterval(uploadTimer.current);
    uploadTimer.current = setInterval(() => {
      setUploadProgress(current => {
        const next = Math.min(current + 15, 100);
        if (next === 100 && uploadTimer.current) {
          clearInterval(uploadTimer.current);
          uploadTimer.current = null;
          setDocuments(items => [{
            id: Date.now(),
            title,
            subject,
            pages: null,
            status: "Procesando",
            progress: 0,
            detail: "En cuarentena · esperando procesamiento"
          }, ...items]);
        }
        return next;
      });
    }, 180);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setTemporaryPassword(null);
    setCopied(false);
  };

  return (
    <div className="page">
      <div className="admin-title">
        <div><div className="eyebrow">Administración</div><h1>Resumen general</h1><p className="muted">Gestioná accesos, documentos y actividad de seguridad.</p></div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Plus size={17}/>Crear estudiante</button>
      </div>

      <div className="stat-grid">
        <div className="stat"><Users size={20} color="#356ee8"/><div className="stat-value">{students.length}</div><div className="muted stat-label">Estudiantes registrados</div></div>
        <div className="stat"><UserCheck size={20} color="#16805b"/><div className="stat-value">{students.filter(item => item.status === "Activo").length}</div><div className="muted stat-label">Con acceso activo</div></div>
        <div className="stat"><FileText size={20} color="#7a52cc"/><div className="stat-value">{documents.filter(item => item.status === "Listo").length}</div><div className="muted stat-label">Documentos publicados</div></div>
        <div className="stat"><AlertTriangle size={20} color="#b54708"/><div className="stat-value">2</div><div className="muted stat-label">Eventos por revisar</div></div>
      </div>

      <div className="section-head" id="usuarios">
        <div><h2>Estudiantes</h2><div className="muted section-description">Acceso mensual administrado manualmente</div></div>
      </div>

      <div className="card">
        <div className="admin-table-tools">
          <label className="material-search">
            <Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre o correo" aria-label="Buscar estudiantes"/>
            {query && <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={16}/></button>}
          </label>
          <span className="muted">{filteredStudents.length} resultados</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Estudiante</th><th>Acceso hasta</th><th>Estado</th><th>Último dispositivo</th><th>Acción</th></tr></thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td><strong>{student.name}</strong><div className="muted table-secondary">{student.email}</div></td>
                  <td>{formatDate(student.until)}</td>
                  <td><span className={`status ${student.status === "Activo" ? "green" : student.status === "Por vencer" ? "amber" : "red"}`}>{student.status}</span></td>
                  <td>{student.device}</td>
                  <td><button className="btn btn-secondary compact-button" onClick={() => { setSelectedStudent(student); setManageError(""); }}>Gestionar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-head" id="documentos">
        <div><h2>Procesamiento de documentos</h2><div className="muted section-description">Los originales permanecen privados</div></div>
        <button className="btn btn-primary" onClick={() => { setUploadOpen(true); setUploadProgress(0); }}><Upload size={16}/>Subir PDF</button>
      </div>
      <div className="grid">
        {documents.map(document => (
          <div className="card document-admin-card" key={document.id}>
            <span className={`status ${document.status === "Listo" ? "green" : document.status === "Procesando" ? "amber" : "red"}`}>
              {document.status === "Listo" && <ShieldCheck size={13}/>}
              {document.status}{document.progress ? ` ${document.progress}%` : ""}
            </span>
            <h3>{document.title}</h3>
            <div className="muted document-subject">{document.subject}{document.pages ? ` · ${document.pages} páginas` : ""}</div>
            <div className="muted document-detail">{document.detail}</div>
            {document.status === "Procesando" && <div className="progress"><span style={{width:`${document.progress ?? 4}%`}}/></div>}
          </div>
        ))}
      </div>

      <AdminMetrics/>
      <AdminRuleManager/>
      <AdminSecurityCenter/>

      {createOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <button className="modal-close" onClick={closeCreate} aria-label="Cerrar"><X size={18}/></button>
            {!temporaryPassword ? (
              <>
                <div className="modal-icon"><Users size={21}/></div>
                <h2 id="create-title">Crear estudiante</h2>
                <p className="muted modal-description">Creá la cuenta y definí hasta cuándo tendrá acceso.</p>
                <form onSubmit={createStudent}>
                  <div className="field"><label htmlFor="student-name">Nombre completo</label><input className="input" id="student-name" name="name" required/></div>
                  <div className="field"><label htmlFor="student-email">Correo electrónico</label><input className="input" id="student-email" name="email" type="email" required/></div>
                  <div className="field"><label htmlFor="student-until">Acceso habilitado hasta</label><input className="input" id="student-until" name="until" type="date" defaultValue="2026-08-25" required/></div>
                  <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeCreate}>Cancelar</button><button className="btn btn-primary">Crear cuenta</button></div>
                </form>
              </>
            ) : (
              <div className="success-panel">
                <span className="success-icon"><Check size={24}/></span>
                <h2 id="create-title">Cuenta creada</h2>
                <p>Esta contraseña temporal se mostrará una sola vez. El estudiante deberá cambiarla al ingresar.</p>
                <div className="temporary-password"><code>{temporaryPassword}</code><button onClick={async () => { await navigator.clipboard.writeText(temporaryPassword); setCopied(true); }} aria-label="Copiar contraseña">{copied ? <Check size={17}/> : <Copy size={17}/>}</button></div>
                <button className="btn btn-primary" onClick={closeCreate}>Entendido, cerrar</button>
              </div>
            )}
          </section>
        </div>
      )}

      {selectedStudent && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card wide-modal" role="dialog" aria-modal="true" aria-labelledby="manage-title">
            <button className="modal-close" onClick={() => setSelectedStudent(null)} aria-label="Cerrar"><X size={18}/></button>
            <h2 id="manage-title">Gestionar a {selectedStudent.name}</h2>
            <p className="muted modal-description">{selectedStudent.email}</p>
            <form onSubmit={updateStudent}>
              <div className="date-comparison">
                <div><span>Acceso actual</span><strong>{formatDate(selectedStudent.until)}</strong></div>
                <div className="field"><label htmlFor="new-until">Nueva fecha de acceso</label><input className="input" id="new-until" name="until" type="date" defaultValue={selectedStudent.until}/></div>
              </div>
              <div className="management-panel">
                <h3>Estado de la cuenta</h3>
                {selectedStudent.status === "Suspendido" ? (
                  <><p className="muted">Suspendida: {selectedStudent.suspensionReason}</p><button className="btn btn-secondary" name="action" value="reactivate">Reactivar cuenta</button></>
                ) : (
                  <><div className="field"><label htmlFor="suspension-reason">Motivo para suspender</label><textarea className="input" id="suspension-reason" name="reason" rows={3} placeholder="El motivo será obligatorio al suspender"/></div><button className="btn btn-danger" name="action" value="suspend">Suspender cuenta</button></>
                )}
                {manageError && <div className="form-error"><AlertTriangle size={15}/>{manageError}</div>}
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>Cancelar</button><button className="btn btn-primary" name="action" value="extend">Confirmar nueva fecha</button></div>
            </form>
          </section>
        </div>
      )}

      {uploadOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="upload-title">
            <button className="modal-close" onClick={() => setUploadOpen(false)} aria-label="Cerrar"><X size={18}/></button>
            <div className="modal-icon"><Upload size={21}/></div>
            <h2 id="upload-title">Subir documento</h2>
            <p className="muted modal-description">El PDF quedará en cuarentena antes de ser procesado.</p>
            {uploadProgress < 100 ? (
              <form onSubmit={startUpload}>
                <div className="field"><label htmlFor="document-title">Título</label><input className="input" id="document-title" name="title" required/></div>
                <div className="field"><label htmlFor="document-subject">Materia</label><select className="input" id="document-subject" name="subject"><option>Anatomía</option><option>Biología</option><option>Histología</option></select></div>
                <div className="field"><label htmlFor="document-file">Archivo PDF · máximo 25 MB</label><input className="input file-input" id="document-file" name="file" type="file" accept="application/pdf" required/></div>
                {uploadError && <div className="form-error"><AlertTriangle size={15}/>{uploadError}</div>}
                {uploadProgress > 0 && <><div className="progress upload-progress"><span style={{width:`${uploadProgress}%`}}/></div><div className="muted progress-label">Subiendo {uploadProgress}%</div></>}
                <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setUploadOpen(false)}>Cancelar</button><button className="btn btn-primary" disabled={uploadProgress > 0 && uploadProgress < 100}>Subir a cuarentena</button></div>
              </form>
            ) : (
              <div className="success-panel"><span className="success-icon"><Check size={24}/></span><h2>Archivo recibido</h2><p>El documento está en cuarentena y aparecerá como pendiente de procesamiento.</p><button className="btn btn-primary" onClick={() => setUploadOpen(false)}>Cerrar</button></div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
