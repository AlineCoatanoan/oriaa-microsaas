import type { Beneficiary } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { BadRequestError, NotFoundError } from '../errors/app-error.js';
import type { CreateBeneficiaryInput } from '../schemas/beneficiary.schema.js';

/** Convertit une date "2026-10-25" en Date, ou undefined. */
const toDate = (value?: string) => (value ? new Date(value) : undefined);

/** Format renvoyé au front (camelCase, comme toPublicUser).
 * Le DTO (Data Transfer Object) joue le rôle d’un traducteur : la base parle snake_case (last_name), le front parle camelCase (lastName).
 * Si une colonne change un jour, seul ce fichier est modifié.
 */
export function toBeneficiaryDto(b: Beneficiary) {
  return {
    id: b.beneficiary_id,
    lastName: b.last_name,
    firstName: b.first_name,
    email: b.email,
    dateOfBirth: b.date_of_birth,
    address: b.address,
    postalCode: b.postal_code,
    city: b.city,
    phone: b.phone,
    familyStatus: b.family_status,
    numberOfChildren: b.number_of_children,
    householdComposition: b.household_composition,
    pathwayStatus: b.pathway_status,
    entryDate: b.entry_date,
    exitDate: b.exit_date,
    createdAt: b.created_at,
    archivedAt: b.archived_at,
    referentId: b.user_id,
  };
}

/** Crée un bénéficiaire. Par défaut, le référent est l'utilisateur connecté. */
export async function create(
  data: CreateBeneficiaryInput,
  currentUserId: number,
) {
  const referentId = data.referentId ?? currentUserId;

  // Le référent doit exister et être actif
  const referent = await prisma.user.findUnique({
    where: { user_id: referentId },
  });
  if (!referent || referent.archived_at) {
    throw new BadRequestError('Référent introuvable.');
  }

  const beneficiary = await prisma.beneficiary.create({
    data: {
      last_name: data.lastName,
      first_name: data.firstName,
      entry_date: new Date(data.entryDate),
      email: data.email,
      date_of_birth: toDate(data.dateOfBirth),
      address: data.address,
      postal_code: data.postalCode,
      city: data.city,
      phone: data.phone,
      family_status: data.familyStatus,
      number_of_children: data.numberOfChildren,
      household_composition: data.householdComposition,
      user_id: referentId,
    },
  });

  return toBeneficiaryDto(beneficiary);
}

/** Renvoie un bénéficiaire, ou une 404. */
export async function findById(id: number) {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { beneficiary_id: id },
  });
  if (!beneficiary) throw new NotFoundError('Bénéficiaire introuvable.');

  return toBeneficiaryDto(beneficiary);
}

/** Liste les bénéficiaires actifs, ou archivés, triés par nom puis prénom. */
export async function findAll(options: { archived: boolean }) {
  const beneficiaries = await prisma.beneficiary.findMany({
    // archived_at vide = actif ; archived_at rempli = archivé
    where: { archived_at: options.archived ? { not: null } : null },
    orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
  });

  return beneficiaries.map(toBeneficiaryDto);
}
