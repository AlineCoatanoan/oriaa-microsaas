import type { ActionResult } from '@/components/ui/result-message';
import { Select } from '@/components/ui/select';
import type { Tone } from '@/components/ui/tones';
import { getErrorMessage } from '@/lib/api';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  taskPriorityTones,
  taskStatusTones,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from './types';
import { useSaveTask, type TaskUpdate } from './useSaveTask';

type EditableFields = Pick<TaskUpdate, 'status' | 'priority'>;

/** Un champ modifiable directement, sans passer par le formulaire. */
type FieldConfig<V extends string> = {
  label: string;
  options: readonly V[];
  tones: Record<V, Tone>;
  /** Lit la valeur du champ dans une tâche ou une modification. */
  read: (data: EditableFields) => V | undefined;
  /** Construit la modification à envoyer à l'API. */
  toUpdate: (value: V) => TaskUpdate;
};

const statusField: FieldConfig<TaskStatus> = {
  label: 'Statut',
  options: TASK_STATUSES,
  tones: taskStatusTones,
  read: (data) => data.status,
  toUpdate: (status) => ({ status }),
};

const priorityField: FieldConfig<TaskPriority> = {
  label: 'Priorité',
  options: TASK_PRIORITIES,
  tones: taskPriorityTones,
  read: (data) => data.priority,
  toUpdate: (priority) => ({ priority }),
};

type FieldSelectProps = {
  task: Task;
  disabled?: boolean;
  /** Message à annoncer après la modification (réussie ou non). */
  onResult: (result: ActionResult) => void;
};

/** Change le statut ou la priorité d'une tâche (liste et fiche). */
export function TaskFieldSelect({
  field,
  ...props
}: FieldSelectProps & { field: 'status' | 'priority' }) {
  return field === 'status' ? (
    <FieldSelect config={statusField} {...props} />
  ) : (
    <FieldSelect config={priorityField} {...props} />
  );
}

function FieldSelect<V extends string>({
  config,
  task,
  disabled = false,
  onResult,
}: FieldSelectProps & { config: FieldConfig<V> }) {
  const update = useSaveTask(task.id);
  const { label, options, tones } = config;
  // Pendant l'envoi, on affiche déjà la nouvelle valeur
  const pendingValue = update.isPending && config.read(update.variables);
  const value = pendingValue || config.read(task);

  return (
    <Select
      aria-label={`${label} de la tâche « ${task.title} »`}
      tone={value && tones[value]}
      value={value}
      disabled={disabled || update.isPending}
      onChange={(event) => {
        const newValue = options.find(
          (option) => option === event.target.value,
        );
        if (!newValue) return;
        update.mutate(config.toUpdate(newValue), {
          onSuccess: () =>
            onResult({
              message: `Tâche « ${task.title} » : ${label.toLowerCase()} ${newValue}.`,
              isError: false,
            }),
          onError: (error) =>
            onResult({ message: getErrorMessage(error), isError: true }),
        });
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
}
