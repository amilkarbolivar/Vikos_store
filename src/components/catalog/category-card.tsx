import Link from "next/link";

import type { Category } from "@/types/catalog";

import { ArrowRightIcon, GiftIcon } from "../ui/icons";

/**
 * Degradados que se alternan entre tarjetas para dar variedad sin necesitar una foto por
 * categoría. (Si en el futuro las categorías tienen imagen, se reemplaza aquí.)
 */
const gradients = [
  "from-brand-100 to-brand-50",
  "from-amber-100 to-orange-50",
  "from-rose-100 to-pink-50",
  "from-violet-100 to-fuchsia-50",
] as const;

interface CategoryCardProps {
  category: Category;
  /** Posición en la lista: se usa para elegir el degradado. */
  index: number;
}

/** Tarjeta de una categoría para la portada: lleva a /categorias/<slug>. */
export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <div
        className={`flex h-28 items-center justify-center bg-gradient-to-br text-4xl text-brand-600/80 ${gradients[index % gradients.length]}`}
      >
        <GiftIcon />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-bold text-ink">{category.name}</h3>
        {category.description && <p className="line-clamp-2 text-sm text-muted">{category.description}</p>}
        <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-brand-700">
          Ver regalos
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
