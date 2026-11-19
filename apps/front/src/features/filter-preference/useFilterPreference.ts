import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';

/** Listes sur lesquelles l'utilisateur peut enregistrer son filtre. */
export type Listing = 'tasks' | 'beneficiaries';

/** Filtre enregistré : l'utilisateur à afficher par défaut. */
type FilterPreference = { userId: number };

const path = (listing: Listing) => `/${listing}/filter-preference`;

export function useFilterPreference(listing: Listing) {
  return useQuery({
    queryKey: queryKeys.filterPreference(listing),
    queryFn: async () => {
      const { filterPreference } = await api<{
        filterPreference: FilterPreference | null;
      }>(path(listing));
      return filterPreference;
    },
  });
}

/** Enregistre l'utilisateur choisi, ou retire le filtre avec null. */
export function useSaveFilterPreference(listing: Listing) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number | null) => {
      if (userId === null) {
        await api<void>(path(listing), { method: 'DELETE' });
        return null;
      }
      const { filterPreference } = await api<{
        filterPreference: FilterPreference;
      }>(path(listing), { method: 'PUT', body: { userId } });
      return filterPreference;
    },
    onSuccess: (filterPreference) => {
      queryClient.setQueryData(
        queryKeys.filterPreference(listing),
        filterPreference,
      );
    },
  });
}
