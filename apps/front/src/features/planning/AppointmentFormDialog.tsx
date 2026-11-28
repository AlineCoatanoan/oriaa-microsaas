import { useState, type SubmitEvent } from 'react';
import { Button } from '@/components/ui/button';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { QueryState } from '@/components/ui/query-state';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/features/auth/useSession';
import { useBeneficiaries } from '@/features/beneficiaries/useBeneficiaries';
import { useAssignableUsers } from '@/features/users/useAssignableUsers';
import { getErrorMessage } from '@/lib/api';
import { toDateKey, toTimeKey } from '@/lib/dates';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import { formatBeneficiaryName } from '@/lib/format';
import { withCurrent } from '@/lib/options';
import {
  appointmentFormLists,
  appointmentFormSchema,
  toAppointmentPayload,
} from './appointment-form';
import type { Appointment } from './types';
import { useSaveAppointment } from './useSaveAppointment';

/** Durée proposée pour un nouveau rendez-vous, en minutes. */
const DEFAULT_DURATION = 60;

type AppointmentFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Absent : nouveau rendez-vous. */
  appointment?: Appointment;
  /** Nouveau rendez-vous : début proposé (créneau cliqué, ou jour affiché). */
  defaultStart: Date;
  /** Nouveau rendez-vous depuis une fiche : ce bénéficiaire est coché. */
  defaultBeneficiaryIds?: number[];
  onSaved: (appointment: Appointment) => void;
};

/** Créer ou modifier un rendez-vous, dans une fenêtre. */
export function AppointmentFormDialog({
  open,
  onClose,
  appointment,
  defaultStart,
  defaultBeneficiaryIds = [],
  onSaved,
}: AppointmentFormDialogProps) {
  const save = useSaveAppointment(appointment?.id);
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (save.isPending) return;
    save.reset();
    setErrors({});
    onClose();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(appointmentFormSchema, form, {
      lists: appointmentFormLists,
    });

    if (!result.success) {
      setErrors(result.errors);
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    save.mutate(toAppointmentPayload(result.data), { onSuccess: onSaved });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
      size="large"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
        {save.isError && <FormAlert>{getErrorMessage(save.error)}</FormAlert>}

        <fieldset disabled={save.isPending}>
          <AppointmentFields
            appointment={appointment}
            defaultStart={defaultStart}
            defaultBeneficiaryIds={defaultBeneficiaryIds}
            errors={errors}
          />
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

type AppointmentFieldsProps = {
  appointment?: Appointment;
  defaultStart: Date;
  defaultBeneficiaryIds: number[];
  errors: FieldErrors;
};

function AppointmentFields({
  appointment,
  defaultStart,
  defaultBeneficiaryIds,
  errors,
}: AppointmentFieldsProps) {
  const user = useCurrentUser();
  const { query: usersQuery, users } = useAssignableUsers();
  const beneficiariesQuery = useBeneficiaries({ archived: false });

  const start = appointment ? new Date(appointment.startAt) : defaultStart;
  const end = appointment
    ? new Date(appointment.endAt)
    : new Date(start.getTime() + DEFAULT_DURATION * 60_000);

  // Une personne déjà en charge reste proposée, même si elle ne l'est plus
  const userOptions = withCurrent(
    users.map(({ id, firstName, lastName }) => ({
      id,
      label: `${firstName} ${lastName}`,
    })),
    appointment ? [appointment.user] : [],
    ({ id, name }) => ({ id, label: name }),
  );

  const beneficiaryOptions = withCurrent(
    (beneficiariesQuery.data ?? [])
      .map((beneficiary) => ({
        id: beneficiary.id,
        label: formatBeneficiaryName(beneficiary),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
    appointment?.beneficiaries ?? [],
    (beneficiary) => ({
      id: beneficiary.id,
      label: `${formatBeneficiaryName(beneficiary)} (archivé)`,
    }),
  );

  return (
    <div className="space-y-4">
      <Field label="Motif" error={errors.title} required>
        {(control) => (
          <Input
            {...control}
            name="title"
            defaultValue={appointment?.title}
            autoComplete="off"
            required
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" error={errors.date} required>
          {(control) => (
            <Input
              {...control}
              name="date"
              type="date"
              defaultValue={toDateKey(start)}
              required
            />
          )}
        </Field>
        {/* Pas de 15 minutes, comme la grille du planning */}
        <Field label="Début" error={errors.startTime} required>
          {(control) => (
            <Input
              {...control}
              name="startTime"
              type="time"
              step={900}
              defaultValue={toTimeKey(start)}
              required
            />
          )}
        </Field>
        <Field label="Fin" error={errors.endTime} required>
          {(control) => (
            <Input
              {...control}
              name="endTime"
              type="time"
              step={900}
              defaultValue={toTimeKey(end)}
              required
            />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QueryState query={usersQuery}>
          <Field label="Personne en charge" error={errors.userId} required>
            {(control) => (
              <Select
                {...control}
                name="userId"
                defaultValue={appointment?.user.id ?? user.id}
                required
              >
                {userOptions.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </QueryState>
        <Field label="Lieu" error={errors.location}>
          {(control) => (
            <Input
              {...control}
              name="location"
              defaultValue={appointment?.location ?? ''}
              autoComplete="off"
            />
          )}
        </Field>
      </div>

      <QueryState query={beneficiariesQuery}>
        <CheckboxGroup
          legend="Bénéficiaires concernés (facultatif)"
          name="beneficiaryIds"
          options={beneficiaryOptions}
          defaultChecked={
            appointment?.beneficiaries.map(({ id }) => id) ??
            defaultBeneficiaryIds
          }
          searchLabel="Rechercher un bénéficiaire"
          emptyMessage="Aucun bénéficiaire actif."
        />
      </QueryState>

      <Field label="Description" error={errors.description}>
        {(control) => (
          <Textarea
            {...control}
            name="description"
            defaultValue={appointment?.description ?? ''}
            rows={4}
          />
        )}
      </Field>
    </div>
  );
}
