import { useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api';
import { focusFirstError, validateForm, type FieldErrors } from '@/lib/form';
import {
  ACCEPTED_TYPES,
  documentFormSchema,
  newDocumentFormSchema,
  toDocumentFormData,
} from './document-form';
import type { BeneficiaryDocument } from './types';
import { useSaveDocument, type DocumentPayload } from './useSaveDocument';

type DocumentFormDialogProps = {
  open: boolean;
  onClose: () => void;
  beneficiaryId: number;
  /** Absent : nouveau document. */
  document?: BeneficiaryDocument;
  /** Dossiers existants de la fiche, proposés dans le champ « Dossier ». */
  folders: string[];
  onSaved: (document: BeneficiaryDocument) => void;
};

/** Ajouter un document, ou modifier son titre et son dossier. */
export function DocumentFormDialog({
  open,
  onClose,
  beneficiaryId,
  document,
  folders,
  onSaved,
}: DocumentFormDialogProps) {
  const save = useSaveDocument(beneficiaryId, document?.id);
  const [errors, setErrors] = useState<FieldErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const foldersId = useId();

  function handleClose() {
    // Pas de fermeture pendant l'envoi
    if (save.isPending) return;
    save.reset();
    setErrors({});
    onClose();
  }

  function showErrors(form: HTMLFormElement, fieldErrors: FieldErrors) {
    setErrors(fieldErrors);
    focusFirstError(form, fieldErrors);
  }

  function send(data: FormData | DocumentPayload) {
    setErrors({});
    save.mutate(data, { onSuccess: onSaved });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (document) {
      const result = validateForm(documentFormSchema, form);
      if (!result.success) return showErrors(form, result.errors);
      send(result.data);
    } else {
      // Ajout : le fichier en plus, envoyé en FormData
      const result = validateForm(newDocumentFormSchema, form);
      if (!result.success) return showErrors(form, result.errors);
      send(toDocumentFormData(result.data));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={document ? 'Modifier le document' : 'Ajouter un document'}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
        {save.isError && <FormAlert>{getErrorMessage(save.error)}</FormAlert>}

        <fieldset disabled={save.isPending} className="space-y-4">
          {document ? (
            <p className="text-sm text-muted">
              Fichier : <span className="break-all">{document.fileName}</span>
            </p>
          ) : (
            <Field
              label="Fichier"
              hint="PDF, JPEG ou PNG, 5 Mo maximum."
              error={errors.file}
              required
            >
              {(control) => (
                <Input
                  {...control}
                  name="file"
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  required
                  onChange={(event) => {
                    // Titre proposé : le nom du fichier, sans son extension
                    const file = event.target.files?.[0];
                    const title = titleRef.current;
                    if (file && title && !title.value) {
                      title.value = file.name.replace(/\.[^.]+$/, '');
                    }
                  }}
                />
              )}
            </Field>
          )}
          <Field label="Titre" error={errors.title} required>
            {(control) => (
              <Input
                {...control}
                ref={titleRef}
                name="title"
                defaultValue={document?.title}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <Field
            label="Dossier"
            hint="Choisissez un dossier existant ou saisissez un nouveau nom (Santé, Logement…)."
            error={errors.category}
            required
          >
            {(control) => (
              <Input
                {...control}
                name="category"
                list={foldersId}
                defaultValue={document?.category}
                autoComplete="off"
                required
              />
            )}
          </Field>
          <datalist id={foldersId}>
            {folders.map((folder) => (
              <option key={folder} value={folder} />
            ))}
          </datalist>
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
