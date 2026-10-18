"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";
import { describeDevice, getOrCreateDeviceId } from "@/lib/device-id";
import { AuthNavbar } from "@/components/auth-navbar";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
    <AuthNavbar current="login" />
    <main className="login-page">
      <section className="login-art">
        <div className="auth-art-label"><ShieldCheck size={18} aria-hidden="true" /> Espacio vendedor</div>
        <div>
          <div className="eyebrow" style={{color:"#9cbcff"}}>Tu espacio vendedor</div>
          <div className="quote">Publicá tus apuntes y mantené tus fichas al día.</div>
          <p style={{color:"#c9d5e8", maxWidth:520, lineHeight:1.7}}>Explorar el catálogo sigue abierto para todos; ingresá cuando quieras publicar.</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9,color:"#b9c8de",fontSize:13}}><BookOpenCheck size={18}/> Acceso personal y protegido</div>
      </section>
      <section className="login-panel">
        <form className="login-box" onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          const data = new FormData(event.currentTarget);
          try {
            await createAuthGateway().login({
              email: String(data.get("email")),
              password: String(data.get("password")),
              remember_me: data.get("remember_me") === "on",
              device_id: getOrCreateDeviceId(),
              device_name: describeDevice(),
            });
            const next = new URLSearchParams(window.location.search).get("next");
            window.location.href = next?.startsWith("/") && !next.startsWith("//") ? next : "/app";
          } catch (cause) {
            setError(apiProblemToView(problemFromAuthError(cause)).message);
            setLoading(false);
          }
        }}>
          <div className="eyebrow">Bienvenido</div>
          <h1 style={{fontSize:34}}>Ingresá a tu cuenta</h1>
          <p className="muted">Entrá a tu cuenta para publicar y gestionar tus apuntes.</p>
          <div className="field"><label htmlFor="email">Correo electrónico</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="password">Contraseña</label><div className="password-input-wrap"><input className="input" id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><button type="button" className="password-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}</button></div></div>
          <div style={{display:"flex",justifyContent:"space-between",margin:"14px 0 22px",fontSize:13}}>
            <label><input name="remember_me" type="checkbox" /> Recordarme</label><Link href="/recuperar-clave" style={{color:"#356ee8",fontWeight:700}}>¿Olvidaste tu contraseña?</Link>
          </div>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="btn btn-primary" style={{width:"100%",padding:13}} disabled={loading}>{loading ? "Ingresando…" : "Ingresar"} <ArrowRight size={17}/></button>
          <p className="register-login login-signup">¿Todavía no tenés cuenta? <Link href="/registro">Registrate</Link></p>
        </form>
      </section>
    </main>
    </>
  );
}
