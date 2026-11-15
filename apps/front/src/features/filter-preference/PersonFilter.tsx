import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { useSaveFilterPreference } from './useFilterPreference';
import { ALL_PEOPLE, type PersonFilterState } from './usePersonFilter';

type PersonFilterSelectProps = {
  filter: PersonFilterState;
  label: string;
  allLabel: string;
  onChange: (value: string) => void;
};

/** Liste déroulante : tout le monde, moi, ou une personne de la liste. */
export function PersonFilterSelect({
  filter,
  label,
  allLabel,
  onChange,
}: PersonFilterSelectProps) {
  const { people, currentUserId, selectedId } = filter;
  const others = people.filter(({ id }) => id !== currentUserId);
  const showMine =
    selectedId === currentUserId ||
    people.some(({ id }) => id === currentUserId);
  // Personne choisie absente de la liste : elle reste affichée pour voir le filtre actif
  const isSelectedMissing =
    selectedId !== undefined &&
    selectedId !== currentUserId &&
    !others.some(({ id }) => id === selectedId);

  return (
    <Select
      aria-label={label}
      value={selectedId === undefined ? ALL_PEOPLE : String(selectedId)}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value={ALL_PEOPLE}>{allLabel}</option>
      {showMine && <option value={currentUserId}>{filter.mineLabel}</option>}
      {isSelectedMissing && (
        <option value={selectedId}>{filter.labelOf(selectedId)}</option>
      )}
      {others.map(({ id, name, status }) => (
        <option key={id} value={id}>
          {status === 'archived' ? `${name} (compte archivé)` : name}
        </option>
      ))}
    </Select>
  );
}

/** Filtre enregistré (appliqué à chaque ouverture de la page) : affichage, retrait, enregistrement. */
export function SavedPersonFilter({ filter }: { filter: PersonFilterState }) {
  const save = useSaveFilterPreference(filter.listing);
  const { selectedId, savedId } = filter;
  const canSave = selectedId !== undefined && selectedId !== savedId;

  if (savedId === undefined && !canSave) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {savedId !== undefined && (
        <span className="inline-flex items-center gap-2 rounded-full bg-info-soft py-1 pr-1 pl-3 text-interaction">
          <BookmarkCheck className="size-4" aria-hidden="true" />
          Filtre enregistré : {filter.labelOf(savedId)}
          <button
            type="button"
            aria-label="Retirer le filtre enregistré"
            disabled={save.isPending}
            onClick={() => save.mutate(null)}
            className="flex size-7 items-center justify-center rounded-full hover:bg-surface disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </span>
      )}
      {canSave && (
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate(selectedId)}
          className="inline-flex min-h-9 items-center gap-2 font-medium text-interaction hover:underline disabled:opacity-50"
        >
          <Bookmark className="size-4" aria-hidden="true" />
          Enregistrer ce filtre
        </button>
      )}
    </div>
  );
}
