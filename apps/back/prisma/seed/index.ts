import prisma from '../../src/lib/prisma.js';

import { seedRoles } from './roles.seed.js';
import { seedUsers } from './users.seed.js';
import { seedBeneficiaries } from './beneficiaries.seed.js';
import { seedTasks } from './tasks.seed.js';
import { seedNotes } from './notes.seed.js';
import { seedAppointments } from './appointments.seed.js';
import { seedDocuments } from './documents.seed.js';
import { seedFilters } from './filters.seed.js';
import { seedLinks } from './links.seed.js';

async function main() {
  console.log('Début du seed...');

  const roles = await seedRoles();
  const users = await seedUsers(roles);
  const beneficiaries = await seedBeneficiaries(users);
  const tasks = await seedTasks(users, beneficiaries);
  const notes = await seedNotes(users, beneficiaries);
  const appointments = await seedAppointments(users, beneficiaries);
  await seedDocuments(users, beneficiaries);
  await seedFilters(users);
  await seedLinks(tasks, notes, appointments);

  console.log('Seed terminé.');
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
