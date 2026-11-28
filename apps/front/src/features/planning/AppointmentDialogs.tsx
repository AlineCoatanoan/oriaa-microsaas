import type { ActionResult } from '@/components/ui/result-message';
import { AppointmentDialog } from './AppointmentDialog';
import { AppointmentFormDialog } from './AppointmentFormDialog';
import { DeleteAppointmentDialog } from './DeleteAppointmentDialog';
import type { Appointment } from './types';
import { useAppointment } from './useAppointment';

/**
 * Fenêtre ouverte à la place du détail : créer, modifier ou supprimer.
 * « deleted » : le rendez-vous vient d'être supprimé, aucune fenêtre ne s'ouvre.
 */
export type AppointmentDialogMode = 'create' | 'edit' | 'delete' | 'deleted';

type AppointmentDialogsProps = {
  /** Rendez-vous choisi : son détail s'ouvre quand aucune autre fenêtre ne l'est. */
  openId?: number;
  mode?: AppointmentDialogMode;
  onModeChange: (mode?: AppointmentDialogMode) => void;
  onCloseDetail: () => void;
  /** Nouveau rendez-vous : début et bénéficiaires proposés. */
  createStart: Date;
  defaultBeneficiaryIds?: number[];
  /** Message à afficher après un enregistrement ou une suppression. */
  onResult: (result: ActionResult) => void;
  onSaved?: (appointment: Appointment) => void;
  onDeleted: () => void;
};

/**
 * Fenêtres d'un rendez-vous, communes au planning et à la fiche bénéficiaire :
 * détail, création ou modification, suppression.
 */
export function AppointmentDialogs({
  openId,
  mode,
  onModeChange,
  onCloseDetail,
  createStart,
  defaultBeneficiaryIds,
  onResult,
  onSaved,
  onDeleted,
}: AppointmentDialogsProps) {
  const selected = useAppointment(openId);

  return (
    // Dans l'ordre d'ouverture : le détail se ferme avant que la
    // modification ou la suppression s'ouvre
    <>
      <AppointmentDialog
        open={openId !== undefined && mode === undefined}
        query={selected}
        onClose={onCloseDetail}
        onEdit={() => onModeChange('edit')}
        onDelete={() => onModeChange('delete')}
      />
      <AppointmentFormDialog
        open={mode === 'create' || (mode === 'edit' && !!selected.data)}
        appointment={mode === 'edit' ? selected.data : undefined}
        defaultStart={createStart}
        defaultBeneficiaryIds={defaultBeneficiaryIds}
        // Modification annulée : retour au détail du rendez-vous
        onClose={() => onModeChange(undefined)}
        onSaved={(appointment) => {
          onModeChange(undefined);
          onResult({
            message: `Rendez-vous « ${appointment.title} » enregistré.`,
            isError: false,
          });
          onSaved?.(appointment);
        }}
      />
      {selected.data && (
        <DeleteAppointmentDialog
          appointment={selected.data}
          open={mode === 'delete'}
          onClose={() => onModeChange(undefined)}
          onDeleted={() => {
            onResult({
              message: `Rendez-vous « ${selected.data.title} » supprimé.`,
              isError: false,
            });
            onModeChange('deleted');
            onDeleted();
          }}
        />
      )}
    </>
  );
}
