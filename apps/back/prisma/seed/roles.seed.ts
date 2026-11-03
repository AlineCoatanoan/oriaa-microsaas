import prisma from '../../src/lib/prisma.js';
import { ROLES } from '../../src/config/roles.js';

export async function seedRoles() {
  const adminRole = await prisma.role.create({
    data: {
      label: ROLES.ADMIN,
    },
  });

  const userRole = await prisma.role.create({
    data: {
      label: ROLES.USER,
    },
  });

  return {
    adminRole,
    userRole,
  };
}
