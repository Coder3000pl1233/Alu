import { AppShell } from "@/components/app-shell";
import { Clock3, MessageCircle, ShieldCheck } from "lucide-react";

const conversations = [
  { initials: "ML", seller: "Martina López", listing: "Anatomía general", message: "¡Hola! Sí, sigue disponible. Te paso los detalles por WhatsApp.", time: "Hace 8 min", unread: true },
  { initials: "JP", seller: "Julián Pérez", listing: "Biología celular", message: "La guía incluye ejercicios resueltos de los primeros cuatro temas.", time: "Ayer", unread: false },
  { initials: "TR", seller: "Tomás Rivas", listing: "Guía del sistema óseo", message: "Podemos coordinar la entrega esta tarde.", time: "Lun", unread: false },
];

export default function InquiriesPage() {
  return <AppShell><div className="page section-page"><div className="page-title-row"><span className="page-title-icon"><MessageCircle size={24}/></span><div><div className="eyebrow">Mensajes</div><h1>Consultas</h1><p className="muted">Seguimiento de los contactos que iniciaste desde las publicaciones.</p></div></div><div className="inquiries-layout"><section className="card inquiry-list">{conversations.map(item => <article className={`inquiry-row ${item.unread ? "unread" : ""}`} key={item.listing}><span className="avatar">{item.initials}</span><div><div className="inquiry-heading"><strong>{item.seller}</strong><time>{item.time}</time></div><span className="inquiry-listing">{item.listing}</span><p>{item.message}</p></div>{item.unread && <i aria-label="Mensaje sin leer"/>}</article>)}</section><aside className="card inquiry-help"><ShieldCheck size={26}/><h2>Contactá con seguridad</h2><p>Las consultas pueden continuar por WhatsApp, pero nunca compartas contraseñas, códigos ni información bancaria sensible.</p><span><Clock3 size={15}/>EntreApuntes no interviene en pagos ni entregas.</span></aside></div></div></AppShell>;
}
