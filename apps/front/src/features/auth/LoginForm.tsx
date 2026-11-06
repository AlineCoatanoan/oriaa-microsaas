import { useState, type FormEvent } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { z } from 'zod/mini';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { getErrorMessage } from '@/lib/api';
import { validateForm, type FieldErrors } from '@/lib/form';
import { useLogin } from './useLogin';

const loginSchema = z.object({
  email: z.email('Saisissez une adresse e-mail valide.'),
  password: z.string().check(z.minLength(1, 'Saisissez votre mot de passe.')),
});

const iconClass =
  'pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted';

export function LoginForm() {
  const navigate = useNavigate();
  const login = useLogin();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(loginSchema, form);

    if (!result.success) {
      setErrors(result.errors);
      // Place le curseur sur le premier champ à corriger
      const [firstField] = Object.keys(result.errors);
      (form.elements.namedItem(firstField) as HTMLElement | null)?.focus();
      return;
    }

    setErrors({});
    login.mutate(result.data, {
      onSuccess: () => navigate('/', { replace: true }),
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      {login.isError && <FormAlert>{getErrorMessage(login.error)}</FormAlert>}

      <fieldset disabled={login.isPending} className="space-y-5">
        <Field label="Adresse e-mail" error={errors.email}>
          {(control) => (
            <div className="relative">
              <Mail className={iconClass} aria-hidden="true" />
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

        <Field label="Mot de passe" error={errors.password}>
          {(control) => (
            <div className="relative">
              <LockKeyhole className={iconClass} aria-hidden="true" />
              <PasswordInput
                {...control}
                name="password"
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                className="pl-10"
              />
            </div>
          )}
        </Field>
      </fieldset>

      <Button type="submit" pending={login.isPending} className="w-full">
        {login.isPending ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  );
}
