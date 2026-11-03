import type { RequestHandler } from 'express';
import type { RoleLabel } from '../config/roles.js';
import { ForbiddenError } from '../errors/app-error.js';
import { getCurrentUser } from '../lib/current-user.js';

/**
 * Réserve une route à un ou plusieurs rôles : authorize('admin') ou authorize('admin', 'user').
 * Fabrique un middleware, sur le même principe que validate({ body: ... }).
 * À placer après authenticate, qui remplit res.locals.user.
 */
export function authorize(...allowedRoles: RoleLabel[]): RequestHandler {
  return (_req, res, next) => {
    // Si authenticate a été oublié, getCurrentUser refuse plutôt que d'ouvrir la route
    const user = getCurrentUser(res);

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
