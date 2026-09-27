import prisma from '../../src/lib/prisma.js';

export async function seedSubtasks(tasks: {
  task1: { task_id: string };
  task2: { task_id: string };
  task3: { task_id: string };
  task4: { task_id: string };
}) {
  const subtask1 = await prisma.subtask.create({
    data: {
      label: 'Vérifier les justificatifs',
      is_completed: true,
      task_id: tasks.task1.task_id,
    },
  });

  const subtask2 = await prisma.subtask.create({
    data: {
      label: 'Scanner les documents',
      is_completed: false,
      task_id: tasks.task1.task_id,
    },
  });

  const subtask3 = await prisma.subtask.create({
    data: {
      label: 'Préparer les informations',
      is_completed: true,
      task_id: tasks.task2.task_id,
    },
  });

  const subtask4 = await prisma.subtask.create({
    data: {
      label: 'Préparer la liste de courses',
      is_completed: true,
      task_id: tasks.task4.task_id,
    },
  });

  return {
    subtask1,
    subtask2,
    subtask3,
    subtask4,
  };
}
