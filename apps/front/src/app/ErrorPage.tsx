import { Link } from 'react-router';
import { ErrorState } from '@/components/ui/error-state';

/** Affichée quand une page plante de façon imprévue. */
export function ErrorPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-4">
      <h1>Une erreur est survenue</h1>
      <ErrorState
        message="La page n'a pas pu s'afficher. Réessayez ou revenez à l'accueil."
        onRetry={() => window.location.reload()}
      />
      <Link to="/" className="text-interaction underline">
        Retour à l'accueil
      </Link>
    </main>
  );
}
