import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** Etiqueta pequeña redondeada (por ejemplo, el nombre de la categoría de un producto). */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
