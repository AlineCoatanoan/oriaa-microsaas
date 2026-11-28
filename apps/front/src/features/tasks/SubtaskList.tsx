import { Plus, X } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Subtask, TaskDetails } from './types';
import {
  useAddSubtask,
  useDeleteSubtask,
  useToggleSubtask,
} from './useSubtasks';

/** Même limite que l'API. */
const MAX_LABEL_LENGTH = 50;

/** Sous-tâches d'une tâche : progression, cases à cocher, ajout et suppression. */
export function SubtaskList({ task }: { task: TaskDetails }) {
  const add = useAddSubtask(task.id);
  const remove = useDeleteSubtask(task.id);
  const [label, setLabel] = useState('');
  const [labelError, setLabelError] = useState<string>();
  const labelErrorId = useId();

  const { subtasks } = task;
  const doneCount = subtasks.filter((subtask) => subtask.isCompleted).length;
  // Tâche archivée : lecture seule
  const isReadOnly = task.isArchived;
  const error = add.error ?? remove.error;

  function handleAdd(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setLabelError('Saisissez la sous-tâche.');
      return;
    }
    setLabelError(undefined);
    add.mutate(trimmed, { onSuccess: () => setLabel('') });
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <CardTitle>Sous-tâches</CardTitle>
        {subtasks.length > 0 && (
          <p className="font-medium">
            {doneCount} / {subtasks.length}
            <span className="sr-only"> terminées</span>
          </p>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="h-2 rounded-full bg-page" aria-hidden="true">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${(doneCount / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      {error && <FormAlert>{getErrorMessage(error)}</FormAlert>}

      {subtasks.length === 0 ? (
        <p className="text-muted">Aucune sous-tâche.</p>
      ) : (
        <ul className="divide-y divide-border">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2 py-1">
              <SubtaskCheckbox
                taskId={task.id}
                subtask={subtask}
                disabled={isReadOnly}
              />
              {!isReadOnly && (
                <Tooltip text="Supprimer">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Supprimer la sous-tâche « ${subtask.label} »`}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(subtask.id)}
                    className="border-0 text-muted"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </Tooltip>
              )}
            </li>
          ))}
        </ul>
      )}

      {!isReadOnly && (
        <form noValidate onSubmit={handleAdd} className="space-y-1">
          <div className="flex gap-2">
            <Input
              aria-label="Nouvelle sous-tâche"
              aria-invalid={labelError ? true : undefined}
              aria-describedby={labelError ? labelErrorId : undefined}
              placeholder="Nouvelle sous-tâche…"
              maxLength={MAX_LABEL_LENGTH}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
            <Button type="submit" variant="outline" pending={add.isPending}>
              <Plus className="size-4" aria-hidden="true" />
              Ajouter
            </Button>
          </div>
          {labelError && (
            <p id={labelErrorId} className="text-sm text-danger">
              {labelError}
            </p>
          )}
        </form>
      )}
    </Card>
  );
}

type SubtaskCheckboxProps = {
  taskId: number;
  subtask: Subtask;
  disabled: boolean;
};

/** Case à cocher d'une sous-tâche, enregistrée dès le clic. */
function SubtaskCheckbox({ taskId, subtask, disabled }: SubtaskCheckboxProps) {
  const toggle = useToggleSubtask(taskId);
  // Affiche tout de suite le nouvel état, sans attendre la réponse de l'API
  const [checked, setChecked] = useState<boolean>();
  const isChecked = checked ?? subtask.isCompleted;

  return (
    <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={isChecked}
        disabled={disabled || toggle.isPending}
        onChange={(event) => {
          setChecked(event.target.checked);
          toggle.mutate(
            { id: subtask.id, isCompleted: event.target.checked },
            // Réussite : la fiche rechargée prend le relais ; échec : retour à l'état initial
            { onSettled: () => setChecked(undefined) },
          );
        }}
        className="size-5 shrink-0 accent-interaction"
      />
      <span
        className={cn('break-words', isChecked && 'text-muted line-through')}
      >
        {subtask.label}
      </span>
      {toggle.isError && (
        <span className="text-sm text-danger">
          {getErrorMessage(toggle.error)}
        </span>
      )}
    </label>
  );
}
