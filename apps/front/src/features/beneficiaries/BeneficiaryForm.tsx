import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCurrentUser } from '@/features/auth/useSession';
import { useUsers } from '@/features/users/useUsers';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import {
  beneficiaryFormSchema,
  toBeneficiaryPayload,
} from './beneficiary-form';
import { PATHWAY_STATUSES, type Beneficiary } from './types';
import { useSaveBeneficiary } from './useSaveBeneficiary';

/** Suggestions proposées, la saisie restant libre. */
const familyStatusSuggestions = [
  'Célibataire',
  'En couple',
  'Marié(e)',
  'Pacsé(e)',
  'Séparé(e)',
  'Divorcé(e)',
  'Veuf / veuve',
];

type BeneficiaryFormProps = {
  /** Absent : création d'un nouveau bénéficiaire. */
  beneficiary?: Beneficiary;
};

export function BeneficiaryForm({ beneficiary }: BeneficiaryFormProps) {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const usersQuery = useUsers();
  const save = useSaveBeneficiary(beneficiary?.id);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Les admins ne suivent pas de dossier : seuls les comptes « user » peuvent être référents
  const referentOptions = usersQuery.data?.filter(
    ({ role }) => role === 'user',
  );
  const currentReferent = beneficiary?.referent;
  // Création : la personne connectée est référente par défaut, sauf un admin qui doit choisir
  const defaultReferentId =
    currentReferent?.id ?? (user.role === 'admin' ? '' : user.id);
  // Un référent archivé n'est plus proposé : il reste affiché tant qu'il n'est pas remplacé
  const isCurrentReferentListed =
    !currentReferent ||
    referentOptions?.some(({ id }) => id === currentReferent.id);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(beneficiaryFormSchema, form);

    if (!result.success) {
      setErrors(result.errors);
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    save.mutate(toBeneficiaryPayload(result.data, beneficiary?.referent.id), {
      onSuccess: ({ id }) =>
        navigate(`/beneficiaries/${id}`, { replace: true }),
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">
        Les champs marqués d'un astérisque (*) sont obligatoires.
      </p>
      {save.isError && <FormAlert>{getErrorMessage(save.error)}</FormAlert>}

      <fieldset disabled={save.isPending} className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <CardTitle>Identité</CardTitle>
          <Field label="Nom" error={errors.lastName} required>
            {(control) => (
              <Input
                {...control}
                name="lastName"
                defaultValue={beneficiary?.lastName}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <Field label="Prénom" error={errors.firstName} required>
            {(control) => (
              <Input
                {...control}
                name="firstName"
                defaultValue={beneficiary?.firstName}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <Field label="Date de naissance" error={errors.dateOfBirth}>
            {(control) => (
              <Input
                {...control}
                name="dateOfBirth"
                type="date"
                defaultValue={beneficiary?.dateOfBirth ?? ''}
              />
            )}
          </Field>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Coordonnées</CardTitle>
          <Field label="Adresse" error={errors.address}>
            {(control) => (
              <Input
                {...control}
                name="address"
                defaultValue={beneficiary?.address ?? ''}
                autoComplete="off"
              />
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <Field label="Code postal" error={errors.postalCode}>
              {(control) => (
                <Input
                  {...control}
                  name="postalCode"
                  inputMode="numeric"
                  defaultValue={beneficiary?.postalCode ?? ''}
                  autoComplete="off"
                />
              )}
            </Field>
            <Field label="Ville" error={errors.city}>
              {(control) => (
                <Input
                  {...control}
                  name="city"
                  defaultValue={beneficiary?.city ?? ''}
                  autoComplete="off"
                />
              )}
            </Field>
          </div>
          <Field label="Téléphone" error={errors.phone}>
            {(control) => (
              <Input
                {...control}
                name="phone"
                type="tel"
                defaultValue={beneficiary?.phone ?? ''}
                autoComplete="off"
              />
            )}
          </Field>
          <Field label="Adresse e-mail" error={errors.email}>
            {(control) => (
              <Input
                {...control}
                name="email"
                type="email"
                defaultValue={beneficiary?.email ?? ''}
                autoComplete="off"
              />
            )}
          </Field>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Situation familiale</CardTitle>
          <Field label="Situation" error={errors.familyStatus}>
            {(control) => (
              <>
                <Input
                  {...control}
                  name="familyStatus"
                  list="family-status-suggestions"
                  defaultValue={beneficiary?.familyStatus ?? ''}
                  autoComplete="off"
                />
                <datalist id="family-status-suggestions">
                  {familyStatusSuggestions.map((status) => (
                    <option key={status} value={status} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          <Field label="Nombre d'enfants" error={errors.numberOfChildren}>
            {(control) => (
              <Input
                {...control}
                name="numberOfChildren"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={beneficiary?.numberOfChildren ?? ''}
              />
            )}
          </Field>
          <Field
            label="Composition du foyer"
            error={errors.householdComposition}
          >
            {(control) => (
              <Input
                {...control}
                name="householdComposition"
                placeholder="Exemple : monoparental, 3 personnes"
                defaultValue={beneficiary?.householdComposition ?? ''}
                autoComplete="off"
              />
            )}
          </Field>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Parcours</CardTitle>
          <Field label="Date d'entrée" error={errors.entryDate} required>
            {(control) => (
              <Input
                {...control}
                name="entryDate"
                type="date"
                defaultValue={beneficiary?.entryDate ?? ''}
                required
              />
            )}
          </Field>
          <Field label="Référent" error={errors.referentId} required>
            {(control) => (
              <Select
                {...control}
                // defaultValue n'est appliqué qu'au montage : on remonte la liste une fois les comptes chargés
                key={referentOptions ? 'loaded' : 'loading'}
                name="referentId"
                defaultValue={defaultReferentId}
                required
              >
                {defaultReferentId === '' && (
                  <option value="">Choisir un référent</option>
                )}
                {currentReferent && !isCurrentReferentListed && (
                  <option value={currentReferent.id}>
                    {currentReferent.status === 'archived'
                      ? `${currentReferent.name} (compte archivé)`
                      : currentReferent.name}
                  </option>
                )}
                {referentOptions?.map(({ id, firstName, lastName }) => (
                  <option key={id} value={id}>
                    {firstName} {lastName}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {/* À la création, le statut est toujours « En cours » */}
          {beneficiary && (
            <Field label="Statut du parcours" error={errors.pathwayStatus}>
              {(control) => (
                <Select
                  {...control}
                  name="pathwayStatus"
                  defaultValue={beneficiary.pathwayStatus}
                >
                  {PATHWAY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
        </Card>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <ButtonLink
          variant="outline"
          to={
            beneficiary ? `/beneficiaries/${beneficiary.id}` : '/beneficiaries'
          }
        >
          Annuler
        </ButtonLink>
        <Button type="submit" pending={save.isPending}>
          {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
