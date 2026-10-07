import prisma from '../../src/lib/prisma.js';

export async function seedFilters(users: {
  admin: { user_id: number };
  user: { user_id: number };
}) {
  const filter1 = await prisma.filterPreference.create({
    data: {
      user_id_target: users.admin.user_id,
      user_id_define: users.user.user_id,
      type_listing: 'beneficiaries',
    },
  });

  const filter2 = await prisma.filterPreference.create({
    data: {
      user_id_target: users.user.user_id,
      user_id_define: users.admin.user_id,
      type_listing: 'tasks',
    },
  });

  return {
    filter1,
    filter2,
  };
}
