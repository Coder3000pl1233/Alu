"use client";

import Link from "next/link";
import { Bell, BookOpen, FileHeart, Gauge, Home, MessageCircle, Plus, Search, ShieldCheck, Store, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { PortalFooter } from "@/components/portal-footer";

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
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href || (href === "/app" && pathname.startsWith("/app/resultados")) : pathname.startsWith(href);

  return (
    <div className="app-shell">
      <header className="portal-navbar">
        <div className="portal-navbar-inner">
          <Link className="brand" href={admin ? "/admin" : "/app"}>
            <span className="brand-mark"><BookOpen size={20}/></span>
            <span>EntreApuntes</span>
          </Link>

          <nav className="portal-nav-links" aria-label="Navegación principal">
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
          </nav>

          <div className="portal-navbar-actions">
            <form action={admin ? "/admin" : "/app/resultados"} className="navbar-search"><Search size={16}/><input name="q" aria-label="Buscar" placeholder={admin ? "Buscar" : "Buscar apuntes"}/></form>
            <button aria-label="Notificaciones" className="navbar-icon-button"><Bell size={18}/></button>
            {admin ? <Link href="/app" className="btn btn-secondary">Ver portal</Link> : <Link href="/app/publicar" className="btn btn-primary navbar-publish"><Plus size={16}/>Publicar</Link>}
            <button className="navbar-profile" aria-label="Abrir perfil"><span className="avatar">{admin ? "AD" : "LF"}</span><span>{admin ? "Admin" : "Lucía"}</span></button>
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
