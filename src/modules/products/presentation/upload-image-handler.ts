import { randomUUID } from 'node:crypto';

import { detectImageType, MAX_IMAGE_BYTES } from '@/lib/image-upload';
import { InfrastructureError, PayloadTooLargeError, ValidationError } from '@/modules/shared/domain/errors';
import { errorBody, toErrorResponse, type ErrorLogger } from '@/modules/shared/presentation/http-error-mapper';

export interface UploadImageDeps {
  requireAdmin: (request: Request) => Promise<unknown>;
  getStorage: () => { put(key: string, body: Uint8Array, contentType: string): Promise<string> } | null;
  logger?: ErrorLogger;
}

/** POST /api/uploads (solo admin): recibe un archivo, lo sube a S3 y devuelve { url }. */
export function uploadImageHandler(deps: UploadImageDeps) {
  return async (request: Request): Promise<Response> => {
    try {
      await deps.requireAdmin(request);

      const storage = deps.getStorage();
      if (!storage) {
        return Response.json(errorBody('STORAGE_NOT_CONFIGURED', 'La subida de imágenes no está configurada.'), { status: 503 });
      }

      const declared = Number(request.headers.get('content-length'));
      if (Number.isFinite(declared) && declared > MAX_IMAGE_BYTES + 100_000) {
        throw new PayloadTooLargeError('La imagen supera los 5 MB.');
      }
      if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data')) {
        throw new ValidationError('Se esperaba un formulario con la imagen.', 'file');
      }

      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        throw new ValidationError('No se pudo leer el archivo enviado.', 'file');
      }
      const file = form.get('file');
      if (!(file instanceof File)) throw new ValidationError('Falta el archivo de la imagen.', 'file');
      if (file.size > MAX_IMAGE_BYTES) throw new PayloadTooLargeError('La imagen supera los 5 MB.');

      const bytes = new Uint8Array(await file.arrayBuffer());
      const type = detectImageType(bytes);
      if (!type) throw new ValidationError('Usa una imagen JPG, PNG o WEBP.', 'file');

      let url: string;
      try {
        url = await storage.put(`productos/${randomUUID()}.${type.ext}`, bytes, type.mime);
      } catch (cause) {
        throw new InfrastructureError('No se pudo guardar la imagen.', { cause });
      }
      return Response.json({ url }, { status: 201 });
    } catch (error) {
      return toErrorResponse(error, deps.logger, { context: 'subida de imágenes' });
    }
  };
}
