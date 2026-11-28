import {
  FileImage,
  FileText,
  Folder,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataListRow, IconButton, RowLink } from '@/components/ui/data-list';
import { QueryState } from '@/components/ui/query-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import type { Beneficiary } from '@/features/beneficiaries/types';
import { PersonName } from '@/features/users/PersonName';
import { formatDate, toDateKey } from '@/lib/dates';
import { formatFileSize, plural } from '@/lib/format';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import { DocumentFormDialog } from './DocumentFormDialog';
import type { BeneficiaryDocument } from './types';
import { useDocuments } from './useDocuments';

/** Fenêtre ouverte : ajouter, modifier ou supprimer un document. */
type DialogMode = 'create' | 'edit' | 'delete';

type DocumentFolder = { name: string; documents: BeneficiaryDocument[] };

/** Regroupe les documents par dossier, dans l'ordre alphabétique français. */
function groupByFolder(documents: BeneficiaryDocument[]) {
  // « État civil » après « Administratif », sans tenir compte des majuscules
  const sorted = documents.toSorted(
    (a, b) =>
      a.category.localeCompare(b.category, 'fr') ||
      a.title.localeCompare(b.title, 'fr'),
  );
  const folders: DocumentFolder[] = [];
  for (const document of sorted) {
    const current = folders.at(-1);
    if (current?.name === document.category) current.documents.push(document);
    else folders.push({ name: document.category, documents: [document] });
  }
  return folders;
}

/** « PDF », « JPEG » ou « PNG », à partir du type du fichier. */
const formatType = (mimeType: string) => mimeType.split('/')[1].toUpperCase();

/** Onglet « Documents » de la fiche : les documents rangés par dossier. */
export function BeneficiaryDocuments({
  beneficiary,
}: {
  beneficiary: Beneficiary;
}) {
  const query = useDocuments(beneficiary.id);
  const [mode, setMode] = useState<DialogMode>();
  // Les fenêtres restent dans la page (fermées) : à la fermeture, le
  // navigateur peut ainsi remettre le focus sur le bouton qui les a ouvertes
  const [selected, setSelected] = useState<BeneficiaryDocument>();
  const [result, setResult] = useState<ActionResult>();
  const [deletedCount, setDeletedCount] = useState(0);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Un dossier archivé est en lecture seule (les documents restent téléchargeables)
  const isArchived = beneficiary.archivedAt !== null;

  // La ligne du document supprimé a disparu : le focus va sur « Ajouter un document ».
  // Effet nécessaire : il faut attendre que la fenêtre de confirmation soit fermée.
  useEffect(() => {
    if (deletedCount > 0) addButtonRef.current?.focus();
  }, [deletedCount]);

  const documents = query.data ?? [];
  const folders = groupByFolder(documents);
  const status = `${documents.length} ${plural(documents.length, 'document')}${
    folders.length > 0
      ? ` dans ${folders.length} ${plural(folders.length, 'dossier')}`
      : ''
  }`;

  function open(nextMode: DialogMode, document?: BeneficiaryDocument) {
    setSelected(document);
    setMode(nextMode);
  }

  function handleSaved(document: BeneficiaryDocument) {
    setMode(undefined);
    setResult({
      message: `Document « ${document.title} » enregistré dans le dossier « ${document.category} ».`,
      isError: false,
    });
  }

  function handleDeleted(document: BeneficiaryDocument) {
    setMode(undefined);
    setResult({
      message: `Document « ${document.title} » supprimé.`,
      isError: false,
    });
    setDeletedCount((count) => count + 1);
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 md:px-6">
        <p role="status" className="text-sm text-muted">
          {query.isSuccess && status}
        </p>
        {!isArchived && (
          <Button
            ref={addButtonRef}
            variant="outline"
            onClick={() => open('create')}
          >
            <Plus className="size-4" aria-hidden="true" />
            Ajouter un document
          </Button>
        )}
      </div>

      <div className={result && 'px-4 md:px-6'}>
        <ResultMessage result={result} />
      </div>

      <QueryState query={query}>
        {documents.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted md:px-6">
            Aucun document pour ce bénéficiaire.
          </p>
        ) : (
          <div className="@container space-y-6">
            {folders.map((folder) => (
              <section key={folder.name}>
                <h3 className="flex items-center gap-2 px-4 font-semibold md:px-6">
                  <Folder
                    className="size-5 shrink-0 text-interaction"
                    aria-hidden="true"
                  />
                  {folder.name}
                  <span className="text-sm font-normal text-muted">
                    ({folder.documents.length}{' '}
                    {plural(folder.documents.length, 'document')})
                  </span>
                </h3>
                <ul className="mt-2 divide-y divide-border border-y border-border">
                  {folder.documents.map((document) => (
                    <DocumentRow
                      key={document.id}
                      beneficiaryId={beneficiary.id}
                      document={document}
                      canEdit={!isArchived}
                      onEdit={() => open('edit', document)}
                      onDelete={() => open('delete', document)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </QueryState>

      <DocumentFormDialog
        open={mode === 'create' || mode === 'edit'}
        beneficiaryId={beneficiary.id}
        document={mode === 'edit' ? selected : undefined}
        folders={folders.map(({ name }) => name)}
        onClose={() => setMode(undefined)}
        onSaved={handleSaved}
      />
      {selected && (
        <DeleteDocumentDialog
          beneficiaryId={beneficiary.id}
          document={selected}
          open={mode === 'delete'}
          onClose={() => setMode(undefined)}
          onDeleted={() => handleDeleted(selected)}
        />
      )}
    </div>
  );
}

type DocumentRowProps = {
  beneficiaryId: number;
  document: BeneficiaryDocument;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function DocumentRow({
  beneficiaryId,
  document,
  canEdit,
  onEdit,
  onDelete,
}: DocumentRowProps) {
  const type = formatType(document.mimeType);
  const size = formatFileSize(document.sizeBytes);
  const Icon = document.mimeType === 'application/pdf' ? FileText : FileImage;

  return (
    <DataListRow
      columns=""
      actions={
        canEdit && (
          <div className="flex">
            <IconButton
              label={`Modifier le document « ${document.title} »`}
              icon={Pencil}
              onClick={onEdit}
            />
            <IconButton
              label={`Supprimer le document « ${document.title} »`}
              icon={Trash2}
              danger
              onClick={onDelete}
            />
          </div>
        )
      }
    >
      {/* Le fichier passe par l'API : seule une personne connectée peut l'ouvrir */}
      <RowLink
        to={`/api/beneficiaries/${beneficiaryId}/documents/${document.id}/download`}
        reloadDocument
        download
        className="flex items-center gap-2"
      >
        <Icon className="size-5 shrink-0 text-interaction" aria-hidden="true" />
        <span className="min-w-0 break-words">
          {document.title}
          <span className="sr-only">
            {' '}
            : télécharger ({type}, {size})
          </span>
        </span>
      </RowLink>
      <p className="text-sm text-muted">
        {type} · {size} · ajouté le{' '}
        {formatDate(toDateKey(new Date(document.createdAt)))} par{' '}
        <PersonName person={document.addedBy} />
      </p>
    </DataListRow>
  );
}
