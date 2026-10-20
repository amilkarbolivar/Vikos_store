import { createRequireAdmin } from "../../modules/auth/presentation/require-admin.ts";
import { getGetCurrentAdmin } from "./auth-composition.ts";

/**
 * `requireAdmin` real, conectado a la base de datos y a la sesión firmada.
 * Todas las rutas que modifican datos (y las que muestran datos ocultos) lo reciben de aquí.
 */
export const requireAdmin = createRequireAdmin({
  getCurrentAdmin: { execute: (token) => getGetCurrentAdmin().execute(token) },
});
