import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
});

const env = envSchema.parse(process.env);

export { env };
