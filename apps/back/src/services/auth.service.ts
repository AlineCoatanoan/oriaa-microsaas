import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import { BadRequestError, UnauthorizedError } from '../errors/app-error.js';
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
export function findActiveUser(where: Prisma.UserWhereInput) {
  return prisma.user.findFirst({
    where: { ...where, archived_at: null },
    include: { role: true },
  });
}

/** Vérifie que ces utilisateurs existent et sont actifs, sinon 400. */
export async function assertActiveUsers(ids: number[], message: string) {
  const count = await prisma.user.count({
    where: { user_id: { in: ids }, archived_at: null },
  });
  if (count !== ids.length) throw new BadRequestError(message);
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

  const token = signAccessToken(user.user_id);

  return {
    token,
    user: toPublicUser(user),
  };
}
