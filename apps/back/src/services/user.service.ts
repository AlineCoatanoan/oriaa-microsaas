import { randomUUID } from 'node:crypto';
import type { Role, User } from '@prisma/client';
import prisma from '../lib/prisma.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/app-error.js';
import type {
  CreateUserInput,
  UpdateUserInput,
} from '../schemas/user.schema.js';
import { hashPassword } from '../lib/password.js';
import { toPublicUser } from '../lib/dto.js';
import type { RoleLabel } from '../config/roles.js';

/** Format renvoyé au front. */
const toUserDto = (user: User & { role: Role }) => ({
  ...toPublicUser(user),
  archivedAt: user.archived_at,
});

/** Relie le compte à son rôle, en le créant s'il n'existe pas encore. */
const toRoleLink = (label: RoleLabel) => ({
  connectOrCreate: { where: { label }, create: { label } },
});

/** Vérifie que ces utilisateurs existent et sont actifs, sinon 400. */
export async function assertActiveUsers(ids: number[], message: string) {
  const count = await prisma.user.count({
    where: { user_id: { in: ids }, archived_at: null },
  });
  if (count !== ids.length) throw new BadRequestError(message);
}

/** Renvoie le compte avec son rôle, ou une 404 s'il n'existe pas ou a été supprimé. */
async function findUserOrFail(id: number) {
  const user = await prisma.user.findFirst({
    where: { user_id: id, deleted_at: null },
    include: { role: true },
  });
  if (!user) throw new NotFoundError('Utilisateur introuvable.');
  return user;
}

/** Un admin ne peut pas agir ainsi sur son propre compte. */
function assertNotSelf(id: number, currentUserId: number, message: string) {
  if (id === currentUserId) throw new ConflictError(message);
}

/** Liste les comptes actifs ou archivés, triés par nom. Jamais les comptes supprimés. */
export async function findAll(options: { archived: boolean }) {
  const users = await prisma.user.findMany({
    where: {
      deleted_at: null,
      archived_at: options.archived ? { not: null } : null,
    },
    include: { role: true },
    orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
  });

  return users.map(toUserDto);
}

/** Crée un compte avec un mot de passe provisoire. */
export async function create(data: CreateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new ConflictError('Cet email est déjà utilisé.');

  const user = await prisma.user.create({
    data: {
      last_name: data.lastName,
      first_name: data.firstName,
      email: data.email,
      password: await hashPassword(data.password),
      job: data.job,
      role: toRoleLink(data.role),
    },
    include: { role: true },
  });

  return toUserDto(user);
}

/** Modifie la fonction et/ou le rôle d'un compte actif. */
export async function update(
  id: number,
  data: UpdateUserInput,
  currentUserId: number,
) {
  const existing = await findUserOrFail(id);
  if (existing.archived_at) {
    throw new ConflictError('Un compte archivé ne peut pas être modifié.');
  }
  if (data.role) {
    assertNotSelf(id, currentUserId, 'Vous ne pouvez pas modifier votre rôle.');
  }

  const user = await prisma.user.update({
    where: { user_id: id },
    data: {
      job: data.job,
      role: data.role ? toRoleLink(data.role) : undefined,
    },
    include: { role: true },
  });

  return toUserDto(user);
}

/** Archive un compte : plus de connexion, et ses filtres enregistrés sont retirés. */
export async function archive(id: number, currentUserId: number) {
  assertNotSelf(id, currentUserId, 'Vous ne pouvez pas archiver votre compte.');

  const existing = await findUserOrFail(id);
  if (existing.archived_at) {
    throw new ConflictError('Ce compte est déjà archivé.');
  }

  const [, user] = await prisma.$transaction([
    prisma.filterPreference.deleteMany({
      where: { OR: [{ user_id_define: id }, { user_id_target: id }] },
    }),
    prisma.user.update({
      where: { user_id: id },
      data: { archived_at: new Date() },
      include: { role: true },
    }),
  ]);

  return toUserDto(user);
}

/**
 * Supprime un compte archivé en l'anonymisant (RGPD).
 * La ligne reste pour que ses notes, tâches et rendez-vous gardent leur auteur.
 */
export async function remove(id: number, currentUserId: number) {
  assertNotSelf(
    id,
    currentUserId,
    'Vous ne pouvez pas supprimer votre compte.',
  );

  const existing = await findUserOrFail(id);
  if (!existing.archived_at) {
    throw new ConflictError(
      "Seul un compte archivé peut être supprimé. Archivez-le d'abord.",
    );
  }

  await prisma.user.update({
    where: { user_id: id },
    data: {
      first_name: 'Utilisateur',
      last_name: 'supprimé',
      email: `supprime-${id}@oriaa.invalid`,
      // Mot de passe aléatoire : personne ne peut plus se connecter à ce compte
      password: await hashPassword(randomUUID()),
      job: '',
      deleted_at: new Date(),
    },
  });
}
