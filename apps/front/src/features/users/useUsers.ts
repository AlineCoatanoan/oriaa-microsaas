import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { User } from './types';

/**
 * Comptes actifs, pour les filtres et les listes de sélection.
 * archived : les comptes archivés (page Administration, admin uniquement).
 */
export function useUsers(archived = false) {
  return useQuery({
    queryKey: archived ? queryKeys.archivedUsers : queryKeys.users,
    queryFn: async () => {
      const { users } = await api<{ users: User[] }>(
        archived ? '/users?archived=true' : '/users',
      );
      return users;
    },
  });
}
