import prisma from '../../src/lib/prisma.js';
import { TASKS_LISTING } from '../../src/config/constants.js';
import type { SeedUsers } from './types.js';

export async function seedFilters(users: SeedUsers) {
  await prisma.filterPreference.create({
    data: {
      user_id_target: users.user.user_id,
      user_id_define: users.admin.user_id,
      type_listing: TASKS_LISTING,
    },
  });
}
