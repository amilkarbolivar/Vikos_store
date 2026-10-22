/**
 * Prueba de componentes de la tienda renderizados de verdad (a HTML, sin navegador):
 * comprueba el enlace de WhatsApp que recibiría el cliente al pulsar "Pedir ahora".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProductWhatsAppButton } from "../../src/components/whatsapp/product-whatsapp-button.tsx";
import type { Product } from "../../src/types/catalog.ts";

const product: Product = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Amor Gigante",
  slug: "amor-gigante",
  description: "",
  price: 489000,
  priceInCents: 48_900_000,
  categoryId: null,
  imageUrl: null,
  isAvailable: true,
  createdAt: "2026-10-18T00:00:00.000Z",
  updatedAt: "2026-10-18T00:00:00.000Z",
};

describe("ProductWhatsAppButton", () => {
  const html = renderToStaticMarkup(createElement(ProductWhatsAppButton, { product, label: "Pedir ahora", size: "sm" }));
  const href = /href="([^"]+)"/.exec(html)?.[1]?.replaceAll("&amp;", "&") ?? "";

  it("abre wa.me en otra pestaña de forma segura", () => {
    assert.match(href, /^https:\/\/wa\.me\/\d+\?text=/);
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
  });

  it("el mensaje trae nombre, precio y enlace del producto", () => {
    const text = new URL(href).searchParams.get("text")?.replace(/\u00a0/g, " ") ?? "";
    assert.match(text, /🎁 Amor Gigante/);
    assert.match(text, /💰 \$ 489\.000/);
    assert.match(text, /🔗 http:\/\/localhost:3000\/productos\/amor-gigante/);
  });

  it("el nombre accesible incluye el texto visible y el producto", () => {
    assert.match(html, /aria-label="Pedir ahora: Amor Gigante"/);
    assert.match(html, />Pedir ahora</);
  });
});
