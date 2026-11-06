import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { tones, type Tone } from '@/components/ui/tones';
import { cn } from '@/lib/utils';

type StatCardProps = {
  to: string;
  icon: LucideIcon;
  value: number | undefined;
  label: string;
  /** Couleur de l'icône quand le chiffre demande de l'attention. */
  tone: Tone;
};

export function StatCard({
  to,
  icon: Icon,
  value,
  label,
  tone,
}: StatCardProps) {
  const isAlert = tone !== 'info' && Boolean(value);

  return (
    <Link
      to={to}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 hover:border-interaction sm:flex-row sm:items-center sm:gap-4 md:p-4"
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          isAlert ? tones[tone] : tones.info,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="font-title text-2xl font-semibold md:text-3xl">
          {value ?? '–'}
        </span>
        <span className="text-sm text-muted">{label}</span>
      </span>
    </Link>
  );
}
