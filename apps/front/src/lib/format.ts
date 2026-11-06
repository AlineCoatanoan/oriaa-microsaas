import type { BeneficiarySummary } from './types';

/** « Marie Dupont » pour un bénéficiaire, « 3 bénéficiaires » au-delà. */
export function formatBeneficiaries(beneficiaries: BeneficiarySummary[]) {
  if (beneficiaries.length === 0) return 'Aucun bénéficiaire';
  if (beneficiaries.length > 1) return `${beneficiaries.length} bénéficiaires`;
  const [{ firstName, lastName }] = beneficiaries;
  return `${firstName} ${lastName}`;
}
