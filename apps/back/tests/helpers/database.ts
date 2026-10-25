import prisma from '../../src/lib/prisma.js';
import { env } from '../../src/config/env.js';

/**
 * Vide toutes les tables de la base de test.
 * TRUNCATE ... CASCADE vide aussi toutes les tables qui dépendent de Role.
 */
export async function resetDatabase() {
  // Sécurité : ne jamais vider une autre base que la base de test
  if (!env.DATABASE_URL.includes('oriaa_test')) {
    throw new Error(
      'resetDatabase ne doit être utilisé que sur la base de test.',
    );
  }
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE',
  );
}
