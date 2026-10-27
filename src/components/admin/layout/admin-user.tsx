import { redirect } from "next/navigation";

import { getAdminSession } from "@/services/admin-service";

/**
 * Muestra el correo del administrador con sesión iniciada.
 *
 * Además actúa como GUARDIA de navegación: si no hay sesión válida, redirige al login. (La
 * seguridad real está en la API, que revisa la cookie en cada petición; esto solo evita que
 * alguien sin sesión vea el marco del panel vacío.)
 * Es async y lee la cookie, así que debe usarse dentro de <Suspense>.
 */
export async function AdminUser() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <p className="truncate text-xs text-muted" title={session.email ?? undefined}>
      Sesión: <span className="font-semibold text-ink">{session.email ?? "administrador"}</span>
    </p>
  );
}
