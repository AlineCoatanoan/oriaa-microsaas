import type { Tone } from '@/components/ui/tones';
import type { BeneficiarySummary, Person } from '@/lib/types';

/** Mêmes valeurs que l'API, dans l'ordre d'avancement. */
export const TASK_STATUSES = ['À faire', 'En cours', 'Terminée'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = 'Basse' | 'Normale' | 'Haute';

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
