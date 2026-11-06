import type { ComponentProps } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingStateProps = ComponentProps<'p'> & {
  label?: string;
};

/** Indique qu'une page ou une partie de page est en cours de chargement. */
export function LoadingState({
  className,
  label = 'Chargement…',
  ...props
}: LoadingStateProps) {
  return (
    <p
      role="status"
      className={cn(
        'flex items-center justify-center gap-2 p-6 text-muted',
        className,
      )}
      {...props}
    >
      <LoaderCircle
        className="size-5 motion-safe:animate-spin"
        aria-hidden="true"
      />
      {label}
    </p>
  );
}
