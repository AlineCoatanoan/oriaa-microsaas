import { z } from 'zod/mini';
import { requiredText } from '@/lib/form';

/** Mêmes règles que le back : titre (50 caractères max) et texte obligatoires. */
export const noteFormSchema = z.object({
  title: requiredText(50, 'Saisissez le titre.'),
  content: z
    .string()
    .check(z.trim(), z.minLength(1, 'Saisissez le texte de la note.')),
});
