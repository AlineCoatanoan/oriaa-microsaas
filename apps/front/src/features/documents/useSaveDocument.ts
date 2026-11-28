import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { BeneficiaryDocument } from './types';

/** Modification : titre et dossier seulement, le fichier ne change pas. */
export type DocumentPayload = { title: string; category: string };

/**
 * Ajoute un document (FormData, avec le fichier),
 * ou le modifie si un identifiant est fourni.
 */
export function useSaveDocument(beneficiaryId: number, documentId?: number) {
  const queryClient = useQueryClient();
  const url = `/beneficiaries/${beneficiaryId}/documents`;

  return useMutation({
    mutationFn: async (data: FormData | DocumentPayload) => {
      const { document } = await api<{ document: BeneficiaryDocument }>(
        documentId ? `${url}/${documentId}` : url,
        { method: documentId ? 'PATCH' : 'POST', body: data },
      );
      return document;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.list(beneficiaryId),
      }),
  });
}
