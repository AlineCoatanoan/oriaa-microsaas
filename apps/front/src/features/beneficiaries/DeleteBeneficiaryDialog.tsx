import { useNavigate } from 'react-router';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatBeneficiaryName } from '@/lib/format';
import type { Beneficiary } from './types';
import { useDeleteBeneficiary } from './useDeleteBeneficiary';

type DeleteBeneficiaryDialogProps = {
  beneficiary: Beneficiary;
  open: boolean;
  onClose: () => void;
};

/** Confirmation avant la suppression définitive d'un dossier archivé (RGPD). */
export function DeleteBeneficiaryDialog({
  beneficiary,
  open,
  onClose,
}: DeleteBeneficiaryDialogProps) {
  const navigate = useNavigate();
  const remove = useDeleteBeneficiary(beneficiary.id);
  const name = formatBeneficiaryName(beneficiary);

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        remove.reset();
        onClose();
      }}
      title="Supprimer définitivement le dossier"
      confirmLabel="Supprimer définitivement"
      isPending={remove.isPending}
      error={remove.error}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () =>
            navigate('/beneficiaries?view=archived', {
              replace: true,
              state: { message: `Le dossier de ${name} a été supprimé.` },
            }),
        })
      }
    >
      <p>
        Le dossier de <strong>{name}</strong> sera supprimé avec ses notes et
        ses documents, ainsi que les tâches et rendez-vous qui ne concernent que
        lui.
      </p>
      <p className="font-medium text-danger">Cette action est irréversible.</p>
    </ConfirmDialog>
  );
}
