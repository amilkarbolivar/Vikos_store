import { aboutContent } from "@/config/about";

import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";

/** Retardo de entrada escalonado por índice de tarjeta (en ms). */
const STAGGER_DELAYS = [0, 150, 300] as const;

/** Tarjetas "Lo que nos mueve". Los elementos salen de `aboutContent.values.items`.
 *  Cada tarjeta entra con una animación fade-in-up escalonada definida en globals.css. */
export function AboutValues() {
  const { eyebrow, title, items } = aboutContent.values;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {items.map((item, index) => (
            <li
              key={item.title}
              className="animate-fade-in-up rounded-card border border-line bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
              style={{ animationDelay: `${STAGGER_DELAYS[index] ?? index * 150}ms` }}
            >
              <h3 className="text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
