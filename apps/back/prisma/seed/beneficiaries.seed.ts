import prisma from '../../src/lib/prisma.js';
import {
  DEFAULT_PATHWAY_STATUS,
  EXIT_PATHWAY_STATUS,
  PREPARING_EXIT_PATHWAY_STATUS,
} from '../../src/config/constants.js';
import { daysFromNow, idOf, type SeedIds } from './helpers.js';

/** Hébergement collectif : les personnes accueillies vivent toutes à la résidence. */
const RESIDENCE = {
  postalCode: '30000',
  city: 'Nîmes',
  address: (housing: number) =>
    `Résidence Les Oliviers, logement ${housing}, 12 rue des Oliviers`,
};

type SeedBeneficiary = {
  key: string;
  lastName: string;
  firstName: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  familyStatus?: string;
  children?: number;
  household?: string;
  /** Dossier incomplet : pas encore d'adresse renseignée. */
  withoutAddress?: boolean;
  /** Arrivée dans la structure, en jours avant aujourd'hui. */
  entryDaysAgo: number;
  /** Sortie de la structure : le dossier est archivé. */
  exitDaysAgo?: number;
  preparingExit?: boolean;
  referent: string;
};

// prettier-ignore
const beneficiaries: SeedBeneficiary[] = [
  { key: 'durand', lastName: 'Durand', firstName: 'Lucas', birthDate: '1992-04-15', phone: '0600000001', email: 'lucas.durand@example.test', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 300, referent: 'george' },
  { key: 'petit', lastName: 'Petit', firstName: 'Sarah', birthDate: '1987-09-23', phone: '0600000002', email: 'sarah.petit@example.test', familyStatus: 'Séparé(e)', children: 2, household: 'Parent avec enfants', entryDaysAgo: 250, referent: 'george' },
  { key: 'moreau', lastName: 'Moreau', firstName: 'Nadia', birthDate: '1998-11-07', phone: '0600000003', email: 'nadia.moreau@example.test', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 420, preparingExit: true, referent: 'george' },
  { key: 'traore', lastName: 'Traoré', firstName: 'Moussa', birthDate: '2001-02-11', phone: '0600000004', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 45, referent: 'george' },
  { key: 'lefevre', lastName: 'Lefèvre', firstName: 'Céline', birthDate: '1979-06-30', phone: '0600000005', email: 'celine.lefevre@example.test', familyStatus: 'Divorcé(e)', children: 3, household: 'Parent avec enfants', entryDaysAgo: 180, referent: 'ines' },
  { key: 'nguyen', lastName: 'Nguyen', firstName: 'Linh', birthDate: '1995-12-02', phone: '0600000006', email: 'linh.nguyen@example.test', familyStatus: 'En couple', children: 1, household: 'Couple avec enfant', entryDaysAgo: 130, referent: 'ines' },
  { key: 'robert', lastName: 'Robert', firstName: 'Jean', birthDate: '1961-03-19', phone: '0600000007', familyStatus: 'Veuf / veuve', children: 2, household: 'Personne seule', entryDaysAgo: 510, preparingExit: true, referent: 'ines' },
  { key: 'diallo', lastName: 'Diallo', firstName: 'Aminata', birthDate: '1990-08-08', phone: '0600000008', email: 'aminata.diallo@example.test', familyStatus: 'Marié(e)', children: 4, household: 'Couple avec enfants', entryDaysAgo: 95, referent: 'ines' },
  { key: 'garcia', lastName: 'Garcia', firstName: 'Antonio', birthDate: '1984-01-25', phone: '0600000009', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 60, referent: 'paul' },
  { key: 'bernard', lastName: 'Bernard', firstName: 'Émilie', birthDate: '1999-05-14', phone: '0600000010', email: 'emilie.bernard@example.test', familyStatus: 'Célibataire', children: 1, household: 'Parent avec enfant', entryDaysAgo: 20, referent: 'paul' },
  { key: 'haddad', lastName: 'Haddad', firstName: 'Youssef', birthDate: '1976-10-03', familyStatus: 'Séparé(e)', children: 2, household: 'Personne seule', entryDaysAgo: 365, preparingExit: true, referent: 'george' },
  { key: 'martin', lastName: 'Martin', firstName: 'Chloé', birthDate: '2003-07-21', phone: '0600000012', email: 'chloe.martin@example.test', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 10, referent: 'paul' },
  { key: 'kone', lastName: 'Koné', firstName: 'Ibrahim', birthDate: '1988-09-09', phone: '0600000013', familyStatus: 'Pacsé(e)', children: 0, household: 'Couple sans enfant', entryDaysAgo: 210, referent: 'paul' },
  { key: 'dubois', lastName: 'Dubois', firstName: 'Marc', birthDate: '1970-12-12', phone: '0600000014', familyStatus: 'Divorcé(e)', children: 1, household: 'Personne seule', entryDaysAgo: 150, referent: 'george' },
  // Dossier sans coordonnées ni date de naissance : la fiche affiche « Non renseigné »
  { key: 'lambert', lastName: 'Lambert', firstName: 'Sophie', withoutAddress: true, entryDaysAgo: 5, referent: 'george' },
  { key: 'roux', lastName: 'Roux', firstName: 'Nathalie', birthDate: '1982-04-04', phone: '0600000016', email: 'nathalie.roux@example.test', familyStatus: 'Célibataire', children: 2, household: 'Parent avec enfants', entryDaysAgo: 280, preparingExit: true, referent: 'ines' },
  // Référente archivée : le dossier doit être réattribué
  { key: 'mercier', lastName: 'Mercier', firstName: 'Kevin', birthDate: '1997-01-17', phone: '0600000017', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 330, referent: 'helene' },

  // Dossiers archivés : personnes sorties de la structure
  { key: 'fournier', lastName: 'Fournier', firstName: 'Alain', birthDate: '1966-11-28', phone: '0600000018', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 700, exitDaysAgo: 90, referent: 'helene' },
  { key: 'benhamou', lastName: 'Benhamou', firstName: 'Leïla', birthDate: '1993-03-08', phone: '0600000019', email: 'leila.benhamou@example.test', familyStatus: 'Marié(e)', children: 2, household: 'Couple avec enfants', entryDaysAgo: 600, exitDaysAgo: 40, referent: 'ines' },
  { key: 'simon', lastName: 'Simon', firstName: 'Hugo', birthDate: '2000-06-06', phone: '0600000020', familyStatus: 'Célibataire', children: 0, household: 'Personne seule', entryDaysAgo: 400, exitDaysAgo: 15, referent: 'george' },
  { key: 'morel', lastName: 'Morel', firstName: 'Patricia', birthDate: '1958-02-14', familyStatus: 'Veuf / veuve', children: 3, household: 'Personne seule', entryDaysAgo: 900, exitDaysAgo: 200, referent: 'helene' },
  { key: 'gauthier', lastName: 'Gauthier', firstName: 'Romain', birthDate: '1989-10-10', phone: '0600000022', email: 'romain.gauthier@example.test', familyStatus: 'Pacsé(e)', children: 1, household: 'Couple avec enfant', entryDaysAgo: 380, exitDaysAgo: 120, referent: 'paul' },
];

