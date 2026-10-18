import Link from "next/link";
import { ArrowRight, Brain, Dna, FileText, Microscope, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getListingDetails, materials } from "@/lib/mock-data";

const featuredIds = ["anatomia-general", "biologia-celular", "histologia-general"];
const featured = featuredIds.map(id => materials.find(material => material.id === id)!);
const subjects = [
  { name: "Anatomía", href: "/app/materia/anatomia", icon: Brain },
  { name: "Biología", href: "/app/materia/biologia", icon: Dna },
  { name: "Histología", href: "/app/materia/histologia", icon: Microscope },
];

export default function ExplorePage() {
  return (
    <AppShell>
      <div className="page simple-home reference-home">
        <section className="reference-hero">
          <div className="reference-hero-copy">
            <h1>Tu próximo parcial<br /><span>empieza acá.</span></h1>
            <p>Apuntes de estudiantes que ya pasaron por tu materia.</p>
            <form action="/app/resultados" className="reference-search" role="search">
              <label>
                <Search size={20} aria-hidden="true" />
                <input name="q" aria-label="Buscar apuntes" placeholder="¿Qué materia estás preparando?" />
              </label>
              <button className="btn btn-primary" type="submit">Buscar</button>
            </form>
            <div className="reference-popular">
              <span>Explorá:</span>
              {subjects.map(subject => <Link href={subject.href} key={subject.name}>{subject.name}</Link>)}
            </div>
          </div>
          <div className="reference-books" aria-hidden="true">
            <div className="hero-book hero-book-math"><strong>ANATOMÍA</strong><small>El cuerpo humano</small><Brain size={62} /><b>UBA</b></div>
            <div className="hero-book hero-book-anatomy"><strong>BIOLOGÍA</strong><small>Células y genética</small><Dna size={68} /><b>UNR</b></div>
            <div className="hero-book hero-book-law"><strong>HISTOLOGÍA</strong><small>Tejidos y sistemas</small><Microscope size={60} /><b>UBA</b></div>
          </div>
        </section>

        <section className="simple-home-subjects" aria-labelledby="subjects-heading">
          <div className="simple-home-heading">
            <h2 id="subjects-heading">Explorá por materia</h2>
            <Link href="/app/materias">Ver todas <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="simple-home-subject-grid">
            {subjects.map(subject => {
              const Icon = subject.icon;
              return <Link className="simple-home-subject" href={subject.href} key={subject.name}><Icon size={22} aria-hidden="true" /><strong>{subject.name}</strong><ArrowRight size={17} aria-hidden="true" /></Link>;
            })}
          </div>
        </section>

        <section className="simple-home-featured" aria-labelledby="featured-heading">
          <div className="simple-home-heading">
            <h2 id="featured-heading">Apuntes destacados</h2>
            <Link href="/app/materias">Ver todos <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="simple-home-grid">
            {featured.map(material => {
              const details = getListingDetails(material);
              return (
                <Link className="simple-home-card" href={`/app/material/${material.id}`} key={material.id}>
                  <span className={`simple-home-card-icon simple-home-card-icon-${material.subjectId}`}>
                    <FileText size={25} aria-hidden="true" />
                  </span>
                  <span className="simple-home-card-type">{material.category} · {material.type}</span>
                  <strong>{material.title}</strong>
                  <span className="simple-home-card-bottom">
                    <span>{details.university} · {material.pages} páginas</span>
                    <b>{details.price}</b>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
