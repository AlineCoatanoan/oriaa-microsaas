import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  taskPriorityTones,
  taskStatusTones,
  type Task,
} from '@/features/tasks/types';
import { getErrorMessage } from '@/lib/api';
import { formatShortDate } from '@/lib/dates';
import { formatBeneficiaries } from '@/lib/format';

type TodayTasksProps = {
  tasks: (Task & { dueDate: string })[];
  query: UseQueryResult<Task[]>;
};

export function TodayTasks({ tasks, query }: TodayTasksProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <CardTitle>Mes tâches</CardTitle>
        {!query.isPending && !query.error && (
          <span className="text-muted">{tasks.length}</span>
        )}
      </div>

      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState
          message={getErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : tasks.length === 0 ? (
        <p className="py-4 text-muted">Aucune tâche à traiter aujourd'hui.</p>
      ) : (
        <div>
          <div
            aria-hidden="true"
            className="hidden justify-end gap-2 pb-1 text-xs font-semibold tracking-wide text-muted uppercase sm:flex"
          >
            <span className="w-24 text-center">Statut</span>
            <span className="w-24 text-center">Priorité</span>
          </div>
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  {/* Le lien couvre toute la ligne grâce à after:inset-0 */}
                  <Link
                    to={`/tasks/${task.id}`}
                    className="font-medium after:absolute after:inset-0 hover:underline"
                  >
                    {task.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {formatBeneficiaries(task.beneficiaries)} ·{' '}
                    {task.isOverdue ? (
                      <span className="font-medium text-danger">
                        En retard ({formatShortDate(task.dueDate)})
                      </span>
                    ) : (
                      "Aujourd'hui"
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Badge
                    tone={taskStatusTones[task.status]}
                    className="sm:w-24 sm:justify-center"
                  >
                    <span className="sr-only">Statut : </span>
                    {task.status}
                  </Badge>
                  <Badge
                    tone={taskPriorityTones[task.priority]}
                    className="sm:w-24 sm:justify-center"
                  >
                    <span className="sr-only">Priorité : </span>
                    {task.priority}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/tasks"
        className="mt-auto inline-flex items-center gap-2 self-start font-medium text-interaction hover:underline"
      >
        Voir toutes mes tâches
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
