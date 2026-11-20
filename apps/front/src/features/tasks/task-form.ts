import { z } from 'zod/mini';
import { orNull, requiredText } from '@/lib/form';
import { TASK_PRIORITIES, TASK_STATUSES } from './types';
import type { TaskUpdate } from './useSaveTask';

/** Mêmes règles que le back : titre obligatoire, au moins un responsable. */
export const taskFormSchema = z.object({
  title: requiredText(50, 'Saisissez le titre.'),
  description: z.string().check(z.trim()),
  dueDate: z.string(),
  priority: z.enum(TASK_PRIORITIES),
  status: z.optional(z.enum(TASK_STATUSES)),
  assigneeIds: z
    .array(z.string())
    .check(z.minLength(1, 'Choisissez au moins un responsable.')),
  beneficiaryIds: z.array(z.string()),
});

/** Champs à plusieurs valeurs, à lire en liste (voir validateForm). */
export const taskFormLists = ['assigneeIds', 'beneficiaryIds'];

type TaskFormValues = z.infer<typeof taskFormSchema>;

/** Prépare les données pour l'API. */
export function toTaskPayload(values: TaskFormValues): TaskUpdate {
  return {
    title: values.title,
    description: orNull(values.description),
    dueDate: orNull(values.dueDate),
    priority: values.priority,
    ...(values.status && { status: values.status }),
    assigneeIds: values.assigneeIds.map(Number),
    beneficiaryIds: values.beneficiaryIds.map(Number),
  };
}
