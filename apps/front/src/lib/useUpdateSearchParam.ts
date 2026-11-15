import { useSearchParams } from 'react-router';

/**
 * Modifie un filtre gardé dans l'URL (recherche, vue, page…).
 * Valeur vide : le paramètre est retiré. Un nouveau filtre ramène à la première page.
 */
export function useUpdateSearchParam() {
  const [, setSearchParams] = useSearchParams();

  return (name: string, value: string) => {
    setSearchParams(
      (params) => {
        if (value) params.set(name, value);
        else params.delete(name);
        if (name !== 'page') params.delete('page');
        return params;
      },
      // Pas une nouvelle entrée d'historique à chaque lettre tapée
      { replace: true },
    );
  };
}
