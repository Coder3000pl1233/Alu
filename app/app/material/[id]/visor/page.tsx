import Link from "next/link";
import { ProtectedViewer } from "@/components/protected-viewer";
import { materials } from "@/lib/mock-data";
import { resolveViewerSource, supportsTiles } from "@/lib/viewer-source";

export default async function ViewerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; source?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const initialPage = Number(query.page ?? "1");
  const material = materials.find(item => item.id === id) ?? materials[0];

  if (material.id !== "anatomia-general") {
    return (
      <main className="viewer-placeholder">
        <h1>Este material todavía no tiene páginas procesadas</h1>
        <p>El visor de demostración está disponible en Anatomía general.</p>
        <Link className="btn btn-primary" href="/app/material/anatomia-general">Abrir material de ejemplo</Link>
      </main>
    );
  }

  return <ProtectedViewer documentId="anatomia-general" title="Bloque 1 · Anatomía" pageCount={60} imageWidth={864} imageHeight={1221} initialPage={Number.isFinite(initialPage) ? initialPage : 1} initialSourceMode={resolveViewerSource(id, query.source)} tileCapable={supportsTiles(id)} />;
}
