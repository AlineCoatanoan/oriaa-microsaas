import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

type ErrorBody = {
  error: { code: string; message: string; details?: unknown; stack?: string };
};

/** Erreur levée par express.json() quand le corps n'est pas un JSON valide. */
function isJsonSyntaxError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: unknown }).type === 'entity.parse.failed'
  );
}

/**
 * Gestionnaire d'erreurs global : dernier middleware de app.ts.
 * Express le reconnaît grâce à ses 4 paramètres.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Réponse déjà partiellement envoyée : on laisse Express gérer
  if (res.headersSent) {
    next(err);
    return;
  }

  // 1. Erreur prévue : code HTTP et message transmis au client
  if (err instanceof AppError) {
    const body: ErrorBody = { error: { code: err.code, message: err.message } };
    if (err.details !== undefined) body.error.details = err.details;
    res.status(err.statusCode).json(body);
    return;
  }

  // 2. JSON mal formé envoyé par le client
  if (isJsonSyntaxError(err)) {
    res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: "Le corps de la requête n'est pas un JSON valide.",
      },
    });
    return;
  }

  // 3. Erreur imprévue : journalisée côté serveur, masquée côté client
  if (env.NODE_ENV !== 'test') {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  const body: ErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Une erreur interne est survenue.',
    },
  };
  // La stack trace n'est exposée qu'en développement local
  if (env.NODE_ENV === 'development' && err instanceof Error) {
    body.error.stack = err.stack;
  }
  res.status(500).json(body);
};
