import { hashPassword } from '../../src/lib/password.js';
import prisma from '../../src/lib/prisma.js';
import type { SeedRoles } from './types.js';

export async function seedUsers(roles: SeedRoles) {
  const password = await hashPassword('Oriaa123!');

  const admin = await prisma.user.create({
    data: {
      last_name: 'Coatanoan',
      first_name: 'Aline',
      email: 'aline.coatanoan@oriaa.test',
      password,
      job: 'Developpeuse',
      role_id: roles.adminRole.role_id,
    },
  });

  const user = await prisma.user.create({
    data: {
      last_name: 'Orwell',
      first_name: 'George',
      email: 'george.orwell@oriaa.test',
      password,
      job: 'Travailleur social',
      role_id: roles.userRole.role_id,
    },
  });

  return {
    admin,
    user,
  };
}
