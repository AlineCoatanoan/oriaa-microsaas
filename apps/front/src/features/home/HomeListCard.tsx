import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Card, CardTitle } from '@/components/ui/card';
import { QueryState } from '@/components/ui/query-state';

type HomeListCardProps = {
  title: string;
  query: UseQueryResult<unknown>;
  count: number;
  emptyMessage: string;
  /** Lien vers la page complète, en bas de la carte. */
  link: { to: string; label: string };
  children: ReactNode;
};

/** Carte de l'accueil : titre, nombre d'éléments, liste et lien « Voir… ». */
export function HomeListCard({
  title,
  query,
  count,
  emptyMessage,
  link,
  children,
}: HomeListCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <CardTitle>{title}</CardTitle>
        {query.isSuccess && <span className="text-muted">{count}</span>}
      </div>

      <QueryState query={query}>
        {count === 0 ? (
          <p className="py-4 text-muted">{emptyMessage}</p>
        ) : (
          children
        )}
      </QueryState>

      <Link
        to={link.to}
        className="mt-auto inline-flex items-center gap-2 self-start font-medium text-interaction hover:underline"
      >
        {link.label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
