import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../config/auth-cookie.js';
import { UnauthorizedError } from '../errors/app-error.js';

/** POST /api/auth/login */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const { token, user } = await authService.login(email, password);

  // Le token part dans le cookie, jamais dans le corps de la réponse
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.status(200).json({ user });
}

/** GET /api/auth/session : renvoie l'utilisateur connecté */
export function session(_req: Request, res: Response) {
  const user = res.locals.user;
  if (!user) throw new UnauthorizedError();

  res.status(200).json({ user });
}

/** POST /api/auth/logout : supprime le cookie de connexion */
export function logout(_req: Request, res: Response) {
  // Mêmes options qu'à la création (Express 5 ignore maxAge ici)
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
  res.status(204).end();
}
