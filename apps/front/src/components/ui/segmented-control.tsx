import { cn } from '@/lib/utils';

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  /** Nom du groupe annoncé aux lecteurs d'écran. */
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Boutons côte à côte dont un seul est actif, par exemple Actifs / Archivés. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-muted bg-surface p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-9 rounded-md px-4 font-medium text-muted hover:text-structure',
            option.value === value &&
              'bg-structure text-white hover:text-white',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
