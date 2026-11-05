/** Erreur renvoyée par l'API, avec son code HTTP et son message. */
export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Appelle l'API. Le cookie de connexion est envoyé automatiquement. */
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, options);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.error?.message ?? 'Une erreur est survenue.',
    );
  }

  // 204 : succès, sans contenu à lire
  return response.status === 204 ? (undefined as T) : response.json();
}
