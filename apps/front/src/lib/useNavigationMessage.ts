import { useLocation } from 'react-router';

/** Message laissé par la page précédente (ex. : « Le dossier … a été supprimé. »). */
export function useNavigationMessage() {
  const state = useLocation().state as { message?: string } | null;
  return state?.message;
}
