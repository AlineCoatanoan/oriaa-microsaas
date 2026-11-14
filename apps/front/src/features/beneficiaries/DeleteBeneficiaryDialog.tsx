import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormAlert } from '@/components/ui/form-alert';
import { getErrorMessage } from '@/lib/api';
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
  const name = `${beneficiary.lastName} ${beneficiary.firstName}`;

  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (remove.isPending) return;
    remove.reset();
    onClose();
  }

  function handleDelete() {
    remove.mutate(undefined, {
      onSuccess: () =>
        navigate('/beneficiaries?view=archived', {
          replace: true,
          state: { message: `Le dossier de ${name} a été supprimé.` },
        }),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Supprimer définitivement le dossier"
    >
      <div className="space-y-4">
        <p>
          Le dossier de <strong>{name}</strong> sera supprimé avec ses notes et
          ses documents, ainsi que les tâches et rendez-vous qui ne concernent
          que lui.
        </p>
        <p className="font-medium text-danger">
          Cette action est irréversible.
        </p>
        {remove.isError && (
          <FormAlert>{getErrorMessage(remove.error)}</FormAlert>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={remove.isPending}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            pending={remove.isPending}
          >
            Supprimer définitivement
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
