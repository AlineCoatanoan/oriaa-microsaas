import { z } from 'zod';

/** Identifiant reçu dans l'URL : "12" devient 12. */
export const idParam = z.coerce.number().int().positive();

/** Filtre ?archived=true des listes. */
export const archivedFilter = z.stringbool().default(false);

/** Impose au moins un champ dans une modification (PATCH). */
export const atLeastOneField = <T extends z.ZodObject>(schema: T) =>
  schema.refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune donnée à modifier.',
  });
