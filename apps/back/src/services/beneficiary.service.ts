import type { Beneficiary } from '@prisma/client';
import prisma from '../lib/prisma.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/app-error.js';
import type {
  CreateBeneficiaryInput,
  UpdateBeneficiaryInput,
} from '../schemas/beneficiary.schema.js';

/** "2026-10-25" → Date ; null → null (champ vidé) ; absent → undefined (inchangé). */
const toDate = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
};

/** Date sans heure (colonne @db.Date) → "2026-10-25", ou null. */
const toDateOnly = (value: Date | null) =>
  value ? value.toISOString().slice(0, 10) : null;

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
    dateOfBirth: toDateOnly(b.date_of_birth),
    address: b.address,
    postalCode: b.postal_code,
    city: b.city,
    phone: b.phone,
    familyStatus: b.family_status,
    numberOfChildren: b.number_of_children,
    householdComposition: b.household_composition,
    pathwayStatus: b.pathway_status,
    entryDate: toDateOnly(b.entry_date),
    exitDate: toDateOnly(b.exit_date),
    createdAt: b.created_at,
    archivedAt: b.archived_at,
    referentId: b.user_id,
  };
}

/** Le référent doit exister et être actif. */
async function assertActiveReferent(userId: number) {
  const referent = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!referent || referent.archived_at) {
    throw new BadRequestError('Référent introuvable.');
  }
}

/** Renvoie le bénéficiaire brut (format base), ou une 404. */
async function findExistingOrFail(id: number) {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { beneficiary_id: id },
  });
  if (!beneficiary) throw new NotFoundError('Bénéficiaire introuvable.');
  return beneficiary;
}

/** Crée un bénéficiaire. Par défaut, le référent est l'utilisateur connecté. */
export async function create(
  data: CreateBeneficiaryInput,
  currentUserId: number,
) {
  const referentId = data.referentId ?? currentUserId;

  await assertActiveReferent(referentId);

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
  return toBeneficiaryDto(await findExistingOrFail(id));
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

/** Modifie un bénéficiaire actif. Seuls les champs envoyés sont modifiés. */
export async function update(id: number, data: UpdateBeneficiaryInput) {
  const existing = await findExistingOrFail(id);

  // Règle métier : un dossier archivé est en lecture seule
  if (existing.archived_at) {
    throw new ConflictError(
      "Un dossier archivé ne peut pas être modifié. Désarchivez-le d'abord.",
    );
  }

  if (data.referentId !== undefined) {
    await assertActiveReferent(data.referentId);
  }

  const beneficiary = await prisma.beneficiary.update({
    where: { beneficiary_id: id },
    data: {
      last_name: data.lastName,
      first_name: data.firstName,
      entry_date: data.entryDate ? new Date(data.entryDate) : undefined,
      email: data.email,
      date_of_birth: toDate(data.dateOfBirth),
      address: data.address,
      postal_code: data.postalCode,
      city: data.city,
      phone: data.phone,
      family_status: data.familyStatus,
      number_of_children: data.numberOfChildren,
      household_composition: data.householdComposition,
      user_id: data.referentId,
    },
  });

  return toBeneficiaryDto(beneficiary);
}

/** Archive un bénéficiaire actif (sortie de la structure). */
export async function archive(id: number, exitDate: string) {
  const existing = await findExistingOrFail(id);
  if (existing.archived_at) {
    throw new ConflictError('Ce dossier est déjà archivé.');
  }

  const exit = new Date(exitDate);
  if (exit < existing.entry_date) {
    throw new BadRequestError(
      "La date de sortie ne peut pas précéder la date d'entrée.",
    );
  }

  const beneficiary = await prisma.beneficiary.update({
    where: { beneficiary_id: id },
    data: { archived_at: new Date(), exit_date: exit },
  });

  return toBeneficiaryDto(beneficiary);
}

/** Désarchive un bénéficiaire (retour dans la structure). */
export async function unarchive(id: number) {
  const existing = await findExistingOrFail(id);
  if (!existing.archived_at) {
    throw new ConflictError("Ce dossier n'est pas archivé.");
  }

  const beneficiary = await prisma.beneficiary.update({
    where: { beneficiary_id: id },
    data: { archived_at: null, exit_date: null },
  });

  return toBeneficiaryDto(beneficiary);
}

/**
 * Supprime définitivement un bénéficiaire archivé (RGPD).
 * Ses notes, documents et liens (tâches, RDV) sont supprimés en cascade par la base.
 */
export async function remove(id: number) {
  const existing = await findExistingOrFail(id);
  if (!existing.archived_at) {
    throw new ConflictError(
      "Seul un dossier archivé peut être supprimé définitivement. Archivez-le d'abord.",
    );
  }

  await prisma.beneficiary.delete({ where: { beneficiary_id: id } });
}
