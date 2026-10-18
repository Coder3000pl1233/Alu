"use client";

import Link from "next/link";
import { useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";

export default function RecoverPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return <main className="login-panel"><form className="login-box" onSubmit={async event => {
    event.preventDefault(); setError("");
    try { await createAuthGateway().requestPasswordReset(String(new FormData(event.currentTarget).get("email"))); setDone(true); }
    catch (cause) { setError(apiProblemToView(problemFromAuthError(cause)).message); }
  }}><h1>Recuperar acceso</h1><p>Si existe una cuenta con ese correo, recibirás un enlace de un solo uso.</p>
    {done ? <p>Revisá tu correo. En desarrollo, abrí <Link href="/dev/correos">la bandeja local</Link>.</p> : <div className="field"><label htmlFor="email">Correo electrónico</label><input className="input" id="email" name="email" type="email" required /></div>}
    {error && <p role="alert" className="form-error">{error}</p>}
    {!done && <button className="btn btn-primary">Enviar enlace</button>}
    <p><Link href="/login">Volver a ingresar</Link></p>
  </form></main>;
}
