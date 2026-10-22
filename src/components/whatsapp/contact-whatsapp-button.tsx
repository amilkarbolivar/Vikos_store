import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

import { ButtonLink } from "../ui/button";
import { WhatsAppIcon } from "../ui/icons";

interface ContactWhatsAppButtonProps {
  label?: string;
  variant?: "primary" | "secondary" | "whatsapp" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

/**
 * Botón de contacto GENERAL por WhatsApp (sin producto): para el encabezado, la portada
 * y el pie de página. El mensaje se define en `siteConfig.whatsapp.generalMessage`.
 */
export function ContactWhatsAppButton({
  label = "Escríbenos por WhatsApp",
  variant = "whatsapp",
  size = "md",
  fullWidth,
  className,
}: ContactWhatsAppButtonProps) {
  return (
    <ButtonLink
      href={buildWhatsAppUrl(siteConfig.whatsapp.number, siteConfig.whatsapp.generalMessage)}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
    >
      <WhatsAppIcon />
      {label}
    </ButtonLink>
  );
}
