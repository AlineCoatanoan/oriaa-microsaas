import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ELLIPSIS, pageNumbers } from '@/lib/paginate';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Tooltip } from './tooltip';

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  // Sur téléphone, sans les pages voisines : la barre tient en largeur
  const lists = [
    { siblings: 0, className: 'flex sm:hidden' },
    { siblings: 1, className: 'hidden sm:flex' },
  ];

  return (
    <nav aria-label="Pagination" className="flex justify-center gap-1">
      <Tooltip text="Page précédente">
        <Button
          variant="outline"
          size="icon"
          aria-label="Page précédente"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
      </Tooltip>
      {lists.map(({ siblings, className }) => (
        <ul key={siblings} className={cn('gap-1', className)}>
          {pageNumbers(page, pageCount, siblings).map((number, index) =>
            number === ELLIPSIS ? (
              <li
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex w-6 items-end justify-center pb-2 text-muted"
              >
                {ELLIPSIS}
              </li>
            ) : (
              <li key={number}>
                <button
                  type="button"
                  aria-label={`Page ${number}`}
                  aria-current={number === page ? 'page' : undefined}
                  onClick={() => onChange(number)}
                  className={cn(
                    'size-11 rounded-lg font-medium text-structure hover:bg-page',
                    number === page &&
                      'bg-structure text-white hover:bg-structure',
                  )}
                >
                  {number}
                </button>
              </li>
            ),
          )}
        </ul>
      ))}
      <Tooltip text="Page suivante">
        <Button
          variant="outline"
          size="icon"
          aria-label="Page suivante"
          disabled={page === pageCount}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </Tooltip>
    </nav>
  );
}
