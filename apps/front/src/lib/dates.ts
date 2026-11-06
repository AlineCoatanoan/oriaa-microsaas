const pad = (value: number) => String(value).padStart(2, '0');

/** Date au format AAAA-MM-JJ, selon l'heure locale (format des dates de l'API). */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Début et fin de la journée, au format attendu par l'API. */
export function dayRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

/** « 09h30 » */
export function formatTime(isoDate: string) {
  const date = new Date(isoDate);
  return `${pad(date.getHours())}h${pad(date.getMinutes())}`;
}

/** « 03/11 » à partir de « 2026-11-03 » */
export function formatShortDate(dateKey: string) {
  const [, month, day] = dateKey.split('-');
  return `${day}/${month}`;
}
