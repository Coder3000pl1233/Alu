import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { readLocalMailbox } from "@/lib/identity/local-mailbox";

export const dynamic = "force-dynamic";

export default async function LocalMailboxPage() {
  const host = (await headers()).get("host") ?? "";
  if (process.env.NODE_ENV === "production" || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) notFound();
  const messages = await readLocalMailbox();
  return <main style={{ maxWidth: 720, margin: "48px auto", padding: 24 }}>
    <h1>Correos de desarrollo</h1>
    <p>Enlaces locales para probar verificación y recuperación. Esta página solo funciona en localhost durante desarrollo.</p>
    {messages.length === 0 ? <p>Todavía no hay correos.</p> : <ul>{messages.map((mail, index) =>
      <li key={`${mail.createdAt}-${index}`} style={{ marginBottom: 20 }}>
        <strong>{mail.purpose === "verify" ? "Verificación" : "Recuperación"}</strong> · {mail.to}<br />
        <a href={mail.url}>{mail.url}</a><br /><small>{mail.createdAt}</small>
      </li>)}</ul>}
  </main>;
}
