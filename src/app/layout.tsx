import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/whatsapp/whatsapp-float";
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
 * LAYOUT RAÍZ: el marco común de todas las páginas.
 *
 *   franja de aviso → encabezado → [contenido de la página] → pie → botón flotante de WhatsApp
 *
 * Nada de aquí depende de la API, así que todo el marco es estático y carga al instante.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Enlace invisible que aparece al navegar con Tab: salta directo al contenido. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-card-hover"
        >
          Saltar al contenido
        </a>

        <AnnouncementBar />
        <SiteHeader />

        <main id="contenido" className="flex-1">
          {children}
        </main>

        <SiteFooter />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
