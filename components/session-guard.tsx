"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, KeyRound, LockKeyhole, ShieldX } from "lucide-react";
import { MockSessionGuard } from "@/components/mock-session-guard";
import { createAuthGateway, getAuthMode, problemFromAuthError } from "@/lib/auth-gateway";
import { apiErrorCodeToView, apiProblemToView } from "@/lib/api-errors";
import type { Session } from "@/lib/api/client";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  if (getAuthMode() === "demo") return <MockSessionGuard>{children}</MockSessionGuard>;
  return <ApiSessionGuard>{children}</ApiSessionGuard>;
}

function ApiSessionGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<ReturnType<typeof apiProblemToView> | null>(null);

  useEffect(() => {
    let active = true;
    createAuthGateway().getCurrentSession()
      .then((result) => { if (active) setSession(result.session); })
      .catch((error) => { if (active) setFailure(apiProblemToView(problemFromAuthError(error))); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <main className="session-gate"><div className="page-loader"><span/>Comprobando sesión…</div></main>;

  if (failure) {
    const Icon = failure.state === "expired" ? Clock3 : failure.state === "revoked" || failure.state === "suspended" ? ShieldX : LockKeyhole;
    return <main className={`session-gate ${failure.state === "revoked" || failure.state === "suspended" ? "danger" : "warning"}`}>
      <span className="session-gate-icon"><Icon size={29}/></span>
      <h1>{failure.title}</h1>
      <p>{failure.message}</p>
      {failure.requestId && <p className="muted">Código de solicitud: {failure.requestId}</p>}
      {failure.action === "login" && <Link className="btn btn-primary" href="/login">Iniciar sesión</Link>}
      {failure.action === "retry" && <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>}
    </main>;
  }

  if (!session) return null;

  if (session.user.must_change_password) return <main className="session-gate warning">
    <span className="session-gate-icon"><KeyRound size={29}/></span>
    <h1>Necesitás cambiar tu contraseña</h1>
    <p>Completá el cambio obligatorio antes de acceder a la biblioteca.</p>
    <Link className="btn btn-primary" href="/login?step=change-password">Continuar</Link>
  </main>;

  if (session.user.access_state !== "active" && session.user.access_state !== "expiring") {
    const view = apiErrorCodeToView(session.user.access_state === "expired" ? "ACCESS_EXPIRED" : session.user.access_state === "suspended" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_REVOKED");
    return <main className="session-gate danger"><span className="session-gate-icon"><ShieldX size={29}/></span><h1>{view.title}</h1><p>{view.message}</p></main>;
  }

  return children;
}
