import { AppShell } from "@/components/app-shell";
import { PublishListingForm } from "@/components/publish-listing-form";

export default function PublishListingPage() {
  return (
    <AppShell>
      <div className="page publish-page">
        <div className="eyebrow">Nueva publicación</div>
        <h1>Publicá tus apuntes</h1>
        <p className="muted">Creá una ficha clara y agregá una muestra para que otros estudiantes puedan conocer el material antes de contactarte.</p>
        <PublishListingForm/>
      </div>
    </AppShell>
  );
}
