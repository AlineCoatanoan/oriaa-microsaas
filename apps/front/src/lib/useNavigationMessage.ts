import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Message laissé par la page précédente (ex. : « Le dossier … a été supprimé. »).
 * Lu une seule fois puis retiré de l'historique : il ne réapparaît pas
 * après un rechargement (F5) ou un retour arrière.
 */
export function useNavigationMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { message?: string } | null;
  const [message] = useState(state?.message);

  useEffect(() => {
    if (state?.message) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });
    }
  }, [state, location.pathname, location.search, navigate]);

  return message;
}
