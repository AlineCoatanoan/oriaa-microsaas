import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChangePasswordForm } from './ChangePasswordForm';

function renderForm() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ChangePasswordForm />
    </QueryClientProvider>,
  );
}

function submit(current: string, next: string, confirm: string) {
  fireEvent.change(screen.getByLabelText('Mot de passe actuel'), {
    target: { value: current },
  });
  fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
    target: { value: next },
  });
  fireEvent.change(screen.getByLabelText('Confirmer le nouveau mot de passe'), {
    target: { value: confirm },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Changer le mot de passe' }),
  );
}

describe('ChangePasswordForm', () => {
  it("refuse une confirmation différente sans appeler l'API", () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    renderForm();

    submit('Ancien123!', 'NouveauMotDePasse1', 'AutreMotDePasse1');

    expect(
      screen.getByText('Les deux mots de passe ne correspondent pas.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('confirme le changement de mot de passe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    renderForm();

    submit('Ancien123!', 'NouveauMotDePasse1', 'NouveauMotDePasse1');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Votre mot de passe a été modifié.',
    );
  });
});
