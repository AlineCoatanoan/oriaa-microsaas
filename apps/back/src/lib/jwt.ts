import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';

/** Informations contenues dans le token. */
export type TokenPayload = {
  userId: number;
  role: string;
};

/**
 * Crée un token signé pour un utilisateur.
 * Il expire après JWT_EXPIRES_IN secondes.
 */
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign({ role: payload.role }, env.JWT_SECRET, {
    subject: String(payload.userId), // identifiant de l'utilisateur (champ standard "sub")
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Vérifie un token et renvoie son contenu.
 * Token expiré, modifié ou invalide → erreur 401.
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'], // n'accepte que l'algorithme utilisé pour signer
    });

    if (
      typeof decoded === 'string' ||
      !decoded.sub ||
      typeof decoded.role !== 'string'
    ) {
      throw new UnauthorizedError('Token invalide.');
    }

    return { userId: Number(decoded.sub), role: decoded.role };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError(
        'Session expirée, veuillez vous reconnecter.',
      );
    }
    throw new UnauthorizedError('Token invalide.');
  }
}
