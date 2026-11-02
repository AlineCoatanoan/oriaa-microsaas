import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../errors/app-error.js';
import type { Prisma, Role, User } from '@prisma/client';

// Même message dans tous les cas : on ne révèle jamais
// si c'est l'email ou le mot de passe qui est faux.
const INVALID_CREDENTIALS = 'Email ou mot de passe incorrect.';

/** Informations de l'utilisateur exposées au front (jamais le mot de passe). */
export function toPublicUser(user: User & { role: Role }) {
  return {
    id: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    job: user.job,
    role: user.role.label,
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;

/** Renvoie l'utilisateur s'il existe et que son compte est actif, sinon null. */
export async function findActiveUser(where: Prisma.UserWhereUniqueInput) {
  const user = await prisma.user.findUnique({
    where,
    include: { role: true },
  });
  return user && !user.archived_at ? user : null;
}

/**
 * Vérifie les identifiants et renvoie un token + les informations de l'utilisateur.
 */
export async function login(email: string, password: string) {
  // Utilisateur inconnu ou compte archivé : connexion refusée
  const user = await findActiveUser({ email });
  if (!user) throw new UnauthorizedError(INVALID_CREDENTIALS);

  // Compare le mot de passe saisi avec le hash stocké en base
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(INVALID_CREDENTIALS);
  }

  const token = signAccessToken({
    userId: user.user_id,
    role: user.role.label,
  });

  return {
    token,
    user: toPublicUser(user),
  };
}
