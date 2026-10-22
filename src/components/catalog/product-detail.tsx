import Link from "next/link";

import type { Category, Product } from "@/types/catalog";

import { ProductWhatsAppButton } from "../whatsapp/product-whatsapp-button";
import { Badge } from "../ui/badge";
import { Breadcrumb, type BreadcrumbItem } from "../ui/breadcrumb";
import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { Skeleton } from "../ui/skeleton";
import { PriceTag } from "./price-tag";
import { ProductImage } from "./product-image";

interface ProductDetailProps {
  product: Product;
  /** Categoría del producto, si tiene una visible. */
  category: Category | null;
}

/**
 * Ficha completa de un producto: foto grande a la izquierda; nombre, precio, descripción
 * y botón de WhatsApp a la derecha (debajo en celular).
 *
 * Presentacional: recibe los datos ya listos, no llama a la API.
 */
export function ProductDetail({ product, category }: ProductDetailProps) {
  // Migas de pan: la categoría solo aparece si el producto tiene una visible.
  const crumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/productos" },
    ...(category ? [{ label: category.name, href: `/categorias/${category.slug}` }] : []),
    { label: product.name },
  ];

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Esta es la imagen principal de la página: `priority` para que cargue primero. */}
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          priority
          className="aspect-square rounded-card border border-line shadow-card"
        />

        <div className="flex flex-col">
          {category && (
            <Link href={`/categorias/${category.slug}`} className="mb-3 self-start">
              <Badge>{category.name}</Badge>
            </Link>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{product.name}</h1>
          <PriceTag price={product.price} size="lg" className="mt-3" />

          {/* `whitespace-pre-line` respeta los saltos de línea que escribió el administrador. */}
          {product.description && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          <div className="mt-8 space-y-3">
            <ProductWhatsAppButton product={product} size="lg" fullWidth />
            <p className="text-center text-sm text-muted">
              Al pulsar se abrirá WhatsApp con el nombre, el precio y el enlace de este regalo ya escritos.
            </p>
          </div>

          <div className="mt-6">
            {/* `-ml-5` compensa el relleno del botón para que el texto quede alineado con el resto. */}
            <ButtonLink href={category ? `/categorias/${category.slug}` : "/productos"} variant="ghost" className="-ml-5">
              ← Seguir viendo regalos
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}

/** Esqueleto de carga de `ProductDetail`. */
export function ProductDetailSkeleton() {
  return (
    <Container className="py-8 sm:py-12">
      <Skeleton className="h-5 w-72" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-square rounded-card" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </Container>
  );
}
