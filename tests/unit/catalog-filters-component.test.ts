/** Renderiza la barra de filtros a HTML y comprueba selección, opciones y el botón "Limpiar". */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CatalogFilters } from "../../src/components/catalog/catalog-filters.tsx";
import type { Category } from "../../src/types/catalog.ts";

const category = (n: number, name: string, slug: string): Category => ({
  id: `00000000-0000-4000-8000-00000000000${n}`,
  name,
  slug,
  description: null,
  isActive: true,
  createdAt: "2026-10-18T00:00:00.000Z",
  updatedAt: "2026-10-18T00:00:00.000Z",
});
const categories = [category(1, "Peluches", "peluches"), category(2, "Flores", "flores")];
const render = (props: { selectedCategorySlug?: string; selectedPriceKey?: string } = {}) =>
  renderToStaticMarkup(createElement(CatalogFilters, { categories, ...props }));

describe("CatalogFilters", () => {
  it("es un formulario GET hacia /productos con los parámetros categoria y precio", () => {
    const html = render();
    assert.match(html, /<form[^>]*action="\/productos"[^>]*method="get"/);
    assert.match(html, /name="categoria"/);
    assert.match(html, /name="precio"/);
  });

  it("lista todas las categorías y los 4 rangos de precio configurados", () => {
    const html = render();
    assert.match(html, /<option value="peluches">Peluches<\/option>/);
    assert.match(html, /<option value="flores">Flores<\/option>/);
    assert.equal((html.match(/<option value="\d+-\d*"/g) ?? []).length, 4);
    assert.match(html, /Todas las categorías/);
    assert.match(html, /Todos los precios/);
  });

  it("deja marcada la opción elegida", () => {
    const html = render({ selectedCategorySlug: "flores", selectedPriceKey: "50000-100000" });
    assert.match(html, /<option value="flores" selected="">Flores<\/option>/);
    assert.match(html, /<option value="50000-100000" selected="">/);
  });

  it("'Limpiar' aparece solo si hay algún filtro aplicado", () => {
    assert.doesNotMatch(render(), /Limpiar/);
    assert.match(render({ selectedPriceKey: "0-50000" }), /Limpiar/);
    assert.match(render({ selectedCategorySlug: "peluches" }), /Limpiar/);
  });

  it("cada selector tiene su etiqueta asociada (accesibilidad)", () => {
    const html = render();
    assert.match(html, /<label for="filtro-categoria"/);
    assert.match(html, /<label for="filtro-precio"/);
    assert.match(html, /<select id="filtro-categoria"/);
  });
});
