import { COMPLETED_TASK_STATUS, type Task } from '@/features/tasks/types';

const priorityOrder = { Haute: 0, Normale: 1, Basse: 2 };

/** Tâches à traiter aujourd'hui : en retard ou à échéance du jour, les plus anciennes puis les plus prioritaires d'abord. */
export function selectTodayTasks(tasks: Task[], today: string) {
  return tasks
    .filter(
      (task): task is Task & { dueDate: string } =>
        task.status !== COMPLETED_TASK_STATUS &&
        task.dueDate !== null &&
        task.dueDate <= today,
    )
    .sort(
      (a, b) =>
        a.dueDate.localeCompare(b.dueDate) ||
        priorityOrder[a.priority] - priorityOrder[b.priority],
    );
}

/** Nombre de tâches en retard et de tâches prioritaires non terminées. */
export function countTaskAlerts(tasks: Task[]) {
  return {
    overdue: tasks.filter((task) => task.isOverdue).length,
    urgent: tasks.filter((task) => task.isUrgent).length,
  };
}
