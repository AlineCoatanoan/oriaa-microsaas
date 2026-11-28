import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';

export function useDeleteAppointment(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api<void>(`/appointments/${id}`, { method: 'DELETE' }),
    // Les listes seulement : redemander le rendez-vous supprimé renverrait une 404
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
        predicate: ({ queryKey }) => queryKey[1] !== 'detail',
      }),
  });
}
