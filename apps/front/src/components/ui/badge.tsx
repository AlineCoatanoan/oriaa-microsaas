import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { tones, type Tone } from './tones';

type BadgeProps = ComponentProps<'span'> & {
  tone?: Tone;
};

export function Badge({ className, tone = 'info', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-sm font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
