import { normalizeText } from '@/lib/search';
import type { Beneficiary } from './types';

export type BeneficiarySort = 'date-desc' | 'date-asc';

type BeneficiaryFilters = {
  search: string;
  referentId?: number;
};

/**
 * Recherche par nom et prénom, dans les deux ordres, sans tenir compte des accents,
 * et filtre par référent.
 * Tout se fait dans le navigateur : la liste est déjà chargée, donc aucune requête par lettre tapée.
 */
export function filterBeneficiaries(
  beneficiaries: Beneficiary[],
  { search, referentId }: BeneficiaryFilters,
) {
  const query = normalizeText(search);

  return beneficiaries.filter(
    ({ firstName, lastName, referent }) =>
      (referentId === undefined || referent.id === referentId) &&
      [`${lastName} ${firstName}`, `${firstName} ${lastName}`].some((name) =>
        normalizeText(name).includes(query),
      ),
  );
}

/**
 * Trie par date : la date d'entrée pour les actifs, la date de sortie pour les archivés.
 * Par défaut, la plus récente d'abord.
 */
export function sortBeneficiaries(
  beneficiaries: Beneficiary[],
  sort: BeneficiarySort,
  isArchived: boolean,
) {
  const dateOf = (beneficiary: Beneficiary) =>
    (isArchived ? beneficiary.exitDate : beneficiary.entryDate) ?? '';

  return [...beneficiaries].sort((a, b) => {
    const order = dateOf(a).localeCompare(dateOf(b));
    return sort === 'date-asc' ? order : -order;
  });
}
