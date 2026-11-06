import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export interface ImageStorage {
  /** Guarda el archivo y devuelve la URL pública que se guarda en la BD. */
  put(key: string, body: Uint8Array, contentType: string): Promise<string>;
}

let cached: ImageStorage | null | undefined;

/**
 * Devuelve el almacenamiento S3, o null si no está configurado (S3_BUCKET / AWS_REGION vacíos).
 * Las credenciales las toma solas del rol IAM de la instancia EC2 (no hay claves en el código).
 */
export function getImageStorage(): ImageStorage | null {
  if (cached !== undefined) return cached;
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.AWS_REGION?.trim();
  if (!bucket || !region) return (cached = null);

  const base = (process.env.S3_PUBLIC_BASE_URL?.trim() || `https://${bucket}.s3.${region}.amazonaws.com`).replace(/\/+$/, '');
  const client = new S3Client({ region });

  cached = {
    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      return `${base}/${key}`;
    },
  };
  return cached;
}
