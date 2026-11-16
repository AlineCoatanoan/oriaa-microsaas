import type { ReactNode } from 'react';
import { getErrorMessage } from '@/lib/api';
import { Button } from './button';
import { Dialog } from './dialog';
import { FormAlert } from './form-alert';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  isPending: boolean;
  /** Erreur de la requête, affichée au-dessus des boutons. */
  error?: Error | null;
  children: ReactNode;
};

/**
 * Confirmation d'une action irréversible (suppression).
 * Le focus arrive sur « Annuler » pour éviter une suppression par erreur.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  confirmLabel,
  onConfirm,
  isPending,
  error,
  children,
}: ConfirmDialogProps) {
  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (!isPending) onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {children}
        {error && <FormAlert>{getErrorMessage(error)}</FormAlert>}

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} pending={isPending}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
