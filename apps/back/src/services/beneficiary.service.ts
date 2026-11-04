import type { Beneficiary } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { toDate, toDateOnly } from '../lib/dates.js';
import { personSelect, toPerson } from '../lib/dto.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/app-error.js';
import {
  DEFAULT_PATHWAY_STATUS,
  EXIT_PATHWAY_STATUS,
} from '../schemas/beneficiary.schema.js';
import type {
  CreateBeneficiaryInput,
  UpdateBeneficiaryInput,
} from '../schemas/beneficiary.schema.js';
import { assertActiveUsers } from './auth.service.js';
import type { Person } from '../lib/dto.js';

const beneficiaryInclude = { user: personSelect };

/** Format renvoyé au front (camelCase, comme toPublicUser).
 * Le DTO (Data Transfer Object) joue le rôle d’un traducteur : la base parle snake_case (last_name), le front parle camelCase (lastName).
 * Si une colonne change un jour, seul ce fichier est modifié.
 */
function toBeneficiaryDto(b: Beneficiary & { user: Person }) {
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
    referent: toPerson(b.user),
  };
}

/**
 * Traduit le format du front (camelCase) vers le format de la base (snake_case).
 * Champ absent = undefined = inchangé pour Prisma.
 */
function toBeneficiaryData(data: UpdateBeneficiaryInput) {
  return {
    last_name: data.lastName,
    first_name: data.firstName,
    // entry_date est obligatoire : toDate, qui peut renvoyer null, ne convient pas
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
    pathway_status: data.pathwayStatus,
    user_id: data.referentId,
  };
}

/** Renvoie le bénéficiaire brut (format base), ou une 404. */
export async function findBeneficiaryOrFail(id: number) {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { beneficiary_id: id },
    include: beneficiaryInclude,
  });
  if (!beneficiary) throw new NotFoundError('Bénéficiaire introuvable.');
  return beneficiary;
}

/** Règle métier : un dossier archivé est en lecture seule. Renvoie le dossier. */
export async function assertBeneficiaryActive(id: number, message: string) {
  const beneficiary = await findBeneficiaryOrFail(id);
  if (beneficiary.archived_at) throw new ConflictError(message);
  return beneficiary;
}

/** Vérifie que le dossier est archivé, sinon 409. */
async function assertBeneficiaryArchived(id: number, message: string) {
  const beneficiary = await findBeneficiaryOrFail(id);
  if (!beneficiary.archived_at) throw new ConflictError(message);
}

/** Les bénéficiaires ajoutés doivent exister et ne pas être archivés. */
export async function assertActiveBeneficiaries(ids: number[]) {
  const count = await prisma.beneficiary.count({
    where: { beneficiary_id: { in: ids }, archived_at: null },
  });
  if (count !== ids.length) {
    throw new BadRequestError('Bénéficiaire introuvable ou archivé.');
  }
}

/** Crée un bénéficiaire. Par défaut, le référent est l'utilisateur connecté. */
export async function create(
  data: CreateBeneficiaryInput,
  currentUserId: number,
) {
  const referentId = data.referentId ?? currentUserId;

  await assertActiveUsers([referentId], 'Référent introuvable.');

  const beneficiary = await prisma.beneficiary.create({
    data: {
      ...toBeneficiaryData(data),
      // Champs obligatoires à la création : on précise leur type exact pour Prisma
      last_name: data.lastName,
      first_name: data.firstName,
      entry_date: new Date(data.entryDate),
      user_id: referentId,
      pathway_status: DEFAULT_PATHWAY_STATUS,
    },
    include: beneficiaryInclude,
  });

  return toBeneficiaryDto(beneficiary);
}

/** Renvoie un bénéficiaire, ou une 404. */
export async function findById(id: number) {
  return toBeneficiaryDto(await findBeneficiaryOrFail(id));
}

/**
 * Chronologie d'un bénéficiaire, calculée à la demande :
 * ses notes, tâches et rendez-vous, du plus récent au plus ancien.
 */
