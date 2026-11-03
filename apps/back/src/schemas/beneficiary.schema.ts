import { z } from 'zod';
import { archivedFilter, atLeastOneField, idParam } from './common.js';

/**
 * Schémas de validation des bénéficiaires.
 * Les max() reprennent la taille des colonnes Prisma (VarChar(50)…) :
 * une valeur trop longue est refusée proprement (400) au lieu de faire planter la base (500).
 */

/** Champ texte facultatif : absent, null (pour le vider) ou max caractères. */
const optionalText = (max: number) => z.string().trim().max(max).nullish();
export const DEFAULT_PATHWAY_STATUS = 'En cours';
export const EXIT_PATHWAY_STATUS = 'Sortie';

/**
 * Tout nouveau dossier démarre à "En cours".
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
 * Champ absent = inchangé ; null = vidé (champs facultatifs uniquement).
 */
export const updateBeneficiarySchema = atLeastOneField(
  createBeneficiarySchema
    .extend({
      pathwayStatus: z.enum([
        DEFAULT_PATHWAY_STATUS,
        'Préparation à la sortie',
        EXIT_PATHWAY_STATUS,
      ]),
    })
    .partial(),
);

export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>;

export const beneficiaryIdSchema = z.object({ id: idParam });

/** Filtres de la liste : ?archived=true pour voir les archivés, ?search=mar pour chercher par nom ou prénom. */
export const listBeneficiariesQuerySchema = z.object({
  archived: archivedFilter,
  search: z.string().trim().max(50).optional(),
});

/** Archivage : la date de sortie est obligatoire. */
export const archiveBeneficiarySchema = z.object({
  exitDate: z.iso.date(),
});
