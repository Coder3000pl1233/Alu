"use client";

import { Clock3, LockKeyhole, ShieldX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function MockSessionGuard({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const state = searchParams.get("demoSession");

  if (state === "missing") {
    return (
      <main className="session-gate">
        <span className="session-gate-icon"><LockKeyhole size={29}/></span>
        <div className="eyebrow">Sesión simulada</div>
        <h1>No hay una sesión disponible</h1>
        <p>Este guard visual representa una ruta visitada sin una sesión activa. La autenticación real se implementará con el backend.</p>
        <Link className="btn btn-primary" href="/app">Restaurar sesión demo</Link>
      </main>
    );
  }

  if (state === "revoked") {
    return (
      <main className="session-gate danger">
        <span className="session-gate-icon"><ShieldX size={29}/></span>
        <div className="eyebrow">Sesión revocada</div>
        <h1>Esta sesión ya no puede continuar</h1>
        <p>El frontend oculta las rutas protegidas y espera una nueva sesión válida.</p>
        <Link className="btn btn-primary" href="/app">Iniciar nueva sesión demo</Link>
      </main>
    );
  }

  if (state === "expired") {
    return (
      <main className="session-gate warning">
        <span className="session-gate-icon"><Clock3 size={29}/></span>
        <div className="eyebrow">Sesión vencida</div>
        <h1>La sesión de demostración venció</h1>
        <p>La ruta queda bloqueada hasta que se renueve la sesión.</p>
        <Link className="btn btn-primary" href="/app">Renovar sesión demo</Link>
      </main>
    );
  }

  return children;
}
