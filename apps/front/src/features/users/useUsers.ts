import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { User } from './types';

/** Comptes actifs, pour les filtres et les listes de sélection. */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { users } = await api<{ users: User[] }>('/users');
      return users;
    },
  });
}
