import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';

export function useDeleteDocument(beneficiaryId: number, documentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<void>(`/beneficiaries/${beneficiaryId}/documents/${documentId}`, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.list(beneficiaryId),
      }),
  });
}
