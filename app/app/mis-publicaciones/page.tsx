import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SellerEmailNotice } from "@/components/seller-email-notice";
import { requireSellerSession } from "@/lib/server/seller-session";
import { getApi } from "@/lib/server/api-runtime";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/server/app";
import type { MarketplacePrivateListing } from "@/lib/marketplace/gateway";

export default async function MyListingsPage() {
  const session = await requireSellerSession("/app/mis-publicaciones");
  const token = (await cookies()).get(SESSION_COOKIE)!.value;
  const response = await (await getApi()).inject({ method: "GET", url: "/api/v1/me/listings", headers: { cookie: `${SESSION_COOKIE}=${token}` } });
  const listings = response.statusCode === 200 ? (response.json() as { data: MarketplacePrivateListing[] }).data : [];
  return <AppShell><div className="page section-page">
    <div className="page-title-row listings-title"><div><div className="eyebrow">Espacio vendedor</div><h1>Mis publicaciones</h1><p className="muted">Tus publicaciones guardadas en EntreApuntes.</p></div><Link className="btn btn-primary" href="/app/publicar">Nueva publicación</Link></div>
    {!session.user.email_verified && <SellerEmailNotice />}
    <section className="card" style={{ padding: 24 }}>
      {listings.length ? <ul>{listings.map(listing => <li key={listing.id} style={{ marginBottom: 16 }}><strong>{listing.title}</strong> · {listing.status} · {listing.price_ars ? `$${listing.price_ars}` : "Sin precio"}</li>)}</ul>
        : <p>Todavía no tenés publicaciones. <Link href="/app/publicar">Prepará la primera</Link>.</p>}
    </section>
  </div></AppShell>;
}
