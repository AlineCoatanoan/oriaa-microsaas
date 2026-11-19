import type { Listing } from '@/features/filter-preference/useFilterPreference';
import type { AppointmentFilters } from '@/features/planning/useAppointments';
import type { TaskQueryFilters } from '@/features/tasks/useTasks';

/*
 * Clés du cache TanStack Query, toutes rangées ici.
 * Chaque clé commence par le nom de la ressource :
 * - `all` (ce préfixe seul) recharge les listes et les fiches ;
 * - `lists` ne recharge que les listes, quand la fiche vient d'être
 *   mise à jour directement dans le cache.
 */
export const queryKeys = {
  session: ['session'],
  users: ['users'],
  filterPreference: (listing: Listing) => ['filter-preference', listing],
  beneficiaries: {
    lists: ['beneficiaries', 'list'],
    list: (archived: boolean) => ['beneficiaries', 'list', { archived }],
    detail: (id: number) => ['beneficiaries', 'detail', id],
  },
  tasks: {
    all: ['tasks'],
    list: (filters: TaskQueryFilters) => ['tasks', 'list', filters],
    detail: (id: number) => ['tasks', 'detail', id],
  },
  appointments: {
    all: ['appointments'],
    list: (filters: AppointmentFilters) => ['appointments', 'list', filters],
  },
};
