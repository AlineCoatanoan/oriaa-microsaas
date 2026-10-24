import type { RequestHandler } from 'express';
import prisma from '../lib/prisma.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { AUTH_COOKIE_NAME } from '../config/auth-cookie.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { toPublicUser } from '../services/auth.service.js';

/**
 * Protège une route : la requête doit contenir un cookie de connexion valide,
 * appartenant à un utilisateur existant et non archivé.
 * L'utilisateur est ensuite disponible dans res.locals.user.
 */
export const authenticate: RequestHandler = async (req, res, next) => {
  // 1. Le cookie est-il présent ?
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token !== 'string' || token === '') {
    throw new UnauthorizedError();
  }

  // 2. Le token est-il valide ? (sinon verifyAccessToken lance une 401)
  const { userId } = verifyAccessToken(token);

  // 3. L'utilisateur existe-t-il toujours, et son compte est-il actif ?
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: { role: true },
  });
  if (!user || user.archived_at) {
    throw new UnauthorizedError('Session invalide, veuillez vous reconnecter.');
  }

  // 4. L'utilisateur est transmis aux middlewares et controllers suivants
  res.locals.user = toPublicUser(user);
  next();
};
