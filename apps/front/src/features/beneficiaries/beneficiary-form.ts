import { z } from 'zod/mini';
import type { PathwayStatus } from './types';

const tooLong = (max: number) => `${max} caractères maximum.`;

const requiredText = (max: number, message: string) =>
  z
    .string()
    .check(z.trim(), z.minLength(1, message), z.maxLength(max, tooLong(max)));

const optionalText = (max: number) =>
  z.string().check(z.trim(), z.maxLength(max, tooLong(max)));

/** Mêmes règles que le back : champs obligatoires et longueurs maximales. */
export const beneficiaryFormSchema = z.object({
  lastName: requiredText(50, 'Saisissez le nom.'),
  firstName: requiredText(50, 'Saisissez le prénom.'),
  dateOfBirth: z.string(),
  address: optionalText(255),
  postalCode: optionalText(10),
  city: optionalText(100),
  phone: optionalText(20),
  email: z.union([
    z.literal(''),
    z.email('Saisissez une adresse e-mail valide.'),
  ]),
  familyStatus: optionalText(50),
  numberOfChildren: z
    .string()
    .check(z.regex(/^\d*$/, 'Saisissez un nombre entier.')),
  householdComposition: optionalText(50),
  entryDate: z.string().check(z.minLength(1, "Saisissez la date d'entrée.")),
  referentId: z.string().check(z.minLength(1, 'Choisissez un référent.')),
  pathwayStatus: z.optional(z.string()),
});

export type BeneficiaryFormValues = z.infer<typeof beneficiaryFormSchema>;

export type BeneficiaryPayload = {
  lastName: string;
  firstName: string;
  dateOfBirth: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  familyStatus: string | null;
  numberOfChildren: number | null;
  householdComposition: string | null;
  entryDate: string;
  referentId?: number;
  pathwayStatus?: PathwayStatus;
};

/** Champ vide = null : en modification, il vide la valeur enregistrée. */
const orNull = (value: string) => value || null;

/**
 * Prépare les données pour l'API.
 * Le référent n'est envoyé que s'il change : un référent archivé reste possible.
 */
export function toBeneficiaryPayload(
  values: BeneficiaryFormValues,
  initialReferentId?: number,
): BeneficiaryPayload {
  const referentId = Number(values.referentId);

  return {
    lastName: values.lastName,
    firstName: values.firstName,
    dateOfBirth: orNull(values.dateOfBirth),
    address: orNull(values.address),
    postalCode: orNull(values.postalCode),
    city: orNull(values.city),
    phone: orNull(values.phone),
    email: orNull(values.email),
    familyStatus: orNull(values.familyStatus),
    numberOfChildren: values.numberOfChildren
      ? Number(values.numberOfChildren)
      : null,
    householdComposition: orNull(values.householdComposition),
    entryDate: values.entryDate,
    ...(referentId !== initialReferentId && { referentId }),
    ...(values.pathwayStatus && {
      pathwayStatus: values.pathwayStatus as PathwayStatus,
    }),
  };
}
