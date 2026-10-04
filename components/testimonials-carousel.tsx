"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const testimonials = [
  { initials: "CM", quote: "Los apuntes están bien explicados y me sirvieron un montón para el parcial.", name: "Camila M.", university: "UBA · Ingeniería" },
  { initials: "TR", quote: "La muestra me dio confianza y luego coordiné con el vendedor sin problemas.", name: "Tomás R.", university: "UNLP · Medicina" },
  { initials: "LV", quote: "Pude comparar varias opciones antes de contactar. La experiencia fue muy simple.", name: "Lucía V.", university: "UNC · Derecho" },
  { initials: "JN", quote: "Encontré material justo de mi cátedra y pude preparar mejor el final.", name: "Julián N.", university: "UTN · Sistemas" },
];

export function TestimonialsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth * 0.72, behavior: "smooth" });

  return (
    <section className="reference-testimonials">
      <div className="testimonials-heading">
        <span><strong>Lo que dicen los estudiantes</strong><small>Experiencias de ejemplo de nuestra comunidad</small></span>
        <span>Deslizá o usá las flechas</span>
      </div>
      <div className="testimonials-carousel">
        <button className="testimonial-arrow previous" type="button" aria-label="Ver opiniones anteriores" onClick={() => move(-1)}><ChevronLeft size={21}/></button>
        <div className="testimonials-track" ref={trackRef}>
          {testimonials.map(item => <article className="testimonial-card" key={item.name}><p>“{item.quote}”</p><div><span className="avatar">{item.initials}</span><strong>{item.name}<small>{item.university}</small></strong><span className="testimonial-stars">★★★★★</span></div></article>)}
        </div>
        <button className="testimonial-arrow next" type="button" aria-label="Ver más opiniones" onClick={() => move(1)}><ChevronRight size={21}/></button>
      </div>
    </section>
  );
}
