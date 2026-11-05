import prisma from '../../src/lib/prisma.js';
import type { SeedBeneficiaries, SeedUsers } from './types.js';
import {
  COMPLETED_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  IN_PROGRESS_TASK_STATUS,
  LOW_TASK_PRIORITY,
  URGENT_TASK_PRIORITY,
} from '../../src/config/constants.js';

export async function seedTasks(
  users: SeedUsers,
  beneficiaries: SeedBeneficiaries,
) {
  const task1 = await prisma.task.create({
    data: {
      title: 'Préparer le dossier CAF',
      description: 'Vérifier les documents nécessaires avant le rendez-vous.',
      due_date: new Date('2026-10-02'),
      status: DEFAULT_TASK_STATUS,
      priority: URGENT_TASK_PRIORITY,
      assignees: { create: { user_id: users.user.user_id } },
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
      status: DEFAULT_TASK_STATUS,
      priority: DEFAULT_TASK_PRIORITY,
      assignees: { create: { user_id: users.admin.user_id } },
      user_id_created_by: users.user.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary2.beneficiary_id,
        },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Préparer la réunion d'équipe",
      description: 'Rassembler les éléments nécessaires pour la réunion.',
      due_date: new Date('2026-10-05'),
      status: IN_PROGRESS_TASK_STATUS,
      priority: DEFAULT_TASK_PRIORITY,
      assignees: { create: { user_id: users.user.user_id } },
      user_id_created_by: users.user.user_id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Préparer un atelier cuisine',
      description:
        'Trouver les bénéficiaires intéressés, préparer la liste de courses.',
      due_date: new Date('2026-09-25'),
      created_at: new Date('2026-09-20'),
      updated_at: new Date('2026-09-25'),
      status: COMPLETED_TASK_STATUS,
      priority: LOW_TASK_PRIORITY,
      assignees: { create: { user_id: users.user.user_id } },
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
  };
}
