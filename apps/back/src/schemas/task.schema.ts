import { z } from 'zod';
import {
  atLeastOneField,
  idList,
  idParam,
  isoDate,
  optionalLongText,
  requiredText,
} from './common.js';

/** Statuts et priorités utilisés aussi par le service. */
export const DEFAULT_TASK_STATUS = 'À faire';
export const COMPLETED_TASK_STATUS = 'Terminée';
export const DEFAULT_TASK_PRIORITY = 'Normale';
export const URGENT_TASK_PRIORITY = 'Haute';

const taskPriority = z.enum([
  'Basse',
  DEFAULT_TASK_PRIORITY,
  URGENT_TASK_PRIORITY,
]);

const taskStatus = z.enum([
  DEFAULT_TASK_STATUS,
  'En cours',
  COMPLETED_TASK_STATUS,
]);

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
