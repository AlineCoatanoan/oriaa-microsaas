import type { RequestHandler } from 'express';
import { NotFoundError } from '../errors/app-error.js';

/** Route inconnue : transmet une 404 au gestionnaire d'erreurs. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(
    new NotFoundError(`Route introuvable : ${req.method} ${req.originalUrl}`),
  );
};
