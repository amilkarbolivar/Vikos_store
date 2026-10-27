import type { ReactNode } from "react";

import { Container } from "../ui/container";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";

interface CtaBandProps {
  title?: string;
  description?: string;
  /** Botones de la banda. Por defecto, uno solo de WhatsApp. */
  actions?: ReactNode;
}

/**
 * Banda de invitación a contactar (fondo rosa). Se usa en la portada y en "Sobre nosotros":
 * sin parámetros muestra el mensaje de la portada; cada página puede cambiar el título, el
 * texto y los botones.
 */
export function CtaBand({
  title = "¿No encuentras lo que buscas?",
  description = "Cuéntanos la ocasión y el presupuesto, y te ayudamos a armar el regalo ideal.",
  actions,
}: CtaBandProps) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col items-center gap-5 rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          <p className="max-w-xl text-white/90">{description}</p>
          {/* Variante "secundario" (fondo blanco) para que resalte sobre el fondo rosa. */}
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            {actions ?? <ContactWhatsAppButton variant="secondary" size="lg" />}
          </div>
        </div>
      </Container>
    </section>
  );
}
