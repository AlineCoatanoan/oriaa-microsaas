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
