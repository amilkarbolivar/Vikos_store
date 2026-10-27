import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number;
  /** Línea pequeña bajo el número (por ejemplo, "3 ocultos"). */
  hint?: string;
  /** Si se pasa, toda la tarjeta es un enlace. */
  href?: string;
}

/** Tarjeta con una cifra grande, para el resumen del panel. */
export function StatCard({ label, value, hint, href }: StatCardProps) {
  const content = (
    <>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );
  const classes = "block rounded-card border border-line bg-white p-5 shadow-card";

  return href ? (
    <Link href={href} className={`${classes} transition-shadow hover:shadow-card-hover`}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
