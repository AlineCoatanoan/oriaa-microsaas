import type { RequestHandler } from 'express';
import type { RoleLabel } from '../config/roles.js';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';

/**
 * Réserve une route à certains rôles.
 * À placer après authenticate, qui remplit res.locals.user.
 * Exemple : router.post('/', authenticate, authorize('admin'), createUser)
 */
export function authorize(...allowedRoles: RoleLabel[]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user;

    // Sécurité : si authenticate a été oublié, on refuse plutôt que d'ouvrir la route
    if (!user) throw new UnauthorizedError();

    // Connecté, mais pas le bon rôle : 403
    if (!allowedRoles.includes(user.role as RoleLabel)) {
      throw new ForbiddenError();
    }

    next();
  };
}

//allowedRoles permet de passer un ou plusieurs rôles : authorize('admin') ou authorize('admin', 'user').
// C’est une fonction qui fabrique un middleware. authorize('admin') renvoie le middleware configuré pour « admin ».
// C’est le même principe que validate({ body: ... })//
