/**
 * ============================================================================
 * CONFIGURACIÓN DEL PANEL DE ADMINISTRACIÓN
 * ============================================================================
 * Textos y enlaces del panel, separados del diseño.
 */
export const adminConfig = {
  /** Nombre que aparece en la barra lateral del panel. */
  title: "Panel de administración",

  /** Enlaces de la navegación del panel. `match` indica cuándo se resalta como "activo". */
  nav: [
    { label: "Resumen", href: "/admin", match: "exact" },
    { label: "Productos", href: "/admin/productos", match: "prefix" },
    { label: "Categorías", href: "/admin/categorias", match: "prefix" },
  ],

  /**
   * Avisos de confirmación. Tras guardar, el formulario redirige a la lista con `?aviso=<clave>`
   * y la lista muestra el mensaje correspondiente. Solo se aceptan estas claves (un texto
   * cualquiera en la URL se ignora): así nadie puede mostrar mensajes inventados en el panel.
   */
  notices: {
    "producto-creado": "Producto creado correctamente.",
    "producto-actualizado": "Producto actualizado correctamente.",
    "sin-cambios": "No había cambios que guardar.",
  },
} as const;

export type AdminNoticeKey = keyof typeof adminConfig.notices;
