import Link from "next/link";

import { cn } from "@/lib/cn";
import type { Category } from "@/types/catalog";

interface CategoryChipsProps {
  categories: Category[];
  /** Slug de la categoría seleccionada, o `undefined` si se está viendo "Todas". */
  activeSlug?: string;
}

/** Un botón-píldora que es un enlace. `active` resalta la opción elegida. */
function Chip({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      // `aria-current` le dice a un lector de pantalla cuál opción está seleccionada.
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-line bg-white text-ink hover:border-brand-500 hover:text-brand-700",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Filtro por categoría. No usa JavaScript: cada opción es un ENLACE a su propia página
 * (/productos o /categorias/<slug>), lo que además permite compartir y guardar cada filtro.
 * En celular se desliza horizontalmente; en pantallas grandes se acomoda en varias filas.
 */
export function CategoryChips({ categories, activeSlug }: CategoryChipsProps) {
  return (
    <nav aria-label="Filtrar por categoría">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <li>
          <Chip href="/productos" active={!activeSlug}>
            Todas
          </Chip>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Chip href={`/categorias/${category.slug}`} active={category.slug === activeSlug}>
              {category.name}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  );
}
