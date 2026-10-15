/** Pruebas de la validación de variables de entorno. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseEnv,
  requireDatabaseUrl,
  requireSessionSecret,
} from "../../src/infrastructure/config/env.ts";

const SECRET = "x".repeat(32);

describe("parseEnv", () => {
  it("usa development por defecto y acepta que no haya base de datos ni secreto", () => {
    const env = parseEnv({});
    assert.equal(env.nodeEnv, "development");
    assert.equal(env.databaseUrl, undefined);
    assert.equal(env.sessionSecret, undefined);
  });

  it("rechaza un SESSION_SECRET demasiado corto", () => {
    assert.throws(() => parseEnv({ SESSION_SECRET: "corto" }), /SESSION_SECRET/);
  });

  it("exige SESSION_SECRET en producción", () => {
    assert.throws(() => parseEnv({ NODE_ENV: "production" }), /producción/);
    assert.equal(parseEnv({ NODE_ENV: "production", SESSION_SECRET: SECRET }).nodeEnv, "production");
  });

  it("trata valores vacíos como no definidos", () => {
    assert.equal(parseEnv({ DATABASE_URL: "   " }).databaseUrl, undefined);
  });
});

describe("require*", () => {
  it("fallan con un mensaje claro si falta el valor y lo devuelven si existe", () => {
    assert.throws(() => requireSessionSecret(parseEnv({})), /SESSION_SECRET/);
    assert.throws(() => requireDatabaseUrl(parseEnv({})), /DATABASE_URL/);
    const env = parseEnv({ SESSION_SECRET: SECRET, DATABASE_URL: "postgresql://x" });
    assert.equal(requireSessionSecret(env), SECRET);
    assert.equal(requireDatabaseUrl(env), "postgresql://x");
  });
});
