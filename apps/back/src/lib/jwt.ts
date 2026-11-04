import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';

/**
 * Crée un token signé pour un utilisateur.
 * Il expire après JWT_EXPIRES_IN secondes.
 * Il ne contient que l'identifiant : le rôle est relu en base à chaque requête.
 */
export function signAccessToken(userId: number): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId), // identifiant de l'utilisateur (champ standard "sub")
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Vérifie un token et renvoie l'identifiant de l'utilisateur.
 * Token expiré, modifié ou invalide → erreur 401.
 */
export function verifyAccessToken(token: string): number {
  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'], // n'accepte que l'algorithme utilisé pour signer
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError(
        'Session expirée, veuillez vous reconnecter.',
      );
    }
    throw new UnauthorizedError('Token invalide.');
  }

  if (typeof decoded === 'string' || !decoded.sub) {
    throw new UnauthorizedError('Token invalide.');
  }

  return Number(decoded.sub);
}
