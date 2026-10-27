"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminApiError, adminRequest } from "@/lib/admin-api-client";

import { FormField } from "./form-field";

/**
 * Formulario de inicio de sesión del panel.
 *
 * Envía correo y contraseña a POST /api/auth/login. Si son correctos, el SERVIDOR deja la
 * cookie de sesión (HttpOnly: este código nunca ve el token) y aquí solo se navega al panel.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }

    setPending(true);
    try {
      await adminRequest("POST", "/api/auth/login", { email, password });

      // IMPORTANTE: con Cache Components, Next.js NO destruye esta página al salir de ella: la
      // conserva oculta, con su estado, por si se vuelve. Si no se limpia aquí, después de
      // cerrar sesión el formulario reaparecería con la contraseña todavía escrita y el botón
      // bloqueado en "Ingresando…". Por eso se vacía todo ANTES de navegar.
      setEmail("");
      setPassword("");
      setPending(false);

      // `replace`: el login no debe quedar en el historial (el botón "atrás" no vuelve a él).
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      const apiError = caught instanceof AdminApiError ? caught : null;
      // Aquí un 401 significa credenciales incorrectas (no "sesión vencida"). A propósito el
      // mensaje es el mismo si falla el correo o la contraseña: no revela qué correos existen.
      setError(
        apiError?.status === 401
          ? "Correo o contraseña incorrectos."
          : (apiError?.message ?? "No se pudo iniciar sesión. Inténtalo de nuevo."),
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <FormField name="email" label="Correo electrónico" required>
        {(field) => (
          <Input
            {...field}
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </FormField>

      <FormField name="password" label="Contraseña" required>
        {(field) => (
          <Input
            {...field}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </FormField>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
