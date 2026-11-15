import { normalizeText } from '@/lib/search';
import { COMPLETED_TASK_STATUS, type Task } from './types';

type TaskFilters = {
  search: string;
  assigneeId?: number;
};

/** Recherche dans le titre et filtre par responsable. */
export function filterTasks(
  tasks: Task[],
  { search, assigneeId }: TaskFilters,
) {
  const term = normalizeText(search.trim());

  return tasks.filter(
    (task) =>
      normalizeText(task.title).includes(term) &&
      (assigneeId === undefined ||
        task.assignees.some(({ id }) => id === assigneeId)),
  );
}

export const isCompleted = (task: Task) =>
  task.status === COMPLETED_TASK_STATUS;

/** Échéance la plus proche d'abord (les retards en tête), sans échéance à la fin. */
export function sortByDueDate(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.dueDate === b.dueDate) return a.title.localeCompare(b.title, 'fr');
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/** Dernières tâches terminées d'abord. */
export function sortByLastUpdate(tasks: Task[]) {
  return [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
