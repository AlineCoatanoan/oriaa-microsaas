import { Navigate } from 'react-router';
import { LoadingState } from '@/components/ui/loading-state';
import { ResultMessage } from '@/components/ui/result-message';
import { useNavigationMessage } from '@/lib/useNavigationMessage';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { useSession } from './useSession';

export function LoginPage() {
  const { data: user, isPending } = useSession();
  // Message laissé par la page précédente (ex. : mot de passe réinitialisé)
  const message = useNavigationMessage();

  if (isPending) return <LoadingState className="min-h-dvh" />;
  // Déjà connecté : inutile d'afficher le formulaire
  if (user) return <Navigate to="/" replace />;

  return (
    <AuthLayout title="Connexion – Oriaa">
      <div className="space-y-2 text-structure">
        <h1>Bienvenue</h1>
        <p>Connectez-vous à votre espace Oriaa.</p>
      </div>

      <ResultMessage
        result={message ? { message, isError: false } : undefined}
      />
      <LoginForm />
    </AuthLayout>
  );
}
