import type { BeneficiarySummary } from './types';

/** Nom d'un bénéficiaire, nom puis prénom comme dans les dossiers : « Dupont Marie ». */
export function formatBeneficiaryName({
  firstName,
  lastName,
}: Pick<BeneficiarySummary, 'firstName' | 'lastName'>) {
  return `${lastName} ${firstName}`;
}

/** « Dupont Marie » pour un bénéficiaire, « 3 bénéficiaires » au-delà. */
export function formatBeneficiaries(beneficiaries: BeneficiarySummary[]) {
  if (beneficiaries.length === 0) return 'Aucun bénéficiaire';
  if (beneficiaries.length > 1) return `${beneficiaries.length} bénéficiaires`;
  return formatBeneficiaryName(beneficiaries[0]);
}

/** Accorde un mot régulier avec un nombre : « 1 tâche », « 2 tâches ». */
export function plural(count: number, word: string) {
  return count > 1 ? `${word}s` : word;
}

const sizeFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** Taille d'un fichier : « 245 Ko », « 1,2 Mo ». */
export function formatFileSize(bytes: number) {
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${sizeFormat.format(Math.ceil(kilobytes))} Ko`;
  return `${sizeFormat.format(kilobytes / 1024)} Mo`;
}
