import Link from "next/link";
import { Fragment } from "react";

import { ChevronRightIcon } from "./icons";

export interface BreadcrumbItem {
  label: string;
  /** Sin `href` = página actual (no es un enlace). */
  href?: string;
}

/**
 * Migas de pan: "Inicio › Tienda › Peluches › Oso grande".
 * Ayuda a ubicarse y a volver atrás. El último elemento se marca como página actual.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Migas de pan" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <li aria-hidden="true" className="flex items-center">
                <ChevronRightIcon width="1em" height="1em" />
              </li>
            )}
            <li>
              {item.href ? (
                <Link href={item.href} className="hover:text-brand-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
