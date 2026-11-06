import { describe, it, expect, vi } from 'vitest';
import { api, ApiError, NETWORK_ERROR_STATUS } from './api';

function mockFetch(status: number, body?: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  );
}

describe('api', () => {
  it('envoie un objet en JSON et renvoie la réponse', async () => {
    const fetchMock = mockFetch(200, { id: 1 });

    const data = await api('/tasks', { method: 'POST', body: { title: 'A' } });

    expect(data).toEqual({ id: 1 });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/tasks');
    expect(options?.body).toBe('{"title":"A"}');
    expect(new Headers(options?.headers).get('Content-Type')).toBe(
      'application/json',
    );
  });

  it("transmet le code et le message d'erreur de l'API", async () => {
    mockFetch(403, { error: { message: 'Accès refusé.' } });

    await expect(api('/users')).rejects.toEqual(
      new ApiError(403, 'Accès refusé.'),
    );
  });

  it('signale un serveur injoignable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Failed to fetch'),
    );

    await expect(api('/tasks')).rejects.toMatchObject({
      status: NETWORK_ERROR_STATUS,
    });
  });
});
