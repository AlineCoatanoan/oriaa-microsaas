import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { User } from './types';
import { useArchiveUser } from './useArchiveUser';

type ArchiveUserDialogProps = {
  user: User;
  /** Archiver un compte actif, ou supprimer un compte archivé (RGPD). */
  action: 'archive' | 'delete';
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

/** Confirmation avant d'archiver ou de supprimer un compte. */
export function ArchiveUserDialog({
  user,
  action,
  open,
  onClose,
  onDone,
}: ArchiveUserDialogProps) {
  const mutation = useArchiveUser(user.id, action);
  const name = `${user.firstName} ${user.lastName}`;
  const isArchive = action === 'archive';

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        mutation.reset();
        onClose();
      }}
      title={isArchive ? 'Archiver le compte' : 'Supprimer le compte'}
      confirmLabel={isArchive ? 'Archiver' : 'Supprimer définitivement'}
      isPending={mutation.isPending}
      error={mutation.error}
      onConfirm={() => mutation.mutate(undefined, { onSuccess: onDone })}
    >
      {isArchive ? (
        <>
          <p>
            <strong>{name}</strong> ne pourra plus se connecter. Son nom reste
            visible, barré, sur ses notes, tâches et rendez-vous.
          </p>
          <p>
            Ses tâches et rendez-vous à venir ne sont pas réattribués : pensez à
            les confier à un collègue.
          </p>
        </>
      ) : (
        <p>
          Le nom, l'adresse e-mail et la fonction de <strong>{name}</strong>{' '}
          seront effacés : le compte apparaîtra comme « Utilisateur supprimé ».
          Ses notes, tâches et rendez-vous sont conservés.
        </p>
      )}
      <p className="font-medium text-danger">Cette action est irréversible.</p>
    </ConfirmDialog>
  );
}
