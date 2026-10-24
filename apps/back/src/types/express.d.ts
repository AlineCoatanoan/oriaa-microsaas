/** Ce fichier indique à TypeScript que res.locals.user existe, et quelle forme il a : */

import type { PublicUser } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Locals {
      /** Utilisateur connecté, renseigné par le middleware authenticate */
      user?: PublicUser;
    }
  }
}

export {};
