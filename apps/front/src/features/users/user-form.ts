import { z } from 'zod/mini';
import { newPassword } from '@/features/auth/password-rules';
import { ROLES } from '@/features/auth/roles';
import { requiredText } from '@/lib/form';

const job = requiredText(50, 'Saisissez la fonction.');
const role = z.enum([ROLES.ADMIN, ROLES.USER]);

/** Mêmes règles que le back, avec un mot de passe provisoire. */
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
  password: newPassword,
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
