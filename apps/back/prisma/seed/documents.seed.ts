import prisma from '../../src/lib/prisma.js';

export async function seedDocuments(beneficiaries: {
  beneficiary1: { beneficiary_id: number };
  beneficiary2: { beneficiary_id: number };
  beneficiary3: { beneficiary_id: number };
}) {
  const document1 = await prisma.document.create({
    data: {
      file_name: 'justificatif_identite.pdf',
      category: 'Identité',
      file_path: '/documents/beneficiary1/justificatif_identite.pdf',
      beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
    },
  });

  const document2 = await prisma.document.create({
    data: {
      file_name: 'attestation_domicile.pdf',
      category: 'Domicile',
      file_path: '/documents/beneficiary1/attestation_domicile.pdf',
      beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
    },
  });

  const document3 = await prisma.document.create({
    data: {
      file_name: 'justificatifs_ressources.pdf',
      category: 'Ressources',
      file_path: '/documents/beneficiary2/justificatifs_ressources.pdf',
      beneficiary_id: beneficiaries.beneficiary2.beneficiary_id,
    },
  });

  const document4 = await prisma.document.create({
    data: {
      file_name: 'courrier_administratif.pdf',
      category: 'Administratif',
      file_path: '/documents/beneficiary3/courrier_administratif.pdf',
      beneficiary_id: beneficiaries.beneficiary3.beneficiary_id,
    },
  });

  return {
    document1,
    document2,
    document3,
    document4,
  };
}
