import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDeleteTask(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api<void>(`/tasks/${id}`, { method: 'DELETE' }),
    // Marquées périmées sans rechargement immédiat : la fiche supprimée
    // renverrait une 404. Les listes se rechargent à leur prochain affichage.
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        refetchType: 'none',
      }),
  });
}
