import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod/mini';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { PasswordInput } from '@/components/ui/password-input';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import { AuthLayout } from './AuthLayout';
import {
  NEW_PASSWORD_HINT,
  newPassword,
  PASSWORDS_DIFFER,
} from './password-rules';
import { useResetPassword } from './usePasswordReset';

const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .check(
    z.refine((data) => data.confirmPassword === data.password, {
      message: PASSWORDS_DIFFER,
      path: ['confirmPassword'],
    }),
  );

/** Lien vers une nouvelle demande, quand le lien reçu ne marche pas. */
function NewRequestLink() {
  return (
    <p className="text-sm text-structure">
      Lien expiré ou déjà utilisé ?{' '}
      <Link
        to="/forgot-password"
        className="font-medium text-interaction underline"
      >
        Faire une nouvelle demande
      </Link>
    </p>
  );
}

/** Ouverte depuis le lien de l'e-mail : choix d'un nouveau mot de passe. */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const reset = useResetPassword();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const result = validateForm(resetPasswordSchema, form);

    if (!result.success) {
      setErrors(result.errors);
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    reset.mutate(
      { token, password: result.data.password },
      {
        // Retour à la connexion, avec un message de confirmation
        onSuccess: () =>
          navigate('/login', {
            replace: true,
            state: {
              message:
                'Votre mot de passe a été modifié. Vous pouvez vous connecter.',
            },
          }),
      },
    );
  }

  return (
    <AuthLayout title="Nouveau mot de passe – Oriaa">
      <BackLink to="/login">Retour à la connexion</BackLink>

      <div className="space-y-2 text-structure">
        <h1>Nouveau mot de passe</h1>
        {token && <p>Choisissez le nouveau mot de passe de votre compte.</p>}
      </div>

      {!token ? (
        // Lien coupé ou copié en partie : il manque le jeton
        <div className="space-y-3">
          <FormAlert>Ce lien est incomplet.</FormAlert>
          <NewRequestLink />
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {reset.isError && (
            <FormAlert>{getErrorMessage(reset.error)}</FormAlert>
          )}

          <fieldset disabled={reset.isPending} className="space-y-5">
            <Field
              label="Nouveau mot de passe"
              hint={NEW_PASSWORD_HINT}
              error={errors.password}
            >
              {(control) => (
                <PasswordInput
                  {...control}
                  name="password"
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

          <Button type="submit" pending={reset.isPending} className="w-full">
            {reset.isPending
              ? 'Enregistrement…'
              : 'Enregistrer le mot de passe'}
          </Button>
          <NewRequestLink />
        </form>
      )}
    </AuthLayout>
  );
}
