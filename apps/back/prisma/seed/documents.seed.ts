import prisma from '../../src/lib/prisma.js';
import type { SeedBeneficiaries, SeedUsers } from './types.js';

/** Petit PDF fictif, pour les données de démonstration. */
const demoPdf = Buffer.from('%PDF-1.4\n% Document de démonstration\n');

export async function seedDocuments(
  users: SeedUsers,
  beneficiaries: SeedBeneficiaries,
) {
  const documents = [
    {
      title: "Attestation d'hébergement",
      file_name: 'attestation_hebergement.pdf',
      category: 'Hébergement',
      beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
    },
    {
      title: 'Demande de logement',
      file_name: 'demande_logement.pdf',
      category: 'Logement',
      beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
    },
    {
      title: 'Attestation France Travail',
      file_name: 'attestation_france_travail.pdf',
      category: 'Emploi',
      beneficiary_id: beneficiaries.beneficiary2.beneficiary_id,
    },
    {
      title: 'Courrier administratif',
      file_name: 'courrier_administratif.pdf',
      category: 'Administratif',
      beneficiary_id: beneficiaries.beneficiary3.beneficiary_id,
    },
  ];

  await prisma.document.createMany({
    data: documents.map((document) => ({
      ...document,
      mime_type: 'application/pdf',
      size_bytes: demoPdf.length,
      content: demoPdf,
      user_id: users.user.user_id,
    })),
  });
}
