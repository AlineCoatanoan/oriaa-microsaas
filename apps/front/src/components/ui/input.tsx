import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Icône placée au début d'un champ (le champ prend alors la classe pl-10). */
export const inputIconClass =
  'pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-lg border border-muted bg-surface px-3 py-2 text-structure placeholder:text-muted disabled:opacity-50 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}
