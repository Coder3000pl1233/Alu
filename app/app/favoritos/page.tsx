import { AppShell } from "@/components/app-shell";
import { FavoritesGrid } from "@/components/favorites-grid";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return <AppShell><div className="page section-page"><div className="page-title-row"><span className="page-title-icon"><Heart size={24}/></span><div><div className="eyebrow">Tu selección</div><h1>Favoritos</h1><p className="muted">Todos los apuntes que guardaste, reunidos en un solo lugar.</p></div></div><FavoritesGrid/></div></AppShell>;
}
