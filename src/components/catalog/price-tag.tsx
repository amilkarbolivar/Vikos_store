import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format-price";

interface PriceTagProps {
  /** Precio en pesos. */
  price: number;
  size?: "md" | "lg";
  className?: string;
}

/** Muestra un precio con el formato de la tienda ("$ 89.900"). Un solo lugar = un solo estilo. */
export function PriceTag({ price, size = "md", className }: PriceTagProps) {
  return (
    <p className={cn("font-bold text-brand-700", size === "lg" ? "text-3xl" : "text-lg", className)}>
      {formatPrice(price)}
    </p>
  );
}
