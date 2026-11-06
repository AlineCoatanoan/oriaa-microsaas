import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { sessionQueryKey } from './useSession';

/** Déconnecte l'utilisateur et efface les données gardées en cache. */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // Données sensibles : rien ne doit rester en mémoire après la déconnexion
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, null);
      navigate('/login', { replace: true });
    },
  });
}
