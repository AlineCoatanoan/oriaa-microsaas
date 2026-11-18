import { Link } from 'react-router';

/** Adresse qui ne correspond à aucune page. */
export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <title>Page introuvable – Oriaa</title>
      <h1>Page introuvable</h1>
      <p className="text-muted">
        Cette adresse ne correspond à aucune page d'Oriaa.
      </p>
      <Link to="/" className="text-interaction underline">
        Retour à l'accueil
      </Link>
    </main>
  );
}
