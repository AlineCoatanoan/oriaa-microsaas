import type { Tone } from '@/components/ui/tones';
import type { BeneficiarySummary, Person } from '@/lib/types';

export type TaskStatus = 'À faire' | 'En cours' | 'Terminée';
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
