import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';
import type { Appointment } from './types';

/** Champs envoyés à l'API. En modification, seuls ceux envoyés changent. */
export type AppointmentPayload = {
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  userId: number;
  beneficiaryIds: number[];
};

/** Crée un rendez-vous, ou le modifie si un identifiant est fourni. */
export function useSaveAppointment(id?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AppointmentPayload>) => {
      const { appointment } = await api<{ appointment: Appointment }>(
        id ? `/appointments/${id}` : '/appointments',
        { method: id ? 'PATCH' : 'POST', body: data },
      );
      return appointment;
    },
    // Planning, accueil, fiche du rendez-vous et onglets des bénéficiaires
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
  });
}
