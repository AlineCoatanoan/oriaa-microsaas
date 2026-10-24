import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../errors/app-error.js';

// Même message dans tous les cas : on ne révèle jamais
// si c'est l'email ou le mot de passe qui est faux.
const INVALID_CREDENTIALS = 'Email ou mot de passe incorrect.';

/**
 * Vérifie les identifiants et renvoie un token + les informations de l'utilisateur.
 */
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // Utilisateur inconnu ou compte archivé : connexion refusée
  if (!user || user.archived_at) {
    throw new UnauthorizedError(INVALID_CREDENTIALS);
  }

  // Compare le mot de passe saisi avec le hash stocké en base
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(INVALID_CREDENTIALS);
  }

  const token = signAccessToken({
    userId: user.user_id,
    role: user.role.label,
  });

  // Informations renvoyées au front (jamais le mot de passe)
  return {
    token,
    user: {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      job: user.job,
      role: user.role.label,
    },
  };
}
