import { Archive, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataList, DataListRow, IconButton } from '@/components/ui/data-list';
import { Pagination } from '@/components/ui/pagination';
import { QueryState } from '@/components/ui/query-state';
import {
  ResultMessage,
  type ActionResult,
} from '@/components/ui/result-message';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ROLES, roleLabels } from '@/features/auth/roles';
import { useCurrentUser } from '@/features/auth/useSession';
import { formatDate, toDateKey } from '@/lib/dates';
import { plural } from '@/lib/format';
import { paginate } from '@/lib/paginate';
import { useUpdateSearchParam } from '@/lib/useUpdateSearchParam';
import { ArchiveUserDialog } from './ArchiveUserDialog';
import type { User } from './types';
import { UserFormDialog } from './UserFormDialog';
import { useUsers } from './useUsers';

type View = 'active' | 'archived';

const viewOptions: { value: View; label: string }[] = [
  { value: 'active', label: 'Actifs' },
  { value: 'archived', label: 'Archivés' },
];

const PAGE_SIZE = 10;

// Dernière colonne de largeur fixe : avec ou sans boutons, les lignes restent alignées
const columns =
  '@3xl:grid @3xl:grid-cols-[1.5fr_2fr_1.5fr_1fr_5.5rem] @3xl:items-center @3xl:gap-4';

/** Fenêtre ouverte : créer, modifier, archiver ou supprimer un compte. */
type DialogMode = 'create' | 'edit' | 'archive' | 'delete';

/** Page Administration : les comptes de l'équipe (admin uniquement). */
export function UsersPage() {
  const currentUser = useCurrentUser();
  const [searchParams] = useSearchParams();
  const updateParam = useUpdateSearchParam();
  const view: View =
    searchParams.get('view') === 'archived' ? 'archived' : 'active';
  const isArchivedView = view === 'archived';
  const page = Number(searchParams.get('page')) || 1;
  const query = useUsers(isArchivedView);

  const [mode, setMode] = useState<DialogMode>();
  // Les fenêtres restent dans la page (fermées) : à la fermeture, le
  // navigateur peut ainsi remettre le focus sur le bouton qui les a ouvertes
  const [selected, setSelected] = useState<User>();
  const [result, setResult] = useState<ActionResult>();
  const [removedCount, setRemovedCount] = useState(0);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // La ligne du compte archivé ou supprimé a disparu : le focus va sur « Ajouter un compte ».
  // Effet nécessaire : il faut attendre que la fenêtre de confirmation soit fermée.
  useEffect(() => {
    if (removedCount > 0) addButtonRef.current?.focus();
  }, [removedCount]);

  const users = query.data ?? [];
  const {
    items: pageUsers,
    page: currentPage,
    pageCount,
  } = paginate(users, page, PAGE_SIZE);
  const status = `${users.length} ${plural(users.length, 'compte')} ${
    isArchivedView
      ? plural(users.length, 'archivé')
      : plural(users.length, 'actif')
  }`;

  function open(nextMode: DialogMode, user?: User) {
    setSelected(user);
    setMode(nextMode);
  }

  function handleSaved(user: User) {
    setMode(undefined);
    setResult({
      message: `Compte de ${user.firstName} ${user.lastName} enregistré.`,
      isError: false,
    });
    // Nouveau compte : il apparaît dans les comptes actifs
    updateParam('view', '');
  }

  function handleRemoved(user: User, action: 'archive' | 'delete') {
    setMode(undefined);
    setResult({
      message: `Compte de ${user.firstName} ${user.lastName} ${
        action === 'archive' ? 'archivé' : 'supprimé'
      }.`,
      isError: false,
    });
    setRemovedCount((count) => count + 1);
  }

  return (
    <div className="space-y-6">
      <title>Administration – Oriaa</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Administration</h1>
        <Button ref={addButtonRef} onClick={() => open('create')}>
          <Plus className="size-4" aria-hidden="true" />
          Ajouter un compte
        </Button>
      </div>
      <ResultMessage result={result} />

      <SegmentedControl
        label="Comptes affichés"
        options={viewOptions}
        value={view}
        onChange={(value) =>
          updateParam('view', value === 'active' ? '' : value)
        }
      />

      <Card className="p-0 md:p-0">
        <QueryState query={query}>
          <DataList
            status={status}
            page={currentPage}
            pageCount={pageCount}
            isEmpty={users.length === 0}
            emptyMessage={
              isArchivedView ? 'Aucun compte archivé.' : 'Aucun compte actif.'
            }
            columns={columns}
            headers={
              <>
                <span>Nom</span>
                <span>Adresse e-mail</span>
                <span>Fonction</span>
                <span>Rôle</span>
                <span />
              </>
            }
          >
            {pageUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={user.id === currentUser.id}
                onEdit={() => open('edit', user)}
                onArchive={() => open('archive', user)}
                onDelete={() => open('delete', user)}
              />
            ))}
          </DataList>
          <div className="pb-4">
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onChange={(nextPage) => updateParam('page', String(nextPage))}
            />
          </div>
        </QueryState>
      </Card>

      <UserFormDialog
        open={mode === 'create' || mode === 'edit'}
        user={mode === 'edit' ? selected : undefined}
        onClose={() => setMode(undefined)}
        onSaved={handleSaved}
      />
      {selected && (
        <ArchiveUserDialog
          user={selected}
          action={mode === 'delete' ? 'delete' : 'archive'}
          open={mode === 'archive' || mode === 'delete'}
          onClose={() => setMode(undefined)}
          onDone={() =>
            handleRemoved(selected, mode === 'delete' ? 'delete' : 'archive')
          }
        />
      )}
    </div>
  );
}

type UserRowProps = {
  user: User;
  isSelf: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

function UserRow({ user, isSelf, onEdit, onArchive, onDelete }: UserRowProps) {
  const name = `${user.firstName} ${user.lastName}`;
  const cellClass = 'text-sm text-muted @3xl:text-base @3xl:text-structure';

  return (
    <DataListRow
      columns={columns}
      actions={
        <div className="flex w-[5.5rem]">
          {user.archivedAt ? (
            // Suppression RGPD : seulement après l'archivage
            <IconButton
              label={`Supprimer définitivement le compte de ${name}`}
              tooltip="Supprimer définitivement"
              icon={Trash2}
              danger
              onClick={onDelete}
            />
          ) : (
            <>
              <IconButton
                label={`Modifier le compte de ${name}`}
                tooltip="Modifier"
                icon={Pencil}
                onClick={onEdit}
              />
              {/* Règle métier : un admin ne peut pas archiver son propre compte */}
              {!isSelf && (
                <IconButton
                  label={`Archiver le compte de ${name}`}
                  tooltip="Archiver"
                  icon={Archive}
                  onClick={onArchive}
                />
              )}
            </>
          )}
        </div>
      }
    >
      <p className="font-medium">
        {name}
        {isSelf && <span className="font-normal text-muted"> (vous)</span>}
        {user.archivedAt && (
          <span className="block text-sm font-normal text-muted">
            Archivé le {formatDate(toDateKey(new Date(user.archivedAt)))}
          </span>
        )}
      </p>
      <p className={`${cellClass} break-all`}>{user.email}</p>
      <p className={cellClass}>{user.job}</p>
      <p>
        <Badge tone={user.role === ROLES.ADMIN ? 'warning' : 'info'}>
          {roleLabels[user.role]}
        </Badge>
      </p>
    </DataListRow>
  );
}
