import type { Metadata } from "next";

import { AboutCta } from "@/components/about/about-cta";
import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";
import { aboutContent } from "@/config/about";

/** Título y descripción de la pestaña / Google. El título final es "Sobre nosotros | Vikos Store". */
export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: aboutContent.hero.description,
};

/**
 * SOBRE NOSOTROS ( /sobre-nosotros )
 *
 * Página 100 % estática: no pide datos a la API, así que se sirve al instante. Cada sección
 * es un componente en `components/about/` y todos los textos están en `config/about.ts`.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutCta />
    </>
  );
}
