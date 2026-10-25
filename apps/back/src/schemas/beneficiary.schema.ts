import { z } from 'zod';

/** Champ texte facultatif : si une valeur est fournie, elle ne doit pas dépasser max caractères. */
const optionalText = (max: number) => z.string().trim().max(max).optional();

/** Données acceptées pour créer un bénéficiaire. */
export const createBeneficiarySchema = z.object({
  lastName: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(1).max(50),
  entryDate: z.iso.date(),
  email: z.email().max(255).optional(),
  dateOfBirth: z.iso.date().optional(),
  address: optionalText(255),
  postalCode: optionalText(10),
  city: optionalText(100),
  phone: optionalText(20),
  familyStatus: optionalText(50),
  numberOfChildren: z.number().int().min(0).optional(),
  householdComposition: optionalText(50),
  referentId: z.number().int().positive().optional(),
});

export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;

/** Paramètre :id dans l'URL. */
export const beneficiaryIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Les max() reprennent la taille des colonnes Prisma (VarChar(50)…). Une valeur trop longue est ainsi refusée proprement (400) au lieu de faire planter la base (500).
//z.iso.date() attend le format 2026-10-25.
//z.infer crée le type TypeScript à partir du schéma : une seule source de vérité.
//pathwayStatus et exitDate ne sont pas acceptés ici : ils ont leurs propres tickets (#94, sortie).//
