/**
 * ============================================================================
 * CONTENIDO DE LA PÁGINA "SOBRE NOSOTROS"
 * ============================================================================
 * Todos los textos de la página viven AQUÍ, separados del diseño: para cambiar lo que dice
 * la página no hay que tocar ningún componente, solo este archivo.
 *
 * ⚠️  TEXTOS PROVISIONALES
 * Se escribieron sin poder leer el Instagram de la tienda (Instagram bloquea la lectura
 * automática), así que SOLO afirman lo que ya se sabe por el propio sitio: es una tienda de
 * regalos y detalles, y los pedidos se hacen por WhatsApp. NO incluyen fechas, ciudades,
 * nombres de personas, cifras ni historias, porque no se pueden inventar.
 * Reemplázalos con la información real (historia, quiénes están detrás, qué hace especial
 * a la tienda) antes de publicar.
 */
export const aboutContent = {
  /** Cabecera de la página. */
  hero: {
    eyebrow: "Sobre nosotros",
    title: "Detalles pensados para sorprender",
    description:
      "Somos una tienda de regalos y detalles para quienes quieren decir “te quiero”, “gracias” o “felicidades” de una forma que se recuerde.",
  },

  /** Bloque de texto principal: cada elemento es un párrafo. */
  story: {
    eyebrow: "Quiénes somos",
    title: "Un buen regalo se nota en el cuidado",
    paragraphs: [
      "Creemos que un regalo no se mide por su precio, sino por el cariño con el que se elige. Por eso reunimos detalles para distintas ocasiones y presupuestos, y te ayudamos a escoger el que mejor le queda a esa persona especial.",
      "Aquí no hay carrito ni trámites largos: eliges tu regalo en la tienda, nos escribes por WhatsApp con tu pedido ya armado y coordinamos contigo los detalles.",
    ],
  },

  /** Tarjetas de valores / razones. Se pueden agregar o quitar. */
  values: {
    eyebrow: "Lo que nos mueve",
    title: "Así trabajamos",
    items: [
      {
        title: "Detalles con intención",
        description: "Cada regalo está pensado para emocionar, no solo para cumplir.",
      },
      {
        title: "Atención cercana",
        description: "Hablas directamente con nosotros por WhatsApp, sin intermediarios ni formularios.",
      },
      {
        title: "Para cada ocasión",
        description: "Cumpleaños, aniversarios o un “porque sí”: encuentra algo para cada momento.",
      },
    ],
  },

  /** Banda final con los botones de contacto. */
  cta: {
    title: "¿Hablamos?",
    description: "Escríbenos por WhatsApp o síguenos en Instagram para ver más detalles.",
  },
} as const;
