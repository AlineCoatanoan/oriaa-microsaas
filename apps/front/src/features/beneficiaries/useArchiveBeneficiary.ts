import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Beneficiary } from './types';
import { beneficiaryQueryKey } from './useBeneficiary';

/** Met à jour la fiche en cache et fait recharger les listes. */
function useOnBeneficiaryChange() {
  const queryClient = useQueryClient();

  return (beneficiary: Beneficiary) => {
    queryClient.setQueryData(beneficiaryQueryKey(beneficiary.id), beneficiary);
    queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
  };
}

/** Archive un bénéficiaire : il sort de la structure à la date indiquée. */
export function useArchiveBeneficiary(id: number) {
  const onSuccess = useOnBeneficiaryChange();

  return useMutation({
    mutationFn: async (exitDate: string) => {
      const { beneficiary } = await api<{ beneficiary: Beneficiary }>(
        `/beneficiaries/${id}/archive`,
        { method: 'PATCH', body: { exitDate } },
      );
      return beneficiary;
    },
    onSuccess,
  });
}

/** Désarchive un bénéficiaire : il revient dans la structure. */
export function useUnarchiveBeneficiary(id: number) {
  const onSuccess = useOnBeneficiaryChange();

  return useMutation({
    mutationFn: async () => {
      const { beneficiary } = await api<{ beneficiary: Beneficiary }>(
        `/beneficiaries/${id}/unarchive`,
        { method: 'PATCH' },
      );
      return beneficiary;
    },
    onSuccess,
  });
}
