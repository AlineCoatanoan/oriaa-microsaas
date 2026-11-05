import { z } from 'zod';
import {
  archivedFilter,
  atLeastOneField,
  idField,
  isoDate,
  optionalText,
  requiredText,
} from './common.js';
import { PATHWAY_STATUSES } from '../config/statuses.js';

/**
 * Données acceptées pour créer un bénéficiaire.
 * pathwayStatus n'est pas accepté ici : tout nouveau dossier démarre à "En cours".
 */
export const createBeneficiarySchema = z.object({
  lastName: requiredText(50),
  firstName: requiredText(50),
  entryDate: isoDate,
  email: z.email().max(255).nullish(),
  dateOfBirth: isoDate.nullish(),
  address: optionalText(255),
  postalCode: optionalText(10),
  city: optionalText(100),
  phone: optionalText(20),
  familyStatus: optionalText(50),
  numberOfChildren: z.number().int().min(0).nullish(),
  householdComposition: optionalText(50),
  referentId: idField.optional(), // jamais null : un bénéficiaire a toujours un référent
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
    .extend({ pathwayStatus: z.enum(PATHWAY_STATUSES) })
    .partial(),
);

export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>;

/** Filtres de la liste : ?archived=true pour voir les archivés, ?search=mar pour chercher par nom ou prénom. */
export const listBeneficiariesQuerySchema = z.object({
  archived: archivedFilter,
  search: z.string().trim().max(50).optional(),
});

/** Archivage : la date de sortie est obligatoire. */
export const archiveBeneficiarySchema = z.object({
  exitDate: isoDate,
});
