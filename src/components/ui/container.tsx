import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Contenedor centrado con ancho máximo y márgenes laterales.
 * TODAS las secciones lo usan para que el contenido quede alineado igual en toda la web.
 */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
