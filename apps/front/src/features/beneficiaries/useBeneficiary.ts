import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Beneficiary } from './types';

export function useBeneficiary(id: number) {
  return useQuery({
    queryKey: queryKeys.beneficiaries.detail(id),
    queryFn: async () => {
      const { beneficiary } = await api<{ beneficiary: Beneficiary }>(
        `/beneficiaries/${id}`,
      );
      return beneficiary;
    },
  });
}
