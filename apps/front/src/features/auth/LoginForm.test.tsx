import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LoginForm } from './LoginForm';

function renderLoginForm() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginForm /> },
      { path: '/', element: <h1>Accueil</h1> },
    ],
    { initialEntries: ['/login'] },
  );

  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function submit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Adresse e-mail'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('Mot de passe'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
}

describe('LoginForm', () => {
  it("affiche les erreurs de saisie sans appeler l'API", () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    renderLoginForm();

    submit('invalide', '');

    expect(
      screen.getByText('Saisissez une adresse e-mail valide.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Saisissez votre mot de passe.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("affiche l'erreur renvoyée par l'API", async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { message: 'Email ou mot de passe incorrect.' },
        }),
        { status: 401 },
      ),
    );
    renderLoginForm();

    submit('a@oriaa.test', 'mauvais');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email ou mot de passe incorrect.',
    );
  });

  it("redirige vers l'accueil après la connexion", async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ user: { id: 1, role: 'user' } }), {
        status: 200,
      }),
    );
    renderLoginForm();

    submit('a@oriaa.test', 'Oriaa123!');

    expect(
      await screen.findByRole('heading', { name: 'Accueil' }),
    ).toBeInTheDocument();
  });
});
