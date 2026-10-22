import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

import { WhatsAppIcon } from "../ui/icons";

/**
 * Botón redondo flotante de WhatsApp, fijo en la esquina inferior derecha de todas las
 * páginas (se coloca una sola vez en el layout raíz). Es solo un enlace: no usa JavaScript.
 */
export function WhatsAppFloat() {
  return (
    <a
      href={buildWhatsAppUrl(siteConfig.whatsapp.number, siteConfig.whatsapp.generalMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-3xl text-white shadow-card-hover transition-transform hover:scale-105 hover:bg-whatsapp-dark"
    >
      <WhatsAppIcon />
    </a>
  );
}
