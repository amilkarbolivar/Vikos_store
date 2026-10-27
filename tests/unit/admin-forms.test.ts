/**
 * Pruebas de la lógica pura de los formularios del panel (precio, payloads, cambios) y del
 * cliente HTTP del navegador (traducción de errores). Sin servidor: fetch se simula.
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { AdminApiError, adminRequest, toAdminApiError } from "../../src/lib/admin-api-client.ts";
import {
  buildCreateCategoryPayload,
  buildUpdateCategoryPayload,
  categoryToFormValues,
  validateCategoryForm,
} from "../../src/lib/admin-category-form.ts";
import {
  buildCreateProductPayload,
  buildUpdateProductPayload,
  emptyProductForm,
  isPreviewableImageUrl,
  productToFormValues,
  sanitizePriceInput,
  validateProductForm,
} from "../../src/lib/admin-product-form.ts";
import type { Category, Product } from "../../src/types/catalog.ts";

const product: Product = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Oso grande",
  slug: "oso-grande",
  description: "Oso de 80 cm",
  price: 89900,
  priceInCents: 8_990_000,
  categoryId: "00000000-0000-4000-8000-000000000001",
  imageUrl: "https://ejemplo.com/oso.jpg",
  isAvailable: true,
  createdAt: "2026-10-18T00:00:00.000Z",
  updatedAt: "2026-10-18T00:00:00.000Z",
};

const category: Category = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Peluches",
  slug: "peluches",
  description: "Peluches suaves",
  isActive: true,
  createdAt: "2026-10-18T00:00:00.000Z",
  updatedAt: "2026-10-18T00:00:00.000Z",
};

describe("sanitizePriceInput", () => {
  it("deja solo dígitos: el punto de miles NUNCA se interpreta como decimal", () => {
    assert.equal(sanitizePriceInput("89.900"), "89900");
    assert.equal(sanitizePriceInput("$ 89,900"), "89900");
    assert.equal(sanitizePriceInput("abc"), "");
    assert.equal(sanitizePriceInput("1e5"), "15");
  });

  it("quita ceros a la izquierda pero conserva un 0 solo y limita la longitud", () => {
    assert.equal(sanitizePriceInput("007"), "7");
    assert.equal(sanitizePriceInput("0"), "0");
    assert.equal(sanitizePriceInput("1".repeat(30)).length, 10);
  });
});

describe("isPreviewableImageUrl", () => {
  it("acepta solo URLs completas http(s) y rechaza los estados a medias al escribir", () => {
    for (const ok of ["https://example.com/a.jpg", "http://x.co/img.png", " https://e "]) assert.equal(isPreviewableImageUrl(ok), true, ok);
    for (const bad of ["", "h", "https:", "https:/", "https://", "no es una url", "javascript:alert(1)", "data:image/png;base64,AAAA", "ftp://x.com/a.png"]) {
      assert.equal(isPreviewableImageUrl(bad), false, bad);
    }
  });
});

describe("formulario de productos", () => {
  it("al crear: valida los obligatorios", () => {
    assert.deepEqual(Object.keys(validateProductForm(emptyProductForm)).sort(), ["categoryId", "name", "price"]);
    assert.deepEqual(validateProductForm({ ...emptyProductForm, name: "A", price: "100", categoryId: "x" }), {});
    assert.ok(validateProductForm({ ...emptyProductForm, name: "A", price: "0", categoryId: "x" }).price);
    assert.ok(validateProductForm({ ...emptyProductForm, name: "   ", price: "1", categoryId: "x" }).name);
  });

  it("al crear: arma el cuerpo con el precio como NÚMERO y omite los opcionales vacíos", () => {
    const payload = buildCreateProductPayload({ ...emptyProductForm, name: "  Rosas  ", price: "45000", categoryId: "c1" });
    assert.deepEqual(payload, { name: "Rosas", description: "", price: 45000, categoryId: "c1", isAvailable: true });
    assert.equal(typeof payload.price, "number");

    const full = buildCreateProductPayload({
      ...emptyProductForm, name: "Rosas", price: "1", categoryId: "c1", slug: " rosas-rojas ", imageUrl: " https://x.co/a.jpg ", isAvailable: false,
    });
    assert.equal(full.slug, "rosas-rojas");
    assert.equal(full.imageUrl, "https://x.co/a.jpg");
    assert.equal(full.isAvailable, false);
  });

  it("al editar: si no se toca nada, el cuerpo queda vacío", () => {
    assert.deepEqual(buildUpdateProductPayload(productToFormValues(product), product), {});
  });

  it("al editar: envía SOLO lo que cambió", () => {
    const values = { ...productToFormValues(product), price: "99900", isAvailable: false };
    assert.deepEqual(buildUpdateProductPayload(values, product), { price: 99900, isAvailable: false });
  });

  it("al editar: un precio con decimales que no se toca NO se envía (no se pisa con el redondeo)", () => {
    const withCents = { ...product, price: 99900.5, priceInCents: 9_990_050 };
    const values = productToFormValues(withCents);
    assert.equal(values.price, "99901");
    assert.deepEqual(buildUpdateProductPayload(values, withCents), {});
    assert.deepEqual(buildUpdateProductPayload({ ...values, price: "120000" }, withCents), { price: 120000 });
  });

  it("al editar: vaciar la imagen envía null; vaciar el slug pide regenerarlo", () => {
    const values = { ...productToFormValues(product), imageUrl: "", slug: "" };
    assert.deepEqual(buildUpdateProductPayload(values, product), { imageUrl: null, slug: "" });
  });

  it("al editar un producto sin categoría o sin imagen no inventa cambios", () => {
    const bare = { ...product, categoryId: null, imageUrl: null };
    assert.deepEqual(buildUpdateProductPayload(productToFormValues(bare), bare), {});
  });
});

describe("formulario de categorías", () => {
  it("valida el nombre y arma el cuerpo (descripción vacía → null)", () => {
    assert.ok(validateCategoryForm({ name: " ", slug: "", description: "" }).name);
    assert.deepEqual(validateCategoryForm({ name: "A", slug: "", description: "" }), {});
    assert.deepEqual(buildCreateCategoryPayload({ name: " Flores ", slug: "", description: "" }), { name: "Flores", description: null });
    assert.deepEqual(buildCreateCategoryPayload({ name: "Flores", slug: "f", description: "Ramos" }), { name: "Flores", description: "Ramos", slug: "f" });
  });

  it("al editar envía solo los cambios", () => {
    const values = categoryToFormValues(category);
    assert.deepEqual(buildUpdateCategoryPayload(values, category), {});
    assert.deepEqual(buildUpdateCategoryPayload({ ...values, description: "" }, category), { description: null });
    assert.deepEqual(buildUpdateCategoryPayload({ ...values, name: "Muñecos" }, category), { name: "Muñecos" });
  });
});

describe("traducción de errores de la API", () => {
  it("validación: mensaje general + error por campo", () => {
    const error = toAdminApiError(400, {
      error: { code: "VALIDATION_ERROR", message: "Los datos enviados no son válidos", details: [
        { field: "price", message: "El precio debe ser mayor que cero" },
        { field: "price", message: "otro" },
        { field: "body", message: "ignorado" },
      ] },
    });
    assert.equal(error.message, "Revisa los campos marcados.");
    assert.deepEqual(error.fieldErrors, { price: "El precio debe ser mayor que cero" });
  });

  it("conflicto 409: usa el mensaje de la API; 5xx y 401: textos propios, sin filtrar el servidor", () => {
    assert.equal(toAdminApiError(409, { error: { message: "Ya existe ese slug" } }).message, "Ya existe ese slug");
    assert.equal(toAdminApiError(500, { error: { message: "password=secreto" } }).message.includes("secreto"), false);
    const expired = toAdminApiError(401, { error: { message: "x" } });
    assert.equal(expired.isSessionExpired, true);
    assert.match(expired.message, /sesión expiró/);
  });

  it("slug repetido: el error queda en el campo slug", () => {
    const error = toAdminApiError(409, { error: { code: "DUPLICATE_SLUG", message: "Ya existe", details: [{ field: "slug", message: "Ya existe" }] } });
    assert.equal(error.fieldErrors.slug, "Ya existe");
  });
});

describe("adminRequest", () => {
  const original = globalThis.fetch;
  afterEach(() => { globalThis.fetch = original; });
  const mock = (status: number, body?: unknown) => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(body === undefined ? null : JSON.stringify(body), { status });
    }) as typeof fetch;
    return calls;
  };

  it("envía JSON con la cookie del mismo origen y devuelve la respuesta", async () => {
    const calls = mock(201, { id: "1" });
    const result = await adminRequest<{ id: string }>("POST", "/api/productos", { name: "x" });
    assert.deepEqual(result, { id: "1" });
    assert.equal(calls[0]?.init.credentials, "same-origin");
    assert.equal(calls[0]?.init.body, JSON.stringify({ name: "x" }));
    assert.deepEqual(calls[0]?.init.headers, { "Content-Type": "application/json" });
  });

  it("204 devuelve undefined (DELETE) y no manda cuerpo", async () => {
    const calls = mock(204);
    assert.equal(await adminRequest("DELETE", "/api/productos/1"), undefined);
    assert.equal(calls[0]?.init.body, undefined);
  });

  it("errores HTTP y de red lanzan AdminApiError", async () => {
    mock(409, { error: { message: "Choque" } });
    await assert.rejects(adminRequest("PATCH", "/api/x", {}), (e: unknown) => e instanceof AdminApiError && e.status === 409 && e.message === "Choque");
    globalThis.fetch = (async () => { throw new TypeError("fetch failed"); }) as typeof fetch;
    await assert.rejects(adminRequest("POST", "/api/x", {}), (e: unknown) => e instanceof AdminApiError && e.status === 0);
  });
});
