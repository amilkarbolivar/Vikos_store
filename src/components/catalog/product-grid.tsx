import type { Product } from "@/types/catalog";

import { ButtonLink } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
}

/** Cuadrícula responsive de productos: 2 columnas en celular, 3 en tablet y 4 en escritorio. */
export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Aún no hay productos aquí"
        description="Estamos preparando nuevos regalos. Mientras tanto, explora las demás categorías."
        action={
          <ButtonLink href="/productos" variant="secondary">
            Ver toda la tienda
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          {/* Solo las 4 primeras (las que se ven sin hacer scroll) cargan con prioridad. */}
          <ProductCard product={product} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}
