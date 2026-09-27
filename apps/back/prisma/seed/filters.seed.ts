import prisma from '../../src/lib/prisma.js';

export async function seedFilters(users: {
  admin: { user_id: string };
  user: { user_id: string };
}) {
  const filter1 = await prisma.filterPreference.create({
    data: {
      user_id_target: users.admin.user_id,
      user_id_define: users.user.user_id,
    },
  });

  const filter2 = await prisma.filterPreference.create({
    data: {
      user_id_target: users.user.user_id,
      user_id_define: users.admin.user_id,
    },
  });

  return {
    filter1,
    filter2,
  };
}
