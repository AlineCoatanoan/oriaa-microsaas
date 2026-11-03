import { z } from 'zod';
import { atLeastOneField, idParam, requiredText } from './common.js';

const label = requiredText(50);

/** Une nouvelle sous-tâche démarre toujours non cochée. */
export const createSubtaskSchema = z.object({ label });

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

/** Modifier le libellé et/ou cocher la sous-tâche : au moins un champ. */
export const updateSubtaskSchema = atLeastOneField(
  z.object({ label, isCompleted: z.boolean() }).partial(),
);

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;

/** Paramètres :id (tâche) et :subtaskId dans l'URL. */
export const subtaskParamsSchema = z.object({
  id: idParam,
  subtaskId: idParam,
});
