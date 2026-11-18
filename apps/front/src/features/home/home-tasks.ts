import { isCompleted } from '@/features/tasks/filter-tasks';
import { TASK_PRIORITIES, type Task } from '@/features/tasks/types';

/** Rang d'une priorité : plus il est grand, plus la tâche est prioritaire. */
const priorityRank = (task: Task) => TASK_PRIORITIES.indexOf(task.priority);

/** Tâches à traiter aujourd'hui : en retard ou à échéance du jour, les plus anciennes puis les plus prioritaires d'abord. */
export function selectTodayTasks(tasks: Task[], today: string) {
  return tasks
    .filter(
      (task): task is Task & { dueDate: string } =>
        !isCompleted(task) && task.dueDate !== null && task.dueDate <= today,
    )
    .sort(
      (a, b) =>
        a.dueDate.localeCompare(b.dueDate) || priorityRank(b) - priorityRank(a),
    );
}

/** Nombre de tâches en retard et de tâches urgentes non terminées. */
export function countTaskAlerts(tasks: Task[]) {
  return {
    overdue: tasks.filter((task) => task.isOverdue).length,
    urgent: tasks.filter((task) => task.isUrgent).length,
  };
}
