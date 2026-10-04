import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Brain,
  CheckCircle2,
  Code2,
  FileText,
  Landmark,
  Scale,
  Search,
  Sigma,
  Star,
  Stethoscope,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { StudyCover } from "@/components/study-cover";

const featured = [
  {
    id: "anatomia-general",
    coverClass: "math-cover",
    icon: <Sigma size={48}/>,
    coverTitle: "ANÁLISIS MATEMÁTICO I",
    coverSubtitle: "Límites, derivadas e integrales",
    university: "UBA",
    career: "Ingeniería",
    title: "Resumen completo de Análisis I",
    description: "Teoría, ejemplos resueltos y ejercicios tipo parcial. Incluye los temas del primer y segundo cuatrimestre.",
    rating: "4,8",
    reviews: 24,
    pages: 86,
    price: "ARS 4.500",
    seller: "Sofía R.",
    initials: "SR",
    featured: true,
  },
  {
    id: "sistema-oseo",
    coverClass: "anatomy-cover",
    icon: <Brain size={66}/>,
    coverTitle: "ANATOMÍA",
    coverSubtitle: "Sistema nervioso",
    university: "UNLP",
    career: "Medicina",
    title: "Apuntes de Anatomía – Sistema nervioso",
    description: "Resumen claro con esquemas, imágenes y referencias de clase. Ideal para el parcial.",
    rating: "4,9",
    reviews: 18,
    pages: 102,
    price: "ARS 6.000",
    seller: "Valentina M.",
    initials: "VM",
  },
  {
    id: "simulacro-anatomia",
    coverClass: "law-cover",
    icon: <Landmark size={58}/>,
    coverTitle: "DERECHO CIVIL",
    coverSubtitle: "Obligaciones",
    university: "UNC",
    career: "Abogacía",
    title: "Apuntes de Derecho Civil – Obligaciones",
    description: "Teoría, cuadros comparativos y fallos resumidos. Incluye preguntas frecuentes.",
    rating: "4,7",
    reviews: 32,
    pages: 74,
    price: "ARS 3.800",
    seller: "Mateo G.",
    initials: "MG",
  },
];

const collections = [
  { title: "Matemática", detail: "Cálculo, Álgebra, Estadística", icon: Sigma, className: "collection-math" },
  { title: "Salud", detail: "Anatomía, Fisiología, Farmacología", icon: Stethoscope, className: "collection-health" },
  { title: "Derecho", detail: "Civil, Penal, Constitucional", icon: Scale, className: "collection-law" },
  { title: "Programación", detail: "Algoritmos, Programación, Bases de datos", icon: Code2, className: "collection-code" },
];

