/** Quién es el administrador con sesión iniciada (respuesta de GET /api/auth/me). */
export interface AdminSession {
  id: string;
  email: string | null;
  role: "ADMIN";
}
