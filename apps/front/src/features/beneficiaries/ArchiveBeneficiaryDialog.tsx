import { useState, type SubmitEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api';
import { toDateKey } from '@/lib/dates';
import type { Beneficiary } from './types';
import { useArchiveBeneficiary } from './useArchiveBeneficiary';

type ArchiveBeneficiaryDialogProps = {
  beneficiary: Beneficiary;
  open: boolean;
  onClose: () => void;
  onArchived: () => void;
};

/** Demande la date de sortie puis archive le dossier. */
export function ArchiveBeneficiaryDialog({
  beneficiary,
  open,
  onClose,
  onArchived,
}: ArchiveBeneficiaryDialogProps) {
  const archive = useArchiveBeneficiary(beneficiary.id);

  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (archive.isPending) return;
    archive.reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Archiver le dossier">
      <ArchiveForm
        entryDate={beneficiary.entryDate}
        archive={archive}
        onCancel={handleClose}
        onArchived={onArchived}
      />
    </Dialog>
  );
}

function ArchiveForm({
  entryDate,
  archive,
  onCancel,
  onArchived,
}: {
  entryDate: string;
  archive: ReturnType<typeof useArchiveBeneficiary>;
  onCancel: () => void;
  onArchived: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      'exitDate',
    ) as HTMLInputElement;
    const exitDate = input.value;

    // Dates « AAAA-MM-JJ » : l'ordre alphabétique est aussi l'ordre chronologique
    const message = !exitDate
      ? 'Saisissez la date de sortie.'
      : exitDate < entryDate
        ? "La date de sortie ne peut pas précéder la date d'entrée."
        : undefined;
    setError(message);
    if (message) {
      input.focus();
      return;
    }

    archive.mutate(exitDate, { onSuccess: onArchived });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <p className="text-muted">
        Le dossier passera en lecture seule et son statut deviendra « Sortie ».
        Il pourra être désarchivé si la personne revient.
      </p>
      {archive.isError && (
        <FormAlert>{getErrorMessage(archive.error)}</FormAlert>
      )}

      <fieldset disabled={archive.isPending} className="space-y-4">
        <Field label="Date de sortie" error={error} required>
          {(control) => (
            <Input
              {...control}
              name="exitDate"
              type="date"
              min={entryDate}
              defaultValue={toDateKey(new Date())}
              required
            />
          )}
        </Field>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" pending={archive.isPending}>
            Archiver
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
