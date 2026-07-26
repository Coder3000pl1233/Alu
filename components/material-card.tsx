import Link from "next/link";
import { FileText } from "lucide-react";
import type { Material } from "@/lib/mock-data";
import { FavoriteButton } from "@/components/favorite-button";

export function MaterialCard({ material }: { material: Material }) {
  return (
    <article className="card material-card">
      <FavoriteButton materialId={material.id} title={material.title}/>
      <Link href={`/app/material/${material.id}`} className="material-card-link">
        <div className="material-cover" style={{background: material.color}}>
          <span className="doc-icon"><FileText color="#315dba" /></span>
        </div>
        <div className="material-body">
          <span className="tag">{material.type}</span>
          <div className="material-title">{material.title}</div>
          <div className="meta"><span>{material.pages} páginas</span><span>{material.updated}</span></div>
          <div className="progress"><span style={{width:`${material.progress}%`}} /></div>
        </div>
      </Link>
    </article>
  );
}
