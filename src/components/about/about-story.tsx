import { aboutContent } from "@/config/about";

import { Container } from "../ui/container";
import { GiftIcon } from "../ui/icons";
import { SectionHeading } from "../ui/section-heading";

/**
 * Bloque "Quiénes somos": título + párrafos a la izquierda y una ilustración a la derecha.
 * Cada párrafo de `aboutContent.story.paragraphs` se dibuja como un <p>: para agregar uno,
 * basta con añadirlo a la lista.
 *
 * La ilustración es un adorno de CSS. Cuando haya una foto real del equipo o de los
 * productos, se reemplaza aquí (ver `ProductImage` para mostrar imágenes con plan B).
 */
export function AboutStory() {
  const { eyebrow, title, paragraphs } = aboutContent.story;

  return (
    <section className="py-12 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-brand-100 to-brand-50 text-8xl text-brand-600/80 shadow-card"
        >
          <GiftIcon />
        </div>
      </Container>
    </section>
  );
}
