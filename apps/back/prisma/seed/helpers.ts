/** Clé lisible (« durand ») → identifiant en base, pour relier les données entre elles. */
export type SeedIds = Record<string, number>;

export function idOf(ids: SeedIds, key: string) {
  const id = ids[key];
  if (id === undefined) throw new Error(`Seed : clé inconnue « ${key} ».`);
  return id;
}

/**
 * Les dates sont calculées à partir du jour où le seed est lancé :
 * l'accueil a toujours des tâches et des rendez-vous du jour, et la démo reste à jour.
 */
const today = new Date();

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

/** Date seule, à J + days (négatif = dans le passé). */
export function daysFromNow(days: number) {
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + days),
  );
}

/** Jour ouvré à J + workdays, à l'heure « 09:30 ». Les week-ends sont sautés. */
export function workdayAt(workdays: number, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes,
  );
  // Seed lancé un week-end : on part du lundi suivant
  while (isWeekend(date)) date.setDate(date.getDate() + 1);

  const step = Math.sign(workdays);
  for (let remaining = Math.abs(workdays); remaining > 0;) {
    date.setDate(date.getDate() + step);
    if (!isWeekend(date)) remaining--;
  }
  return date;
}

/** Même jour, durée ajoutée en minutes (fin d'un rendez-vous). */
export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}
