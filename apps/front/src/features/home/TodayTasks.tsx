import type { UseQueryResult } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { RowLink } from '@/components/ui/data-list';
import {
  taskPriorityTones,
  taskStatusTones,
  type Task,
} from '@/features/tasks/types';
import { formatShortDate } from '@/lib/dates';
import { formatBeneficiaries } from '@/lib/format';
import { HomeListCard } from './HomeListCard';

type TodayTasksProps = {
  tasks: (Task & { dueDate: string })[];
  query: UseQueryResult<Task[]>;
};

export function TodayTasks({ tasks, query }: TodayTasksProps) {
  return (
    <HomeListCard
      title="Mes tâches"
      query={query}
      count={tasks.length}
      emptyMessage="Aucune tâche à traiter aujourd'hui."
      link={{ to: '/tasks', label: 'Voir toutes mes tâches' }}
    >
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
                <RowLink to={`/tasks/${task.id}`}>{task.title}</RowLink>
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
    </HomeListCard>
  );
}
