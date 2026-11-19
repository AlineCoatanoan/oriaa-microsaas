import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';

/** Supprime définitivement un bénéficiaire archivé (RGPD, admin). */
export function useDeleteBeneficiary(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api<void>(`/beneficiaries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.beneficiaries.detail(id),
      });
      // Ses tâches et rendez-vous ont pu être supprimés avec lui
      for (const queryKey of [
        queryKeys.beneficiaries.lists,
        queryKeys.tasks.all,
        queryKeys.appointments.all,
      ]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
