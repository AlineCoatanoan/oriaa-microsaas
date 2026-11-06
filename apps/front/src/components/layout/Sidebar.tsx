import {
  CalendarDays,
  House,
  ListTodo,
  LogOut,
  Settings,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { useLogout } from '@/features/auth/useLogout';
import { useSession } from '@/features/auth/useSession';
import { cn } from '@/lib/utils';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { to: '/', label: 'Accueil', icon: House },
  { to: '/beneficiaries', label: 'Bénéficiaires', icon: UsersRound },
  { to: '/tasks', label: 'Tâches', icon: ListTodo },
  { to: '/planning', label: 'Planning', icon: CalendarDays },
];

const adminNavItems: NavItem[] = [
  { to: '/users', label: 'Administration', icon: Settings },
];

/** Barre fixe en bas sur téléphone, colonne à gauche à partir de la tablette. */
export function Sidebar() {
  const { data: user } = useSession();
  const logout = useLogout();
  const items =
    user?.role === 'admin' ? [...navItems, ...adminNavItems] : navItems;

  return (
    <div className="md:sticky md:top-16 md:flex md:h-[calc(100dvh-4rem)] md:w-64 md:shrink-0 md:flex-col md:self-start md:p-4">
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-10 bg-structure md:static"
      >
        <ul className="flex md:flex-col md:gap-2">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to} className="min-w-0 flex-1 md:flex-none">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2 text-[11px] md:flex-row md:gap-3 md:rounded-lg md:px-4 md:py-3 md:text-base',
                    isActive
                      ? 'font-semibold text-accent md:bg-accent md:text-structure'
                      : 'text-white hover:bg-interaction',
                  )
                }
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sur téléphone, la déconnexion se trouve sur la page profil */}
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="mt-auto hidden items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-interaction disabled:opacity-50 md:flex"
      >
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        Se déconnecter
      </button>
    </div>
  );
}
