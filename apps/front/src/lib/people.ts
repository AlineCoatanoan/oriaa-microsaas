import type { Person } from './types';

/** Personnes sans doublon, triées par nom (ex. : référents ou responsables d'une liste). */
export function uniquePeople(people: Person[]) {
  const byId = new Map<number, Person>();
  for (const person of people) byId.set(person.id, person);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
