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
} from './types';
import { useUpdateTask } from './useUpdateTask';

type Field = 'status' | 'priority';

/** Champs modifiables directement, sans passer par le formulaire. */
const fields: Record<
  Field,
  { label: string; options: readonly string[]; tones: Record<string, Tone> }
> = {
  status: {
    label: 'Statut',
    options: TASK_STATUSES,
    tones: taskStatusTones,
  },
  priority: {
    label: 'Priorité',
    options: TASK_PRIORITIES,
    tones: taskPriorityTones,
  },
};

type TaskFieldSelectProps = {
  task: Task;
  field: Field;
  disabled?: boolean;
  /** Message à annoncer après la modification (réussie ou non). */
  onResult: (result: ActionResult) => void;
};

/** Change le statut ou la priorité d'une tâche (liste et fiche). */
export function TaskFieldSelect({
  task,
  field,
  disabled = false,
  onResult,
}: TaskFieldSelectProps) {
  const update = useUpdateTask(task.id);
  const { label, options, tones } = fields[field];
  // Pendant l'envoi, on affiche déjà la nouvelle valeur
  const value = (update.isPending && update.variables[field]) || task[field];

  return (
    <Select
      aria-label={`${label} de la tâche « ${task.title} »`}
      tone={tones[value]}
      value={value}
      disabled={disabled || update.isPending}
      onChange={(event) => {
        const newValue = event.target.value;
        update.mutate(
          { [field]: newValue },
          {
            onSuccess: () =>
              onResult({
                message: `Tâche « ${task.title} » : ${label.toLowerCase()} ${newValue}.`,
                isError: false,
              }),
            onError: (error) =>
              onResult({ message: getErrorMessage(error), isError: true }),
          },
        );
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
