import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { BeneficiaryDocument } from './types';
import { useDeleteDocument } from './useDeleteDocument';

type DeleteDocumentDialogProps = {
  beneficiaryId: number;
  document: BeneficiaryDocument;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

/** Confirmation avant la suppression d'un document. */
export function DeleteDocumentDialog({
  beneficiaryId,
  document,
  open,
  onClose,
  onDeleted,
}: DeleteDocumentDialogProps) {
  const remove = useDeleteDocument(beneficiaryId, document.id);

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        remove.reset();
        onClose();
      }}
      title="Supprimer le document"
      confirmLabel="Supprimer"
      isPending={remove.isPending}
      error={remove.error}
      onConfirm={() => remove.mutate(undefined, { onSuccess: onDeleted })}
    >
      <p>
        Le document <strong>{document.title}</strong> sera supprimé.
      </p>
      <p className="font-medium text-danger">Cette action est irréversible.</p>
    </ConfirmDialog>
  );
}
