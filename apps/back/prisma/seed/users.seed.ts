import { ROLES } from '../../src/config/roles.js';
import { hashPassword } from '../../src/lib/password.js';
import prisma from '../../src/lib/prisma.js';
import { daysFromNow, idOf, type SeedIds } from './helpers.js';

/** Même mot de passe pour tous les comptes de démonstration. */
const PASSWORD = 'Oriaa123!';

// prettier-ignore
const users = [
  { key: 'aline', lastName: 'Coatanoan', firstName: 'Aline', job: 'Développeuse', role: ROLES.ADMIN },
  { key: 'martine', lastName: 'Lebrun', firstName: 'Martine', job: 'Cheffe de service', role: ROLES.ADMIN },
  { key: 'george', lastName: 'Orwell', firstName: 'George', job: 'Éducateur spécialisé', role: ROLES.USER },
  { key: 'ines', lastName: 'Roussel', firstName: 'Inès', job: 'Assistante de service social', role: ROLES.USER },
  { key: 'paul', lastName: 'Lemaire', firstName: 'Paul', job: 'Conseiller en insertion professionnelle', role: ROLES.USER },
  // A quitté la structure : son compte est archivé mais ses dossiers gardent son nom
  { key: 'helene', lastName: 'Faure', firstName: 'Hélène', job: 'Éducatrice spécialisée', role: ROLES.USER, archivedDaysAgo: 60 },
];

export async function seedUsers(roles: SeedIds): Promise<SeedIds> {
  const password = await hashPassword(PASSWORD);
  const ids: SeedIds = {};

  for (const {
    key,
    lastName,
    firstName,
    job,
    role,
    archivedDaysAgo,
  } of users) {
    const user = await prisma.user.create({
      data: {
        last_name: lastName,
        first_name: firstName,
        // « Inès » → « ines » : pas d'accent dans les adresses e-mail
        email: `${firstName}.${lastName}@oriaa.test`
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase(),
        password,
        job,
        role_id: idOf(roles, role),
        archived_at:
          archivedDaysAgo === undefined ? null : daysFromNow(-archivedDaysAgo),
      },
    });
    ids[key] = user.user_id;
  }

  return ids;
}
