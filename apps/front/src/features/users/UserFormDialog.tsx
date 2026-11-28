import { useState, type SubmitEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { NEW_PASSWORD_HINT } from '@/features/auth/password-rules';
import { ROLES, roleLabels } from '@/features/auth/roles';
import { useCurrentUser } from '@/features/auth/useSession';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import type { User } from './types';
import { useSaveUser } from './useSaveUser';
import {
  newUserFormSchema,
  userFormSchema,
  type NewUserPayload,
  type UserPayload,
} from './user-form';

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Absent : nouveau compte. */
  user?: User;
  onSaved: (user: User) => void;
};

/** Créer un compte (avec un mot de passe provisoire), ou modifier sa fonction et son rôle. */
export function UserFormDialog({
  open,
  onClose,
  user,
  onSaved,
}: UserFormDialogProps) {
  const currentUser = useCurrentUser();
  const save = useSaveUser(user?.id);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Règle métier : un admin ne peut pas retirer son propre rôle d'admin
  const isSelf = user?.id === currentUser.id;

  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (save.isPending) return;
    save.reset();
    setErrors({});
    onClose();
  }

  function showErrors(form: HTMLFormElement, fieldErrors: FieldErrors) {
    setErrors(fieldErrors);
    focusFirstError(form, fieldErrors);
  }

  function send(data: NewUserPayload | UserPayload) {
    setErrors({});
    save.mutate(data, { onSuccess: onSaved });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    const result = user
      ? validateForm(userFormSchema, form)
      : validateForm(newUserFormSchema, form);
    if (!result.success) return showErrors(form, result.errors);
    send(result.data);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={user ? 'Modifier le compte' : 'Ajouter un compte'}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
        {save.isError && <FormAlert>{getErrorMessage(save.error)}</FormAlert>}

        <fieldset disabled={save.isPending} className="space-y-4">
          {user ? (
            <p>
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="block text-sm break-all text-muted">
                {user.email}
              </span>
            </p>
          ) : (
            <>
              <Field label="Prénom" error={errors.firstName} required>
                {(control) => (
                  <Input
                    {...control}
                    name="firstName"
                    autoComplete="off"
                    required
                  />
                )}
              </Field>
              <Field label="Nom" error={errors.lastName} required>
                {(control) => (
                  <Input
                    {...control}
                    name="lastName"
                    autoComplete="off"
                    required
                  />
                )}
              </Field>
              <Field label="Adresse e-mail" error={errors.email} required>
                {(control) => (
                  <Input
                    {...control}
                    name="email"
                    type="email"
                    autoComplete="off"
                    required
                  />
                )}
              </Field>
            </>
          )}

          <Field label="Fonction" error={errors.job} required>
            {(control) => (
              <Input
                {...control}
                name="job"
                defaultValue={user?.job}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <Field
            label="Rôle"
            hint={
              isSelf
                ? 'Vous ne pouvez pas modifier votre propre rôle.'
                : 'Un administrateur gère les comptes et voit tous les plannings ; il ne suit pas de bénéficiaires.'
            }
            error={errors.role}
            required
          >
            {(control) => (
              <Select
                {...control}
                name="role"
                defaultValue={user?.role ?? ROLES.USER}
                disabled={isSelf}
                required
              >
                {Object.values(ROLES).map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {!user && (
            <Field
              label="Mot de passe provisoire"
              hint={`${NEW_PASSWORD_HINT} Transmettez-le à la personne : elle le changera depuis son profil.`}
              error={errors.password}
              required
            >
              {(control) => (
                <PasswordInput
                  {...control}
                  name="password"
                  autoComplete="new-password"
                  required
                />
              )}
            </Field>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" pending={save.isPending}>
            {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
