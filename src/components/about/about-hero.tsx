import { aboutContent } from "@/config/about";

import { Container } from "../ui/container";

/**
 * Cabecera de "Sobre nosotros": título principal (el único <h1> de la página) y una
 * introducción. Los textos se editan en `config/about.ts`.
 */
export function AboutHero() {
  const { eyebrow, title, description } = aboutContent.hero;

  return (
    <section className="relative overflow-hidden">
      {/* Manchas de color decorativas; `aria-hidden` porque no aportan información. */}
      <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-brand-100 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-20 left-0 size-72 rounded-full bg-gold/20 blur-3xl" />

      <Container className="relative py-14 text-center sm:py-20">
        <p className="mb-4 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-700 shadow-card">
          {eyebrow}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">{description}</p>
      </Container>
    </section>
  );
}
