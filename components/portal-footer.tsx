import Link from "next/link";
import { BookOpen, Menu } from "lucide-react";

export function PortalFooter() {
  return <footer className="portal-footer">
    <div className="footer-brand"><Link className="brand" href="/app"><span className="brand-mark"><BookOpen size={17}/></span><strong>EntreApuntes</strong></Link><p>Apuntes de estudiantes, para estudiantes.</p></div>
    <div><strong>Explorar</strong><Link href="/app/materias">Materias</Link><a href="#">Universidades</a><a href="#">Carreras</a></div>
    <div><strong>Comunidad</strong><Link href="/app/consultas">Consultas</Link><Link href="/app/mis-publicaciones">Mis publicaciones</Link><a href="#">Ayuda</a></div>
    <div><strong>Legal</strong><a href="#">Términos de uso</a><a href="#">Privacidad</a><a href="#">Contacto</a></div>
    <div className="footer-social"><span aria-label="Redes sociales"><b>◎</b><b>𝕏</b><b>▶</b></span><small>Hecho en Argentina 🇦🇷</small><Menu size={17}/></div>
  </footer>;
}
