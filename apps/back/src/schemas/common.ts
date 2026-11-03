import { z } from 'zod';

/** Identifiant reçu dans le corps de la requête. */
export const idField = z.number().int().positive();

/** Identifiant reçu dans l'URL : "12" devient 12. */
export const idParam = z.coerce.number().int().positive();

/** Paramètre :id dans l'URL. */
export const idParamsSchema = z.object({ id: idParam });

/** Filtre ?archived=true des listes. */
export const archivedFilter = z.stringbool().default(false);

/** Texte obligatoire : au moins un caractère, max caractères au plus. */
export const requiredText = (max: number) => z.string().trim().min(1).max(max);

/** Texte facultatif : absent, null (pour le vider) ou max caractères. */
export const optionalText = (max: number) =>
  z.string().trim().max(max).nullish();

/** Impose au moins un champ dans une modification (PATCH). */
export const atLeastOneField = <T extends z.ZodObject>(schema: T) =>
  schema.refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune donnée à modifier.',
  });
