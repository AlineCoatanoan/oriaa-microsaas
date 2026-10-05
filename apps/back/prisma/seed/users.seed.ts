import bcrypt from 'bcrypt';
import prisma from '../../src/lib/prisma.js';

export async function seedUsers(roles: {
  adminRole: { role_id: number };
  userRole: { role_id: number };
}) {
  const password = await bcrypt.hash('Oriaa123!', 10);

  const admin = await prisma.user.create({
    data: {
      last_name: 'coatanoan',
      first_name: 'Aline',
      email: 'aline.coatanoan@oriaa.test',
      password,
      job: 'Developpeuse',
      created_at: new Date(),
      role_id: roles.adminRole.role_id,
    },
  });

  const user = await prisma.user.create({
    data: {
      last_name: 'orwell',
      first_name: 'George',
      email: 'george.orwell@oriaa.test',
      password,
      job: 'Travailleur social',
      created_at: new Date(),
      role_id: roles.userRole.role_id,
    },
  });

  return {
    admin,
    user,
  };
}
