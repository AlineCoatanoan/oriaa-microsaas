import { Navigate, Outlet } from 'react-router';
import { isAdmin } from './roles';
import { useSession } from './useSession';

/** Réserve les routes enfants aux administrateurs. À placer dans RequireAuth. */
export function RequireAdmin() {
  const { data: user } = useSession();

  if (!isAdmin(user)) return <Navigate to="/" replace />;

  return <Outlet />;
}
