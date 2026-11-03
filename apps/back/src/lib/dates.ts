/** "2026-10-25" → Date ; null → null (champ vidé) ; absent → undefined (inchangé). */
export const toDate = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
};

/** Date sans heure (colonne @db.Date) → "2026-10-25", ou null. */
export const toDateOnly = (value: Date | null) =>
  value ? value.toISOString().slice(0, 10) : null;
