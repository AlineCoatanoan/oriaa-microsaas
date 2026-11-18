import type { ComponentProps } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, inputIconClass } from './input';

type SearchInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Nom du champ annoncé aux lecteurs d'écran. */
  label: string;
};

export function SearchInput({ label, className, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className={inputIconClass} aria-hidden="true" />
      <Input type="search" aria-label={label} className="pl-10" {...props} />
    </div>
  );
}
