import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.url(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  // Clé secrète de signature des tokens (au moins 32 caractères)
  JWT_SECRET: z.string().min(32),
  // Durée de validité d'un token, en secondes (8 h par défaut : une journée de travail)
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(28800),
});

const env = envSchema.parse(process.env);

export { env };
