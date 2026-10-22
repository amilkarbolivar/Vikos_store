/**
 * ============================================================================
 * CONFIGURACIÓN DEL SITIO
 * ============================================================================
 * Este es el ÚNICO archivo que hay que tocar para cambiar datos del negocio:
 * nombre, número de WhatsApp, textos del encabezado, etc. Ningún componente
 * tiene estos datos escritos "a mano".
 *
 * Variables de entorno opcionales (ponlas en tu .env o en compose.yaml):
 *   NEXT_PUBLIC_WHATSAPP_NUMBER  Número con indicativo de país y sin "+" ni espacios.
 *                                Ejemplo para Colombia: 573001234567
 *   NEXT_PUBLIC_SITE_URL         URL pública de la tienda (se usa para armar el enlace del
 *                                producto dentro del mensaje de WhatsApp).
 *                                Ejemplo: https://www.mitienda.com
 */
export const siteConfig = {
  /** Nombre de la tienda: aparece en el encabezado, el pie y el título de la pestaña. */
  name: "Vikos Store",

  /** Frase corta que acompaña al nombre. */
  tagline: "Regalos que sorprenden",

  /** Descripción para buscadores (Google) y para cuando se comparte el enlace. */
  description:
    "Tienda de regalos y detalles para toda ocasión. Elige tu regalo favorito y pídelo por WhatsApp.",

  /**
   * URL pública del sitio, SIN barra final.
   * En local es http://localhost:3000; en producción debe ser tu dominio real.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),

  /** Formato de dinero. COP = pesos colombianos, sin decimales salvo que el precio los tenga. */
  currency: { locale: "es-CO", code: "COP" },

  /** Franja superior del sitio. Pon `null` para ocultarla. */
  announcement: "Entregas a domicilio en Cucuta" as string | null,

  whatsapp: {
    /**
     * Número al que llegan los pedidos. Solo dígitos, con indicativo de país.
     * ⚠️ El valor por defecto es de EJEMPLO: cámbialo por el número real del negocio.
     */
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573000000000",

    /** Primera línea del mensaje que se abre en WhatsApp. */
    productGreeting: "Hola 👋, me interesa este regalo:",

    /** Última línea del mensaje de un producto. */
    productClosing: "¿Me confirmas disponibilidad y tiempo de entrega?",

    /** Mensaje genérico (botón flotante, encabezado, pie de página). */
    generalMessage: "Hola 👋, quiero información sobre sus regalos.",
  },

  /** Enlaces del menú principal (encabezado y pie). */
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/productos" },
  ],
} as const;
