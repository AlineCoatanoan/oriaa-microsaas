import type { Prisma } from '@prisma/client';
import { ROLES } from '../config/roles.js';
import type { PublicUser } from './dto.js';

/** Personne connectée : ce qu'elle voit dépend de son rôle. */
export type Viewer = Pick<PublicUser, 'role'>;

/**
 * Tâches visibles : un admin voit tout ; un user ne voit pas les tâches
 * confiées uniquement à des admins (fonctionnement interne de la direction).
 */
export function visibleTasksWhere(viewer: Viewer): Prisma.TaskWhereInput {
  if (viewer.role === ROLES.ADMIN) return {};
  return { assignees: { some: { user: { role: { label: ROLES.USER } } } } };
}
