import { siteConfig } from "@/config/site";

import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { GiftIcon } from "../ui/icons";
import { ContactWhatsAppButton } from "../whatsapp/contact-whatsapp-button";

/**
 * Bloque principal de la portada: titular, descripción y dos botones de acción
 * (ver la tienda / escribir por WhatsApp). Todos los textos salen de `siteConfig`.
 * La ilustración de la derecha es puro CSS (sin imágenes), así carga al instante.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Manchas de color decorativas; `aria-hidden` porque no aportan información. */}
      <div aria-hidden="true" className="absolute -left-24 -top-24 size-80 rounded-full bg-brand-100 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-24 right-0 size-96 rounded-full bg-gold/20 blur-3xl" />

      <Container className="relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-700 shadow-card">
            {siteConfig.name}
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{siteConfig.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/productos" size="lg">
              Ver la tienda
            </ButtonLink>
            <ContactWhatsAppButton size="lg" />
          </div>
        </div>

        {/* Ilustración: tarjeta central con regalo y "burbujas" flotantes alrededor. */}
        <div aria-hidden="true" className="relative mx-auto hidden size-80 lg:block">
          <div className="absolute inset-6 flex items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-brand-700 text-9xl text-white shadow-card-hover [transform:rotate(-6deg)]">
            <GiftIcon />
          </div>
          <span className="absolute -right-2 top-4 flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-card">
            🎈
          </span>
          <span className="absolute -left-4 bottom-10 flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-card">
            💐
          </span>
          <span className="absolute bottom-0 right-8 flex size-14 items-center justify-center rounded-2xl bg-gold text-2xl shadow-card">
            ✨
          </span>
        </div>
      </Container>
    </section>
  );
}
