/** Pruebas de la lógica pura de filtros: rangos de precio y lectura de parámetros de la URL. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { siteConfig } from "../../src/config/site.ts";
import { filterByPrice, findPriceRange, firstParam, priceRangeKey, priceRangeLabel } from "../../src/lib/catalog-filters.ts";

const plain = (text: string) => text.replace(/\u00a0/g, " ");

describe("rangos de precio", () => {
  it("genera una clave estable para la URL", () => {
    assert.equal(priceRangeKey({ max: 50000 }), "0-50000");
    assert.equal(priceRangeKey({ min: 50000, max: 100000 }), "50000-100000");
    assert.equal(priceRangeKey({ min: 200000 }), "200000-");
  });

  it("genera etiquetas legibles para los tres tipos de rango", () => {
    assert.equal(plain(priceRangeLabel({ max: 50000 })), "Hasta $ 50.000");
    assert.equal(plain(priceRangeLabel({ min: 50000, max: 100000 })), "$ 50.000 – $ 100.000");
    assert.equal(plain(priceRangeLabel({ min: 200000 })), "Más de $ 200.000");
  });

  it("las claves de los rangos configurados son únicas", () => {
    const keys = siteConfig.priceRanges.map(priceRangeKey);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("solo acepta rangos configurados: texto libre o inventado se ignora", () => {
    const ranges = siteConfig.priceRanges;
    assert.deepEqual(findPriceRange("50000-100000", ranges), { min: 50000, max: 100000 });
    for (const bad of [undefined, "", "0-1", "abc", "50000-100001", "'; drop table", "-5-"]) {
      assert.equal(findPriceRange(bad, ranges), undefined, String(bad));
    }
  });
});

describe("filterByPrice", () => {
  const items = [10000, 50000, 50001, 100000, 150000, 200000, 250000].map((price) => ({ price }));
  const prices = (range?: Parameters<typeof filterByPrice>[1]) => filterByPrice(items, range).map((i) => i.price);

  it("sin rango devuelve todo", () => {
    assert.equal(prices(undefined).length, items.length);
  });

  it("'Hasta' incluye el tope; 'Más de' lo excluye: ningún precio cae en dos rangos", () => {
    assert.deepEqual(prices({ max: 50000 }), [10000, 50000]);
    assert.deepEqual(prices({ min: 50000, max: 100000 }), [50001, 100000]);
    assert.deepEqual(prices({ min: 200000 }), [250000]);
    // Cada precio pertenece a exactamente un rango configurado.
    for (const { price } of items) {
      const matches = siteConfig.priceRanges.filter((range) => filterByPrice([{ price }], range).length === 1);
      assert.equal(matches.length, 1, `precio ${price}`);
    }
  });
});

describe("firstParam", () => {
  it("toma el primer valor si el parámetro se repite", () => {
    assert.equal(firstParam("a"), "a");
    assert.equal(firstParam(["a", "b"]), "a");
    assert.equal(firstParam(undefined), undefined);
    assert.equal(firstParam([]), undefined);
  });
});
