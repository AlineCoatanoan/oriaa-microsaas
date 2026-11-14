import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Page précédente"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          aria-label={`Page ${number}`}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}
          className={cn(
            'size-11 rounded-lg font-medium text-structure hover:bg-page',
            number === page && 'bg-structure text-white hover:bg-structure',
          )}
        >
          {number}
        </button>
      ))}
      <Button
        variant="outline"
        size="icon"
        aria-label="Page suivante"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
