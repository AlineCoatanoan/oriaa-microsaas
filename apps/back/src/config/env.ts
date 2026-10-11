import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

const env = envSchema.parse(process.env);

export { env };
