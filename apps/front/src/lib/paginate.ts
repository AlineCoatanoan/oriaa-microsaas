/** Découpe une liste en pages. Une page trop grande ramène à la dernière. */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    pageCount,
  };
}

export const ELLIPSIS = '…' as const;

/**
 * Numéros à afficher dans la pagination : la première et la dernière page,
 * la page courante et ses voisines, « … » à la place des autres.
 * Ex. : page 5 sur 10, 1 voisine → [1, '…', 4, 5, 6, '…', 10].
 * Les points ne remplacent jamais une seule page : elle est affichée.
 */
export function pageNumbers(
  page: number,
  pageCount: number,
  siblings: number,
): (number | typeof ELLIPSIS)[] {
  const first = Math.max(2, page - siblings);
  const last = Math.min(pageCount - 1, page + siblings);
  const range = (from: number, to: number) =>
    Array.from(
      { length: Math.max(0, to - from + 1) },
      (_, index) => from + index,
    );

  return [
    1,
    ...(first > 3 ? [ELLIPSIS] : range(2, first - 1)),
    ...range(first, last),
    ...(last < pageCount - 2 ? [ELLIPSIS] : range(last + 1, pageCount - 1)),
    ...(pageCount > 1 ? [pageCount] : []),
  ];
}
