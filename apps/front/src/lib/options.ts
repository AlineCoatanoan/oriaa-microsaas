/** Choix proposé dans une liste (cases à cocher, menu déroulant). */
export type Option = { id: number; label: string };

/**
 * Ajoute en tête les éléments déjà liés qui ne sont plus proposés
 * (compte ou bénéficiaire archivé…) : en modification, ils restent choisis.
 */
export function withCurrent<T extends { id: number }>(
  options: Option[],
  current: T[],
  toOption: (item: T) => Option,
) {
  const kept = current
    .filter(({ id }) => !options.some((option) => option.id === id))
    .map(toOption);
  return [...kept, ...options];
}
