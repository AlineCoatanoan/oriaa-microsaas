import { z } from 'zod';

/** Données attendues pour se connecter. */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
