import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Archive un compte, ou le supprime (RGPD) s'il est déjà archivé.
 * Le nom de la personne apparaît partout (tâches, notes, planning…) :
 * tout le cache est rechargé.
 */
export function useArchiveUser(id: number, action: 'archive' | 'delete') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      action === 'archive'
        ? api<unknown>(`/users/${id}/archive`, { method: 'PATCH' })
        : api<unknown>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
