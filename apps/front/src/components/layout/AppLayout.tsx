import { Outlet } from 'react-router';
import { AppHeader } from './AppHeader';
import { MainNav } from './MainNav';

/** Structure commune des pages de l'application. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-structure">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-surface focus:p-3 focus:text-structure"
      >
        Aller au contenu
      </a>
      <AppHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <MainNav />
        <div className="flex min-w-0 flex-1 flex-col bg-page pb-16 text-structure md:mr-3 md:rounded-t-2xl md:pb-0">
          <main id="content" tabIndex={-1} className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
          <footer className="p-4 text-center text-sm text-interaction">
            © {new Date().getFullYear()} Oriaa
          </footer>
        </div>
      </div>
    </div>
  );
}
