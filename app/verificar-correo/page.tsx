"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";

function Verify() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return <main className="login-panel"><section className="login-box"><h1>Verificar correo</h1>
    {done ? <p>Tu correo está verificado. Ya podés volver a tu cuenta. <Link href="/app/publicar">Ir a publicar</Link></p> : <>
      <p>La verificación confirma que tenés acceso a este correo; no certifica el contenido publicado.</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn btn-primary" disabled={!token} onClick={async () => {
        try { await createAuthGateway().verifyEmail(token); setDone(true); }
        catch (cause) { setError(apiProblemToView(problemFromAuthError(cause)).message); }
      }}>Verificar correo</button>
    </>}
  </section></main>;
}
export default function VerifyPage() { return <Suspense><Verify /></Suspense>; }
