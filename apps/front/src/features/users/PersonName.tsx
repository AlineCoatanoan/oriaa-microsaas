import type { Person } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Nom d'un utilisateur, barré si son compte est archivé. */
export function PersonName({ person }: { person: Person }) {
  const isArchived = person.status === 'archived';

  return (
    <span className={cn(isArchived && 'line-through')}>
      {person.name}
      {isArchived && <span className="sr-only"> (compte archivé)</span>}
    </span>
  );
}
