import { Container } from "../ui/container";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";

/** Banda final de la portada con una invitación a escribir por WhatsApp. */
export function CtaBand() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col items-center gap-5 rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="max-w-xl text-white/90">
            Cuéntanos la ocasión y el presupuesto, y te ayudamos a armar el regalo ideal.
          </p>
          {/* Variante "secundario" (fondo blanco) para que resalte sobre el fondo rosa. */}
          <ContactWhatsAppButton variant="secondary" size="lg" />
        </div>
      </Container>
    </section>
  );
}
