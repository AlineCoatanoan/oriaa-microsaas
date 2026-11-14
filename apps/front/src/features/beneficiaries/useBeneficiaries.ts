import { useQuery } from '@tanstack/react-query';
import { api, toQueryString } from '@/lib/api';
import type { Beneficiary } from './types';

export function useBeneficiaries({ archived }: { archived: boolean }) {
  return useQuery({
    queryKey: ['beneficiaries', { archived }],
    queryFn: async () => {
      const { beneficiaries } = await api<{ beneficiaries: Beneficiary[] }>(
        `/beneficiaries${toQueryString({ archived: String(archived) })}`,
      );
      return beneficiaries;
    },
  });
}
