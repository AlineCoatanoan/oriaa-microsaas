import { useId, useState } from 'react';
import type { Option } from '@/lib/options';
import { normalizeText } from '@/lib/search';
import { cn } from '@/lib/utils';
import { SearchInput } from './search-input';

type CheckboxGroupProps = {
  legend: string;
  /** Nom des cases : le formulaire reçoit la liste des identifiants cochés. */
  name: string;
  options: Option[];
  defaultChecked: number[];
  error?: string;
  /** Affiche un astérisque à côté de la légende. */
  required?: boolean;
  /** Champ de recherche au-dessus de la liste, pour les longues listes. */
  searchLabel?: string;
  /** Message affiché quand il n'y a aucune option. */
  emptyMessage: string;
};

/** Choix multiple : une case à cocher par option, dans un fieldset. */
export function CheckboxGroup({
  legend,
  name,
  options,
  defaultChecked,
  error,
  required,
  searchLabel,
  emptyMessage,
}: CheckboxGroupProps) {
  const errorId = useId();
  const [checked, setChecked] = useState(() => new Set(defaultChecked));
  const [search, setSearch] = useState('');

  // Une option cochée reste toujours visible, même hors de la recherche
  const isVisible = ({ id, label }: Option) =>
    checked.has(id) || normalizeText(label).includes(normalizeText(search));

  function toggle(id: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      className="space-y-2"
    >
      <legend className="text-sm font-medium text-structure">
        {legend}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>

      {searchLabel && options.length > 0 && (
        <SearchInput
          label={searchLabel}
          placeholder="Nom…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          // Entrée dans la recherche ne doit pas envoyer le formulaire
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault();
          }}
        />
      )}

      {options.length === 0 ? (
        <p className="text-muted">{emptyMessage}</p>
      ) : (
        <ul
          className={cn(
            'divide-y divide-border rounded-lg border border-border px-3',
            searchLabel && 'max-h-72 overflow-y-auto',
          )}
        >
          {options.map((option) => (
            <li key={option.id} hidden={!isVisible(option)}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name={name}
                  value={option.id}
                  checked={checked.has(option.id)}
                  onChange={() => toggle(option.id)}
                  aria-invalid={error ? true : undefined}
                  className="size-5 shrink-0 accent-interaction"
                />
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
