import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/app-error.js';

const WINDOW_MINUTES = 15;

/**
 * Limite le nombre de requêtes par adresse IP sur 15 minutes,
 * pour freiner les essais en boucle. Chaque limite a son propre compteur.
 */
function limitByIp(
  limit: number,
  message: string,
  // true : seules les requêtes refusées comptent
  skipSuccessfulRequests = false,
) {
  return rateLimit({
    windowMs: WINDOW_MINUTES * 60 * 1000,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError(message));
    },
  });
}

/** Échecs de connexion : une connexion réussie ne compte pas. */
export const loginRateLimit = limitByIp(
  10,
  `Trop de tentatives de connexion. Réessayez dans ${WINDOW_MINUTES} minutes.`,
  true,
);

/** Demandes de mot de passe oublié : chacune envoie un e-mail. */
export const forgotPasswordRateLimit = limitByIp(
  5,
  `Trop de demandes. Réessayez dans ${WINDOW_MINUTES} minutes.`,
);

/** Liens de réinitialisation refusés (jeton faux ou expiré). */
export const resetPasswordRateLimit = limitByIp(
  10,
  `Trop de tentatives. Réessayez dans ${WINDOW_MINUTES} minutes.`,
  true,
);
