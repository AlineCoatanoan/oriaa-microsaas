import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Erreur générale du formulaire, par exemple un refus de l'API. */
export function FormAlert({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      role="alert"
      className={cn('rounded-lg bg-danger-soft p-3 text-danger', className)}
      {...props}
    />
  );
}
