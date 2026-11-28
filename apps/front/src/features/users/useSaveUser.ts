import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { User } from './types';
import type { NewUserPayload, UserPayload } from './user-form';

/** Crée un compte, ou le modifie si un identifiant est fourni. */
export function useSaveUser(id?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewUserPayload | UserPayload) => {
      const { user } = await api<{ user: User }>(
        id ? `/users/${id}` : '/users',
        { method: id ? 'PATCH' : 'POST', body: data },
      );
      return user;
    },
    onSuccess: () =>
      Promise.all([
        // Comptes actifs et archivés
        queryClient.invalidateQueries({ queryKey: queryKeys.users }),
        // Sa propre fonction a pu changer
        queryClient.invalidateQueries({ queryKey: queryKeys.session }),
      ]),
  });
}
