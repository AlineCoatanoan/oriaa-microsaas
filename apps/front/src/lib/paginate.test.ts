import { describe, it, expect } from 'vitest';
import { ELLIPSIS, pageNumbers, paginate } from './paginate';

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

describe('pageNumbers', () => {
  it('affiche toutes les pages quand il y en a peu', () => {
    expect(pageNumbers(1, 1, 1)).toEqual([1]);
    expect(pageNumbers(2, 3, 1)).toEqual([1, 2, 3]);
  });

  it('remplace les pages éloignées par « … »', () => {
    expect(pageNumbers(5, 10, 1)).toEqual([1, ELLIPSIS, 4, 5, 6, ELLIPSIS, 10]);
    expect(pageNumbers(5, 10, 0)).toEqual([1, ELLIPSIS, 5, ELLIPSIS, 10]);
  });

  it('garde la première et la dernière page aux extrémités', () => {
    expect(pageNumbers(1, 10, 1)).toEqual([1, 2, ELLIPSIS, 10]);
    expect(pageNumbers(10, 10, 1)).toEqual([1, ELLIPSIS, 9, 10]);
  });

  it('affiche une page seule plutôt que « … »', () => {
    expect(pageNumbers(4, 10, 1)).toEqual([1, 2, 3, 4, 5, ELLIPSIS, 10]);
  });
});
