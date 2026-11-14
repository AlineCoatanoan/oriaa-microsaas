import { describe, it, expect } from 'vitest';
import { paginate } from './paginate';

const items = [1, 2, 3, 4, 5];

describe('paginate', () => {
  it('renvoie les éléments de la page demandée', () => {
    expect(paginate(items, 2, 2)).toEqual({
      items: [3, 4],
      page: 2,
      pageCount: 3,
    });
  });

  it('ramène une page trop grande à la dernière', () => {
    expect(paginate(items, 9, 2)).toEqual({
      items: [5],
      page: 3,
      pageCount: 3,
    });
  });
});
