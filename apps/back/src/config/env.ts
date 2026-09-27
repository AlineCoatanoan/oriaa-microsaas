import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
});

const env = envSchema.parse(process.env);

export { env };