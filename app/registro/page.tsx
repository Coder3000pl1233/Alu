"use client";

import Link from "next/link";
import { BookOpenCheck, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";
import { AuthNavbar } from "@/components/auth-navbar";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  return <><AuthNavbar current="registro" /><main className="login-page register-page"><section className="login-art register-art">
    <div className="auth-art-label"><BookOpenCheck size={18} aria-hidden="true" /> Espacio vendedor</div>
    <div className="register-art-content"><div className="eyebrow">Un espacio para compartir lo que sabés</div><h1 className="quote">Tus apuntes pueden ayudar a alguien más.</h1><p>Creá tu cuenta y prepará tus publicaciones para que otros estudiantes encuentren el material que necesitan.</p></div>
    <div className="register-art-footer"><ShieldCheck size={18} aria-hidden="true" /> Verificamos tu correo antes de publicar</div>
  </section>
    <section className="login-panel"><form className="login-box" onSubmit={async event => {
      event.preventDefault(); setError("");
      const data = new FormData(event.currentTarget);
      if (data.get("password") !== data.get("confirm_password")) {
        setError("Las contraseñas no coinciden.");
        (event.currentTarget.elements.namedItem("confirm_password") as HTMLInputElement).focus();
        return;
      }
      setLoading(true);
      try { await createAuthGateway().register({ name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")) }); setDone(true); }
      catch (cause) { setError(apiProblemToView(problemFromAuthError(cause)).message); }
      finally { setLoading(false); }
    }}><div className="register-heading"><div className="eyebrow">Empezá acá</div><h2>Crear tu cuenta</h2><p>Completá tus datos para preparar tus publicaciones.</p></div>
      {done ? <p>Si la cuenta puede crearse, encontrarás un enlace de verificación en tu correo. En desarrollo, revisá <Link href="/dev/correos">la bandeja local</Link>. <Link href="/login">Ir a ingresar</Link>.</p> : <>
        <div className="field"><label htmlFor="name">Nombre</label><input className="input" id="name" name="name" minLength={2} maxLength={120} required /></div>
        <div className="field"><label htmlFor="email">Correo electrónico</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="password">Contraseña</label><div className="password-input-wrap"><input className="input" id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required /><button type="button" className="password-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}</button></div><small>Al menos 12 caracteres, mayúscula, minúscula, número y símbolo.</small></div>
        <div className="field"><label htmlFor="confirm-password">Confirmar contraseña</label><div className="password-input-wrap"><input className="input" id="confirm-password" name="confirm_password" type={showConfirmation ? "text" : "password"} autoComplete="new-password" minLength={12} required /><button type="button" className="password-toggle" aria-label={showConfirmation ? "Ocultar confirmación de contraseña" : "Ver confirmación de contraseña"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(value => !value)}>{showConfirmation ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}</button></div></div>
        {error && <p role="alert" className="form-error">{error}</p>}
        <div className="register-actions">
          <button className="btn btn-primary register-submit" disabled={loading}>{loading ? "Creando…" : "Crear cuenta"}</button>
          <p className="register-login">¿Ya tenés cuenta? <Link href="/login">Ingresá</Link></p>
        </div>
      </>}
    </form></section></main></>;
}
