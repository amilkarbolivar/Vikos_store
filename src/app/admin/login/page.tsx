import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/forms/login-form";
import { GiftIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { getAdminSession } from "@/services/admin-service";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * Si quien abre el login YA tiene una sesión válida, no tiene sentido mostrarle el formulario:
 * se le lleva directo al panel. Lee la cookie, así que va dentro de <Suspense>.
 */
async function RedirectIfSignedIn() {
  if (await getAdminSession()) redirect("/admin");
  return null;
}

/** LOGIN ( /admin/login ): formulario centrado, sin la barra lateral del panel. */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-50 via-cream to-white p-4">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl text-white">
            <GiftIcon />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{siteConfig.name}</h1>
          <p className="text-sm text-muted">Panel de administración</p>
        </div>

        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <LoginForm />
        </div>

        <p className="mt-5 text-center text-sm">
          <Link href="/" className="font-semibold text-brand-700 hover:underline">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
