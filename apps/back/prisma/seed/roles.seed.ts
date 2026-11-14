import prisma from '../../src/lib/prisma.js';
import { ROLES } from '../../src/config/roles.js';
import type { SeedIds } from './helpers.js';

export async function seedRoles(): Promise<SeedIds> {
  const ids: SeedIds = {};

  for (const label of Object.values(ROLES)) {
    const role = await prisma.role.create({ data: { label } });
    ids[label] = role.role_id;
  }

  return ids;
}
