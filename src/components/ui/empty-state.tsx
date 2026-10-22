import type { ReactNode } from "react";

import { GiftIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Botón o enlace opcional que sugiere qué hacer a continuación. */
  action?: ReactNode;
}

/** Mensaje amable para cuando no hay nada que mostrar (lista vacía, sin resultados...). */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-2xl">
        <GiftIcon />
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
