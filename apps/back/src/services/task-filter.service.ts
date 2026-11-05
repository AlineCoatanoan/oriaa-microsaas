import prisma from '../lib/prisma.js';
import type { SaveTaskFilterInput } from '../schemas/task-filter.schema.js';
import { assertActiveUsers } from './auth.service.js';
import { UNKNOWN_ASSIGNEE_MESSAGE } from './task.service.js';

const TASKS_LISTING = 'tasks';

/** Critère de recherche du filtre d'un utilisateur. */
const filterKey = (userId: number) => ({
  user_id_define_type_listing: {
    user_id_define: userId,
    type_listing: TASKS_LISTING,
  },
});

/** Renvoie le filtre enregistré de l'utilisateur, ou null. */
export async function find(userId: number) {
  const filter = await prisma.filterPreference.findUnique({
    where: filterKey(userId),
  });
  return filter && { assigneeId: filter.user_id_target };
}

/** Enregistre le filtre de l'utilisateur, ou remplace l'ancien. */
export async function save(userId: number, data: SaveTaskFilterInput) {
  await assertActiveUsers([data.assigneeId], UNKNOWN_ASSIGNEE_MESSAGE);

  const filter = await prisma.filterPreference.upsert({
    where: filterKey(userId),
    update: { user_id_target: data.assigneeId },
    create: {
      user_id_define: userId,
      user_id_target: data.assigneeId,
      type_listing: TASKS_LISTING,
    },
  });

  return { assigneeId: filter.user_id_target };
}

/** Retire le filtre enregistré de l'utilisateur, s'il existe. */
export async function remove(userId: number) {
  await prisma.filterPreference.deleteMany({
    where: { user_id_define: userId, type_listing: TASKS_LISTING },
  });
}
