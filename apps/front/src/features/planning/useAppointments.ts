import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api, toQueryString } from '@/lib/api';
import type { Appointment } from './types';

export type AppointmentFilters = {
  from?: string;
  to?: string;
  userId?: number;
  beneficiaryId?: number;
};

export function useAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: async () => {
      const { appointments } = await api<{ appointments: Appointment[] }>(
        `/appointments${toQueryString(filters)}`,
      );
      return appointments;
    },
  });
}
