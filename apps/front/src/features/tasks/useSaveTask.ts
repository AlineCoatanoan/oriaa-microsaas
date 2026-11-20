import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus } from './types';

/** Champs envoyés à l'API. En modification, seuls ceux envoyés changent. */
export type TaskUpdate = Partial<{
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: number[];
  beneficiaryIds: number[];
}>;

/** Crée une tâche, ou la modifie si un identifiant est fourni. */
export function useSaveTask(id?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskUpdate) => {
      const { task } = await api<{ task: Task }>(
        id ? `/tasks/${id}` : '/tasks',
        { method: id ? 'PATCH' : 'POST', body: data },
      );
      return task;
    },
    // Recharge toutes les listes de tâches (page Tâches, accueil, fiches)
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}
