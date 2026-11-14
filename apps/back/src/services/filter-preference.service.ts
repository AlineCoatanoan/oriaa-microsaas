import prisma from '../lib/prisma.js';
import type { Listing } from '../config/constants.js';
import type { SaveFilterPreferenceInput } from '../schemas/filter-preference.schema.js';
import { assertActiveUsers } from './user.service.js';

const UNKNOWN_USER_MESSAGE = 'Utilisateur introuvable.';

/** Critère de recherche du filtre d'un utilisateur sur une liste. */
const filterKey = (userId: number, listing: Listing) => ({
  user_id_define_type_listing: {
    user_id_define: userId,
    type_listing: listing,
  },
});

/** Renvoie le filtre enregistré de l'utilisateur sur cette liste, ou null. */
export async function find(userId: number, listing: Listing) {
  const filter = await prisma.filterPreference.findUnique({
    where: filterKey(userId, listing),
  });
  return filter && { userId: filter.user_id_target };
}

/** Enregistre le filtre de l'utilisateur sur cette liste, ou remplace l'ancien. */
export async function save(
  userId: number,
  listing: Listing,
  data: SaveFilterPreferenceInput,
) {
  await assertActiveUsers([data.userId], UNKNOWN_USER_MESSAGE);

  const filter = await prisma.filterPreference.upsert({
    where: filterKey(userId, listing),
    update: { user_id_target: data.userId },
    create: {
      user_id_define: userId,
      user_id_target: data.userId,
      type_listing: listing,
    },
  });

  return { userId: filter.user_id_target };
}

/** Retire le filtre enregistré de l'utilisateur sur cette liste, s'il existe. */
export async function remove(userId: number, listing: Listing) {
  await prisma.filterPreference.deleteMany({
    where: { user_id_define: userId, type_listing: listing },
  });
}
