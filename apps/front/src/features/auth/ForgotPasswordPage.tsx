import { Mail } from 'lucide-react';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { z } from 'zod/mini';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input, inputIconClass } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import { AuthLayout } from './AuthLayout';
import { useForgotPassword } from './usePasswordReset';

const forgotPasswordSchema = z.object({
  email: z.email('Saisissez une adresse e-mail valide.'),
});

/** Mot de passe oublié : demande d'un lien de réinitialisation par e-mail. */
export function ForgotPasswordPage() {
  const request = useForgotPassword();
  const [errors, setErrors] = useState<FieldErrors>({});
  // Adresse à qui le lien a été demandé : la page affiche alors la suite
  const [sentTo, setSentTo] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Le formulaire disparaît : le focus va sur le nouveau titre, lu en premier.
  // Effet nécessaire : le titre change au rendu suivant.
  useEffect(() => {
    if (sentTo) headingRef.current?.focus();
  }, [sentTo]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(forgotPasswordSchema, form);

    if (!result.success) {
      setErrors(result.errors);
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    const { email } = result.data;
    request.mutate(email, { onSuccess: () => setSentTo(email) });
  }

  return (
    <AuthLayout title="Mot de passe oublié – Oriaa">
      <BackLink to="/login">Retour à la connexion</BackLink>

      <div className="space-y-2 text-structure">
        <h1 ref={headingRef} tabIndex={-1} className="outline-none">
          {sentTo ? 'Vérifiez vos e-mails' : 'Mot de passe oublié'}
        </h1>
        {!sentTo && (
          <p>
            Saisissez l'adresse e-mail de votre compte : vous recevrez un lien
            pour choisir un nouveau mot de passe.
          </p>
        )}
      </div>

      {sentTo ? (
        // Même message que le compte existe ou non (rien n'est révélé)
        <div className="space-y-3 text-structure">
          <p>
            Si un compte actif correspond à <strong>{sentTo}</strong>, un e-mail
            vient de lui être envoyé. Le lien qu'il contient est valable 30
            minutes.
          </p>
          <p className="text-sm text-muted">
            Rien reçu ? Vérifiez vos courriers indésirables, ou refaites une
            demande dans quelques minutes.
          </p>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {request.isError && (
            <FormAlert>{getErrorMessage(request.error)}</FormAlert>
          )}

          <fieldset disabled={request.isPending}>
            <Field label="Adresse e-mail" error={errors.email}>
              {(control) => (
                <div className="relative">
                  <Mail className={inputIconClass} aria-hidden="true" />
                  <Input
                    {...control}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="votre@email.fr"
                    className="pl-10"
                  />
                </div>
              )}
            </Field>
          </fieldset>

          <Button type="submit" pending={request.isPending} className="w-full">
            {request.isPending ? 'Envoi…' : 'Recevoir le lien'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
