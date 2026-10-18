"use client";

import Link from "next/link";
import { Bell, BookOpen, ChevronDown, FileHeart, Gauge, Home, LogOut, MessageCircle, Plus, Search, ShieldCheck, Store, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PortalFooter } from "@/components/portal-footer";
import { createAuthGateway } from "@/lib/auth-gateway";
import type { Session } from "@/lib/api/client";

type ShellProps = { children: React.ReactNode; admin?: boolean };

const portalLinks = [
  { href: "/app", label: "Explorar", icon: Home, exact: true },
  { href: "/app/materias", label: "Materias", icon: BookOpen },
  { href: "/app/favoritos", label: "Favoritos", icon: FileHeart },
  { href: "/app/consultas", label: "Consultas", icon: MessageCircle },
  { href: "/app/mis-publicaciones", label: "Mis publicaciones", icon: Store },
];

export function AppShell({ children, admin = false }: ShellProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const accountMenuRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => { createAuthGateway().getCurrentSession().then(result => setSession(result.session)).catch(() => setSession(null)).finally(() => setSessionLoaded(true)); }, []);
  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        accountMenuRef.current.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && accountMenuRef.current?.open) {
        accountMenuRef.current.open = false;
        accountMenuRef.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href || (href === "/app" && pathname.startsWith("/app/resultados")) : pathname.startsWith(href);

  return (
    <div className="app-shell">
      <header className="portal-navbar">
        <div className="portal-navbar-inner">
          <Link className="brand" href={admin ? "/admin" : "/app"}>
            <span className="brand-mark"><BookOpen size={20}/></span>
            <span>EntreApuntes</span>
          </Link>

          {(admin || (sessionLoaded && !session)) && <nav className="portal-nav-links" aria-label="Navegación principal">
            {admin ? (
              <>
                <Link className="portal-nav-link active" href="/admin"><Gauge size={16}/>Resumen</Link>
                <Link className="portal-nav-link" href="/admin#usuarios"><Users size={16}/>Usuarios</Link>
                <Link className="portal-nav-link" href="/admin#documentos"><BookOpen size={16}/>Publicaciones</Link>
                <Link className="portal-nav-link" href="/admin#seguridad"><ShieldCheck size={16}/>Moderación</Link>
              </>
            ) : portalLinks.map(item => {
              const Icon = item.icon;
              return <Link key={item.href} className={`portal-nav-link ${isActive(item.href, item.exact) ? "active" : ""}`} href={item.href}><Icon size={16}/>{item.label}</Link>;
            })}
          </nav>}

          <div className="portal-navbar-actions">
            <form action={admin ? "/admin" : "/app/resultados"} className="navbar-search"><Search size={16}/><input name="q" aria-label="Buscar" placeholder={admin ? "Buscar" : "Buscar apuntes"}/></form>
            <button aria-label="Notificaciones" className="navbar-icon-button"><Bell size={18}/></button>
            {admin ? <Link href="/app" className="btn btn-secondary">Ver portal</Link> : <Link href="/app/publicar" className="btn btn-primary navbar-publish"><Plus size={16}/>Publicar</Link>}
            {session ? <details ref={accountMenuRef} className="navbar-account">
              <summary className="navbar-account-trigger" aria-label={`Abrir menú de cuenta de ${session.user.name}`}>
                <span className="avatar">{session.user.name.slice(0, 2).toUpperCase()}</span>
                <span className="navbar-account-name">{session.user.name}</span>
                <ChevronDown size={16} className="navbar-account-chevron" aria-hidden="true" />
              </summary>
              <div className="navbar-account-menu">
                <div className="navbar-account-identity"><strong>{session.user.name}</strong><small>{session.user.email}</small></div>
                {!admin && <nav className="navbar-account-links" aria-label="Navegación del portal">
                  {portalLinks.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return <Link key={item.href} href={item.href} className={`navbar-account-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => { if (accountMenuRef.current) accountMenuRef.current.open = false; }}><Icon size={17} aria-hidden="true" />{item.label}</Link>;
                  })}
                </nav>}
                <button type="button" onClick={async () => {
                  setLogoutError("");
                  try { await createAuthGateway().logout(); window.location.href = "/app"; }
                  catch { setLogoutError("No pudimos cerrar la sesión. Intentá nuevamente."); }
                }}><LogOut size={16} aria-hidden="true" /> Cerrar sesión</button>
                {logoutError && <p role="alert" className="form-error">{logoutError}</p>}
              </div>
            </details>
              : <Link className="btn btn-secondary" href="/login">Ingresar</Link>}
          </div>
        </div>
      </header>

      <main className="main">{children}</main>
      <PortalFooter />

      <nav className="mobile-nav">
        <Link href="/app"><Home size={19}/>Inicio</Link>
        <Link href="/app/materias"><BookOpen size={19}/>Materias</Link>
        <Link href="/app/favoritos"><FileHeart size={19}/>Favoritos</Link>
        <Link href="/app/consultas"><MessageCircle size={19}/>Consultas</Link>
        <Link href="/app/mis-publicaciones"><Store size={19}/>Publicaciones</Link>
      </nav>
    </div>
  );
}
