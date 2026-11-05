import type { ComponentProps } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils';

export const Tabs = BaseTabs.Root;

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-border',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTab({
  className,
  ...props
}: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 font-medium text-muted hover:text-structure data-active:border-accent data-active:text-structure',
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({
  className,
  ...props
}: ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn('py-4', className)} {...props} />;
}
