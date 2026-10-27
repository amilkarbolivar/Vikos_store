import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-brand-100 bg-brand-50 text-brand-700",
};

interface AlertProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

/**
 * Mensaje destacado (error, éxito o información).
 * Los errores usan `role="alert"` (el lector de pantalla los anuncia al instante); el resto,
 * `role="status"` (los anuncia con calma, sin interrumpir).
 */
export function Alert({ tone = "info", children, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-xl border px-4 py-3 text-sm font-medium", tones[tone], className)}
    >
      {children}
    </div>
  );
}
