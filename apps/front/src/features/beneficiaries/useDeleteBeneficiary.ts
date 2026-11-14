import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { beneficiaryQueryKey } from './useBeneficiary';

/** Supprime définitivement un bénéficiaire archivé (RGPD, admin). */
export function useDeleteBeneficiary(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api<void>(`/beneficiaries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: beneficiaryQueryKey(id) });
      // Ses tâches et rendez-vous ont pu être supprimés avec lui
      for (const queryKey of [['beneficiaries'], ['tasks'], ['appointments']]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
