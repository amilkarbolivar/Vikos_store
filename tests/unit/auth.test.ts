/**
 * Pruebas de Login y GetCurrentAdmin con repositorio y sesiones falsos.
 * Cubren: usuarios no autenticados no pasan, mensajes que no filtran información
 * y desactivar un administrador corta su acceso.
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { GetCurrentAdmin } from "../../src/modules/auth/application/get-current-admin.ts";
import { Login, PASSWORD_MAX_LENGTH } from "../../src/modules/auth/application/login.ts";
import type { AuthRepository } from "../../src/modules/auth/domain/auth-repository.ts";
import type { PasswordHasher } from "../../src/modules/auth/domain/password-hasher.ts";
import type { CreatedSession, SessionService } from "../../src/modules/auth/domain/session-service.ts";
import { normalizeEmail, type AdminUser } from "../../src/modules/auth/domain/user.ts";
import { ScryptPasswordHasher } from "../../src/modules/auth/infrastructure/scrypt-password-hasher.ts";
import { UnauthorizedError, ValidationError } from "../../src/modules/shared/domain/errors.ts";

class FakeAuthRepository implements AuthRepository {
  readonly users = new Map<string, AdminUser>();
  async findAdminByEmail(email: string) {
    return [...this.users.values()].find((u) => u.email === email) ?? null;
  }
  async findAdminById(id: string) {
    return this.users.get(id) ?? null;
  }
}

class FakeSessionService implements SessionService {
  readonly tokens = new Map<string, string>();
  async create(userId: string): Promise<CreatedSession> {
    const token = `token-${userId}`;
    this.tokens.set(token, userId);
    return { token, expiresAt: new Date(Date.now() + 3_600_000) };
  }
  async verify(token: string) {
    const userId = this.tokens.get(token);
    return userId ? { userId } : null;
  }
}

/** Cuenta cuántas veces se hashea, para comprobar que se gasta tiempo aunque el usuario no exista. */
class CountingHasher implements PasswordHasher {
  hashCalls = 0;
  private readonly inner = new ScryptPasswordHasher({ N: 1024, r: 8, p: 1 });
  async hash(p: string) {
    this.hashCalls++;
    return this.inner.hash(p);
  }
  verify(p: string, h: string) {
    return this.inner.verify(p, h);
  }
}

let repo: FakeAuthRepository;
let sessions: FakeSessionService;
let hasher: CountingHasher;
let login: Login;
let admin: AdminUser;

beforeEach(async () => {
  repo = new FakeAuthRepository();
  sessions = new FakeSessionService();
  hasher = new CountingHasher();
  admin = {
    id: "u1",
    email: "admin@vikos.co",
    passwordHash: await hasher.hash("clave-correcta-1"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  hasher.hashCalls = 0;
  repo.users.set(admin.id, admin);
  login = new Login({ auth: repo, hasher, sessions });
});

describe("normalizeEmail", () => {
  it("recorta y pasa a minúsculas; rechaza lo que no parece un correo", () => {
    assert.equal(normalizeEmail("  Admin@Vikos.CO "), "admin@vikos.co");
    for (const bad of ["", "sin-arroba", "a@b", "a b@c.co"]) {
      assert.throws(() => normalizeEmail(bad), ValidationError, bad);
    }
  });
});

describe("Login", () => {
  it("entra con credenciales correctas (ignorando mayúsculas y espacios del correo)", async () => {
    const result = await login.execute({ email: " ADMIN@vikos.co ", password: "clave-correcta-1" });
    assert.deepEqual(result.admin, { id: "u1", email: "admin@vikos.co" });
    assert.equal(result.session.token, "token-u1");
  });

  it("falla con el mismo error si la contraseña es incorrecta, el correo no existe o es inválido", async () => {
    const attempts = [
      { email: "admin@vikos.co", password: "mala" },
      { email: "nadie@vikos.co", password: "clave-correcta-1" },
      { email: "no-es-correo", password: "clave-correcta-1" },
    ];
    for (const attempt of attempts) {
      await assert.rejects(login.execute(attempt), (error: unknown) => {
        assert.ok(error instanceof UnauthorizedError);
        assert.equal(error.message, "Credenciales inválidas.");
        return true;
      });
    }
    assert.equal(sessions.tokens.size, 0);
  });

  it("calcula un hash aunque el usuario no exista (tiempo parejo)", async () => {
    await assert.rejects(login.execute({ email: "nadie@vikos.co", password: "algo" }), UnauthorizedError);
    assert.equal(hasher.hashCalls, 1);
  });

  it("rechaza contraseñas vacías o gigantes sin gastar CPU en el algoritmo", async () => {
    for (const password of ["", "a".repeat(PASSWORD_MAX_LENGTH + 1)]) {
      await assert.rejects(login.execute({ email: "admin@vikos.co", password }), UnauthorizedError);
    }
    assert.equal(hasher.hashCalls, 0);
  });

  it("no deja entrar a un administrador desactivado", async () => {
    repo.users.set("u1", { ...admin, isActive: false });
    await assert.rejects(
      login.execute({ email: "admin@vikos.co", password: "clave-correcta-1" }),
      UnauthorizedError,
    );
  });
});

describe("GetCurrentAdmin", () => {
  let current: GetCurrentAdmin;
  beforeEach(() => {
    current = new GetCurrentAdmin({ auth: repo, sessions });
  });

  it("rechaza peticiones sin token o con token inválido", async () => {
    await assert.rejects(current.execute(undefined), UnauthorizedError);
    await assert.rejects(current.execute(""), UnauthorizedError);
    await assert.rejects(current.execute("token-falso"), UnauthorizedError);
  });

  it("devuelve el administrador de una sesión válida", async () => {
    const { session } = await login.execute({ email: "admin@vikos.co", password: "clave-correcta-1" });
    assert.deepEqual(await current.execute(session.token), { id: "u1", email: "admin@vikos.co" });
  });

  it("corta el acceso si el administrador se desactiva o se elimina, aunque su sesión siga vigente", async () => {
    const { session } = await login.execute({ email: "admin@vikos.co", password: "clave-correcta-1" });
    repo.users.set("u1", { ...admin, isActive: false });
    await assert.rejects(current.execute(session.token), UnauthorizedError);
    repo.users.delete("u1");
    await assert.rejects(current.execute(session.token), UnauthorizedError);
  });
});
