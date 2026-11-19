import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus } from './types';

/** Champs modifiables d'une tâche : seuls ceux envoyés changent. */
export type TaskUpdate = Partial<{
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: number[];
  beneficiaryIds: number[];
}>;

export function useUpdateTask(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskUpdate) => {
      const { task } = await api<{ task: Task }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: data,
      });
      return task;
    },
    // Recharge toutes les listes de tâches (page Tâches, accueil, fiches)
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}
