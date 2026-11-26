import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import { noteFormSchema } from './note-form';
import type { Note } from './types';
import { useSaveNote } from './useSaveNote';

type NoteFormDialogProps = {
  open: boolean;
  onClose: () => void;
  beneficiaryId: number;
  /** Absent : nouvelle note. */
  note?: Note;
  onSaved: (note: Note) => void;
};

/** Écrire ou modifier une note, dans une grande fenêtre. */
export function NoteFormDialog({
  open,
  onClose,
  beneficiaryId,
  note,
  onSaved,
}: NoteFormDialogProps) {
  const save = useSaveNote(beneficiaryId, note?.id);
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (save.isPending) return;
    save.reset();
    setErrors({});
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateForm(noteFormSchema, form);

    if (!result.success) {
      setErrors(result.errors);
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    save.mutate(result.data, { onSuccess: onSaved });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={note ? 'Modifier la note' : 'Nouvelle note'}
      size="large"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
        {save.isError && <FormAlert>{getErrorMessage(save.error)}</FormAlert>}

        <fieldset disabled={save.isPending} className="space-y-4">
          <Field label="Titre" error={errors.title} required>
            {(control) => (
              <Input
                {...control}
                name="title"
                defaultValue={note?.title}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <Field label="Texte" error={errors.content} required>
            {(control) => (
              <Textarea
                {...control}
                name="content"
                defaultValue={note?.content}
                rows={14}
                required
              />
            )}
          </Field>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" pending={save.isPending}>
            {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
