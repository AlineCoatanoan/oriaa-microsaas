import type { Response } from 'express';
import { UnauthorizedError } from '../errors/app-error.js';

/** Renvoie l'utilisateur connecté, ou une 401 si authenticate a été oublié. */
export function getCurrentUser(res: Response) {
  const user = res.locals.user;
  if (!user) throw new UnauthorizedError();
  return user;
}
