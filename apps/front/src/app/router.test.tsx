import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './router';

function mockSession(status: number, role?: string) {
  const body = role
    ? { user: { id: 1, role } }
    : { error: { message: 'Erreur' } };
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () => new Response(JSON.stringify(body), { status }),
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
    await expectPage('Connexion');
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
    await expectPage('ORIAA');
  });

  it('affiche la page admin à un administrateur', async () => {
    mockSession(200, 'admin');
    renderRoute('/users');
    await expectPage('Utilisateurs');
  });

  it('affiche une page 404 pour une route inconnue', async () => {
    renderRoute('/route-inconnue');
    await expectPage('Page introuvable');
  });
});
