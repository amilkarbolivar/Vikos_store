import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";

/**
 * Los pasos para pedir. Están en un arreglo: para agregar, quitar o cambiar un paso
 * solo se edita esta lista, no el diseño.
 */
const steps = [
  {
    title: "Elige tu regalo",
    description: "Explora la tienda y encuentra el detalle perfecto para esa persona especial.",
  },
  {
    title: "Pídelo por WhatsApp",
    description: "Pulsa el botón y se abrirá WhatsApp con tu pedido ya escrito. Solo envía el mensaje.",
  },
  {
    title: "Recíbelo",
    description: "Te confirmamos la disponibilidad y coordinamos contigo la entrega.",
  },
] as const;

/** Sección "Cómo funciona": 3 pasos numerados. Es estática (no pide datos). */
export function HowItWorks() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Así de fácil" title="Pedir tu regalo toma un minuto" />
        {/* <ol>: es una lista ORDENADA (los pasos tienen secuencia). */}
        <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-card border border-line bg-white p-6 shadow-card">
              <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {index + 1}
              </span>
              <h3 className="text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
