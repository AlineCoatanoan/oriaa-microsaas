import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiError, getErrorMessage } from '@/lib/api';
import { BackLink } from './back-link';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';

type DetailQueryProps<T> = {
  query: UseQueryResult<T>;
  /** Lien de retour affiché avec l'erreur (ex. : la liste). */
  backTo: string;
  backLabel: string;
  children: (data: T) => ReactNode;
};

/**
 * États d'une fiche chargée depuis l'API : chargement, erreur, puis contenu.
 * Si l'élément n'existe pas (404), « Réessayer » n'est pas proposé.
 */
export function DetailQuery<T>({
  query,
  backTo,
  backLabel,
  children,
}: DetailQueryProps<T>) {
  if (query.isPending) return <LoadingState />;
  if (query.error) {
    const isNotFound =
      query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="space-y-4">
        <BackLink to={backTo}>{backLabel}</BackLink>
        <ErrorState
          message={getErrorMessage(query.error)}
          onRetry={isNotFound ? undefined : () => query.refetch()}
        />
      </div>
    );
  }
  return children(query.data);
}
