import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getErrorMessage } from '@/lib/api';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';

type QueryStateProps = {
  query: UseQueryResult<unknown>;
  /** À préciser si une autre donnée doit aussi être chargée (ex. : filtre). */
  isPending?: boolean;
  children: ReactNode;
};

/** États d'une liste chargée depuis l'API : chargement, erreur, puis contenu. */
export function QueryState({
  query,
  isPending = query.isPending,
  children,
}: QueryStateProps) {
  if (isPending) return <LoadingState />;
  if (query.error) {
    return (
      <ErrorState
        message={getErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }
  return children;
}
