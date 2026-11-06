import Image from "next/image";

import { aboutContent } from "@/config/about";

import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";

/**
 * Bloque "Quiénes somos": título + párrafos a la izquierda y la fotografía real
 * de la entrega de regalos en Viko's Store a la derecha, manteniendo su proporción original.
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

        <div className="relative mx-auto w-full overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover">
          <Image
            src="/sobre-nosotros.jpg"
            alt="Detalles personalizados en Viko's Store"
            width={1024}
            height={584}
            unoptimized
            priority
            className="h-auto w-full object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
