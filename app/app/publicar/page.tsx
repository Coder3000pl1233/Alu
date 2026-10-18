import { AppShell } from "@/components/app-shell";
import { PublishListingForm } from "@/components/publish-listing-form";
import { SellerEmailNotice } from "@/components/seller-email-notice";
import { requireSellerSession } from "@/lib/server/seller-session";

export default async function PublishListingPage() {
  const session = await requireSellerSession("/app/publicar");
  return (
    <AppShell>
      <div className="page publish-page">
        <div className="eyebrow">Nueva publicación</div>
        <h1>Publicá tus apuntes</h1>
        <p className="muted">Creá una ficha clara y agregá una muestra para que otros estudiantes puedan conocer el material antes de contactarte.</p>
        {!session.user.email_verified && <SellerEmailNotice />}
        <PublishListingForm/>
      </div>
    </AppShell>
  );
}