export async function findTimeline(id: number) {
  await findBeneficiaryOrFail(id);

  const [notes, tasks, appointments] = await Promise.all([
    prisma.note.findMany({
      where: { beneficiary_id: id },
      include: { user: personSelect },
    }),
    prisma.task.findMany({
      where: { beneficiaries: { some: { beneficiary_id: id } } },
      include: { created_by: personSelect },
    }),
    prisma.appointment.findMany({
      where: { beneficiaries: { some: { beneficiary_id: id } } },
      include: { user: personSelect },
    }),
  ]);

  return [
    ...notes.map((note) => ({
      type: 'note',
      id: note.note_id,
      title: note.title,
      date: note.created_at,
      author: toPerson(note.user),
    })),
    ...tasks.map((task) => ({
      type: 'task',
      id: task.task_id,
      title: task.title,
      date: task.created_at,
      author: toPerson(task.created_by),
    })),
    ...appointments.map((appointment) => ({
      type: 'appointment',
      id: appointment.appointment_id,
      title: appointment.title,
      date: appointment.start_at,
      author: toPerson(appointment.user),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Liste les bénéficiaires actifs, ou archivés, triés par nom puis prénom.
 * Si une recherche est fournie, garde ceux dont le nom ou le prénom la contient.
 */
export async function findAll(options: { archived: boolean; search?: string }) {
  const { archived, search } = options;

  const beneficiaries = await prisma.beneficiary.findMany({
    where: {
      // archived_at vide = actif ; archived_at rempli = archivé
      archived_at: archived ? { not: null } : null,
      // mode 'insensitive' : les majuscules et minuscules sont ignorées
      OR: search
        ? [
            { last_name: { contains: search, mode: 'insensitive' } },
            { first_name: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: beneficiaryInclude,
    orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
  });

  return beneficiaries.map(toBeneficiaryDto);
}

/** Modifie un bénéficiaire actif. Seuls les champs envoyés sont modifiés. */
export async function update(id: number, data: UpdateBeneficiaryInput) {
  await assertBeneficiaryActive(
    id,
    "Un dossier archivé ne peut pas être modifié. Désarchivez-le d'abord.",
  );

  if (data.referentId !== undefined) {
    await assertActiveUsers([data.referentId], 'Référent introuvable.');
  }

  const beneficiary = await prisma.beneficiary.update({
    where: { beneficiary_id: id },
    data: toBeneficiaryData(data),
    include: beneficiaryInclude,
  });

  return toBeneficiaryDto(beneficiary);
}

/** Archive un bénéficiaire actif (sortie de la structure). */
export async function archive(id: number, exitDate: string) {
  const existing = await assertBeneficiaryActive(
    id,
    'Ce dossier est déjà archivé.',
  );

  const exit = new Date(exitDate);
  if (exit < existing.entry_date) {
    throw new BadRequestError(
      "La date de sortie ne peut pas précéder la date d'entrée.",
    );
  }

  const beneficiary = await prisma.beneficiary.update({
    where: { beneficiary_id: id },
    data: {
      archived_at: new Date(),
      exit_date: exit,
      pathway_status: EXIT_PATHWAY_STATUS,
    },
    include: beneficiaryInclude,
  });

  return toBeneficiaryDto(beneficiary);
}

/** Désarchive un bénéficiaire (retour dans la structure). */
export async function unarchive(id: number) {
  await assertBeneficiaryArchived(id, "Ce dossier n'est pas archivé.");

  const beneficiary = await prisma.beneficiary.update({
    where: { beneficiary_id: id },
    data: {
      archived_at: null,
      exit_date: null,
      pathway_status: DEFAULT_PATHWAY_STATUS,
    },
    include: beneficiaryInclude,
  });

  return toBeneficiaryDto(beneficiary);
}

/**
 * Supprime définitivement un bénéficiaire archivé (RGPD).
 * Ses notes, documents et liens sont supprimés en cascade par la base.
 * Les tâches et rendez-vous qui n'étaient liés qu'à lui sont supprimés aussi.
 * Ceux qui sont liés à d'autres bénéficiaires sont conservés.
 */
export async function remove(id: number) {
  await assertBeneficiaryArchived(
    id,
    "Seul un dossier archivé peut être supprimé définitivement. Archivez-le d'abord.",
  );

  // some + every : au moins ce lien, et aucun autre bénéficiaire
  const onlyThisBeneficiary = {
    beneficiaries: {
      some: { beneficiary_id: id },
      every: { beneficiary_id: id },
    },
  };

  // Transaction : soit tout est supprimé, soit rien
  await prisma.$transaction([
    prisma.task.deleteMany({ where: onlyThisBeneficiary }),
    prisma.appointment.deleteMany({ where: onlyThisBeneficiary }),
    prisma.beneficiary.delete({ where: { beneficiary_id: id } }),
  ]);
}
