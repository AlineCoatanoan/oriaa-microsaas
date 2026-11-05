import prisma from '../../src/lib/prisma.js';

/** Crée directement un bénéficiaire en base (plus rapide que par l'API). */
export async function createBeneficiary(
  userId: number,
  data: { lastName?: string; firstName?: string; archivedAt?: Date } = {},
) {
  return prisma.beneficiary.create({
    data: {
      last_name: data.lastName ?? 'Martin',
      first_name: data.firstName ?? 'Test',
      entry_date: new Date('2026-10-01'),
      archived_at: data.archivedAt,
      user_id: userId,
    },
  });
}
