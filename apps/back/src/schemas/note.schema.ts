import { z } from 'zod';

/** Données acceptées pour créer une note. Les max() reprennent la taille des colonnes Prisma. */
export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(50),
  content: z.string().trim().min(1),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/** Données acceptées pour modifier une note : au moins un champ. */
export const updateNoteSchema = createNoteSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune donnée à modifier.',
  });

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/** Paramètres :id (bénéficiaire) et :noteId dans l'URL. */
export const noteParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  noteId: z.coerce.number().int().positive(),
});
