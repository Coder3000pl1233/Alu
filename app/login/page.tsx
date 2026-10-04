"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createAuthGateway, problemFromAuthError } from "@/lib/auth-gateway";
import { apiProblemToView } from "@/lib/api-errors";
import { describeDevice, getOrCreateDeviceId } from "@/lib/device-id";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="login-page">
      <section className="login-art">
        <div className="brand"><span className="brand-mark"><ShieldCheck size={20}/></span>Aula Segura</div>
        <div>
          <div className="eyebrow" style={{color:"#9cbcff"}}>Tu biblioteca de estudio</div>
          <div className="quote">Todo lo que necesitás para avanzar, en un solo lugar.</div>
          <p style={{color:"#c9d5e8", maxWidth:520, lineHeight:1.7}}>Apuntes, guías y simulacros seleccionados para estudiar con foco y continuidad.</p>
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
            window.location.href = "/app";
          } catch (cause) {
            setError(apiProblemToView(problemFromAuthError(cause)).message);
            setLoading(false);
          }
        }}>
          <div className="eyebrow">Bienvenido</div>
          <h1 style={{fontSize:34}}>Ingresá a tu cuenta</h1>
          <p className="muted">Usá las credenciales que recibiste del administrador.</p>
          <div className="field"><label htmlFor="email">Correo electrónico</label><input className="input" id="email" name="email" type="email" defaultValue="lucia.f@email.com" required /></div>
          <div className="field"><label htmlFor="password">Contraseña</label><input className="input" id="password" name="password" type="password" required /></div>
          <div style={{display:"flex",justifyContent:"space-between",margin:"14px 0 22px",fontSize:13}}>
            <label><input name="remember_me" type="checkbox" /> Recordarme</label><a href="#" style={{color:"#356ee8",fontWeight:700}}>¿Olvidaste tu contraseña?</a>
          </div>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="btn btn-primary" style={{width:"100%",padding:13}} disabled={loading}>{loading ? "Ingresando…" : "Ingresar"} <ArrowRight size={17}/></button>
          <p className="muted" style={{marginTop:22,fontSize:12,lineHeight:1.6}}>Este acceso es personal. Las sesiones y páginas visualizadas pueden quedar asociadas a tu cuenta.</p>
          <Link href="/admin" style={{display:"block",marginTop:18,fontSize:12,color:"#667085",textAlign:"center"}}>Abrir demo administrativa</Link>
        </form>
      </section>
    </main>
  );
}
