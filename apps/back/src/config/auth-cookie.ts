import type { CookieOptions } from 'express';
import { env } from './env.js';

/** Nom du cookie qui contient le token de connexion. */
export const AUTH_COOKIE_NAME = 'oriaa_token';

/**
 * Options du cookie de connexion :
 * - httpOnly : illisible par le JavaScript de la page (protection XSS)
 * - sameSite lax : non envoyé depuis un autre site (protection CSRF)
 * - secure : HTTPS uniquement en production (en local, on est en HTTP)
 * - maxAge : même durée que le token
 */
export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: env.JWT_EXPIRES_IN * 1000,
  path: '/',
};
