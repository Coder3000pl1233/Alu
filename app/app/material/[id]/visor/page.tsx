import { ProtectedViewer } from "@/components/protected-viewer";
import { materials } from "@/lib/mock-data";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const initialPage = Number(query.page ?? "1");
  const material = materials.find(item => item.id === id) ?? materials[0];

  return (
    <ProtectedViewer
      documentId={material.id}
      sourceDocumentId="anatomia-general"
      backHref={`/app/material/${material.id}`}
      title={`Vista previa · ${material.title}`}
      pageCount={5}
      imageWidth={864}
      imageHeight={1221}
      initialPage={Number.isFinite(initialPage) ? initialPage : 1}
      previewMode
    />
  );
}
