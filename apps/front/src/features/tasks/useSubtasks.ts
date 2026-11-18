import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/** Après chaque changement : recharge la fiche et les listes de tâches. */
function useRefreshTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
}

export function useAddSubtask(taskId: number) {
  const onSuccess = useRefreshTasks();

  return useMutation({
    mutationFn: (label: string) =>
      api(`/tasks/${taskId}/subtasks`, { method: 'POST', body: { label } }),
    onSuccess,
  });
}

export function useToggleSubtask(taskId: number) {
  const onSuccess = useRefreshTasks();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      api(`/tasks/${taskId}/subtasks/${id}`, {
        method: 'PATCH',
        body: { isCompleted },
      }),
    onSuccess,
  });
}

export function useDeleteSubtask(taskId: number) {
  const onSuccess = useRefreshTasks();

  return useMutation({
    mutationFn: (id: number) =>
      api<void>(`/tasks/${taskId}/subtasks/${id}`, { method: 'DELETE' }),
    onSuccess,
  });
}
