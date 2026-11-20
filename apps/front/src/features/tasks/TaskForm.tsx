import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
  CheckboxGroup,
  type CheckboxOption,
} from '@/components/ui/checkbox-group';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { QueryState } from '@/components/ui/query-state';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { isAdmin, ROLES } from '@/features/auth/roles';
import { useCurrentUser } from '@/features/auth/useSession';
import { useBeneficiaries } from '@/features/beneficiaries/useBeneficiaries';
import { useUsers } from '@/features/users/useUsers';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import { formatBeneficiaryName } from '@/lib/format';
import type { Person } from '@/lib/types';
import { taskFormLists, taskFormSchema, toTaskPayload } from './task-form';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskDetails,
  type TaskPriority,
} from './types';
import { useSaveTask } from './useSaveTask';

const DEFAULT_PRIORITY: TaskPriority = 'Normale';

/** Ajoute en tête les éléments déjà liés qui ne sont plus proposés. */
function withCurrent<T extends { id: number }>(
  options: CheckboxOption[],
  current: T[],
  toOption: (item: T) => CheckboxOption,
) {
  const kept = current
    .filter(({ id }) => !options.some((option) => option.id === id))
    .map(toOption);
  return [...kept, ...options];
}

type TaskFormProps = {
  /** Absent : création d'une nouvelle tâche. */
  task?: TaskDetails;
};

export function TaskForm({ task }: TaskFormProps) {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const usersQuery = useUsers();
  const beneficiariesQuery = useBeneficiaries({ archived: false });
  const save = useSaveTask(task?.id);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Règle métier : un utilisateur ne peut pas confier une tâche à un admin
  const users = usersQuery.data ?? [];

  // Un responsable déjà lié reste affiché, même s'il n'est plus proposé
  function keptAssigneeLabel({ id, name, status }: Person) {
    if (status === 'archived') return `${name} (compte archivé)`;
    const isAdminAccount = users.some(
      (other) => other.id === id && other.role === ROLES.ADMIN,
    );
    return isAdminAccount ? `${name} (administrateur)` : name;
  }

  const assigneeOptions = withCurrent(
    users
      .filter(({ role }) => isAdmin(user) || role === ROLES.USER)
      .map(({ id, firstName, lastName }) => ({
        id,
        label: `${firstName} ${lastName}`,
      })),
    task?.assignees ?? [],
    (person) => ({ id: person.id, label: keptAssigneeLabel(person) }),
  );

  const beneficiaryOptions = withCurrent(
    (beneficiariesQuery.data ?? [])
      .map((beneficiary) => ({
        id: beneficiary.id,
        label: formatBeneficiaryName(beneficiary),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
    task?.beneficiaries ?? [],
    (beneficiary) => ({
      id: beneficiary.id,
      label: `${formatBeneficiaryName(beneficiary)} (archivé)`,
    }),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(taskFormSchema, form, {
      lists: taskFormLists,
    });

    if (!result.success) {
      setErrors(result.errors);
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    save.mutate(toTaskPayload(result.data), {
      onSuccess: ({ id }) => navigate(`/tasks/${id}`, { replace: true }),
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">
        Les champs marqués d'un astérisque (*) sont obligatoires.
      </p>
      {save.isError && <FormAlert>{getErrorMessage(save.error)}</FormAlert>}

      <fieldset disabled={save.isPending} className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 lg:row-span-2">
          <CardTitle>Tâche</CardTitle>
          <Field label="Titre" error={errors.title} required>
            {(control) => (
              <Input
                {...control}
                name="title"
                defaultValue={task?.title}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <Field label="Description" error={errors.description}>
            {(control) => (
              <Textarea
                {...control}
                name="description"
                defaultValue={task?.description ?? ''}
              />
            )}
          </Field>
          <Field label="Échéance" error={errors.dueDate}>
            {(control) => (
              <Input
                {...control}
                name="dueDate"
                type="date"
                defaultValue={task?.dueDate ?? ''}
              />
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priorité" error={errors.priority}>
              {(control) => (
                <Select
                  {...control}
                  name="priority"
                  defaultValue={task?.priority ?? DEFAULT_PRIORITY}
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            {/* À la création, le statut est toujours « À faire » */}
            {task && (
              <Field label="Statut" error={errors.status}>
                {(control) => (
                  <Select {...control} name="status" defaultValue={task.status}>
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Responsables</CardTitle>
          <QueryState query={usersQuery}>
            <CheckboxGroup
              legend="Personnes chargées de la tâche"
              name="assigneeIds"
              options={assigneeOptions}
              // Création : la personne connectée est responsable par défaut
              defaultChecked={
                task ? task.assignees.map(({ id }) => id) : [user.id]
              }
              error={errors.assigneeIds}
              required
              emptyMessage="Aucun compte disponible."
            />
          </QueryState>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Bénéficiaires</CardTitle>
          <QueryState query={beneficiariesQuery}>
            <CheckboxGroup
              legend="Bénéficiaires concernés (facultatif)"
              name="beneficiaryIds"
              options={beneficiaryOptions}
              defaultChecked={task?.beneficiaries.map(({ id }) => id) ?? []}
              searchLabel="Rechercher un bénéficiaire"
              emptyMessage="Aucun bénéficiaire actif."
            />
          </QueryState>
        </Card>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <ButtonLink
          variant="outline"
          to={task ? `/tasks/${task.id}` : '/tasks'}
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
