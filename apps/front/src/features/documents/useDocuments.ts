import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { BeneficiaryDocument } from './types';

/** Documents d'un bénéficiaire, triés par dossier puis par titre. */
export function useDocuments(beneficiaryId: number) {
  return useQuery({
    queryKey: queryKeys.documents.list(beneficiaryId),
    queryFn: async () => {
      const { documents } = await api<{ documents: BeneficiaryDocument[] }>(
        `/beneficiaries/${beneficiaryId}/documents`,
      );
      return documents;
    },
  });
}
