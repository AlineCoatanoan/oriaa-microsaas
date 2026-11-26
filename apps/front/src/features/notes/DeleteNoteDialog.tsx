import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Note } from './types';
import { useDeleteNote } from './useDeleteNote';

type DeleteNoteDialogProps = {
  note: Note;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

/** Confirmation avant la suppression d'une note. */
export function DeleteNoteDialog({
  note,
  open,
  onClose,
  onDeleted,
}: DeleteNoteDialogProps) {
  const remove = useDeleteNote(note);

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        remove.reset();
        onClose();
      }}
      title="Supprimer la note"
      confirmLabel="Supprimer"
      isPending={remove.isPending}
      error={remove.error}
      onConfirm={() => remove.mutate(undefined, { onSuccess: onDeleted })}
    >
      <p>
        La note <strong>{note.title}</strong> sera supprimée.
      </p>
      <p className="font-medium text-danger">Cette action est irréversible.</p>
    </ConfirmDialog>
  );
}
