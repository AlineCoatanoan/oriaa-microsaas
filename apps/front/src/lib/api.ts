/** Erreur renvoyée par l'API, avec son code HTTP et son message. */
export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Code utilisé quand le serveur ne répond pas. */
export const NETWORK_ERROR_STATUS = 0;

type ApiOptions = Omit<RequestInit, 'body'> & {
  /** Objet envoyé en JSON, ou FormData pour un fichier. */
  body?: unknown;
};

/** Appelle l'API. Le cookie de connexion est envoyé automatiquement. */
export async function api<T>(
  path: string,
  { body, headers, ...options }: ApiOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    // Le navigateur ajoute lui-même le bon Content-Type
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (error) {
    // Requête annulée volontairement : on ne la transforme pas
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      NETWORK_ERROR_STATUS,
      'Impossible de joindre le serveur. Vérifiez votre connexion.',
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      data?.error?.message ?? 'Une erreur est survenue.',
    );
  }

  // 204 : succès, sans contenu à lire
  return response.status === 204 ? (undefined as T) : response.json();
}

/** Message à afficher : celui de l'API, ou un message générique pour une erreur imprévue. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'Une erreur inattendue est survenue.';
}
