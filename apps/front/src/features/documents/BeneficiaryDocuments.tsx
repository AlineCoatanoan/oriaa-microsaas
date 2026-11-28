import {
  ChevronLeft,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
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
  // Dossier ouvert (ses documents sont affichés), et le dernier quitté
  const [openFolder, setOpenFolder] = useState<string>();
  const [lastFolder, setLastFolder] = useState<string>();
  const folderListRef = useRef<HTMLUListElement>(null);
  const folderTitleRef = useRef<HTMLHeadingElement>(null);

  // Un dossier archivé est en lecture seule (les documents restent téléchargeables)
  const isArchived = beneficiary.archivedAt !== null;

  // La ligne du document supprimé a disparu : le focus va sur « Ajouter un document ».
  // Effet nécessaire : il faut attendre que la fenêtre de confirmation soit fermée.
  useEffect(() => {
    if (deletedCount > 0) addButtonRef.current?.focus();
  }, [deletedCount]);

  // En entrant dans un dossier, le focus va sur son titre ; en revenant,
  // sur le dossier quitté. Effet nécessaire : la vue change au rendu suivant.
  useEffect(() => {
    if (openFolder) {
      folderTitleRef.current?.focus();
    } else if (lastFolder) {
      folderListRef.current
        ?.querySelector<HTMLButtonElement>(
          `[data-folder="${CSS.escape(lastFolder)}"]`,
        )
        ?.focus();
    }
  }, [openFolder, lastFolder]);

  const documents = query.data ?? [];
  const folders = groupByFolder(documents);
  // Dossier vidé (dernier document supprimé ou déplacé) : retour aux dossiers
  const currentFolder = folders.find(({ name }) => name === openFolder);
  const status = `${documents.length} ${plural(documents.length, 'document')}${
    folders.length > 0
      ? ` dans ${folders.length} ${plural(folders.length, 'dossier')}`
      : ''
  }`;

  function open(nextMode: DialogMode, document?: BeneficiaryDocument) {
    setSelected(document);
    setMode(nextMode);
  }

  function enterFolder(name: string) {
    setOpenFolder(name);
    setLastFolder(name);
  }

  function handleSaved(document: BeneficiaryDocument) {
    setMode(undefined);
    // On affiche le dossier où le document est rangé
    enterFolder(document.category);
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
        ) : currentFolder ? (
          <section className="@container">
            <div className="space-y-2 px-4 md:px-6">
              <button
                type="button"
                onClick={() => setOpenFolder(undefined)}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-interaction hover:underline"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Tous les dossiers
              </button>
              <h3
                ref={folderTitleRef}
                tabIndex={-1}
                className="flex items-center gap-2 font-semibold outline-none"
              >
                <FolderOpen
                  className="size-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {currentFolder.name}
                <span className="text-sm font-normal text-muted">
                  ({currentFolder.documents.length}{' '}
                  {plural(currentFolder.documents.length, 'document')})
                </span>
              </h3>
            </div>
            <ul className="mt-2 divide-y divide-border border-y border-border">
              {currentFolder.documents.map((document) => (
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
        ) : (
          // Les dossiers : un clic entre dans le dossier et montre ses documents
          <div className="@container">
            <ul
              ref={folderListRef}
              aria-label="Dossiers"
              className="grid gap-3 px-4 md:px-6 @md:grid-cols-2 @2xl:grid-cols-3"
            >
              {folders.map(({ name, documents: folderDocuments }) => (
                <li key={name}>
                  <button
                    type="button"
                    data-folder={name}
                    onClick={() => enterFolder(name)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left hover:border-interaction hover:bg-info-soft"
                  >
                    <Folder
                      className="size-8 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold break-words">
                        {name}
                      </span>
                      <span className="text-sm text-muted">
                        {folderDocuments.length}{' '}
                        {plural(folderDocuments.length, 'document')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </QueryState>

      <DocumentFormDialog
        open={mode === 'create' || mode === 'edit'}
        beneficiaryId={beneficiary.id}
        document={mode === 'edit' ? selected : undefined}
        folders={folders.map(({ name }) => name)}
        defaultFolder={currentFolder?.name}
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
              tooltip="Modifier"
              icon={Pencil}
              onClick={onEdit}
            />
            <IconButton
              label={`Supprimer le document « ${document.title} »`}
              tooltip="Supprimer"
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
