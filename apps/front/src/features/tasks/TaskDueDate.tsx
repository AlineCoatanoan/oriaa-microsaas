import { daysUntil, formatDate } from '@/lib/dates';
import type { Task } from './types';

/** « Aujourd'hui », « Demain », « Dans 3 jours », « En retard · 12/11/2026 »… */
export function TaskDueDate({ task }: { task: Task }) {
  if (task.dueDate === null) {
    return <span className="text-muted">Sans échéance</span>;
  }
  if (task.isOverdue) {
    return (
      <span className="font-medium text-danger">
        En retard · {formatDate(task.dueDate)}
      </span>
    );
  }

  const days = daysUntil(task.dueDate);
  if (days === 0) return <span className="font-medium">Aujourd'hui</span>;
  if (days === 1) return <span className="font-medium">Demain</span>;
  if (days > 1 && days < 7) return <>Dans {days} jours</>;
  return <>{formatDate(task.dueDate)}</>;
}
