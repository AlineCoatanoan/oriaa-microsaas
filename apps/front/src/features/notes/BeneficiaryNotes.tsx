import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListRow,
  IconButton,
  RowButton,
} from '@/components/ui/data-list';
import { Pagination } from '@/components/ui/pagination';
import { QueryState } from '@/components/ui/query-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { isAdmin } from '@/features/auth/roles';
import { useCurrentUser } from '@/features/auth/useSession';
import type { Beneficiary } from '@/features/beneficiaries/types';
import { PersonName } from '@/features/users/PersonName';
import { formatDate, toDateKey } from '@/lib/dates';
import { plural } from '@/lib/format';
import { paginate } from '@/lib/paginate';
import { DeleteNoteDialog } from './DeleteNoteDialog';
import { NoteDialog } from './NoteDialog';
import { NoteFormDialog } from './NoteFormDialog';
import type { Note } from './types';
import { useNotes } from './useNotes';

const PAGE_SIZE = 10;

// Dernière colonne de largeur fixe : avec ou sans boutons, les lignes restent alignées
const columns =
  '@3xl:grid @3xl:grid-cols-[2fr_1.5fr_1fr_5.5rem] @3xl:items-center @3xl:gap-4';

/** Fenêtre ouverte : écrire, lire, modifier ou supprimer une note. */
type DialogMode = 'create' | 'read' | 'edit' | 'delete';

/** Onglet « Notes » de la fiche : la liste montre les titres, la note s'ouvre en grand. */
export function BeneficiaryNotes({
  beneficiary,
}: {
  beneficiary: Beneficiary;
}) {
  const user = useCurrentUser();
  const query = useNotes(beneficiary.id);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<DialogMode>();
  // Les fenêtres restent dans la page (fermées) : à la fermeture, le
  // navigateur peut ainsi remettre le focus sur le bouton qui les a ouvertes
  const [selected, setSelected] = useState<Note>();
  const [result, setResult] = useState<ActionResult>();
  const [deletedCount, setDeletedCount] = useState(0);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Un dossier archivé est en lecture seule
  const isArchived = beneficiary.archivedAt !== null;
  const canEdit = (note: Note) =>
    !isArchived && (isAdmin(user) || note.author.id === user.id);

  // La ligne de la note supprimée a disparu : le focus va sur « Ajouter une note ».
  // Effet nécessaire : il faut attendre que la fenêtre de confirmation soit fermée.
  useEffect(() => {
    if (deletedCount > 0) addButtonRef.current?.focus();
  }, [deletedCount]);

  const notes = query.data ?? [];
  const {
    items: pageNotes,
    page: currentPage,
    pageCount,
  } = paginate(notes, page, PAGE_SIZE);
  const status = `${notes.length} ${plural(notes.length, 'note')}`;

  function open(nextMode: DialogMode, note?: Note) {
    setSelected(note);
    setMode(nextMode);
  }

  function handleSaved(note: Note) {
    setMode(undefined);
    setResult({
      message: `Note « ${note.title} » enregistrée.`,
      isError: false,
    });
  }

  function handleDeleted(note: Note) {
    setMode(undefined);
    setResult({ message: `Note « ${note.title} » supprimée.`, isError: false });
    setDeletedCount((count) => count + 1);
  }

  return (
    <div className="space-y-4">
      {!isArchived && (
        <div className="flex justify-end px-4 md:px-6">
          <Button
            ref={addButtonRef}
            variant="outline"
            onClick={() => open('create')}
          >
            <Plus className="size-4" aria-hidden="true" />
            Ajouter une note
          </Button>
        </div>
      )}

      <div className={result && 'px-4 md:px-6'}>
        <ResultMessage result={result} />
      </div>

      <QueryState query={query}>
        <DataList
          status={status}
          page={currentPage}
          pageCount={pageCount}
          isEmpty={notes.length === 0}
          emptyMessage="Aucune note pour ce bénéficiaire."
          columns={columns}
          headers={
            <>
              <span>Titre</span>
              <span>Auteur</span>
              <span>Date</span>
              <span />
            </>
          }
        >
          {pageNotes.map((note) => (
            <DataListRow
              key={note.id}
              columns={columns}
              actions={
                canEdit(note) && (
                  <div className="flex w-[5.5rem] justify-end">
                    <IconButton
                      label={`Modifier la note « ${note.title} »`}
                      icon={Pencil}
                      onClick={() => open('edit', note)}
                    />
                    <IconButton
                      label={`Supprimer la note « ${note.title} »`}
                      icon={Trash2}
                      danger
                      onClick={() => open('delete', note)}
                    />
                  </div>
                )
              }
            >
              <RowButton className="block" onClick={() => open('read', note)}>
                {note.title}
              </RowButton>
              <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
                <span className="@3xl:sr-only">Par </span>
                <PersonName person={note.author} />
              </p>
              <p className="text-sm text-muted @3xl:text-base @3xl:text-structure">
                <span className="@3xl:sr-only">Le </span>
                {formatDate(toDateKey(new Date(note.createdAt)))}
              </p>
            </DataListRow>
          ))}
        </DataList>
      </QueryState>

      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />

      {/* Dans l'ordre d'ouverture : la lecture se ferme avant que la modification
          ou la suppression s'ouvre, et le focus revient bien sur la ligne */}
      {selected && (
        <NoteDialog
          note={selected}
          open={mode === 'read'}
          onClose={() => setMode(undefined)}
          canEdit={canEdit(selected)}
          onEdit={() => setMode('edit')}
          onDelete={() => setMode('delete')}
        />
      )}
      <NoteFormDialog
        open={mode === 'create' || mode === 'edit'}
        beneficiaryId={beneficiary.id}
        note={mode === 'edit' ? selected : undefined}
        onClose={() => setMode(undefined)}
        onSaved={handleSaved}
      />
      {selected && (
        <DeleteNoteDialog
          note={selected}
          open={mode === 'delete'}
          onClose={() => setMode(undefined)}
          onDeleted={() => handleDeleted(selected)}
        />
      )}
    </div>
  );
}
