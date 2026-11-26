import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { PersonName } from '@/features/users/PersonName';
import { formatDateTime } from '@/lib/dates';
import type { Note } from './types';

type NoteDialogProps = {
  note: Note;
  open: boolean;
  onClose: () => void;
  /** Auteur ou admin, sur un dossier actif. */
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

/** Lecture d'une note en entier : comptes rendus et rapports peuvent être longs. */
export function NoteDialog({
  note,
  open,
  onClose,
  canEdit,
  onEdit,
  onDelete,
}: NoteDialogProps) {
  const isEdited = note.updatedAt !== note.createdAt;

  return (
    <Dialog open={open} onClose={onClose} title={note.title} size="large">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Rédigée par <PersonName person={note.author} /> le{' '}
          {formatDateTime(note.createdAt)}
          {isEdited && ` · modifiée le ${formatDateTime(note.updatedAt)}`}
        </p>
        {/*
          Le texte défile dans son cadre : le titre et les boutons restent visibles.
          tabIndex : le cadre reçoit le focus à l'ouverture, on fait défiler au clavier.
          whitespace-pre-wrap : retours à la ligne conservés, comme à l'écriture.
        */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Texte de la note"
          className="max-h-[55dvh] overflow-y-auto rounded-lg border border-border p-4 break-words whitespace-pre-wrap"
        >
          {note.content}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {canEdit && (
            <>
              <Button variant="danger" onClick={onDelete}>
                <Trash2 className="size-4" aria-hidden="true" />
                Supprimer
              </Button>
              <Button onClick={onEdit}>
                <Pencil className="size-4" aria-hidden="true" />
                Modifier
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
