import { z } from 'zod/mini';

export type FieldErrors = Record<string, string>;

type FormResult<T> =
  { success: true; data: T } | { success: false; errors: FieldErrors };

type ValidateOptions = {
  /** Champs à plusieurs valeurs (cases à cocher), lus sous forme de liste. */
  lists?: string[];
};

/** Lit les champs d'un formulaire et les valide avec un schéma Zod. */
export function validateForm<T>(
  schema: z.ZodMiniType<T>,
  form: HTMLFormElement,
  { lists = [] }: ValidateOptions = {},
): FormResult<T> {
  const formData = new FormData(form);
  const values: Record<string, unknown> = Object.fromEntries(formData);
  for (const name of lists) values[name] = formData.getAll(name);

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

/** Place le curseur sur le premier champ à corriger. */
export function focusFirstError(form: HTMLFormElement, errors: FieldErrors) {
  const [firstField] = Object.keys(errors);
  const field = form.elements.namedItem(firstField);
  // Groupe de cases à cocher : on se place sur la première
  const element = field instanceof RadioNodeList ? field[0] : field;
  (element as HTMLElement | null)?.focus();
}

const tooLong = (max: number) => `${max} caractères maximum.`;

/** Texte obligatoire, mêmes longueurs maximales que le back. */
export const requiredText = (max: number, message: string) =>
  z
    .string()
    .check(z.trim(), z.minLength(1, message), z.maxLength(max, tooLong(max)));

/** Texte facultatif, mêmes longueurs maximales que le back. */
export const optionalText = (max: number) =>
  z.string().check(z.trim(), z.maxLength(max, tooLong(max)));

/** Champ vide = null : en modification, il vide la valeur enregistrée. */
export const orNull = (value: string) => value || null;
