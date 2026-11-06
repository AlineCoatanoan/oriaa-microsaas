import { useState, type FormEvent } from 'react';
import { z } from 'zod/mini';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { PasswordInput } from '@/components/ui/password-input';
import { getErrorMessage } from '@/lib/api';
import { validateForm, type FieldErrors } from '@/lib/form';
import { useChangePassword } from './useChangePassword';

/** Mêmes règles que le back : 12 caractères au moins, 72 au plus. */
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .check(z.minLength(1, 'Saisissez votre mot de passe actuel.')),
    newPassword: z
      .string()
      .check(
        z.minLength(
          12,
          'Le mot de passe doit contenir au moins 12 caractères.',
        ),
        z.maxLength(72, 'Le mot de passe doit contenir au plus 72 caractères.'),
      ),
    confirmPassword: z.string(),
  })
  .check(
    z.refine((data) => data.confirmPassword === data.newPassword, {
      message: 'Les deux mots de passe ne correspondent pas.',
      path: ['confirmPassword'],
    }),
  );

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(changePasswordSchema, form);

    if (!result.success) {
      setErrors(result.errors);
      const [firstField] = Object.keys(result.errors);
      (form.elements.namedItem(firstField) as HTMLElement | null)?.focus();
      return;
    }

    setErrors({});
    const { currentPassword, newPassword } = result.data;
    changePassword.mutate(
      { currentPassword, newPassword },
      { onSuccess: () => form.reset() },
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      {changePassword.isError && (
        <FormAlert>{getErrorMessage(changePassword.error)}</FormAlert>
      )}
      {changePassword.isSuccess && (
        <p
          role="status"
          className="rounded-lg bg-success-soft p-3 text-success"
        >
          Votre mot de passe a été modifié.
        </p>
      )}

      <fieldset disabled={changePassword.isPending} className="space-y-5">
        <Field label="Mot de passe actuel" error={errors.currentPassword}>
          {(control) => (
            <PasswordInput
              {...control}
              name="currentPassword"
              autoComplete="current-password"
            />
          )}
        </Field>
        <Field label="Nouveau mot de passe" error={errors.newPassword}>
          {(control) => (
            <PasswordInput
              {...control}
              name="newPassword"
              autoComplete="new-password"
            />
          )}
        </Field>
        <Field
          label="Confirmer le nouveau mot de passe"
          error={errors.confirmPassword}
        >
          {(control) => (
            <PasswordInput
              {...control}
              name="confirmPassword"
              autoComplete="new-password"
            />
          )}
        </Field>
      </fieldset>

      <Button type="submit" pending={changePassword.isPending}>
        {changePassword.isPending
          ? 'Enregistrement…'
          : 'Changer le mot de passe'}
      </Button>
    </form>
  );
}
