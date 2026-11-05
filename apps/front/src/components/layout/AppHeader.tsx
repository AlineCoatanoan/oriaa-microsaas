import { Search, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import logo from '@/assets/logo.svg';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 bg-structure px-4 text-white md:sticky md:top-0 md:z-10">
      <Link to="/" className="flex shrink-0 items-center gap-2 md:w-60">
        <img src={logo} alt="" width={36} height={31} />
        <span className="font-title text-2xl font-semibold">Oriaa</span>
      </Link>

      <div className="flex min-w-0 items-center gap-4">
        {/* La recherche et le profil seront activés par leurs propres tickets */}
        <div className="relative hidden w-72 md:block">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-interaction"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Rechercher"
            placeholder="Rechercher…"
            disabled
            className="w-full rounded-md bg-surface py-1.5 pr-3 pl-9 text-sm text-structure placeholder:text-interaction"
          />
        </div>
        <button
          type="button"
          aria-label="Profil"
          disabled
          className="flex size-10 items-center justify-center"
        >
          <UserRound className="size-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
