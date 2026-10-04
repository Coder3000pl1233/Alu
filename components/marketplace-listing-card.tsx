import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { StudyCover } from "@/components/study-cover";
import { getListingDetails, type Material } from "@/lib/mock-data";

export function MarketplaceListingCard({ material }: { material: Material }) {
  const listing = getListingDetails(material);
  return <article className="featured-card">
    <Link href={`/app/material/${material.id}`} className="featured-card-main">
      <StudyCover material={material} university={listing.university} className="featured-cover"/>
      <div className="featured-info">
        <small>{listing.university} · {listing.degree}</small>
        <h3>{material.title}</h3>
        <p>Material completo y ordenado para preparar la materia, repasar conceptos y practicar antes del parcial.</p>
        <div className="featured-rating">★ {String(listing.rating).replace(".", ",")} ({listing.reviews})</div>
        <div className="featured-meta">{material.pages} páginas <i/> <span>Muestra de 5 páginas</span></div>
        <strong className="featured-price">ARS {listing.price.replace("$", "")}</strong>
      </div>
    </Link>
    <div className="featured-seller">
      <span className="avatar">{listing.initials}</span><strong>{listing.seller}</strong><CheckCircle2 size={15}/><small>Correo verificado</small>
      <FavoriteButton materialId={material.id} title={material.title}/>
    </div>
  </article>;
}
