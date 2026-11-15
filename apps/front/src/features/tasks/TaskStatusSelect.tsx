import { Select } from '@/components/ui/select';
import { getErrorMessage } from '@/lib/api';
import { TASK_STATUSES, taskStatusTones, type Task } from './types';
import { useUpdateTask } from './useUpdateTask';

type TaskStatusSelectProps = {
  task: Task;
  /** Message à annoncer après la modification (réussie ou non). */
  onResult: (result: { message: string; isError: boolean }) => void;
};

/** Change le statut d'une tâche directement, sans passer par le formulaire. */
export function TaskStatusSelect({ task, onResult }: TaskStatusSelectProps) {
  const update = useUpdateTask(task.id);

  return (
    <Select
      aria-label={`Statut de la tâche « ${task.title} »`}
      tone={taskStatusTones[task.status]}
      // Pendant l'envoi, on affiche déjà le nouveau statut
      value={update.isPending ? update.variables.status : task.status}
      disabled={update.isPending}
      onChange={(event) => {
        const status = event.target.value as Task['status'];
        update.mutate(
          { status },
          {
            onSuccess: () =>
              onResult({
                message: `Tâche « ${task.title} » : ${status}.`,
                isError: false,
              }),
            onError: (error) =>
              onResult({ message: getErrorMessage(error), isError: true }),
          },
        );
      }}
    >
      {TASK_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </Select>
  );
}
