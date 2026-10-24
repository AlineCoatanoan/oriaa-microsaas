import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../config/auth-cookie.js';

/** POST /api/auth/login */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const { token, user } = await authService.login(email, password);

  // Le token part dans le cookie, jamais dans le corps de la réponse
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.status(200).json({ user });
}
