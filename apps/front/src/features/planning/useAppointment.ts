import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Appointment } from './types';

/** Un rendez-vous ; rien n'est demandé tant qu'aucun n'est choisi. */
export function useAppointment(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id ?? 0),
    queryFn: async () => {
      const { appointment } = await api<{ appointment: Appointment }>(
        `/appointments/${id}`,
      );
      return appointment;
    },
    enabled: id !== undefined,
  });
}
