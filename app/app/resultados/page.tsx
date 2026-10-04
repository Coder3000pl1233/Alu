import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, FileText, Search, Star, X } from "lucide-react";

const results = [
  { id: "anatomia-general", cover: "analysis", coverTitle: "Análisis Matemático I", subtitle: "Resumen teórico y ejercicios", title: "Análisis Matemático I — Resumen completo", rating: "4,8", reviews: 32, seller: "Mateo G.", initials: "MG", price: "ARS 4.500", description: "Resumen teórico de los primeros parciales con ejercicios resueltos y ejemplos. Incluye límites, continuidad y derivadas." },
  { id: "sistema-oseo", cover: "calculus", coverTitle: "Cálculo Diferencial", subtitle: "Apuntes, ejemplos y ejercicios resueltos", title: "Cálculo Diferencial — Guía práctica", rating: "4,6", reviews: 18, seller: "Valentina M.", initials: "VR", price: "ARS 3.200", description: "Guía con los temas clave de derivadas, con ejercicios resueltos y una lista de práctica por tema." },
  { id: "biologia-celular", cover: "integrals", coverTitle: "Integrales", subtitle: "Teoría y aplicaciones", title: "Integrales — Teoría y práctica", rating: "4,9", reviews: 27, seller: "Sofía R.", initials: "SR", price: "ARS 5.000", description: "Desarrollo teórico claro con ejercicios resueltos, aplicaciones y problemas de parciales." },
  { id: "genetica-basica", cover: "series", coverTitle: "Series y Sucesiones", subtitle: "Apuntes de cátedra y ejercicios", title: "Series y Sucesiones — Resumen", rating: "4,4", reviews: 12, seller: "Mateo G.", initials: "MG", price: "ARS 2.800", description: "Resumen de los conceptos principales con ejemplos resueltos y ejercicios propuestos." },
];

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "Análisis Matemático";
  return <AppShell>
    <div className="results-page">
      <form action="/app/resultados" className="results-top-search"><Search size={20}/><input name="q" defaultValue={query} aria-label="Buscar apuntes"/><button type="reset" aria-label="Limpiar búsqueda"><X size={15}/></button></form>
      <div className="results-breadcrumb"><Link href="/app">Explorar</Link><span>/</span><span>Resultados</span></div>
      <div className="results-title"><h1>Apuntes de {query}</h1><p>24 resultados de ejemplo.</p></div>

      <div className="results-layout">
        <aside className="results-filters">
          <h2>Filtrar resultados</h2>
          <FilterGroup title="Universidad" options={["UBA", "UNLP", "UTN"]} checked={["UBA"]}/>
          <FilterGroup title="Carrera" options={["Ingeniería", "Economía"]} checked={["Ingeniería"]}/>
          <FilterGroup title="Año" options={["1º año", "2º año"]} checked={["1º año"]}/>
          <fieldset><legend>Precio (ARS)</legend><div className="price-inputs"><input aria-label="Precio mínimo" placeholder="Mínimo"/><input aria-label="Precio máximo" placeholder="Máximo"/></div></fieldset>
          <FilterGroup title="Tipo de apunte" options={["Resumen", "Guía", "Simulacro"]}/>
          <FilterGroup title="Valoración" options={["4 estrellas o más"]}/>
          <button className="btn btn-primary filters-apply">Aplicar filtros</button><button className="clear-filters">Limpiar filtros</button>
        </aside>

        <main className="results-content">
          <div className="results-toolbar"><div><span>UBA <X size={12}/></span><span>Primer año <X size={12}/></span></div><div><select aria-label="Ordenar resultados"><option>Más relevantes</option><option>Mejor valorados</option><option>Menor precio</option><option>Más recientes</option></select><a href="#">Mejor valorados</a><a href="#">Menor precio</a><a href="#">Más recientes</a></div></div>
          <div className="result-cards">{results.map(item => <ResultCard item={item} key={item.title}/>)}</div>
          <nav className="pagination" aria-label="Paginación"><button aria-label="Página anterior"><ChevronLeft size={16}/></button><button className="active">1</button><button>2</button><button>3</button><button aria-label="Página siguiente"><ChevronRight size={16}/></button></nav>
        </main>
      </div>

    </div>
  </AppShell>;
}

function FilterGroup({ title, options, checked = [] }: { title: string; options: string[]; checked?: string[] }) {
  return <fieldset><legend>{title}</legend>{options.map(option => <label key={option}><input type="checkbox" defaultChecked={checked.includes(option)}/><span>{option}</span></label>)}</fieldset>;
}

function ResultCard({ item }: { item: typeof results[number] }) {
  return <article className="result-card"><Link href={`/app/material/${item.id}`} className="result-card-body"><div className={`result-cover ${item.cover}`}><strong>{item.coverTitle}</strong><small>{item.subtitle}</small><i/><b>UBA</b></div><div className="result-info"><button aria-label={`Guardar ${item.title}`}><Bookmark size={17}/></button><h3>{item.title}</h3><small>UBA · Primer año</small><div className="result-rating"><Star size={14} fill="currentColor"/>{item.rating} ({item.reviews})</div><p>{item.description}</p><div className="result-tags"><span>Resumen</span><span>Teoría y ejercicios</span></div></div></Link><div className="result-seller"><span className="avatar">{item.initials}</span><strong>{item.seller}</strong><b>{item.price}</b></div><Link href={`/app/material/${item.id}/visor`} className="result-preview"><FileText size={15}/>5 páginas de muestra <ArrowRight size={15}/></Link></article>;
}
