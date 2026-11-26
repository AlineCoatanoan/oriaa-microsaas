import type { Prisma } from '@prisma/client';
import { ROLES } from '../config/roles.js';
import type { PublicUser } from './dto.js';

/** Personne connectée : ce qu'elle voit dépend de son rôle. */
export type Viewer = Pick<PublicUser, 'role'>;

/** Un admin voit tout ; un user ne voit pas le fonctionnement interne de la direction. */
const isUserViewer = (viewer: Viewer) => viewer.role !== ROLES.ADMIN;

/** Le compte est celui d'un simple utilisateur (pas d'un admin). */
const userAccount = { role: { label: ROLES.USER } };

/** Tâches visibles : un user ne voit pas les tâches confiées uniquement à des admins. */
export function visibleTasksWhere(viewer: Viewer): Prisma.TaskWhereInput {
  if (!isUserViewer(viewer)) return {};
  return { assignees: { some: { user: userAccount } } };
}

/** Rendez-vous visibles : un user ne voit pas les rendez-vous d'un admin. */
export function visibleAppointmentsWhere(
  viewer: Viewer,
): Prisma.AppointmentWhereInput {
  if (!isUserViewer(viewer)) return {};
  return { user: userAccount };
}
