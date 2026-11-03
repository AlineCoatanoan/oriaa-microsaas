import { z } from 'zod';
import {
  archivedFilter,
  atLeastOneField,
  idField,
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

const idList = z.array(idField);

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
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Données acceptées pour modifier une tâche (PATCH).
 * assigneeIds et beneficiaryIds remplacent les listes existantes.
 */
export const updateTaskSchema = atLeastOneField(
  createTaskSchema
    .extend({
      status: z.enum([DEFAULT_TASK_STATUS, 'En cours', COMPLETED_TASK_STATUS]),
    })
    .partial(),
);

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/** Filtres de la liste : ?archived=true, ?beneficiaryId=5 pour l'onglet de la fiche. */
export const listTasksQuerySchema = z.object({
  archived: archivedFilter,
  beneficiaryId: idParam.optional(),
});
