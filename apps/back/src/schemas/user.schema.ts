import { z } from 'zod';
import { ROLES } from '../config/roles.js';
import {
  archivedFilter,
  atLeastOneField,
  newPassword,
  requiredText,
} from './common.js';

const job = requiredText(50);
const role = z.enum([ROLES.ADMIN, ROLES.USER]);

/** Données acceptées pour créer un compte, avec un mot de passe provisoire. */
export const createUserSchema = z.object({
  lastName: requiredText(50),
  firstName: requiredText(50),
  email: z.email().max(255),
  password: newPassword,
  job,
  role,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Données acceptées pour modifier un compte : au moins un champ. */
export const updateUserSchema = atLeastOneField(
  z.object({ job, role }).partial(),
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** Filtre de la liste : ?archived=true pour voir les comptes archivés. */
export const listUsersQuerySchema = z.object({ archived: archivedFilter });
