import { siteConfig } from "@/config/site";

/** Franja superior con un aviso corto (ej. "Entregas a domicilio en Bogotá"). Se edita en siteConfig. */
export function AnnouncementBar() {
  if (!siteConfig.announcement) return null;

  return (
    <div className="bg-brand-700 px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
      {siteConfig.announcement}
    </div>
  );
}
