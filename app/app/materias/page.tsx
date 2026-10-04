import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ArrowRight, Atom, BarChart3, BookOpen, Coins, FlaskConical, Laptop, Pi, Scale, Search, Stethoscope, UsersRound } from "lucide-react";

const popularSubjects = [
  { title: "Análisis Matemático I", count: 128, tags: ["UBA", "UTN", "UNLP"], icon: Pi, tone: "blue" },
  { title: "Anatomía", count: 96, tags: ["UBA", "UNC"], icon: Stethoscope, tone: "pink" },
  { title: "Programación Orientada a Objetos", count: 74, tags: ["UTN", "UBA"], icon: Laptop, tone: "violet" },
  { title: "Derecho Civil", count: 62, tags: ["UBA", "UNLP"], icon: Scale, tone: "amber" },
  { title: "Estadística", count: 51, tags: ["UBA", "UNC"], icon: BarChart3, tone: "teal" },
  { title: "Economía", count: 43, tags: ["UBA", "UNLP"], icon: Coins, tone: "cyan" },
];

const recentSubjects = [
  { title: "Física II", count: 28, icon: Atom, tone: "cyan" },
  { title: "Química General", count: 19, icon: FlaskConical, tone: "violet" },
  { title: "Historia Argentina", count: 16, icon: BookOpen, tone: "amber" },
  { title: "Sociología", count: 14, icon: UsersRound, tone: "blue" },
];

export default function SubjectsPage() {
  return <AppShell>
    <div className="catalog-page">
      <section className="catalog-hero">
        <h1>Encontrá tu materia</h1>
        <p>Apuntes para tu carrera, ordenados por materia.</p>
        <form action="/app/resultados" className="catalog-main-search"><Search size={20}/><input name="q" defaultValue="Análisis Matemático" aria-label="Buscar una materia" placeholder="Buscar una materia"/><button className="sr-only">Buscar</button></form>
        <form action="/app/resultados" className="catalog-filters">
          <label>Universidad<select name="universidad"><option>Todas</option><option>UBA</option><option>UNLP</option><option>UTN</option></select></label>
          <label>Carrera<select name="carrera"><option>Todas</option><option>Ingeniería</option><option>Medicina</option><option>Derecho</option></select></label>
          <label>Año<select name="anio"><option>Todos</option><option>Primer año</option><option>Segundo año</option></select></label>
          <button type="reset">Limpiar filtros</button>
        </form>
      </section>

      <section className="catalog-section">
        <div className="catalog-section-heading"><div><h2>Populares</h2><p>Las materias más buscadas por estudiantes como vos.</p></div><Link href="/app/resultados?q=Análisis+Matemático">Ver todas <ArrowRight size={15}/></Link></div>
        <div className="popular-subjects">{popularSubjects.map(item => { const Icon = item.icon; return <Link href={`/app/resultados?q=${encodeURIComponent(item.title)}`} className="subject-search-card" key={item.title}><span className={`subject-search-icon ${item.tone}`}><Icon size={36}/></span><div><strong>{item.title}</strong><small>{item.count} apuntes</small></div><div className="subject-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div><ArrowRight size={17}/></Link>; })}</div>
      </section>

      <section className="catalog-section recent-subjects-section">
        <div className="catalog-section-heading"><div><h2>Materias que se sumaron</h2><p>Nuevos apuntes para seguir aprendiendo.</p></div><a href="#">Ver todas <ArrowRight size={15}/></a></div>
        <div className="recent-subjects">{recentSubjects.map(item => { const Icon = item.icon; return <Link href={`/app/resultados?q=${encodeURIComponent(item.title)}`} className="recent-subject-card" key={item.title}><span className={`subject-search-icon ${item.tone}`}><Icon size={29}/></span><div><strong>{item.title}</strong><small>{item.count} apuntes</small></div><ArrowRight size={16}/></Link>; })}</div>
      </section>
    </div>
  </AppShell>;
}
