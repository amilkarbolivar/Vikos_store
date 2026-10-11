/**
 * Pruebas de las utilidades de slug (funciones puras del dominio compartido).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ValidationError } from "../../src/modules/shared/domain/errors.ts";
import { isValidSlug, resolveSlug, slugify } from "../../src/modules/shared/domain/slug.ts";

describe("slugify", () => {
  it("quita tildes y la ñ, y pasa a minúsculas", () => {
    assert.equal(slugify("Cumpleaños y Más"), "cumpleanos-y-mas");
  });

  it("colapsa símbolos y espacios en un solo guion y recorta los bordes", () => {
    assert.equal(slugify("  ¡Caja   de  chocolates!!  "), "caja-de-chocolates");
  });

  it("devuelve cadena vacía si no queda ningún carácter aprovechable", () => {
    assert.equal(slugify("¡¡¡???"), "");
  });

  it("no supera la longitud máxima ni termina en guion", () => {
    const slug = slugify("a".repeat(79) + " b");
    assert.ok(slug.length <= 80);
    assert.ok(!slug.endsWith("-"));
  });
});

describe("isValidSlug / resolveSlug", () => {
  it("acepta slugs bien formados y rechaza los mal formados", () => {
    assert.equal(isValidSlug("peluches-grandes"), true);
    for (const bad of ["", "Peluches", "con espacios", "-inicio", "fin-", "doble--guion", "../etc"]) {
      assert.equal(isValidSlug(bad), false, bad);
    }
  });

  it("usa el slug explícito si es válido, sin transformarlo", () => {
    assert.equal(resolveSlug("mi-slug", "Otro nombre"), "mi-slug");
  });

  it("deriva el slug del nombre cuando no hay uno explícito", () => {
    assert.equal(resolveSlug(undefined, "Taza Mágica"), "taza-magica");
    assert.equal(resolveSlug("   ", "Taza Mágica"), "taza-magica");
  });

  it("lanza ValidationError si el slug explícito es inválido o no se puede derivar", () => {
    assert.throws(() => resolveSlug("Mal Slug", "x"), ValidationError);
    assert.throws(() => resolveSlug(undefined, "???"), ValidationError);
  });
});
