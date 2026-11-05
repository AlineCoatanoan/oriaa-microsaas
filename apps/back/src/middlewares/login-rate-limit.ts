import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/app-error.js';

/** Limite les échecs de connexion par adresse IP, pour freiner les essais en boucle. */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  skipSuccessfulRequests: true, // une connexion réussie ne compte pas
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      ),
    );
  },
});
