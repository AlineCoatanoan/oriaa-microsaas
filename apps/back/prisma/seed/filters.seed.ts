import prisma from '../../src/lib/prisma.js';
import type { SeedUsers } from './types.js';

export async function seedFilters(users: SeedUsers) {
  await prisma.filterPreference.create({
    data: {
      user_id_target: users.admin.user_id,
      user_id_define: users.user.user_id,
      type_listing: 'beneficiaries',
    },
  });

  await prisma.filterPreference.create({
    data: {
      user_id_target: users.user.user_id,
      user_id_define: users.admin.user_id,
      type_listing: 'tasks',
    },
  });
}
