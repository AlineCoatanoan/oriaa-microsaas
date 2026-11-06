import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-lg border border-muted bg-surface px-3 py-2 text-structure placeholder:text-muted disabled:opacity-50 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}
