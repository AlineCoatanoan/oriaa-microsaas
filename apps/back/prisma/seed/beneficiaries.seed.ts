import prisma from '../../src/lib/prisma.js';

export async function seedBeneficiaries(userId: number) {
  const beneficiary1 = await prisma.beneficiary.create({
    data: {
      last_name: 'Durand',
      first_name: 'Lucas',
      email: 'lucas.durand@example.test',
      date_of_birth: new Date('1992-04-15'),
      address: '12 rue des Oliviers',
      postal_code: '30000',
      city: 'Nîmes',
      phone: '0600000001',
      family_status: 'Célibataire',
      number_of_children: 0,
      household_composition: 'Seul',
      pathway_status: 'En cours',
      entry_date: new Date('2026-01-15'),
      created_at: new Date(),
      user_id: userId,
    },
  });

  const beneficiary2 = await prisma.beneficiary.create({
    data: {
      last_name: 'Petit',
      first_name: 'Sarah',
      email: 'sarah.petit@example.test',
      date_of_birth: new Date('1987-09-23'),
      address: '12 rue des Oliviers',
      postal_code: '30000',
      city: 'Nîmes',
      phone: '0600000002',
      family_status: 'Séparée',
      number_of_children: 2,
      household_composition: 'Parent avec enfants',
      pathway_status: 'En cours',
      entry_date: new Date('2026-03-02'),
      created_at: new Date(),
      user_id: userId,
    },
  });

  const beneficiary3 = await prisma.beneficiary.create({
    data: {
      last_name: 'Moreau',
      first_name: 'Nadia',
      email: 'nadia.moreau@example.test',
      date_of_birth: new Date('1998-11-07'),
      address: '12 rue des Oliviers',
      postal_code: '30000',
      city: 'Nîmes',
      phone: '0600000003',
      family_status: 'Célibataire',
      number_of_children: 0,
      household_composition: 'Seule',
      pathway_status: 'En cours',
      entry_date: new Date('2026-05-10'),
      created_at: new Date(),
      user_id: userId,
    },
  });

  return {
    beneficiary1,
    beneficiary2,
    beneficiary3,
  };
}
