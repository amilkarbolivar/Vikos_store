import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { siteConfig } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadatos por defecto de TODO el sitio. Cada página puede sobrescribir `title`:
 * la plantilla le agrega el nombre de la tienda ("Oso grande | Vikos Store").
 */
export const metadata: Metadata = {
  // Base para convertir en absolutas las URLs relativas de Open Graph.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: siteConfig.name,
  },
};

/**
 * LAYOUT RAÍZ: lo mínimo común a TODO el sitio (tienda y panel de administración): el documento
 * HTML, las fuentes y los metadatos por defecto.
 *
 * El marco visible (encabezado, pie...) NO está aquí, porque la tienda y el panel son distintos:
 *   - tienda → `app/(store)/layout.tsx`  (usa `StoreShell`)
 *   - panel  → `app/admin/(panel)/layout.tsx`  (usa `AdminShell`)
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
