import prisma from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import { BadRequestError, UnauthorizedError } from '../errors/app-error.js';
import type { Prisma } from '@prisma/client';
import { toPublicUser } from '../lib/dto.js';
import type { ChangePasswordInput } from '../schemas/auth.schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';

// Même message dans tous les cas : on ne révèle jamais
// si c'est l'email ou le mot de passe qui est faux.
const INVALID_CREDENTIALS = 'Email ou mot de passe incorrect.';

/** Renvoie l'utilisateur s'il existe et que son compte est actif, sinon null. */
export function findActiveUser(where: Prisma.UserWhereInput) {
  return prisma.user.findFirst({
    where: { ...where, archived_at: null },
    include: { role: true },
  });
}

/**
 * Vérifie les identifiants et renvoie un token + les informations de l'utilisateur.
 */
export async function login(email: string, password: string) {
  // Utilisateur inconnu ou compte archivé : connexion refusée
  const user = await findActiveUser({ email });
  if (!user) throw new UnauthorizedError(INVALID_CREDENTIALS);

  // Compare le mot de passe saisi avec le hash stocké en base
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(INVALID_CREDENTIALS);
  }

  const token = signAccessToken(user.user_id);

  return {
    token,
    user: toPublicUser(user),
  };
}

/** Change le mot de passe de l'utilisateur connecté, après vérification de l'ancien. */
export async function changePassword(
  userId: number,
  data: ChangePasswordInput,
) {
  const user = await findActiveUser({ user_id: userId });
  if (!user) throw new UnauthorizedError();

  const isPasswordValid = await verifyPassword(
    data.currentPassword,
    user.password,
  );
  if (!isPasswordValid) {
    throw new BadRequestError('Mot de passe actuel incorrect.');
  }

  await prisma.user.update({
    where: { user_id: userId },
    data: { password: await hashPassword(data.newPassword) },
  });
}
