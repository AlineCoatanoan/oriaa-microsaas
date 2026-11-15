import { useSearchParams } from 'react-router';
import { useCurrentUser } from '@/features/auth/useSession';
import { useUsers } from '@/features/users/useUsers';
import type { Person } from '@/lib/types';
import { useFilterPreference, type Listing } from './useFilterPreference';

/** Valeur du filtre dans l'URL pour afficher tout le monde. */
export const ALL_PEOPLE = 'all';

type PersonFilterOptions = {
  listing: Listing;
  /** Nom du paramètre d'URL (ex. : « referent »). */
  param: string;
  /** Personnes proposées : celles qui apparaissent dans la liste affichée. */
  people: Person[];
  /** Libellé quand la personne connectée se choisit elle-même. */
  mineLabel: string;
};

/**
 * Filtre « une personne » d'une liste (référent, responsable).
 * Sans choix dans l'URL, le filtre enregistré par l'utilisateur s'applique.
 */
export function usePersonFilter({
  listing,
  param,
  people,
  mineLabel,
}: PersonFilterOptions) {
  const user = useCurrentUser();
  const usersQuery = useUsers();
  const preferenceQuery = useFilterPreference(listing);
  const [searchParams] = useSearchParams();

  const savedId = preferenceQuery.data?.userId;
  const value = searchParams.get(param);
  const selectedId =
    value === null ? savedId : value === ALL_PEOPLE ? undefined : Number(value);

  /** Nom affiché d'une personne du filtre. */
  function labelOf(id: number) {
    if (id === user.id) return mineLabel;
    const person = people.find((item) => item.id === id);
    if (person) return person.name;
    const account = usersQuery.data?.find((item) => item.id === id);
    return account ? `${account.firstName} ${account.lastName}` : 'Personne';
  }

  return {
    listing,
    param,
    people,
    mineLabel,
    currentUserId: user.id,
    selectedId,
    savedId,
    isPending: preferenceQuery.isPending,
    labelOf,
  };
}

export type PersonFilterState = ReturnType<typeof usePersonFilter>;
