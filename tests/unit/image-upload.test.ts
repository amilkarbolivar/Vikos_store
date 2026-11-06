import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkImageFile, detectImageType } from "../../src/lib/image-upload.ts";
import { uploadImageHandler } from "../../src/modules/products/presentation/upload-image-handler.ts";
import { UnauthorizedError } from "../../src/modules/shared/domain/errors.ts";

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0];
const WEBP = [...Buffer.from("RIFF"), 1, 2, 3, 4, ...Buffer.from("WEBP")];

describe("detectImageType", () => {
  it("reconoce jpeg, png y webp", () => {
    assert.equal(detectImageType(new Uint8Array(JPEG))?.ext, "jpg");
    assert.equal(detectImageType(new Uint8Array(PNG))?.ext, "png");
    assert.equal(detectImageType(new Uint8Array(WEBP))?.ext, "webp");
  });
  it("rechaza SVG, HTML y vacío", () => {
    assert.equal(detectImageType(new TextEncoder().encode("<svg xmlns=...>")), null);
    assert.equal(detectImageType(new TextEncoder().encode("<html>")), null);
    assert.equal(detectImageType(new Uint8Array()), null);
  });
});

describe("checkImageFile", () => {
  it("valida tamaño y tipo", () => {
    assert.equal(checkImageFile({ size: 100, type: "image/png" }), null);
    assert.ok(checkImageFile({ size: 0, type: "image/png" }));
    assert.ok(checkImageFile({ size: 6 * 1024 * 1024, type: "image/png" }));
    assert.ok(checkImageFile({ size: 10, type: "image/svg+xml" }));
  });
});

describe("uploadImageHandler", () => {
  const puts: string[] = [];
  const storage = { put: async (key: string) => (puts.push(key), `https://b.s3.x.amazonaws.com/${key}`) };
  const make = (over = {}) => uploadImageHandler({ requireAdmin: async () => ({}), getStorage: () => storage, ...over });
  const upload = (bytes: number[], name = "a.png") => {
    const form = new FormData();
    form.append("file", new File([new Uint8Array(bytes)], name));
    return new Request("http://x/api/uploads", { method: "POST", body: form });
  };

  it("sube y devuelve la URL", async () => {
    const res = await make()(upload(PNG));
    assert.equal(res.status, 201);
    const { url } = (await res.json()) as { url: string };
    assert.match(url, /\/productos\/[0-9a-f-]{36}\.png$/);
  });
  it("401 sin sesión", async () => {
    const res = await make({ requireAdmin: async () => { throw new UnauthorizedError(); } })(upload(PNG));
    assert.equal(res.status, 401);
  });
  it("503 si S3 no está configurado", async () => {
    assert.equal((await make({ getStorage: () => null })(upload(PNG))).status, 503);
  });
  it("400 si el contenido no es imagen aunque se llame .png", async () => {
    assert.equal((await make()(upload([...Buffer.from("<svg>")], "x.png"))).status, 400);
  });
  it("400 si no es multipart", async () => {
    const res = await make()(new Request("http://x/api/uploads", { method: "POST", body: "{}" }));
    assert.equal(res.status, 400);
  });
  it("413 si supera 5 MB", async () => {
    const big = new Array(5 * 1024 * 1024 + 1).fill(0);
    big[0] = 0xff; big[1] = 0xd8; big[2] = 0xff;
    assert.equal((await make()(upload(big))).status, 413);
  });
  it("500 genérico si S3 falla, sin filtrar detalles", async () => {
    const res = await make({ getStorage: () => ({ put: async () => { throw new Error("secreto"); } }) })(upload(PNG));
    assert.equal(res.status, 500);
    assert.ok(!JSON.stringify(await res.json()).includes("secreto"));
  });
});
