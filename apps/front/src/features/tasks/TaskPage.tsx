import { Archive, Check, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { DetailList } from '@/components/ui/detail-list';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { PersonName } from '@/features/users/PersonName';
import { ApiError, getErrorMessage } from '@/lib/api';
import { formatDate, toDateKey } from '@/lib/dates';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { isCompleted } from './filter-tasks';
import { SubtaskList } from './SubtaskList';
import { TaskDueDate } from './TaskDueDate';
import { TaskFieldSelect } from './TaskFieldSelect';
import { COMPLETED_TASK_STATUS, type TaskDetails } from './types';
import { useTask } from './useTask';
import { useUpdateTask } from './useUpdateTask';

export function TaskPage() {
  const id = Number(useParams().id);
  const query = useTask(id);

  if (query.isPending) return <LoadingState />;
  if (query.error) {
    const isNotFound =
      query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="space-y-4">
        <BackLink to="/tasks">Tâches</BackLink>
        <ErrorState
          message={getErrorMessage(query.error)}
          // Réessayer ne sert à rien si la tâche n'existe pas
          onRetry={isNotFound ? undefined : () => query.refetch()}
        />
      </div>
    );
  }

  return <TaskView task={query.data} />;
}

function TaskView({ task }: { task: TaskDetails }) {
  const update = useUpdateTask(task.id);
  const [result, setResult] = useState<ActionResult | undefined>();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  function handleComplete() {
    update.mutate(
      { status: COMPLETED_TASK_STATUS },
      {
        onSuccess: () => {
          setResult({ message: 'Tâche terminée.', isError: false });
          // Le bouton cliqué disparaît : le focus revient sur le titre
          headingRef.current?.focus();
        },
        onError: (error) =>
          setResult({ message: getErrorMessage(error), isError: true }),
      },
    );
  }

  return (
    <div className="space-y-6">
      <title>{`${task.title} – Oriaa`}</title>
      <BackLink to="/tasks">Tâches</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="break-words outline-none"
          >
            {task.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted">
            <div className="w-32">
              <TaskFieldSelect
                task={task}
                field="status"
                disabled={task.isArchived}
                onResult={setResult}
              />
            </div>
            <div className="w-28">
              <TaskFieldSelect
                task={task}
                field="priority"
                disabled={task.isArchived}
                onResult={setResult}
              />
            </div>
            <span>
              Créée le {formatDate(toDateKey(new Date(task.createdAt)))} par{' '}
              <PersonName person={task.createdBy} />
            </span>
          </div>
        </div>

        {/* Une tâche archivée est en lecture seule */}
        {!task.isArchived && (
          <div className="flex flex-wrap gap-3">
            {!isCompleted(task) && (
              <Button onClick={handleComplete} pending={update.isPending}>
                <Check className="size-4" aria-hidden="true" />
                Marquer terminée
              </Button>
            )}
            <Button
              variant="danger"
              size="icon"
              aria-label="Supprimer la tâche"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="size-5" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      <ResultMessage result={result} />

      {task.isArchived && (
        <p className="flex items-center gap-2 rounded-lg bg-info-soft p-4 text-interaction">
          <Archive className="size-5 shrink-0" aria-hidden="true" />
          Tâche archivée : tous ses bénéficiaires sont archivés. Elle est en
          lecture seule.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <CardTitle>Description</CardTitle>
            {task.description ? (
              <p className="break-words whitespace-pre-line">
                {task.description}
              </p>
            ) : (
              <p className="text-muted">Aucune description.</p>
            )}
          </Card>
          <SubtaskList task={task} />
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <CardTitle>Informations</CardTitle>
            <DetailList
              details={[
                {
                  label: 'Bénéficiaires',
                  value: task.beneficiaries.length > 0 && (
                    <ul>
                      {task.beneficiaries.map(({ id, firstName, lastName }) => (
                        <li key={id}>
                          <Link
                            to={`/beneficiaries/${id}`}
                            className="text-interaction hover:underline"
                          >
                            {lastName} {firstName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                { label: 'Échéance', value: <TaskDueDate task={task} /> },
                {
                  label:
                    task.assignees.length > 1 ? 'Responsables' : 'Responsable',
                  value: (
                    <ul>
                      {task.assignees.map((person) => (
                        <li key={person.id}>
                          <PersonName person={person} />
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <CardTitle>Notes liées</CardTitle>
              {task.notes.length > 0 && (
                <p className="text-muted">{task.notes.length}</p>
              )}
            </div>
            {task.notes.length === 0 ? (
              <p className="text-muted">Aucune note liée.</p>
            ) : (
              // Lien vers la note ajouté avec les notes (#89)
              <ul className="space-y-2">
                {task.notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-page px-3 py-2">
                    {note.title ?? 'Note sans titre'}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <DeleteTaskDialog
        task={task}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
