import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Note } from './types';

/** Notes d'un bénéficiaire, de la plus récente à la plus ancienne. */
export function useNotes(beneficiaryId: number) {
  return useQuery({
    queryKey: queryKeys.notes.list(beneficiaryId),
    queryFn: async () => {
      const { notes } = await api<{ notes: Note[] }>(
        `/beneficiaries/${beneficiaryId}/notes`,
      );
      return notes;
    },
  });
}
