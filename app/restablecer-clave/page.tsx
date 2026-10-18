"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";

function Reset() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return <main className="login-panel"><form className="login-box" onSubmit={async event => {
    event.preventDefault(); setError("");
    try { await createAuthGateway().resetPassword(token, String(new FormData(event.currentTarget).get("password"))); setDone(true); }
    catch (cause) { setError(apiProblemToView(problemFromAuthError(cause)).message); }
  }}><h1>Nueva contraseña</h1>
    {done ? <p>Contraseña actualizada. <Link href="/login">Ingresá de nuevo</Link>.</p> : <>
      <div className="field"><label htmlFor="password">Contraseña nueva</label><input className="input" id="password" name="password" type="password" minLength={12} required /><small>Al menos 12 caracteres, mayúscula, minúscula, número y símbolo.</small></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn btn-primary" disabled={!token}>Guardar contraseña</button>
    </>}
  </form></main>;
}
export default function ResetPage() { return <Suspense><Reset /></Suspense>; }
