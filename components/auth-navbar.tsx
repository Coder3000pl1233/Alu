import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export function AuthNavbar({ current }: { current: "login" | "registro" }) {
  return <header className="auth-navbar">
    <div className="auth-navbar-inner">
      <Link className="brand auth-navbar-brand" href="/app"><span className="brand-mark"><BookOpenCheck size={19} aria-hidden="true" /></span>EntreApuntes</Link>
      <nav className="auth-navbar-links" aria-label="Navegación de cuenta">
        <Link className="auth-nav-link" href="/app">Explorar apuntes</Link>
        <Link className="auth-nav-link" href="/login" aria-current={current === "login" ? "page" : undefined}>Ingresar</Link>
        <Link className="auth-nav-link auth-nav-primary" href="/registro" aria-current={current === "registro" ? "page" : undefined}>Crear cuenta</Link>
      </nav>
    </div>
  </header>;
}
