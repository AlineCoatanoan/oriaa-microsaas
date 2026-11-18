import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Detail = {
  label: string;
  /** Vide : « Non renseigné » est affiché à la place. */
  value: ReactNode;
};

/** Liste de libellés et de valeurs, pour afficher les informations d'une fiche. */
export function DetailList({
  details,
  className,
}: {
  details: Detail[];
  className?: string;
}) {
  return (
    <dl className={cn('space-y-3', className)}>
      {details.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="break-words">
            {value === null || value === undefined || value === '' ? (
              <span className="text-muted">Non renseigné</span>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
