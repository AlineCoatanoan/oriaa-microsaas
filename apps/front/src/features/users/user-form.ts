import { z } from 'zod/mini';
import { ROLES } from '@/features/auth/roles';
import { requiredText } from '@/lib/form';

const job = requiredText(50, 'Saisissez la fonction.');
const role = z.enum([ROLES.ADMIN, ROLES.USER]);

/** Mêmes règles que le back ; mot de passe provisoire de 12 à 72 caractères. */
export const newUserFormSchema = z.object({
  firstName: requiredText(50, 'Saisissez le prénom.'),
  lastName: requiredText(50, 'Saisissez le nom.'),
  email: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, "Saisissez l'adresse e-mail."),
      z.maxLength(255, '255 caractères maximum.'),
      z.email(
        'Saisissez une adresse e-mail valide (exemple : nom@domaine.fr).',
      ),
    ),
  job,
  role,
  password: z
    .string()
    .check(
      z.minLength(12, 'Le mot de passe doit contenir au moins 12 caractères.'),
      z.maxLength(72, 'Le mot de passe doit contenir au plus 72 caractères.'),
    ),
});

/**
 * Modification : la fonction et le rôle.
 * Son propre rôle ne se modifie pas : le champ est désactivé, donc absent.
 */
export const userFormSchema = z.object({
  job,
  role: z.optional(role),
});

export type NewUserPayload = z.infer<typeof newUserFormSchema>;
export type UserPayload = z.infer<typeof userFormSchema>;
