import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BeneficiaryPayload } from './beneficiary-form';
import type { Beneficiary } from './types';
import { beneficiaryQueryKey } from './useBeneficiary';

/** Crée un bénéficiaire, ou le modifie si un identifiant est fourni. */
export function useSaveBeneficiary(id?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BeneficiaryPayload) => {
      const { beneficiary } = await api<{ beneficiary: Beneficiary }>(
        id ? `/beneficiaries/${id}` : '/beneficiaries',
        { method: id ? 'PATCH' : 'POST', body: payload },
      );
      return beneficiary;
    },
    onSuccess: (beneficiary) => {
      queryClient.setQueryData(
        beneficiaryQueryKey(beneficiary.id),
        beneficiary,
      );
      // La liste devra être rechargée à la prochaine visite
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}
