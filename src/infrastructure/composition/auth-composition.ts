import { GetCurrentAdmin } from "../../modules/auth/application/get-current-admin.ts";
import { Login } from "../../modules/auth/application/login.ts";
import { createAdminUserDelegate } from "../../modules/auth/infrastructure/admin-user-delegate.ts";
import { PrismaAuthRepository } from "../../modules/auth/infrastructure/auth-repository-impl.ts";
import { HmacSessionService } from "../../modules/auth/infrastructure/hmac-session-service.ts";
import { ScryptPasswordHasher } from "../../modules/auth/infrastructure/scrypt-password-hasher.ts";
import { requireSessionSecret } from "../config/env.ts";
import { getPrisma } from "../database/prisma.ts";

interface AuthUseCases {
  login: Login;
  getCurrentAdmin: GetCurrentAdmin;
}

let useCases: AuthUseCases | undefined;

/**
 * Casos de uso de autenticación con la implementación real (Prisma + scrypt + sesión HMAC).
 * Se arma de forma perezosa: `SESSION_SECRET` y la base de datos solo se exigen al primer uso,
 * así `next build` no falla si no están definidas.
 */
function getAuth(): AuthUseCases {
  if (!useCases) {
    const auth = new PrismaAuthRepository(createAdminUserDelegate(getPrisma()));
    const sessions = new HmacSessionService({ secret: requireSessionSecret() });
    useCases = {
      login: new Login({ auth, hasher: new ScryptPasswordHasher(), sessions }),
      getCurrentAdmin: new GetCurrentAdmin({ auth, sessions }),
    };
  }
  return useCases;
}

export function getLogin(): Login {
  return getAuth().login;
}

export function getGetCurrentAdmin(): GetCurrentAdmin {
  return getAuth().getCurrentAdmin;
}
