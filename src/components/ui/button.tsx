import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * ============================================================================
 * BOTONES
 * ============================================================================
 * Un solo lugar define cómo se ve un botón. Hay dos componentes que comparten el mismo
 * aspecto a través de `buttonStyles`:
 *
 *   <Button>      → un <button> real (para acciones: enviar, abrir un menú...).
 *   <ButtonLink>  → un enlace con aspecto de botón (para navegar a otra página o a WhatsApp).
 *
 * Regla de accesibilidad: lo que NAVEGA es un enlace; lo que EJECUTA algo es un botón.
 */

type Variant = "primary" | "secondary" | "whatsapp" | "ghost";
type Size = "sm" | "md" | "lg";

interface StyleOptions {
  variant?: Variant;
  size?: Size;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
  className?: string;
}

/** Clases comunes a todos los botones. */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold " +
  "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

/** Colores según la variante. */
const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-brand-600 bg-white text-brand-700 hover:bg-brand-50",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-dark",
  ghost: "text-ink hover:bg-brand-50",
};

/** Altura y relleno según el tamaño (todos ≥ 40px de alto: fáciles de tocar en celular). */
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
};

/** Devuelve las clases de un botón. Exportada por si otro componente necesita el mismo estilo. */
export function buttonStyles({ variant = "primary", size = "md", fullWidth, className }: StyleOptions = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleOptions;

/** Botón de acción (<button>). Por defecto `type="button"` para no enviar formularios por accidente. */
export function Button({ variant, size, fullWidth, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, fullWidth, className })} {...props} />;
}

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  StyleOptions & {
    href: string;
    children: ReactNode;
  };

/**
 * Enlace con aspecto de botón.
 * - Ruta interna ("/productos") → usa <Link> de Next (navegación rápida, sin recargar).
 * - Dirección externa ("https://wa.me/...") → usa <a> y se abre en otra pestaña, con
 *   `rel="noopener noreferrer"` para que la página destino no pueda controlar a la nuestra.
 */
export function ButtonLink({ href, variant, size, fullWidth, className, children, ...props }: ButtonLinkProps) {
  const classes = buttonStyles({ variant, size, fullWidth, className });
  const isExternal = /^https?:\/\//.test(href);

  if (isExternal) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
