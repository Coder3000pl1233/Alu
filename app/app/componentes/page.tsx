import { AppShell } from "@/components/app-shell";
import { DesignSystemGallery } from "@/components/design-system-gallery";

export default function ComponentsPage() {
  return (
    <AppShell>
      <div className="page">
        <div className="eyebrow">Documentación viva</div>
        <h1>Sistema de diseño</h1>
        <p className="muted">Componentes, tokens y estados utilizados por Aula Segura.</p>
        <DesignSystemGallery/>
      </div>
    </AppShell>
  );
}
