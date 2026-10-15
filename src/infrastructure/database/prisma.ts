import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Instancia única de Prisma por proceso. En desarrollo, Next.js recarga los módulos con cada
 * cambio; guardar la instancia en globalThis evita abrir una conexión nueva en cada recarga.
 *
 * Se crea de forma perezosa para que `next build` no falle si DATABASE_URL no está definida.
 * DATABASE_URL se lee solo del entorno (nunca se escribe en el código). Dentro de Docker Compose
 * debe apuntar al NOMBRE DEL SERVICIO de PostgreSQL (por ejemplo `@db:5432`), no a `localhost`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('La variable de entorno DATABASE_URL no está definida');
    }
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }
  return globalForPrisma.prisma;
}
