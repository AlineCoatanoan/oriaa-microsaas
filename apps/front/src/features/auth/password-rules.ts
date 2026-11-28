import { z } from 'zod/mini';

/** Nouveau mot de passe : mêmes règles que le back, 12 caractères au moins, 72 au plus. */
export const newPassword = z
  .string()
  .check(
    z.minLength(12, 'Le mot de passe doit contenir au moins 12 caractères.'),
    z.maxLength(72, 'Le mot de passe doit contenir au plus 72 caractères.'),
  );

/** Aide affichée sous un champ de nouveau mot de passe. */
export const NEW_PASSWORD_HINT = '12 caractères minimum.';

/** Message quand la confirmation diffère du nouveau mot de passe. */
export const PASSWORDS_DIFFER = 'Les deux mots de passe ne correspondent pas.';
