import { z } from 'zod';

/**
 * Schémas de validation des bénéficiaires.
 * Les max() reprennent la taille des colonnes Prisma (VarChar(50)…) :
 * une valeur trop longue est refusée proprement (400) au lieu de faire planter la base (500).
 */

/** Champ texte facultatif : absent, null (pour le vider) ou max caractères. */
const optionalText = (max: number) => z.string().trim().max(max).nullish();

/**
 * Données acceptées pour créer un bénéficiaire.
 * pathwayStatus et exitDate ne sont pas acceptés ici : ils ont leurs propres tickets (#94, #104).
 */
export const createBeneficiarySchema = z.object({
  lastName: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(1).max(50),
  entryDate: z.iso.date(), // format ISO : 2026-10-25
  email: z.email().max(255).nullish(),
  dateOfBirth: z.iso.date().nullish(),
  address: optionalText(255),
  postalCode: optionalText(10),
  city: optionalText(100),
  phone: optionalText(20),
  familyStatus: optionalText(50),
  numberOfChildren: z.number().int().min(0).nullish(),
  householdComposition: optionalText(50),
  referentId: z.number().int().positive().optional(), // jamais null : un bénéficiaire a toujours un référent
});

/** Type TypeScript déduit du schéma : une seule source de vérité. */
export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;

/**
 * Données acceptées pour modifier un bénéficiaire (PATCH).
 * .partial() reprend toutes les règles de la création en rendant chaque champ facultatif.
 * .refine() impose au moins un champ.
 * Champ absent = inchangé ; null = vidé (champs facultatifs uniquement).
 */
export const updateBeneficiarySchema = createBeneficiarySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Aucune donnée à modifier.',
  });

export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>;

/** Paramètre :id dans l'URL. */
export const beneficiaryIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Filtres de la liste : ?archived=true pour voir les archivés. */
export const listBeneficiariesQuerySchema = z.object({
  archived: z.stringbool().default(false),
});
