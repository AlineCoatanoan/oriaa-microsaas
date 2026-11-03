import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/app-error.js';
import { toSubtaskDto } from '../lib/dto.js';
import { assertTaskEditable } from './task.service.js';
import type {
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from '../schemas/subtask.schema.js';

/** Vérifie que la sous-tâche existe et appartient bien à cette tâche, sinon 404. */
async function assertSubtaskExists(taskId: number, subtaskId: number) {
  const subtask = await prisma.subtask.findFirst({
    where: { subtask_id: subtaskId, task_id: taskId },
  });
  if (!subtask) throw new NotFoundError('Sous-tâche introuvable.');
}

/** Ajoute une sous-tâche à une tâche. */
export async function create(taskId: number, data: CreateSubtaskInput) {
  await assertTaskEditable(taskId);

  const subtask = await prisma.subtask.create({
    data: { label: data.label, task_id: taskId },
  });

  return toSubtaskDto(subtask);
}

/** Modifie le libellé et/ou coche une sous-tâche. */
export async function update(
  taskId: number,
  subtaskId: number,
  data: UpdateSubtaskInput,
) {
  await assertTaskEditable(taskId);
  await assertSubtaskExists(taskId, subtaskId);

  const subtask = await prisma.subtask.update({
    where: { subtask_id: subtaskId },
    data: { label: data.label, is_completed: data.isCompleted },
  });

  return toSubtaskDto(subtask);
}

/** Supprime une sous-tâche. */
export async function remove(taskId: number, subtaskId: number) {
  await assertTaskEditable(taskId);
  await assertSubtaskExists(taskId, subtaskId);

  await prisma.subtask.delete({ where: { subtask_id: subtaskId } });
}
