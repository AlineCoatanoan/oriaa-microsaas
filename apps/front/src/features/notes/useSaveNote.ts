import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Note } from './types';

export type NotePayload = { title: string; content: string };

/** Crée une note, ou la modifie si un identifiant est fourni. */
export function useSaveNote(beneficiaryId: number, noteId?: number) {
  const queryClient = useQueryClient();
  const url = `/beneficiaries/${beneficiaryId}/notes`;

  return useMutation({
    mutationFn: async (data: NotePayload) => {
      const { note } = await api<{ note: Note }>(
        noteId ? `${url}/${noteId}` : url,
        { method: noteId ? 'PATCH' : 'POST', body: data },
      );
      return note;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.notes.list(beneficiaryId),
      }),
  });
}
