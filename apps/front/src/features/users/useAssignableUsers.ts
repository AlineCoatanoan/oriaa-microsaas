import { isAdmin, ROLES } from '@/features/auth/roles';
import { useCurrentUser } from '@/features/auth/useSession';
import { useUsers } from './useUsers';

/**
 * Comptes à qui l'on peut confier un rendez-vous.
 * Règle métier : un utilisateur ne voit pas les admins (un admin voit tout le monde).
 */
export function useAssignableUsers() {
  const user = useCurrentUser();
  const query = useUsers();
  const users = (query.data ?? []).filter(
    ({ role }) => isAdmin(user) || role === ROLES.USER,
  );
  return { query, users };
}
