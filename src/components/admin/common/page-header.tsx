import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Botones a la derecha del título (por ejemplo, "Nuevo producto"). */
  actions?: ReactNode;
}

/** Cabecera de cada página del panel: título (el <h1>), descripción y acciones. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
