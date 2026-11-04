import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import {
  allBeneficiariesArchivedWhere,
  areAllBeneficiariesArchived,
  beneficiaryLinksInclude,
  newIds,
  toBeneficiaryLinks,
  toBeneficiarySummary,
  unique,
} from '../lib/beneficiary-links.js';
import { authorSelect, toAuthorName } from '../lib/dto.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/app-error.js';
import type {
  CreateAppointmentInput,
  ListAppointmentsQuery,
  UpdateAppointmentInput,
} from '../schemas/appointment.schema.js';
import { assertActiveUsers } from './auth.service.js';
import { assertActiveBeneficiaries } from './beneficiary.service.js';

const UNKNOWN_USER_MESSAGE = 'Personne en charge introuvable.';

/** Données liées à récupérer avec chaque rendez-vous. */
const appointmentInclude = {
  user: { select: { ...authorSelect.select, user_id: true } },
  beneficiaries: beneficiaryLinksInclude,
  notes: { include: { note: { select: { note_id: true, title: true } } } },
} satisfies Prisma.AppointmentInclude;

type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: typeof appointmentInclude;
}>;

/** Format renvoyé au front. */
function toAppointmentDto(appointment: AppointmentWithRelations) {
  return {
    id: appointment.appointment_id,
    title: appointment.title,
    description: appointment.description,
    location: appointment.location,
    startAt: appointment.start_at,
    endAt: appointment.end_at,
    isArchived: areAllBeneficiariesArchived(appointment.beneficiaries),
    user: {
      id: appointment.user.user_id,
      name: toAuthorName(appointment.user),
    },
    beneficiaries: appointment.beneficiaries.map(toBeneficiarySummary),
    notes: appointment.notes.map(({ note }) => ({
      id: note.note_id,
      title: note.title,
    })),
  };
}

const toNoteLinks = (ids: number[]) => ids.map((note_id) => ({ note_id }));

/** La fin d'un rendez-vous doit être après son début. */
function assertEndAfterStart(startAt: Date, endAt: Date) {
  if (endAt <= startAt) {
    throw new BadRequestError(
      'La fin doit être après le début du rendez-vous.',
    );
  }
}

/** Les notes liées doivent exister. */
async function assertNotesExist(ids: number[]) {
  const count = await prisma.note.count({ where: { note_id: { in: ids } } });
  if (count !== ids.length) throw new BadRequestError('Note introuvable.');
}

/** Renvoie le rendez-vous avec ses liens, ou une 404. */
async function findAppointmentOrFail(id: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { appointment_id: id },
    include: appointmentInclude,
  });
  if (!appointment) throw new NotFoundError('Rendez-vous introuvable.');
  return appointment;
}

/** Règle métier : un rendez-vous archivé est en lecture seule. Le renvoie sinon. */
async function assertAppointmentEditable(id: number) {
  const appointment = await findAppointmentOrFail(id);
  if (areAllBeneficiariesArchived(appointment.beneficiaries)) {
    throw new ConflictError(
      "Un rendez-vous archivé ne peut pas être modifié. Désarchivez d'abord un de ses bénéficiaires.",
    );
  }
  return appointment;
}

/**
 * Liste les rendez-vous filtrés, du plus tôt au plus tard.
 * Un rendez-vous est retenu s'il chevauche la période demandée.
 */
export async function findAll(filters: ListAppointmentsQuery) {
  const { from, to, userId, beneficiaryId } = filters;

  const appointments = await prisma.appointment.findMany({
    where: {
      user_id: userId,
      start_at: to ? { lt: new Date(to) } : undefined,
      end_at: from ? { gt: new Date(from) } : undefined,
      ...(beneficiaryId
        ? { beneficiaries: { some: { beneficiary_id: beneficiaryId } } }
        : { NOT: allBeneficiariesArchivedWhere }),
    },
    include: appointmentInclude,
    orderBy: { start_at: 'asc' },
  });

  return appointments.map(toAppointmentDto);
}

/** Renvoie un rendez-vous, ou une 404. */
export async function findById(id: number) {
  return toAppointmentDto(await findAppointmentOrFail(id));
}

/** Crée un rendez-vous. Par défaut, la personne connectée en a la charge. */
export async function create(
  data: CreateAppointmentInput,
  currentUserId: number,
) {
  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);
  const userId = data.userId ?? currentUserId;
  const beneficiaryIds = unique(data.beneficiaryIds ?? []);
  const noteIds = unique(data.noteIds ?? []);

  assertEndAfterStart(startAt, endAt);
  await assertActiveUsers([userId], UNKNOWN_USER_MESSAGE);
  await assertActiveBeneficiaries(beneficiaryIds);
  await assertNotesExist(noteIds);

  const appointment = await prisma.appointment.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      start_at: startAt,
      end_at: endAt,
      user_id: userId,
      beneficiaries: { create: toBeneficiaryLinks(beneficiaryIds) },
      notes: { create: toNoteLinks(noteIds) },
    },
    include: appointmentInclude,
  });

  return toAppointmentDto(appointment);
}

/**
 * Modifie un rendez-vous. Seuls les champs envoyés sont modifiés.
 * Seuls les ajouts sont vérifiés : un lien existant peut être conservé.
 */
export async function update(id: number, data: UpdateAppointmentInput) {
  const existing = await assertAppointmentEditable(id);

  const startAt = data.startAt ? new Date(data.startAt) : existing.start_at;
  const endAt = data.endAt ? new Date(data.endAt) : existing.end_at;
  const beneficiaryIds = data.beneficiaryIds && unique(data.beneficiaryIds);
  const noteIds = data.noteIds && unique(data.noteIds);

  assertEndAfterStart(startAt, endAt);

  if (data.userId !== undefined && data.userId !== existing.user_id) {
    await assertActiveUsers([data.userId], UNKNOWN_USER_MESSAGE);
  }
  if (beneficiaryIds) {
    await assertActiveBeneficiaries(
      newIds(
        beneficiaryIds,
        existing.beneficiaries.map((link) => link.beneficiary_id),
      ),
    );
  }
  if (noteIds) await assertNotesExist(noteIds);

  const appointment = await prisma.appointment.update({
    where: { appointment_id: id },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      start_at: startAt,
      end_at: endAt,
      user_id: data.userId,
      // deleteMany + create : la liste envoyée remplace l'ancienne
      beneficiaries: beneficiaryIds && {
        deleteMany: {},
        create: toBeneficiaryLinks(beneficiaryIds),
      },
      notes: noteIds && {
        deleteMany: {},
        create: toNoteLinks(noteIds),
      },
    },
    include: appointmentInclude,
  });

  return toAppointmentDto(appointment);
}

/** Supprime un rendez-vous. Ses liens sont supprimés en cascade. */
export async function remove(id: number) {
  await assertAppointmentEditable(id);

  await prisma.appointment.delete({ where: { appointment_id: id } });
}
