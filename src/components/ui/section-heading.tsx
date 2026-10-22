import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  /** Texto pequeño sobre el título (opcional), en mayúsculas y color de marca. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Contenido a la derecha del título en pantallas grandes (por ejemplo un enlace "Ver todo"). */
  action?: ReactNode;
  /**
   * Nivel del título. Cada página debe tener UN solo <h1> (el título principal, importante
   * para buscadores y lectores de pantalla); las secciones internas usan 2 (por defecto).
   */
  level?: 1 | 2;
  className?: string;
}

/**
 * Encabezado de sección: [eyebrow] + título + descripción + acción opcional.
 * Se usa en TODAS las secciones para que los títulos se vean igual en toda la web.
 */
export function SectionHeading({ eyebrow, title, description, action, level = 2, className }: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
        )}
        <Heading
          className={cn(
            "font-bold tracking-tight text-ink",
            level === 1 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </Heading>
        {description && <p className="mt-2 text-base text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
