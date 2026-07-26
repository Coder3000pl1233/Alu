import { AppShell } from "@/components/app-shell";
import { ContinueReading } from "@/components/continue-reading";
import { SubjectCard } from "@/components/subject-card";
import { subjects } from "@/lib/mock-data";
import { ArrowRight, CalendarClock, ShieldCheck } from "lucide-react";

export default function StudentHome() {
  return (
    <AppShell>
      <div className="page">
        <div className="eyebrow">Sábado, 25 de julio</div>
        <h1>Hola, Lucía 👋</h1>
        <p className="muted">Tu acceso está activo. Retomá donde dejaste o explorá nuevos materiales.</p>
        <div className="card" style={{marginTop:25,padding:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,background:"linear-gradient(90deg,#eef4ff,#f8fbff)"}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <span className="brand-mark" style={{boxShadow:"none"}}><CalendarClock size={19}/></span>
            <div><strong>Acceso vigente hasta el 25 de agosto</strong><div className="muted" style={{fontSize:13,marginTop:4}}>Tu administrador puede extenderlo cuando registres el próximo pago.</div></div>
          </div>
          <span className="status green"><ShieldCheck size={13}/>Activo</span>
        </div>
        <div className="section-head" id="recientes"><div><h2>Continuar estudiando</h2><div className="muted" style={{fontSize:13,marginTop:5}}>Tus materiales recientes</div></div><a className="btn btn-secondary" href="#biblioteca">Ver todos <ArrowRight size={15}/></a></div>
        <ContinueReading/>
        <div className="section-head" id="biblioteca"><div><h2>Materias</h2><div className="muted" style={{fontSize:13,marginTop:5}}>Elegí una materia para ver sus materiales de estudio</div></div></div>
        <div className="grid">{subjects.map(subject => <SubjectCard key={subject.id} subject={subject}/>)}</div>
      </div>
    </AppShell>
  );
}
