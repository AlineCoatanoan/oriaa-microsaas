import { z } from 'zod';

export type FieldErrors = Record<string, string>;

type FormResult<T> =
  { success: true; data: T } | { success: false; errors: FieldErrors };

/** Lit les champs d'un formulaire et les valide avec un schéma Zod. */
export function validateForm<T>(
  schema: z.ZodType<T>,
  form: HTMLFormElement,
): FormResult<T> {
  const values = Object.fromEntries(new FormData(form));
  const result = schema.safeParse(values);

  if (result.success) return { success: true, data: result.data };

  // Un seul message par champ : le premier problème trouvé
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return { success: false, errors };
}
