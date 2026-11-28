import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/query-keys';
import { api } from '@/lib/api';

/** Nouvel horaire d'un rendez-vous déplacé dans le planning. */
export type AppointmentMove = { id: number; startAt: string; endAt: string };

/** Change seulement l'horaire d'un rendez-vous (glisser-déposer). */
export function useMoveAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...times }: AppointmentMove) =>
      api<unknown>(`/appointments/${id}`, { method: 'PATCH', body: times }),
    // Succès ou échec : on recharge. Le rendez-vous reste affiché à sa
    // nouvelle place jusqu'à la fin du rechargement (voir PlanningPage).
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
  });
}
