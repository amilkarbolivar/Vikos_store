"use client";

import Image from "next/image";
import { useState } from "react";

import { GiftIcon } from "@/components/ui/icons";
import { isPreviewableImageUrl } from "@/lib/admin-product-form";

/**
 * Vista previa de la imagen de un producto a partir de su URL.
 *
 * Si la URL está vacía, no es http(s) o la imagen no carga, muestra un recuadro de aviso en
 * lugar de una imagen rota. Quien lo use debe pasar `key={url}`: así, cuando cambia la URL, el
 * componente se reinicia y vuelve a intentar cargarla (si no, recordaría el fallo anterior).
 */
export function ImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  // Mientras se escribe, la URL pasa por estados incompletos: solo se muestra si ya es válida.
  const valid = isPreviewableImageUrl(url);

  return (
    <div className="relative aspect-square w-full max-w-[14rem] overflow-hidden rounded-card border border-line bg-brand-50">
      {valid && !failed ? (
        <Image
          src={url.trim()}
          alt="Vista previa de la imagen del producto"
          fill
          unoptimized
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center text-sm text-muted">
          <GiftIcon className="text-3xl text-brand-500/70" />
          {failed ? "No se pudo cargar la imagen" : "Sin imagen"}
        </div>
      )}
    </div>
  );
}
