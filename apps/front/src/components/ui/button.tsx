import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-structure hover:bg-accent/90',
        outline: 'border border-muted bg-surface text-structure hover:bg-page',
        danger:
          'border border-danger bg-surface text-danger hover:bg-danger-soft',
      },
      size: {
        default: 'min-h-11 px-4 py-2',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Requête en cours : le bouton est désactivé et affiche un indicateur. */
    pending?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  type = 'button',
  pending = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {pending && (
        <LoaderCircle
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
