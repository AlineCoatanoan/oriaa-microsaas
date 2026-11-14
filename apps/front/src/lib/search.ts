/** Minuscules et sans accents : « Hélène » et « helene » se retrouvent. */
export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
