import { describe, it, expect } from 'vitest';
import { filterBeneficiaries, sortBeneficiaries } from './filter-beneficiaries';
import type { Beneficiary } from './types';

const beneficiaries = [
  {
    id: 1,
    firstName: 'Hélène',
    lastName: 'Dupont',
    entryDate: '2026-03-01',
    referent: { id: 10 },
  },
  {
    id: 2,
    firstName: 'Marc',
    lastName: 'Girard',
    entryDate: '2025-11-12',
    referent: { id: 20 },
  },
] as Beneficiary[];

function ids(list: Beneficiary[]) {
  return list.map(({ id }) => id);
}

describe('filterBeneficiaries', () => {
  it('ignore les accents et les majuscules', () => {
    expect(
      ids(filterBeneficiaries(beneficiaries, { search: 'HELENE' })),
    ).toEqual([1]);
  });

  it('trouve le prénom et le nom dans les deux ordres', () => {
    expect(
      ids(filterBeneficiaries(beneficiaries, { search: 'marc gir' })),
    ).toEqual([2]);
  });

  it('filtre par référent', () => {
    expect(
      ids(filterBeneficiaries(beneficiaries, { search: '', referentId: 20 })),
    ).toEqual([2]);
  });
});

describe('sortBeneficiaries', () => {
  it("trie par date d'entrée, de la plus récente à la plus ancienne", () => {
    expect(ids(sortBeneficiaries(beneficiaries, 'date-desc', false))).toEqual([
      1, 2,
    ]);
    expect(ids(sortBeneficiaries(beneficiaries, 'date-asc', false))).toEqual([
      2, 1,
    ]);
  });
});
