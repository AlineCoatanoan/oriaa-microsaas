import { z } from 'zod';

const label = z.string().trim().min(1).max(50);

/** Une nouvelle sous-tâche démarre toujours non cochée. */
export const createSubtaskSchema = z.object({ label });

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

/** Modifier le libellé et/ou cocher la sous-tâche : au moins un champ. */
export const updateSubtaskSchema = z
  .object({ label, isCompleted: z.boolean() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune donnée à modifier.',
  });

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;

/** Paramètres :id (tâche) et :subtaskId dans l'URL. */
export const subtaskParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  subtaskId: z.coerce.number().int().positive(),
});
