"use client";

import { useState } from "react";
import { ExternalLink, MessageCircle, X } from "lucide-react";

export function ContactSellerButton({ contactUrl }: { contactUrl: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="listing-contact-button" type="button" onClick={() => setOpen(true)}><MessageCircle size={19}/>Contactar al vendedor</button>
    {open && <div className="contact-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="contact-dialog-close" type="button" aria-label="Cerrar" onClick={() => setOpen(false)}><X size={19}/></button>
        <span className="contact-dialog-icon"><MessageCircle size={27}/></span>
        <h2 id="contact-title">Vas a continuar por WhatsApp</h2>
        <p>Consultá disponibilidad, precio y forma de entrega directamente con el vendedor.</p>
        <div><button type="button" onClick={() => setOpen(false)}>Cancelar</button><a href={contactUrl} target="_blank" rel="noreferrer">Continuar <ExternalLink size={15}/></a></div>
      </section>
    </div>}
  </>;
}
