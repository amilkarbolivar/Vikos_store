"use client";

import type { ReactNode } from "react";

import { Alert } from "./alert";
import { Button } from "./button";
import { DangerButton } from "./danger-button";
import { Dialog } from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  /** Se ejecuta al pulsar el botón de confirmar. */
  onConfirm: () => void;
  title: string;
  description?: string;
  /** Texto del botón de confirmar (por ejemplo "Eliminar"). */
  confirmLabel: string;
  /** `true` mientras la acción está en curso: se bloquean los botones. */
  pending?: boolean;
  /** Mensaje de error si la acción falló. */
  error?: string | null;
  children?: ReactNode;
}

/**
 * Pregunta "¿Seguro?" antes de una acción destructiva. El botón de confirmar es rojo y el de
 * cancelar es el que queda enfocado primero (el borrado accidental con Enter es más difícil).
 */
export function ConfirmDialog({
  open, onClose, onConfirm, title, description, confirmLabel, pending, error, children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      {children}
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={pending} autoFocus>
          Cancelar
        </Button>
        <DangerButton onClick={onConfirm} disabled={pending}>
          {pending ? "Eliminando…" : confirmLabel}
        </DangerButton>
      </div>
    </Dialog>
  );
}
