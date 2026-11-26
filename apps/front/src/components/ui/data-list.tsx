import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
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

// Le lien ou bouton principal rend toute la ligne cliquable (after:inset-0)
const rowActionClass =
  'font-medium after:absolute after:inset-0 hover:underline';

/** Lien principal d'une ligne. */
export function RowLink({ className, ...props }: LinkProps) {
  return <Link className={cn(rowActionClass, className)} {...props} />;
}

/** Bouton principal d'une ligne, quand il ouvre une fenêtre au lieu d'une page. */
export function RowButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(rowActionClass, 'text-left', className)}
      {...props}
    />
  );
}

// Au-dessus du lien de la ligne (z-10) pour rester cliquable
const iconActionClass =
  'relative z-10 flex size-11 items-center justify-center rounded-lg hover:bg-page';

type IconLinkProps = {
  to: string;
  label: string;
  icon: LucideIcon;
};

/** Action d'une ligne qui mène à une page. */
export function IconLink({ to, label, icon: Icon }: IconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(iconActionClass, 'text-interaction')}
    >
      <Icon className="size-5" aria-hidden="true" />
    </Link>
  );
}

type IconButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Rouge pour une action destructrice (supprimer). */
  danger?: boolean;
};

/** Action d'une ligne qui ouvre une fenêtre. */
export function IconButton({
  label,
  icon: Icon,
  onClick,
  danger = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        iconActionClass,
        danger ? 'text-danger hover:bg-danger-soft' : 'text-interaction',
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}
