"use client";

import Link from "next/link";
import { useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";

export function SellerEmailNotice() {
  const [message, setMessage] = useState("");
  return <section className="card" style={{ padding: 20, marginBottom: 24 }}>
    <h2>Verificá tu correo</h2>
    <p>Podés preparar un borrador. Para enviarlo a revisión necesitás confirmar tu correo.</p>
    <button className="btn btn-secondary" onClick={async () => {
      try { await createAuthGateway().requestVerification(); setMessage("Enlace enviado. En desarrollo, revisá la bandeja local."); }
      catch (cause) { setMessage(apiProblemToView(problemFromAuthError(cause)).message); }
    }}>Enviar otro enlace</button>
    {message && <p role="status">{message} <Link href="/dev/correos">Abrir bandeja local</Link></p>}
  </section>;
}
