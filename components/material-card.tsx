import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { getListingDetails, type Material } from "@/lib/mock-data";
import { FavoriteButton } from "@/components/favorite-button";
import { StudyCover } from "@/components/study-cover";

export function MaterialCard({ material }: { material: Material }) {
  const listing = getListingDetails(material);

  return (
    <article className="card material-card">
      <FavoriteButton materialId={material.id} title={material.title}/>
      <Link href={`/app/material/${material.id}`} className="material-card-link">
        <div className="material-cover">
          <StudyCover material={material} university={listing.university}/>
          <span className="listing-price-badge">{listing.price}</span>
        </div>
        <div className="material-body">
          <span className="tag">{material.type}</span>
          <div className="material-title">{material.title}</div>
          <div className="listing-location"><MapPin size={13}/>{listing.university} · {listing.degree}</div>
          <div className="listing-seller">
            <span className="avatar small">{listing.initials}</span>
            <span>{listing.seller}</span>
            <span className="listing-rating"><Star size={13} fill="currentColor"/>{listing.rating}</span>
          </div>
          <div className="listing-footer"><strong>{listing.price}</strong><span>{material.pages} páginas</span></div>
        </div>
      </Link>
    </article>
  );
}
