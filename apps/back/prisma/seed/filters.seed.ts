import prisma from '../../src/lib/prisma.js';
import {
  BENEFICIARIES_LISTING,
  TASKS_LISTING,
} from '../../src/config/constants.js';
import { idOf, type SeedIds } from './helpers.js';

export async function seedFilters(users: SeedIds) {
  await prisma.filterPreference.createMany({
    data: [
      // Aline suit les tâches de George
      {
        user_id_define: idOf(users, 'aline'),
        user_id_target: idOf(users, 'george'),
        type_listing: TASKS_LISTING,
      },
      // George n'affiche que ses propres bénéficiaires
      {
        user_id_define: idOf(users, 'george'),
        user_id_target: idOf(users, 'george'),
        type_listing: BENEFICIARIES_LISTING,
      },
    ],
  });
}
