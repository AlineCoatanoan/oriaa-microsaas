import { useNavigate } from 'react-router';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Task } from './types';
import { useDeleteTask } from './useDeleteTask';

type DeleteTaskDialogProps = {
  task: Task;
  open: boolean;
  onClose: () => void;
};

/** Confirmation avant la suppression d'une tâche et de ses sous-tâches. */
export function DeleteTaskDialog({
  task,
  open,
  onClose,
}: DeleteTaskDialogProps) {
  const navigate = useNavigate();
  const remove = useDeleteTask(task.id);

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        remove.reset();
        onClose();
      }}
      title="Supprimer la tâche"
      confirmLabel="Supprimer"
      isPending={remove.isPending}
      error={remove.error}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () =>
            navigate('/tasks', {
              replace: true,
              state: { message: `La tâche « ${task.title} » a été supprimée.` },
            }),
        })
      }
    >
      <p>
        La tâche <strong>{task.title}</strong> sera supprimée avec ses
        sous-tâches. Les notes liées sont conservées.
      </p>
      <p className="font-medium text-danger">Cette action est irréversible.</p>
    </ConfirmDialog>
  );
}
