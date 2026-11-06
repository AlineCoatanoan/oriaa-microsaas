import type { ComponentProps } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type ErrorStateProps = ComponentProps<'div'> & {
  message: string;
  /** Affiche un bouton pour relancer la requête. */
  onRetry?: () => void;
};

/** Remplace une page ou une partie de page dont le chargement a échoué. */
export function ErrorState({
  className,
  message,
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-6 text-center',
        className,
      )}
      {...props}
    >
      <p className="flex items-center gap-2 text-danger">
        <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
