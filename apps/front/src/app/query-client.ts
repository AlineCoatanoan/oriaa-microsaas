import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { sessionQueryKey } from '@/features/auth/useSession';
import { ApiError } from '@/lib/api';

/** Session expirée : l'utilisateur est oublié et RequireAuth renvoie vers la connexion. */
function handleApiError(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(sessionQueryKey, null);
  }
}

/** Réessayer n'a de sens que si le serveur est injoignable ou en erreur. */
function shouldRetry(failureCount: number, error: Error) {
  const isClientError =
    error instanceof ApiError && error.status >= 400 && error.status < 500;
  return !isClientError && failureCount < 2;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleApiError }),
  mutationCache: new MutationCache({ onError: handleApiError }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      // Données considérées à jour 30 s : évite des requêtes inutiles
      staleTime: 30_000,
    },
  },
});
