import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tones, type Tone } from './tones';

type SelectProps = ComponentProps<'select'> & {
  tone?: Tone;
};

/** Liste native : accessible et adaptée au téléphone, sans JavaScript ajouté. */
export function Select({ className, tone, ...props }: SelectProps) {
  return (
    <div className="relative inline-block w-full">
      <select
        className={cn(
          'min-h-11 w-full appearance-none rounded-lg py-2 pr-9 pl-3 font-medium disabled:opacity-50',
          tone ? tones[tone] : 'border border-muted bg-surface text-structure',
          className,
        )}
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}
