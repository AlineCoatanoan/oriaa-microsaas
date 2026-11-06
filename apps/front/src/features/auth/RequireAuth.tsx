import { Navigate, Outlet } from 'react-router';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { useSession } from './useSession';

/** Réserve les routes enfants aux utilisateurs connectés. */
export function RequireAuth() {
  const { data: user, isPending, isError, refetch } = useSession();

  if (isPending) return <LoadingState className="min-h-dvh" />;
  if (user) return <Outlet />;
  if (isError) {
    return (
      <ErrorState
        className="min-h-dvh"
        message="Impossible de vérifier votre session."
        onRetry={() => refetch()}
      />
    );
  }

  return <Navigate to="/login" replace />;
}
