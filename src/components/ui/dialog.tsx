"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  /** Se llama al cerrar: con Escape, al pulsar fuera de la ventana o con un botón. */
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Ventana modal accesible, construida sobre el elemento nativo <dialog>.
 *
 * Por qué <dialog> y no una ventana hecha a mano: el navegador ya se encarga de lo difícil
 * (atrapar el foco dentro de la ventana, cerrar con Escape, bloquear lo de atrás, anunciarla a
 * los lectores de pantalla), así que no hay que reimplementarlo ni se puede hacer mal.
 *
 * El contenido solo se monta mientras está abierta: cada vez que se abre, los formularios
 * empiezan limpios.
 */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Sincroniza el estado `open` de React con el del elemento <dialog>.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Pulsar sobre el fondo oscuro (que cuenta como un clic sobre el propio <dialog>) cierra.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card border-0 bg-white p-0 text-ink shadow-card-hover backdrop:bg-ink/50"
    >
      {open && (
        <div className="p-6">
          <h2 id={titleId} className="text-xl font-bold tracking-tight">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-muted">
              {description}
            </p>
          )}
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
