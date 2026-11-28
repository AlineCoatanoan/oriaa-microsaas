import { Check, ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

type ComboboxProps = Omit<
  ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'list'
> & {
  /** Choix proposés ; on peut aussi saisir une autre valeur. */
  options: string[];
  defaultValue?: string;
  /** Nom du bouton flèche, pour les lecteurs d'écran. */
  toggleLabel: string;
  /** Nom de la liste des choix. */
  listLabel: string;
};

/**
 * Champ texte avec une liste de choix qui s'ouvre en dessous
 * (modèle « combobox » des bonnes pratiques ARIA).
 * Souris : la flèche ouvre la liste. Clavier : flèches haut et bas,
 * Entrée pour choisir, Échap pour fermer. Saisir du texte filtre la liste.
 */
export function Combobox({
  options,
  defaultValue = '',
  toggleLabel,
  listLabel,
  className,
  ...props
}: ComboboxProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  // Texte qui filtre la liste : vide quand on l'ouvre avec la flèche
  const [filter, setFilter] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const search = filter.toLocaleLowerCase('fr');
  const visible = options.filter((option) =>
    option.toLocaleLowerCase('fr').includes(search),
  );
  const expanded = isOpen && visible.length > 0;
  const optionId = (index: number) => `${listId}-${index}`;

  // Le choix actif reste visible quand la liste défile
  useEffect(() => {
    if (activeIndex >= 0) {
      document
        .getElementById(optionId(activeIndex))
        ?.scrollIntoView({ block: 'nearest' });
    }
  });

  function open(nextFilter: string, nextIndex = -1) {
    setFilter(nextFilter);
    setActiveIndex(nextIndex);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function choose(option: string) {
    setValue(option);
    close();
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (expanded) setActiveIndex((index) => (index + 1) % visible.length);
        else open('', 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (expanded) {
          setActiveIndex((index) =>
            index <= 0 ? visible.length - 1 : index - 1,
          );
        }
        break;
      case 'Enter':
        // Entrée choisit l'option active au lieu d'envoyer le formulaire
        if (expanded && activeIndex >= 0) {
          event.preventDefault();
          choose(visible[activeIndex]);
        }
        break;
      case 'Escape':
        // Échap ferme la liste, pas la fenêtre qui contient le champ
        if (expanded) {
          event.preventDefault();
          close();
        }
        break;
    }
  }

  return (
    <div>
      <div className="relative">
        <Input
          {...props}
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={
            expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          autoComplete="off"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            open(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          onBlur={close}
          className={cn('pr-11', className)}
        />
        {/* Hors de l'ordre de tabulation : au clavier, la flèche bas ouvre la liste */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={toggleLabel}
          aria-controls={listId}
          aria-expanded={expanded}
          // Garde le focus dans le champ
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (expanded) close();
            else open('');
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-structure hover:bg-info-soft"
        >
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              expanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded && (
        <ul
          id={listId}
          role="listbox"
          aria-label={listLabel}
          className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-muted bg-surface py-1 shadow-lg"
        >
          {visible.map((option, index) => (
            <li
              key={option}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => choose(option)}
              className={cn(
                'flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3',
                index === activeIndex && 'bg-info-soft text-interaction',
              )}
            >
              {option}
              {option === value && (
                <Check className="size-4 shrink-0" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
