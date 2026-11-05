import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-xl border border-border bg-surface p-4 md:p-6',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'inline-block border-b-2 border-accent pb-1 text-xl font-semibold text-structure',
        className,
      )}
      {...props}
    />
  );
}
