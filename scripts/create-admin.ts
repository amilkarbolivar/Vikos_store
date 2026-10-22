/**
 * Crea (o actualiza) un usuario administrador en la base de datos.
 *
 * Uso:
 *   ADMIN_EMAIL=admin@vikos.com ADMIN_PASSWORD='una-clave-larga' ADMIN_NAME='Administrador' \
 *     npm run admin:create
 *
 * Solo imprimir el hash (para insertarlo tú con SQL), sin conectarse a la base de datos:
 *   ADMIN_PASSWORD='una-clave-larga' npm run admin:create -- --hash-only
 *
 * La contraseña se lee del entorno y no de argumentos, para que no quede en el historial del
 * shell de la misma forma ni se vea en la lista de procesos. Si el correo ya existe, se
 * actualizan nombre, contraseña, rol y se reactiva la cuenta (sirve para resetear la clave).
 */

import { ScryptPasswordHasher } from "../src/modules/auth/infrastructure/scrypt-password-hasher.ts";

const MIN_PASSWORD_LENGTH = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(`ADMIN_PASSWORD es obligatoria y debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  const passwordHash = await new ScryptPasswordHasher().hash(password);

  if (process.argv.includes("--hash-only")) {
    console.log(passwordHash);
    return;
  }

  // El login normaliza el correo con trim + minúsculas: se guarda igual para que coincida.
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME ?? "Administrador").trim();

  if (!EMAIL_PATTERN.test(email)) fail("ADMIN_EMAIL es obligatorio y debe ser un correo válido.");
  if (!name || name.length > 120) fail("ADMIN_NAME debe tener entre 1 y 120 caracteres.");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) fail("DATABASE_URL no está definida.");

  // Carga diferida: --hash-only y las validaciones no necesitan el cliente de Prisma.
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const existing = await prisma.users.findUnique({ where: { email } });
    const user = await prisma.users.upsert({
      where: { email },
      create: { name, email, password_hash: passwordHash, role: "ADMIN", is_active: true },
      update: {
        name,
        password_hash: passwordHash,
        role: "ADMIN",
        is_active: true,
        updated_at: new Date(),
      },
    });
    console.log(`${existing ? "Actualizado" : "Creado"} administrador ${user.email} (id ${user.id}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Error inesperado:', error instanceof Error ? error.message : error);
  process.exit(1);
});