export async function seedBeneficiaries(users: SeedIds): Promise<SeedIds> {
  const ids: SeedIds = {};

  for (const [index, beneficiary] of beneficiaries.entries()) {
    const exitDate =
      beneficiary.exitDaysAgo === undefined
        ? null
        : daysFromNow(-beneficiary.exitDaysAgo);
    const hasAddress = !beneficiary.withoutAddress;

    const created = await prisma.beneficiary.create({
      data: {
        last_name: beneficiary.lastName,
        first_name: beneficiary.firstName,
        email: beneficiary.email,
        phone: beneficiary.phone,
        date_of_birth: beneficiary.birthDate
          ? new Date(beneficiary.birthDate)
          : undefined,
        address: hasAddress ? RESIDENCE.address(index + 1) : undefined,
        postal_code: hasAddress ? RESIDENCE.postalCode : undefined,
        city: hasAddress ? RESIDENCE.city : undefined,
        family_status: beneficiary.familyStatus,
        number_of_children: beneficiary.children,
        household_composition: beneficiary.household,
        pathway_status: exitDate
          ? EXIT_PATHWAY_STATUS
          : beneficiary.preparingExit
            ? PREPARING_EXIT_PATHWAY_STATUS
            : DEFAULT_PATHWAY_STATUS,
        entry_date: daysFromNow(-beneficiary.entryDaysAgo),
        exit_date: exitDate,
        archived_at: exitDate,
        user_id: idOf(users, beneficiary.referent),
      },
    });
    ids[beneficiary.key] = created.beneficiary_id;
  }

  return ids;
}
