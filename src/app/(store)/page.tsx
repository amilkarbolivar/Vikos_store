import { Suspense } from "react";

import { CategoryShowcase, CategoryShowcaseSkeleton } from "@/components/catalog/category-showcase";
import { ProductShowcase, ProductShowcaseSkeleton } from "@/components/catalog/product-showcase";
import { CtaBand } from "@/components/home/cta-band";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";

/**
 * PORTADA ( / )
 *
 * La página es una "carcasa" estática (Hero, Cómo funciona, banda final) que se sirve al
 * instante. Las dos secciones que dependen de la API (categorías y productos) van cada una
 * dentro de su <Suspense>: mientras llegan los datos se ve el esqueleto, y cada sección
 * aparece sola en cuanto está lista, sin esperar a la otra.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryShowcase />
      </Suspense>

      <Suspense fallback={<ProductShowcaseSkeleton />}>
        <ProductShowcase limit={8} />
      </Suspense>

      <HowItWorks />
      <CtaBand />
    </>
  );
}
