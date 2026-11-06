import { Navigate, Outlet } from 'react-router';
import { LoadingState } from '@/components/ui/loading-state';
import { useSession } from './useSession';

/** Réserve les routes enfants aux utilisateurs connectés. */
export function RequireAuth() {
  const { data: user, isPending, isError } = useSession();

  if (isPending) return <LoadingState className="min-h-dvh" />;
  if (user) return <Outlet />;
  if (isError) return <p>Impossible de vérifier votre session.</p>;

  return <Navigate to="/login" replace />;
}
