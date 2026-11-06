import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ErrorPage } from './ErrorPage';
import { routes } from './router';

function BrokenPage(): never {
  throw new Error('Plantage');
}

function mockSession(status: number, role?: string) {
  const body = role
    ? { user: { id: 1, firstName: 'Julia', role } }
    : { error: { message: 'Erreur' } };
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
    String(input).includes('/auth/session')
      ? new Response(JSON.stringify(body), { status })
      : // Données vides pour les pages (tâches, rendez-vous…)
        new Response(JSON.stringify({ tasks: [], appointments: [] })),
  );
}

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

async function expectPage(name: string) {
  expect(await screen.findByRole('heading', { name })).toBeInTheDocument();
}

describe('routes', () => {
  it('redirige un visiteur non connecté vers la connexion', async () => {
    mockSession(401);
    renderRoute('/beneficiaries');
    await expectPage('Bienvenue');
  });

  it('affiche une page protégée à un utilisateur connecté', async () => {
    mockSession(200, 'user');
    renderRoute('/beneficiaries');
    await expectPage('Bénéficiaires');
  });

  it("n'envoie pas vers la connexion si la session ne peut pas être vérifiée", async () => {
    mockSession(500);
    renderRoute('/beneficiaries');
    expect(
      await screen.findByText('Impossible de vérifier votre session.'),
    ).toBeInTheDocument();
  });

  it('redirige un utilisateur sans droits depuis la page admin', async () => {
    mockSession(200, 'user');
    renderRoute('/users');
    await expectPage('Bonjour Julia');
  });

  it('affiche la page admin à un administrateur', async () => {
    mockSession(200, 'admin');
    renderRoute('/users');
    await expectPage('Utilisateurs');
  });

  it('affiche le lien Administration à un administrateur', async () => {
    mockSession(200, 'admin');
    renderRoute('/');
    expect(
      await screen.findByRole('link', { name: 'Administration' }),
    ).toBeInTheDocument();
  });

  it('masque le lien Administration aux autres utilisateurs', async () => {
    mockSession(200, 'user');
    renderRoute('/');
    await expectPage('Bonjour Julia');
    expect(
      screen.queryByRole('link', { name: 'Administration' }),
    ).not.toBeInTheDocument();
  });

  it("affiche la page d'erreur si une page plante", async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const router = createMemoryRouter(
      [
        {
          errorElement: <ErrorPage />,
          children: [{ path: '/', element: <BrokenPage /> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    await expectPage('Une erreur est survenue');
  });

  it("déconnecte l'utilisateur et renvoie vers la connexion", async () => {
    mockSession(200, 'user');
    renderRoute('/profile');
    await expectPage('Mon profil');

    const [logoutButton] = screen.getAllByRole('button', {
      name: 'Se déconnecter',
    });
    fireEvent.click(logoutButton);

    await expectPage('Bienvenue');
  });

  it('affiche une page 404 pour une route inconnue', async () => {
    renderRoute('/route-inconnue');
    await expectPage('Page introuvable');
  });
});
