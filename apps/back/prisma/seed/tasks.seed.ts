import prisma from '../../src/lib/prisma.js';

export async function seedTasks(
  users: {
    admin: { user_id: number };
    user: { user_id: number };
  },
  beneficiaries: {
    beneficiary1: { beneficiary_id: number };
    beneficiary2: { beneficiary_id: number };
    beneficiary3: { beneficiary_id: number };
  },
) {
  const task1 = await prisma.task.create({
    data: {
      title: 'Préparer le dossier CAF',
      description: 'Vérifier les documents nécessaires avant le rendez-vous.',
      due_date: new Date('2026-10-02'),
      created_at: new Date(),
      updated_at: new Date(),
      status: 'À faire',
      priority: 'Haute',
      user_id_assigned: users.user.user_id,
      user_id_created_by: users.admin.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
        },
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Appeler le référent',
      description: 'Faire le point sur la situation du bénéficiaire.',
      due_date: new Date('2026-09-30'),
      created_at: new Date(),
      updated_at: new Date(),
      status: 'En cours',
      priority: 'Normale',
      user_id_assigned: users.admin.user_id,
      user_id_created_by: users.user.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary2.beneficiary_id,
        },
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Préparer la réunion d'équipe",
      description: 'Rassembler les éléments nécessaires pour la réunion.',
      due_date: new Date('2026-10-05'),
      created_at: new Date(),
      updated_at: new Date(),
      status: 'À faire',
      priority: 'Normale',
      user_id_assigned: users.user.user_id,
      user_id_created_by: users.user.user_id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Préparer un atelier cuisine',
      description:
        'Trouver les bénéficaires interessés, préparer la liste de courses.',
      due_date: new Date('2026-09-25'),
      created_at: new Date('2026-09-20'),
      updated_at: new Date('2026-09-25'),
      status: 'Terminée',
      priority: 'Basse',
      user_id_assigned: users.user.user_id,
      user_id_created_by: users.admin.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary3.beneficiary_id,
        },
      },
    },
  });

  return {
    task1,
    task2,
    task3,
    task4,
  };
}
