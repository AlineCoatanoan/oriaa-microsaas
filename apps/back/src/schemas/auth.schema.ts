import { z } from 'zod';
import { newPassword } from './common.js';

/** Données attendues pour se connecter. */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/** Données attendues pour changer son mot de passe. */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
