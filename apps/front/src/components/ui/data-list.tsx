import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/utils';

type DataListProps = {
  /** Nombre de résultats, annoncé aux lecteurs d'écran (ex. : « 3 tâches »). */
  status: string;
  page: number;
  pageCount: number;
  isEmpty: boolean;
  emptyMessage: string;
  /** Grille partagée par l'en-tête et les lignes, quand la liste est assez large. */
  columns: string;
  /** Titres des colonnes, masqués quand la liste est étroite. */
  headers: ReactNode;
  children: ReactNode;
};

/**
 * Liste en tableau : une ligne par élément, en cartes quand la place manque.
 * La mise en page suit la largeur de la liste (@container), pas celle de
 * l'écran : un onglet de fiche est plus étroit que la page Tâches.
 */
export function DataList({
  status,
  page,
  pageCount,
  isEmpty,
  emptyMessage,
  columns,
  headers,
  children,
}: DataListProps) {
  return (
    <div className="@container">
      <p role="status" className="px-4 pt-4 text-sm text-muted md:px-6">
        {status}
        {pageCount > 1 && ` · page ${page} sur ${pageCount}`}
      </p>

      {isEmpty ? (
        <p className="px-4 py-8 text-center text-muted md:px-6">
          {emptyMessage}
        </p>
      ) : (
        <>
          <div
            aria-hidden="true"
            className={cn(
              columns,
              'mt-2 hidden border-b border-border px-6 pb-2 text-xs font-semibold tracking-wide text-muted uppercase',
            )}
          >
            {headers}
          </div>
          <ul className="divide-y divide-border">{children}</ul>
        </>
      )}
    </div>
  );
}

type DataListRowProps = {
  columns: string;
  /** Boutons d'action, en fin de ligne. */
  actions: ReactNode;
  children: ReactNode;
};

export function DataListRow({ columns, actions, children }: DataListRowProps) {
  return (
    <li
      className={cn(
        columns,
        'relative grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 px-4 py-3 hover:bg-page md:px-6',
      )}
    >
      <div className="min-w-0 space-y-2 @3xl:contents @3xl:space-y-0">
        {children}
      </div>
      <div className="flex items-start @3xl:items-center">{actions}</div>
    </li>
  );
}

/** Lien principal d'une ligne : il la rend cliquable en entier (after:inset-0). */
export function RowLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        'font-medium after:absolute after:inset-0 hover:underline',
        className,
      )}
      {...props}
    />
  );
}

type IconLinkProps = {
  to: string;
  label: string;
  icon: LucideIcon;
};

/** Action d'une ligne, placée au-dessus de RowLink pour rester cliquable. */
export function IconLink({ to, label, icon: Icon }: IconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative z-10 flex size-11 items-center justify-center rounded-lg text-interaction hover:bg-page"
    >
      <Icon className="size-5" aria-hidden="true" />
    </Link>
  );
}
