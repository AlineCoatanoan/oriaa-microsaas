const pad = (value: number) => String(value).padStart(2, '0');

/** Date au format AAAA-MM-JJ, selon l'heure locale (format des dates de l'API). */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** « 09:30 » : l'heure au format d'un champ <input type="time">. */
export function toTimeKey(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Date locale à minuit à partir de « 2026-11-26 ». */
export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** La même date, décalée d'un nombre de jours (négatif pour reculer). */
export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Lundi de la semaine qui contient cette date, à minuit. */
export function startOfWeek(date: Date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay() : 0 = dimanche … 6 = samedi ; la semaine commence le lundi
  return addDays(day, -((day.getDay() + 6) % 7));
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

/** « 04/02/2026 » à partir de « 2026-02-04 » */
export function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}

/** « 20/11/2026 à 14h32 » à partir d'une date ISO complète */
export function formatDateTime(isoDate: string) {
  return `${formatDate(toDateKey(new Date(isoDate)))} à ${formatTime(isoDate)}`;
}

/** Âge en années révolues à partir d'une date « 1987-03-14 ». */
export function computeAge(dateKey: string, today = new Date()) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const hasHadBirthday =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hasHadBirthday ? 0 : 1);
}

/** Jours entre aujourd'hui et une date « 2026-11-20 » (négatif si elle est passée). */
export function daysUntil(dateKey: string, today = new Date()) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const start = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.round((target - start) / 86_400_000);
}
