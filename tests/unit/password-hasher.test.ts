/** Pruebas del hasher scrypt (con costo bajo para que corran rápido). */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ScryptPasswordHasher } from "../../src/modules/auth/infrastructure/scrypt-password-hasher.ts";

const hasher = new ScryptPasswordHasher({ N: 1024, r: 8, p: 1 });

describe("ScryptPasswordHasher", () => {
  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hasher.hash("clave-segura-123");
    assert.equal(await hasher.verify("clave-segura-123", hash), true);
    assert.equal(await hasher.verify("otra-clave", hash), false);
  });

  it("no guarda la contraseña en claro y usa una sal distinta cada vez", async () => {
    const a = await hasher.hash("misma");
    const b = await hasher.hash("misma");
    assert.ok(!a.includes("misma"));
    assert.notEqual(a, b);
    assert.ok(a.startsWith("scrypt$1024$8$1$"));
  });

  it("devuelve false (sin lanzar) ante hashes mal formados o alterados", async () => {
    for (const bad of ["", "texto", "scrypt$1$2", "bcrypt$1024$8$1$a$b", "scrypt$x$8$1$AAAA$AAAA", "scrypt$1024$8$1$AAAA$AAAA"]) {
      assert.equal(await hasher.verify("clave", bad), false, bad);
    }
    const hash = await hasher.hash("clave");
    assert.equal(await hasher.verify("clave", hash.slice(0, -4) + "AAAA"), false);
  });

  it("lee los parámetros del propio hash, así que puede verificar hashes de otro costo", async () => {
    const old = await new ScryptPasswordHasher({ N: 512, r: 8, p: 1 }).hash("clave");
    assert.equal(await hasher.verify("clave", old), true);
  });
});
