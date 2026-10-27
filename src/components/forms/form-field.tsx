import type { ReactNode } from "react";

/** Atributos que el campo debe llevar para quedar enlazado con su etiqueta, ayuda y error. */
export interface FieldControlProps {
  id: string;
  name: string;
  invalid: boolean;
  "aria-describedby": string | undefined;
}

interface FormFieldProps {
  /** Nombre del campo: también es el nombre del parámetro que viaja a la API. */
  name: string;
  label: string;
  /** Mensaje de error del campo (si lo hay). */
  error?: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
  required?: boolean;
  /** Recibe los atributos de accesibilidad para esparcirlos en el control: `<Input {...field} />`. */
  children: (field: FieldControlProps) => ReactNode;
}

/**
 * Un campo de formulario completo: etiqueta + control + ayuda + error.
 *
 * Se asegura de la ACCESIBILIDAD, que es fácil olvidar: la etiqueta queda asociada al control
 * (al tocarla se enfoca), y la ayuda y el error se enlazan con `aria-describedby` para que los
 * lectores de pantalla los lean junto al campo.
 */
export function FormField({ name, label, error, hint, required, children }: FormFieldProps) {
  const id = `campo-${name}`;
  const hintId = `${id}-ayuda`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-brand-600">
            *
          </span>
        )}
      </label>

      {children({ id, name, invalid: Boolean(error), "aria-describedby": describedBy })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
