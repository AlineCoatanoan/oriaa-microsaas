import { ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router';
import illustration from '@/assets/login-illustration.svg';
import logo from '@/assets/logo.svg';
import { LoadingState } from '@/components/ui/loading-state';
import { LoginForm } from './LoginForm';
import { useSession } from './useSession';

export function LoginPage() {
  const { data: user, isPending } = useSession();

  if (isPending) return <LoadingState className="min-h-dvh" />;
  // Déjà connecté : inutile d'afficher le formulaire
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-dvh bg-surface">
      <title>Connexion – Oriaa</title>

      <aside className="hidden w-2/5 max-w-lg flex-col justify-between bg-structure p-10 text-white lg:flex">
        <div className="flex items-center justify-center gap-3">
          <img src={logo} alt="" width={44} height={38} />
          <span className="font-title text-3xl font-semibold">Oriaa</span>
        </div>

        <div className="space-y-8">
          <p className="font-title text-4xl leading-tight font-semibold">
            Pour que l'accompagnement{' '}
            <span className="text-accent">reste au centre.</span>
          </p>
          <span className="block h-0.5 w-12 bg-accent" />
          <p className="text-center">Pensé par le terrain, pour l'essentiel.</p>
          <img
            src={illustration}
            alt=""
            width={320}
            height={190}
            className="w-full"
          />
        </div>

        <p className="flex items-center gap-3 text-sm">
          <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
          Vos données sont sécurisées et confidentielles. Conforme RGPD.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-page p-6 md:p-10">
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <img src={logo} alt="" width={36} height={31} />
            <span className="font-title text-2xl font-semibold text-structure">
              Oriaa
            </span>
          </div>

          <div className="space-y-2 text-structure">
            <h1>Bienvenue</h1>
            <p>Connectez-vous à votre espace Oriaa.</p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
