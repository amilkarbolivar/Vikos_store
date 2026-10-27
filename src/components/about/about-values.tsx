import { aboutContent } from "@/config/about";

import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";

/** Tarjetas "Lo que nos mueve". Los elementos salen de `aboutContent.values.items`. */
export function AboutValues() {
  const { eyebrow, title, items } = aboutContent.values;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {items.map((item) => (
            <li key={item.title} className="rounded-card border border-line bg-white p-6 shadow-card">
              <h3 className="text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
