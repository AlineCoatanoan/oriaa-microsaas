import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import illustration from '@/assets/login-illustration.svg';
import logo from '@/assets/logo.svg';

/**
 * Mise en page des pages sans connexion (connexion, mot de passe oublié) :
 * le panneau Oriaa à gauche sur grand écran, le contenu dans une carte.
 */
export function AuthLayout({
  title,
  children,
}: {
  /** Titre de l'onglet du navigateur. */
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-surface">
      <title>{title}</title>

      <aside className="hidden w-2/5 max-w-lg flex-col justify-between bg-structure p-10 text-white lg:flex">
        <div className="flex items-center justify-center gap-3">
          <img src={logo} alt="" width={84} height={72} />
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

          {children}
        </div>
      </main>
    </div>
  );
}
