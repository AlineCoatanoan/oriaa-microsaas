import type { Tone } from '@/components/ui/tones';
import type { BeneficiarySummary, Person } from '@/lib/types';

/** Mêmes valeurs que l'API, dans l'ordre d'avancement. */
export const TASK_STATUSES = ['À faire', 'En cours', 'Terminée'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_PRIORITIES = ['Basse', 'Normale', 'Haute'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const COMPLETED_TASK_STATUS: TaskStatus = 'Terminée';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  isOverdue: boolean;
  isUrgent: boolean;
  isArchived: boolean;
  updatedAt: string;
  assignees: Person[];
  beneficiaries: BeneficiarySummary[];
};

export type Subtask = {
  id: number;
  label: string;
  isCompleted: boolean;
};

/** Tâche complète, telle que renvoyée par GET /tasks/:id. */
export type TaskDetails = Task & {
  createdAt: string;
  createdBy: Person;
  subtasks: Subtask[];
  notes: { id: number; title: string | null }[];
};

export const taskStatusTones: Record<TaskStatus, Tone> = {
  'À faire': 'info',
  'En cours': 'warning',
  Terminée: 'success',
};

export const taskPriorityTones: Record<TaskPriority, Tone> = {
  Basse: 'info',
  Normale: 'warning',
  Haute: 'danger',
};
