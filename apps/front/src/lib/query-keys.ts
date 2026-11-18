import type { Listing } from '@/features/filter-preference/useFilterPreference';
import type { AppointmentFilters } from '@/features/planning/useAppointments';
import type { TaskQueryFilters } from '@/features/tasks/useTasks';

/*
 * Clés du cache TanStack Query, toutes rangées ici.
 * Même règle pour chaque ressource : `all` est le préfixe commun ;
 * l'invalider recharge à la fois les listes et les fiches.
 */
export const queryKeys = {
  session: ['session'],
  users: ['users'],
  filterPreference: (listing: Listing) => ['filter-preference', listing],
  beneficiaries: {
    all: ['beneficiaries'],
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
