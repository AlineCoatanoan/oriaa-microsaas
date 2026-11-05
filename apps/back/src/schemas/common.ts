import { z } from 'zod';

/** Identifiant reçu dans le corps de la requête. */
export const idField = z.number().int().positive();

/** Identifiant reçu dans l'URL : "12" devient 12. */
export const idParam = z.coerce.number().int().positive();

/** Paramètre :id dans l'URL. */
export const idParamsSchema = z.object({ id: idParam });

/** Filtre ?archived=true des listes. */
export const archivedFilter = z.stringbool().default(false);

/** Date au format ISO : 2026-10-25. */
export const isoDate = z.iso.date();

/**
 * Les max() reprennent la taille des colonnes Prisma (VarChar(50)…) :
 * une valeur trop longue est refusée proprement (400) au lieu de faire planter la base (500).
 */
export const requiredText = (max: number) => z.string().trim().min(1).max(max);

/** Texte facultatif : absent, null (pour le vider) ou max caractères. */
export const optionalText = (max: number) =>
  z.string().trim().max(max).nullish();

/** Texte long obligatoire, sans limite de taille (colonne TEXT). */
export const requiredLongText = z.string().trim().min(1);

/** Texte long facultatif : absent, null ou vide (colonne TEXT). */
export const optionalLongText = z.string().trim().nullish();

/** Impose au moins un champ dans une modification (PATCH). */
export const atLeastOneField = <T extends z.ZodObject>(schema: T) =>
  schema.refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune donnée à modifier.',
  });

/** Liste d'identifiants reçue dans le corps de la requête. */
export const idList = z.array(idField);

/** Date et heure au format ISO : 2026-11-04T14:30:00+01:00. */
export const isoDateTime = z.iso.datetime({ offset: true });

/** Nouveau mot de passe : 12 caractères au moins, 72 au plus (limite de bcrypt). */
export const newPassword = z.string().min(12).max(72);
