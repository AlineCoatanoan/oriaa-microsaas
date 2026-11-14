import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '@/app/router';

const referent = (id: number, name: string) => ({
  id,
  name,
  status: 'active',
});

const responses: Record<string, unknown> = {
  '/api/auth/session': { user: { id: 1, firstName: 'Julia', role: 'user' } },
  '/api/users': {
    users: [
      { id: 1, firstName: 'Julia', lastName: 'Lucas' },
      { id: 2, firstName: 'Thomas', lastName: 'Roux' },
    ],
  },
  '/api/beneficiaries?archived=false': {
    beneficiaries: [
      {
        id: 1,
        lastName: 'Dupont',
        firstName: 'Marie',
        pathwayStatus: 'En cours',
        entryDate: '2026-02-04',
        referent: referent(1, 'Julia Lucas'),
      },
      {
        id: 2,
        lastName: 'Girard',
        firstName: 'Paul',
        pathwayStatus: 'En cours',
        entryDate: '2026-01-10',
        referent: referent(2, 'Thomas Roux'),
      },
    ],
  },
};

function renderPage(savedFilter: { userId: number } | null) {
  const fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/beneficiaries/filter-preference') {
        const body =
          init?.method === 'PUT'
            ? { filterPreference: JSON.parse(String(init.body)) }
            : { filterPreference: savedFilter };
        return new Response(JSON.stringify(body));
      }
      return new Response(JSON.stringify(responses[url]));
    });

  const router = createMemoryRouter(routes, {
    initialEntries: ['/beneficiaries'],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return fetchMock;
}

describe('BeneficiariesPage', () => {
  it('applique le filtre référent enregistré', async () => {
    renderPage({ userId: 2 });

    expect(
      await screen.findByRole('link', { name: 'Girard Paul' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Dupont Marie' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Filtre enregistré : Thomas Roux'),
    ).toBeInTheDocument();
  });

  it('enregistre le référent choisi', async () => {
    const fetchMock = renderPage(null);
    await screen.findByRole('link', { name: 'Dupont Marie' });

    fireEvent.change(screen.getByLabelText('Filtrer par référent'), {
      target: { value: '2' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer ce filtre' }),
    );

    expect(
      await screen.findByText('Filtre enregistré : Thomas Roux'),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/beneficiaries/filter-preference',
      expect.objectContaining({ method: 'PUT', body: '{"userId":2}' }),
    );
  });
});
