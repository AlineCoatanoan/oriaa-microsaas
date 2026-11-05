import prisma from '../../src/lib/prisma.js';
import type { SeedTasks } from './types.js';

export async function seedSubtasks(tasks: SeedTasks) {
  await prisma.subtask.create({
    data: {
      label: 'Vérifier les justificatifs',
      is_completed: true,
      task_id: tasks.task1.task_id,
    },
  });

  await prisma.subtask.create({
    data: {
      label: 'Scanner les documents',
      is_completed: false,
      task_id: tasks.task1.task_id,
    },
  });

  await prisma.subtask.create({
    data: {
      label: 'Préparer les informations',
      is_completed: true,
      task_id: tasks.task2.task_id,
    },
  });

  await prisma.subtask.create({
    data: {
      label: 'Préparer la liste de courses',
      is_completed: true,
      task_id: tasks.task3.task_id,
    },
  });
}
