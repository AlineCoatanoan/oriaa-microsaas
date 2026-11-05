import { Navigate, Outlet } from 'react-router';
import { useSession } from './useSession';

/** Réserve les routes enfants aux utilisateurs connectés. */
export function RequireAuth() {
  const { data: user, isPending, isError } = useSession();

  if (isPending) return <p>Chargement…</p>;
  if (user) return <Outlet />;
  if (isError) return <p>Impossible de vérifier votre session.</p>;

  return <Navigate to="/login" replace />;
}
