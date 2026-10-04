import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ContactSellerButton } from "@/components/contact-seller-button";
import { getStudyCoverColor } from "@/components/study-cover";
import { getListingDetails, materials, subjects } from "@/lib/mock-data";
import { Bookmark, CalendarDays, ChevronRight, Eye, FileText, Flag, ShieldCheck, Star } from "lucide-react";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = materials.find((item) => item.id === id);
  if (!material) notFound();
  const subject = subjects.find((item) => item.id === material.subjectId);
  const listing = getListingDetails(material);
  const similar = materials.filter((item) => item.subjectId === material.subjectId && item.id !== material.id).slice(0, 2);

  return <AppShell>
    <div className="listing-detail-page">
      <nav className="listing-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/app">Explorar</Link><ChevronRight size={13}/>
        <Link href={`/app/materia/${material.subjectId}`}>{subject?.name ?? material.category}</Link><ChevronRight size={13}/>
        <span>{material.title}</span>
      </nav>

      <section className="listing-detail-grid">
        <div className="listing-editorial-cover" style={{ backgroundColor: getStudyCoverColor(material) }}>
          <div className="cover-school"><strong>{listing.university}</strong><span>{listing.degree}</span></div>
          <div className="cover-copy"><h2>{material.title}</h2><p>Límites · Derivadas · Integrales</p><i /></div>
          <div className="cover-summary">Resumen teórico<br/>Ejercicios resueltos<br/>Guía de fórmulas</div>
        </div>

        <div className="listing-detail-content">
          <div className="listing-title-row">
            <div><h1>{material.title}</h1><p className="listing-context">{listing.university} · {listing.degree} · {subject?.name ?? material.category}</p><p className="listing-chair">Cátedra: material compartido por un estudiante</p></div>
            <div className="listing-quick-actions"><button type="button"><Bookmark size={17}/> Guardar</button><button type="button"><Flag size={16}/> Reportar</button></div>
          </div>
          <div className="listing-rating-row"><Star size={18} fill="currentColor"/><strong>{String(listing.rating).replace(".", ",")}</strong><span>({listing.reviews} valoraciones)</span></div>
          <div className="listing-price-row"><strong>ARS {listing.price.replace("$", "")}</strong><span>Precio orientativo</span></div>
          <p className="listing-description">Un material claro y ordenado para repasar los conceptos clave, con explicaciones, ejercicios resueltos y una guía práctica de fórmulas.</p>
          <div className="listing-meta-row"><span><FileText size={20}/>{material.pages} páginas en el material completo</span><span><CalendarDays size={20}/>{material.updated}</span></div>
          <div className="listing-action-grid"><Link className="listing-preview-button" href={`/app/material/${material.id}/visor`}><Eye size={19}/>Ver muestra de 5 páginas</Link><ContactSellerButton contactUrl={listing.contactUrl}/></div>
          <div className="listing-info-alert"><span>i</span><p>El pago y la entrega se acuerdan directamente con el vendedor, por fuera de EntreApuntes.</p></div>
          <article className="listing-seller-card">
            <span className="listing-seller-avatar">{listing.initials}</span>
            <div><div><strong>{listing.seller}</strong><b><ShieldCheck size={14}/> Correo universitario verificado</b></div><p>{listing.university} · {listing.degree} <span>La verificación confirma el correo, no el contenido.</span></p></div>
            <button type="button">Ver perfil</button>
          </article>
        </div>
      </section>

      <section className="listing-lower-grid">
        <article className="listing-panel"><h2>Valoraciones ({listing.reviews})</h2><div className="reviews-overview"><strong>{String(listing.rating).replace(".", ",")}</strong><span>★★★★★</span></div><div className="listing-reviews"><Review initials="MG" name="Mateo G." text="Muy completo y bien explicado. Me sirvió un montón para preparar el parcial."/><Review initials="VM" name="Valentina M." text="Ordenado, claro y con muy buenos ejercicios resueltos."/></div></article>
        <article className="listing-panel"><div className="similar-heading"><h2>Publicaciones similares</h2><Link href={`/app/materia/${material.subjectId}`}>Ver todas</Link></div><div className="similar-listings">{similar.map((item) => { const itemListing = getListingDetails(item); return <Link href={`/app/material/${item.id}`} className="similar-listing" key={item.id}><span className="similar-listing-cover" style={{ background: item.color }}><FileText size={25}/></span><span><strong>{item.title}</strong><small>{itemListing.university} · {itemListing.degree}</small><em>★ {String(itemListing.rating).replace(".", ",")}</em><b>ARS {itemListing.price.replace("$", "")}</b></span></Link>; })}</div></article>
      </section>
    </div>
  </AppShell>;
}

function Review({ initials, name, text }: { initials: string; name: string; text: string }) {
  return <article><div><span>{initials}</span><p><strong>{name}</strong><b>★★★★★</b></p></div><p>{text}</p></article>;
}
