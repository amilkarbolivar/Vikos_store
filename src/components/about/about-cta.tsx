import { aboutContent } from "@/config/about";
import { siteConfig } from "@/config/site";

import { CtaBand } from "../home/cta-band";
import { ButtonLink } from "../ui/button";
import { InstagramIcon } from "../ui/icons";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";

/**
 * Cierre de "Sobre nosotros": reutiliza `CtaBand` (la misma banda de la portada) con dos
 * botones: WhatsApp e Instagram.
 */
export function AboutCta() {
  return (
    <CtaBand
      title={aboutContent.cta.title}
      description={aboutContent.cta.description}
      actions={
        <>
          <ContactWhatsAppButton variant="secondary" size="lg" />
          <ButtonLink href={siteConfig.social.instagram.url} variant="secondary" size="lg">
            <InstagramIcon />
            {siteConfig.social.instagram.handle}
          </ButtonLink>
        </>
      }
    />
  );
}
