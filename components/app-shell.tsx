import Link from "next/link";
import { Accessibility, Bell, BookOpen, FileText, Gauge, Home, Layers3, Search, Settings, ShieldCheck, Users } from "lucide-react";

type ShellProps = { children: React.ReactNode; admin?: boolean };

export function AppShell({ children, admin = false }: ShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href={admin ? "/admin" : "/app"}>
          <span className="brand-mark"><ShieldCheck size={20} /></span>
          <span>Aula Segura</span>
        </Link>
        <div className="side-label">{admin ? "Administración" : "Mi espacio"}</div>
        <nav className="side-nav">
          {admin ? (
            <>
              <Link className="side-link active" href="/admin"><Gauge size={18} />Resumen</Link>
              <Link className="side-link" href="/admin#usuarios"><Users size={18} />Estudiantes</Link>
              <Link className="side-link" href="/admin#documentos"><FileText size={18} />Documentos</Link>
              <Link className="side-link" href="/admin#seguridad"><ShieldCheck size={18} />Seguridad</Link>
              <Link className="side-link" href="/admin#configuracion"><Settings size={18} />Configuración</Link>
            </>
          ) : (
            <>
              <Link className="side-link active" href="/app"><Home size={18} />Inicio</Link>
              <Link className="side-link" href="/app#biblioteca"><BookOpen size={18} />Biblioteca</Link>
              <Link className="side-link" href="/app#recientes"><FileText size={18} />Continuar leyendo</Link>
              <Link className="side-link" href="/app/estados"><Layers3 size={18} />Estados UI</Link>
              <Link className="side-link" href="/app/componentes"><Settings size={18} />Componentes</Link>
              <Link className="side-link" href="/app/seguridad"><ShieldCheck size={18} />Seguridad</Link>
              <Link className="side-link" href="/app/accesibilidad"><Accessibility size={18} />Accesibilidad</Link>
            </>
          )}
        </nav>
        <div className="side-profile">
          <span className="avatar">{admin ? "AD" : "LF"}</span>
          <div>
            <div style={{fontSize: 13, fontWeight: 700, color: "white"}}>{admin ? "Admin General" : "Lucía Fernández"}</div>
            <div style={{fontSize: 11, color: "#8191ac", marginTop: 2}}>{admin ? "Administrador" : "Acceso hasta 25 ago"}</div>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="search"><Search size={17} /><input aria-label="Buscar" placeholder={admin ? "Buscar estudiantes o documentos" : "Buscar en tu biblioteca"} /></div>
          <div style={{display:"flex", alignItems:"center", gap:14}}>
            <button aria-label="Notificaciones" className="btn btn-secondary" style={{padding:9}}><Bell size={17} /></button>
            <Link href={admin ? "/app" : "/admin"} className="btn btn-secondary">{admin ? "Vista estudiante" : "Administrar"}</Link>
          </div>
        </header>
        {children}
      </main>
      <nav className="mobile-nav">
        <Link href={admin ? "/admin" : "/app"}><Home size={19} />Inicio</Link>
        <Link href={admin ? "/admin#usuarios" : "/app#biblioteca"}><BookOpen size={19} />Contenido</Link>
        <Link href={admin ? "/app" : "/admin"}><Settings size={19} />Cuenta</Link>
      </nav>
    </div>
  );
}
