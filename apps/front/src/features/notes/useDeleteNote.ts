import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Note } from './types';

export function useDeleteNote({ id, beneficiaryId }: Note) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<void>(`/beneficiaries/${beneficiaryId}/notes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.notes.list(beneficiaryId),
      }),
  });
}
