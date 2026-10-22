/**
 * Sesión firmada (HmacSessionService), cookie y `requireAdmin` con el flujo completo:
 * login -> cookie -> petición autenticada.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GetCurrentAdmin } from "../../src/modules/auth/application/get-current-admin.ts";
import { Login } from "../../src/modules/auth/application/login.ts";
import type { AuthRepository } from "../../src/modules/auth/domain/auth-repository.ts";
import type { AdminUser } from "../../src/modules/auth/domain/user.ts";
import { HmacSessionService } from "../../src/modules/auth/infrastructure/hmac-session-service.ts";
import { ScryptPasswordHasher } from "../../src/modules/auth/infrastructure/scrypt-password-hasher.ts";
import { loginHandler } from "../../src/modules/auth/presentation/login-handler.ts";
import { logoutHandler } from "../../src/modules/auth/presentation/logout-handler.ts";
import { meHandler } from "../../src/modules/auth/presentation/me-handler.ts";
import { createRequireAdmin } from "../../src/modules/auth/presentation/require-admin.ts";
import {
  buildClearedSessionCookie,
  buildSessionCookie,
  readSessionToken,
  SESSION_COOKIE_NAME,
} from "../../src/modules/auth/presentation/session-cookie.ts";

const SECRET = "x".repeat(40);
const silent = { error() {} };

describe("HmacSessionService", () => {
  it("firma y verifica: ida y vuelta devuelve el mismo usuario", async () => {
    const sessions = new HmacSessionService({ secret: SECRET });
    const { token, expiresAt } = await sessions.create("user-1");
    assert.deepEqual(await sessions.verify(token), { userId: "user-1" });
    assert.ok(expiresAt.getTime() > Date.now());
  });

  it("rechaza un token alterado (payload o firma) o firmado con otro secreto", async () => {
    const sessions = new HmacSessionService({ secret: SECRET });
    const { token } = await sessions.create("user-1");
    const [payload, signature] = token.split(".") as [string, string];

    const forged = Buffer.from(JSON.stringify({ sub: "admin-2", exp: 9_999_999_999 })).toString("base64url");
    assert.equal(await sessions.verify(`${forged}.${signature}`), null);
    assert.equal(await sessions.verify(`${payload}.${signature.slice(0, -2)}AA`), null);
    assert.equal(await new HmacSessionService({ secret: "y".repeat(40) }).verify(token), null);
  });

  it("rechaza un token expirado", async () => {
    let now = 1_000_000;
    const sessions = new HmacSessionService({ secret: SECRET, ttlMs: 60_000, now: () => now });
    const { token } = await sessions.create("user-1");
    now += 30_000;
    assert.notEqual(await sessions.verify(token), null);
    now += 31_000;
    assert.equal(await sessions.verify(token), null);
  });

  it("rechaza tokens mal formados sin lanzar errores", async () => {
    const sessions = new HmacSessionService({ secret: SECRET });
    for (const bad of ["", "a", "a.b.c", "a.b", "....", "%%%.%%%"]) {
      assert.equal(await sessions.verify(bad), null, JSON.stringify(bad));
    }
  });
});

describe("cookie de sesión", () => {
  it("se lee del encabezado Cookie entre otras cookies", () => {
    const request = new Request("http://x/", {
      headers: { cookie: `a=1; ${SESSION_COOKIE_NAME}=tok.en; b=2` },
    });
    assert.equal(readSessionToken(request), "tok.en");
    assert.equal(readSessionToken(new Request("http://x/")), undefined);
    assert.equal(readSessionToken(new Request("http://x/", { headers: { cookie: `${SESSION_COOKIE_NAME}=` } })), undefined);
    assert.equal(readSessionToken(new Request("http://x/", { headers: { cookie: `x${SESSION_COOKIE_NAME}=zzz` } })), undefined);
  });

  it("se emite HttpOnly + SameSite=Strict, y Secure solo cuando se pide", () => {
    const expires = new Date("2030-01-01T00:00:00Z");
    const dev = buildSessionCookie("t", expires, false);
    const prod = buildSessionCookie("t", expires, true);
    for (const cookie of [dev, prod]) {
      assert.match(cookie, /HttpOnly/);
      assert.match(cookie, /SameSite=Strict/);
      assert.match(cookie, /Path=\//);
    }
    assert.doesNotMatch(dev, /Secure/);
    assert.match(prod, /Secure/);
    assert.match(buildClearedSessionCookie(false), /Max-Age=0/);
  });
});

describe("flujo login -> requireAdmin", () => {
  async function setup() {
    const hasher = new ScryptPasswordHasher({ N: 1024, r: 8, p: 1 });
    const now = new Date();
    const admin: AdminUser = {
      id: "7f1b4f0e-6c1e-4f43-a6b0-000000000001",
      email: "admin@tienda.com",
      passwordHash: await hasher.hash("clave-correcta"),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const auth: AuthRepository = {
      findAdminByEmail: async (email) => (email === admin.email ? admin : null),
      findAdminById: async (id) => (id === admin.id ? admin : null),
    };
    const sessions = new HmacSessionService({ secret: SECRET });
    const login = new Login({ auth, hasher, sessions });
    const requireAdmin = createRequireAdmin({
      getCurrentAdmin: new GetCurrentAdmin({ auth, sessions }),
    });
    const doLogin = (body: unknown) =>
      loginHandler({ login, secureCookies: false, logger: silent })(
        new Request("http://x/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
      );
    return { admin, requireAdmin, doLogin };
  }

  it("el login fija la cookie de sesión y NO devuelve el token en el cuerpo", async () => {
    const { doLogin } = await setup();
    const response = await doLogin({ email: " Admin@Tienda.com ", password: "clave-correcta" });
    assert.equal(response.status, 200);
    const text = await response.text();
    assert.deepEqual(JSON.parse(text), { id: "7f1b4f0e-6c1e-4f43-a6b0-000000000001", email: "admin@tienda.com" });
    const cookie = response.headers.get("set-cookie") ?? "";
    assert.match(cookie, new RegExp(`^${SESSION_COOKIE_NAME}=[\\w-]+\\.[\\w-]+;`));
    assert.match(cookie, /HttpOnly/);
    const token = cookie.split(";")[0]?.split("=")[1] ?? "";
    assert.ok(!text.includes(token));
    assert.equal(response.headers.get("cache-control"), "no-store");
  });

  it("credenciales incorrectas: 401 con el mismo mensaje para correo y contraseña erróneos", async () => {
    const { doLogin } = await setup();
    const wrongPassword = await doLogin({ email: "admin@tienda.com", password: "mala" });
    const unknownUser = await doLogin({ email: "nadie@tienda.com", password: "clave-correcta" });
    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownUser.status, 401);
    assert.deepEqual(await wrongPassword.json(), await unknownUser.json());
    assert.equal(wrongPassword.headers.get("set-cookie"), null);
  });

  it("valida la estructura del cuerpo de login", async () => {
    const { doLogin } = await setup();
    assert.equal((await doLogin({ email: "a@b.co" })).status, 400);
    assert.equal((await doLogin({ email: "a@b.co", password: "x", role: "ADMIN" })).status, 400);
    assert.equal((await doLogin([])).status, 400);
  });

  it("la cookie del login abre /api/auth/me; sin cookie o alterada responde 401", async () => {
    const { doLogin, requireAdmin, admin } = await setup();
    const cookie = (await doLogin({ email: admin.email, password: "clave-correcta" })).headers
      .get("set-cookie")!
      .split(";")[0]!;
    const me = meHandler({ requireAdmin, logger: silent });

    const ok = await me(new Request("http://x/api/auth/me", { headers: { cookie } }));
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { id: admin.id, email: admin.email, role: "ADMIN" });

    assert.equal((await me(new Request("http://x/api/auth/me"))).status, 401);
    const tampered = cookie.slice(0, -3) + "AAA";
    assert.equal((await me(new Request("http://x/api/auth/me", { headers: { cookie: tampered } }))).status, 401);
  });

  it("un administrador desactivado pierde el acceso aunque su sesión no haya expirado", async () => {
    const { doLogin, requireAdmin, admin } = await setup();
    const cookie = (await doLogin({ email: admin.email, password: "clave-correcta" })).headers
      .get("set-cookie")!
      .split(";")[0]!;
    admin.isActive = false;
    await assert.rejects(requireAdmin(new Request("http://x/", { headers: { cookie } })));
  });

  it("sin cookie no consulta nada (los endpoints públicos funcionan sin SESSION_SECRET ni base de datos)", async () => {
    let calls = 0;
    const requireAdmin = createRequireAdmin({
      getCurrentAdmin: { execute: async () => { calls++; throw new Error("no debería llamarse"); } },
    });
    await assert.rejects(requireAdmin(new Request("http://x/")));
    assert.equal(calls, 0);
  });

  it("logout borra la cookie (204) sin exigir sesión", async () => {
    const response = await logoutHandler({ secureCookies: false })();
    assert.equal(response.status, 204);
    assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
  });
});
