/**
 * Pruebas de la capa de datos y utilidades de la tienda (frontend):
 * formato de precio, mensajes de WhatsApp, cliente HTTP y servicio del catálogo.
 * No necesitan servidor: `fetch` se reemplaza por una función simulada.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { ApiError, apiGet, apiGetOrNull } from "../../src/lib/api-client.ts";
import { formatPrice } from "../../src/lib/format-price.ts";
import { truncate } from "../../src/lib/truncate.ts";
import { buildProductMessage, buildWhatsAppUrl } from "../../src/lib/whatsapp.ts";
import { getCategories, getCategory, getProduct, getProducts } from "../../src/services/catalog-service.ts";

describe("formatPrice", () => {
  // Intl usa espacios "duros" (U+00A0) entre el símbolo y el número: se normalizan para comparar.
  const plain = (text: string) => text.replace(/\u00a0/g, " ");

  it("usa el formato colombiano y no muestra decimales en precios enteros", () => {
    assert.equal(plain(formatPrice(89900)), "$ 89.900");
    assert.equal(plain(formatPrice(1250000)), "$ 1.250.000");
  });

  it("conserva los centavos si el precio los tiene", () => {
    assert.match(plain(formatPrice(99900.5)), /^\$ 99\.900,5$/);
  });
});

describe("WhatsApp", () => {
  it("arma la URL oficial con solo dígitos en el número", () => {
    const url = buildWhatsAppUrl("+57 313-273 4121", "Hola");
    assert.equal(url, "https://wa.me/573132734121?text=Hola");
  });

  it("codifica saltos de línea, tildes y emojis para que viajen intactos", () => {
    const url = new URL(buildWhatsAppUrl("573000000000", "¿Qué tal? 👋\nGracias & hasta pronto"));
    assert.equal(url.searchParams.get("text"), "¿Qué tal? 👋\nGracias & hasta pronto");
  });

  it("el mensaje de un producto incluye nombre, precio y enlace", () => {
    const message = buildProductMessage(
      { name: "Oso grande", price: 89900, slug: "oso-grande" },
      { siteUrl: "https://mitienda.com", greeting: "Hola", closing: "Gracias" },
    );
    const lines = message.split("\n").map((line) => line.replace(/\u00a0/g, " "));
    assert.deepEqual(lines, [
      "Hola",
      "",
      "🎁 Oso grande",
      "💰 $ 89.900",
      "🔗 https://mitienda.com/productos/oso-grande",
      "",
      "Gracias",
    ]);
  });
});

describe("truncate", () => {
  it("no toca textos cortos y recorta los largos con puntos suspensivos", () => {
    assert.equal(truncate("corto", 10), "corto");
    const long = truncate("a".repeat(300), 160);
    assert.equal(long.length, 160);
    assert.ok(long.endsWith("…"));
  });

  it("colapsa espacios y saltos de línea", () => {
    assert.equal(truncate("uno\n\n  dos"), "uno dos");
  });
});

describe("cliente HTTP y servicio del catálogo", () => {
  const originalFetch = globalThis.fetch;
  let calls: string[];

  /** Reemplaza fetch por una respuesta simulada y registra qué URL se pidió. */
  function mockFetch(status: number, body: unknown) {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
  }

  beforeEach(() => {
    calls = [];
    process.env.API_BASE_URL = "http://api.test";
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.API_BASE_URL;
  });

  it("desenvuelve las listas { data: [...] } de la API", async () => {
    mockFetch(200, { data: [{ id: "1", name: "Peluches" }] });
    const categories = await getCategories();
    assert.equal(categories[0]?.name, "Peluches");
    assert.equal(calls[0], "http://api.test/api/categorias");
  });

  it("filtra productos por categoría usando el parámetro categoryId", async () => {
    mockFetch(200, { data: [] });
    await getProducts("7f1b4f0e-6c1e-4f43-a6b0-000000000001");
    assert.equal(calls[0], "http://api.test/api/productos?categoryId=7f1b4f0e-6c1e-4f43-a6b0-000000000001");
  });

  it("un 404 se convierte en null (producto o categoría inexistente)", async () => {
    mockFetch(404, { error: { code: "PRODUCT_NOT_FOUND", message: "no existe" } });
    assert.equal(await getProduct("nope"), null);
    assert.equal(await getCategory("nope"), null);
  });

  it("codifica el identificador para que no pueda alterar la ruta", async () => {
    mockFetch(404, {});
    await getProduct("../admin?x=1");
    assert.equal(calls[0], "http://api.test/api/productos/..%2Fadmin%3Fx%3D1");
  });

  it("otros errores HTTP lanzan ApiError con el código y mensaje de la API", async () => {
    mockFetch(500, { error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
    await assert.rejects(apiGet("/api/productos"), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 500);
      assert.equal(error.code, "INTERNAL_ERROR");
      return true;
    });
    // Un 500 NUNCA se disfraza de "no encontrado".
    await assert.rejects(apiGetOrNull("/api/productos/x"), ApiError);
  });

  it("si la API no responde, lanza ApiError con estado 0", async () => {
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    await assert.rejects(apiGet("/api/productos"), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 0);
      assert.equal(error.code, "NETWORK_ERROR");
      return true;
    });
  });
});
