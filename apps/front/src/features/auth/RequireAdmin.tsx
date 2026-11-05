import { Navigate, Outlet } from 'react-router';
import { useSession } from './useSession';

/** Réserve les routes enfants aux administrateurs. À placer dans RequireAuth. */
export function RequireAdmin() {
  const { data: user } = useSession();

  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