export default function ExplorePage() {
  return (
    <AppShell>
      <div className="page reference-home">
        <section className="reference-hero">
          <div className="reference-hero-copy">
            <h1>Tu próximo parcial<br/><span>empieza acá.</span></h1>
            <p>Apuntes de estudiantes que ya pasaron por tu materia.</p>
            <div className="reference-search">
              <label><Search size={20}/><input aria-label="Materia" placeholder="¿Qué materia estás preparando?"/></label>
              <label className="university-select"><Landmark size={19}/><select aria-label="Universidad"><option>Todas las universidades</option><option>UBA</option><option>UNLP</option><option>UNC</option></select></label>
              <button className="btn btn-primary">Buscar</button>
            </div>
            <div className="reference-popular"><span>Búsquedas populares:</span><Link href="/app/materias">Análisis Matemático</Link><Link href="/app/materias">Anatomía</Link><Link href="/app/materias">Derecho Civil</Link></div>
          </div>
          <div className="reference-books" aria-hidden="true">
            <div className="hero-book hero-book-math"><strong>ANÁLISIS<br/>MATEMÁTICO I</strong><small>Límites, derivadas<br/>e integrales</small><Sigma size={62}/><b>UBA</b></div>
            <div className="hero-book hero-book-anatomy"><strong>ANATOMÍA</strong><small>Sistema nervioso</small><Brain size={68}/><b>UNLP</b></div>
            <div className="hero-book hero-book-law"><strong>DERECHO CIVIL</strong><small>Obligaciones</small><Landmark size={60}/><b>UNC</b></div>
            <span className="hand-note">Apuntes reales<br/>de estudiantes ↙</span>
          </div>
        </section>

        <section className="reference-section featured-section">
          <div className="reference-section-title"><div><h2>Apuntes que valen la pena</h2><p>Apuntes completos, claros y recomendados por la comunidad.</p></div><Link href="/app/materias">Ver todos los apuntes <ArrowRight size={14}/></Link></div>
          <div className="featured-listings">
            {featured.map(item => <FeaturedCard key={item.id} item={item}/>) }
          </div>
        </section>

        <section className="reference-section collections-block">
          <div className="reference-section-title"><div><h2>Explorá por colección</h2><p>Encontrá apuntes según tu área de estudio.</p></div><Link href="/app/materias">Ver todas las colecciones <ArrowRight size={14}/></Link></div>
          <div className="reference-collections">
            {collections.map(item => { const Icon = item.icon; return <Link href="/app/materias" className={`reference-collection ${item.className}`} key={item.title}><Icon size={28}/><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowRight size={18}/></Link>; })}
          </div>
        </section>

        <div className="reference-lower">
          <section className="reference-how">
            <div className="reference-section-title"><div><h2>¿Cómo funciona?</h2><p>Es muy simple y seguro.</p></div></div>
            <div className="reference-steps">
              <article><b>1</b><Search size={25}/><span><strong>Encontrá tu materia</strong><small>Buscá por materia o universidad y explorá apuntes.</small></span></article>
              <article><b>2</b><FileText size={25}/><span><strong>Revisá 5 páginas</strong><small>Leé una muestra gratuita para ver si te sirve.</small></span></article>
              <article><b>3</b><BookOpen size={25}/><span><strong>Contactá al vendedor</strong><small>Hablá directamente con quien lo hizo.</small></span></article>
            </div>
          </section>
          <TestimonialsCarousel/>
        </div>

        <section className="reference-cta"><span><BookOpen size={31}/></span><div><h2>Tus apuntes pueden ayudar a alguien más.</h2><p>Compartí tus apuntes y formá parte de una comunidad que se ayuda.</p></div><Link className="btn btn-primary" href="/app/publicar">Publicar mis apuntes <ArrowRight size={16}/></Link></section>

        <footer className="reference-footer"><Link className="brand" href="/app"><span className="brand-mark"><BookOpen size={17}/></span><strong>EntreApuntes</strong></Link><nav><Link href="/app">Explorar</Link><a href="#">Ayuda</a><a href="#">Términos</a><a href="#">Privacidad</a><a href="#">Reportar contenido</a></nav><p>El pago y la entrega se acuerdan por fuera de EntreApuntes.</p></footer>
      </div>
    </AppShell>
  );
}

function FeaturedCard({ item }: { item: typeof featured[number] }) {
  return <article className="featured-card">
    <Link href={`/app/material/${item.id}`} className="featured-card-main">
      <StudyCover className="featured-cover" university={item.university} material={{ subjectId: item.coverClass === "math-cover" ? "matematica" : item.coverClass === "law-cover" ? "derecho" : "anatomia", category: item.coverTitle, title: item.title, type: "Apunte" }}/>
      <div className="featured-info"><small>{item.university} · {item.career}</small><h3>{item.title}</h3><p>{item.description}</p><div className="featured-rating"><Star size={15} fill="currentColor"/>{item.rating} ({item.reviews})</div><div className="featured-meta">{item.pages} páginas <i/> <span>Muestra de 5 páginas</span></div><strong className="featured-price">{item.price}</strong></div>
    </Link>
    <div className="featured-seller"><span className="avatar">{item.initials}</span><strong>{item.seller}</strong><CheckCircle2 size={15}/><small>Correo verificado</small><button aria-label={`Guardar ${item.title}`}><Bookmark size={17}/></button></div>
  </article>;
}

