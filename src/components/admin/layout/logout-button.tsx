"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { adminRequest } from "@/lib/admin-api-client";

import { LogOutIcon } from "../admin-icons";

/**
 * Botón "Salir". Pide a POST /api/auth/logout que borre la cookie de sesión y lleva al login.
 * Si la petición falla (por ejemplo, sin internet) igual se navega al login: ahí, si la sesión
 * seguía vigente, se verá de inmediato que no se cerró.
 */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await adminRequest("POST", "/api/auth/logout");
    } catch {
      // Se ignora a propósito (ver el comentario de arriba).
    }
    router.replace("/admin/login");
    router.refresh();
    // Con Cache Components, este marco del panel se conserva oculto al salir. Si el botón se
    // quedara en "Saliendo…", reaparecería bloqueado al volver a iniciar sesión.
    setPending(false);
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending} aria-label="Cerrar sesión">
      <LogOutIcon />
      <span className="hidden sm:inline">{pending ? "Saliendo…" : "Salir"}</span>
    </Button>
  );
}
