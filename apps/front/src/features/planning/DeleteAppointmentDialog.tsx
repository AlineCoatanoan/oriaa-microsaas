import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Appointment } from './types';
import { useDeleteAppointment } from './useDeleteAppointment';

type DeleteAppointmentDialogProps = {
  appointment: Appointment;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

/** Confirmation avant la suppression d'un rendez-vous. */
export function DeleteAppointmentDialog({
  appointment,
  open,
  onClose,
  onDeleted,
}: DeleteAppointmentDialogProps) {
  const remove = useDeleteAppointment(appointment.id);

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        remove.reset();
        onClose();
      }}
      title="Supprimer le rendez-vous"
      confirmLabel="Supprimer"
      isPending={remove.isPending}
      error={remove.error}
      onConfirm={() => remove.mutate(undefined, { onSuccess: onDeleted })}
    >
      <p>
        Le rendez-vous <strong>{appointment.title}</strong> sera supprimé.
      </p>
      <p className="font-medium text-danger">Cette action est irréversible.</p>
    </ConfirmDialog>
  );
}
