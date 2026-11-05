import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';

export type SessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  job: string;
  role: string;
};

/** Renvoie l'utilisateur connecté, ou null si personne n'est connecté. */
async function fetchSession(): Promise<SessionUser | null> {
  try {
    const { user } = await api<{ user: SessionUser }>('/auth/session');
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    retry: false,
    // Évite de redemander la session à chaque changement de page
    staleTime: 60_000,
  });
}
