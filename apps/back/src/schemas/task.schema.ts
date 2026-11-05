import { z } from 'zod';
import {
  atLeastOneField,
  idList,
  idParam,
  isoDate,
  optionalLongText,
  requiredText,
} from './common.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../config/statuses.js';

const taskPriority = z.enum(TASK_PRIORITIES);
const taskStatus = z.enum(TASK_STATUSES);

/**
 * Données acceptées pour créer une tâche.
 * Le statut n'est pas accepté ici : toute nouvelle tâche démarre à "À faire".
 * assigneeIds absent : la personne connectée devient responsable.
 */
export const createTaskSchema = z.object({
  title: requiredText(50),
  description: optionalLongText,
  dueDate: isoDate.nullish(),
  priority: taskPriority.optional(),
  assigneeIds: idList.min(1).optional(), // au moins un responsable
  beneficiaryIds: idList.optional(), // absent ou vide : tâche sans bénéficiaire
  noteIds: idList.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Données acceptées pour modifier une tâche (PATCH).
 * assigneeIds, beneficiaryIds et noteIds remplacent les listes existantes.
 */
export const updateTaskSchema = atLeastOneField(
  createTaskSchema.extend({ status: taskStatus }).partial(),
);

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Filtres de la liste, combinables entre eux.
 * Sans beneficiaryId (page des tâches) : tâches courantes uniquement.
 * Avec beneficiaryId (onglet de la fiche) : toutes ses tâches, même archivées.
 */
export const listTasksQuerySchema = z.object({
  beneficiaryId: idParam.optional(),
  assigneeId: idParam.optional(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
