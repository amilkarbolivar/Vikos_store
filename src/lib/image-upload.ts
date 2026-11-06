/**
 * Reglas puras para subir imágenes de producto (sin React ni red).
 * Las usan el navegador (aviso rápido) y el servidor (validación real).
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ImageType = { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

/** Detecta el tipo REAL por los primeros bytes (no confía en el nombre ni en el Content-Type). */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return { mime: "image/png", ext: "png" };
  const ascii = (from: number, text: string) => [...text].every((c, i) => bytes[from + i] === c.charCodeAt(0));
  if (bytes.length >= 12 && ascii(0, "RIFF") && ascii(8, "WEBP")) return { mime: "image/webp", ext: "webp" };
  return null;
}

/** Comprobación rápida en el navegador. Devuelve un mensaje de error o null si está bien. */
export function checkImageFile(file: { size: number; type: string }): string | null {
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > MAX_IMAGE_BYTES) return "La imagen supera los 5 MB.";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Usa una imagen JPG, PNG o WEBP.";
  return null;
}
