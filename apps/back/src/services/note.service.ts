import type { Note } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { personSelect, toPerson } from '../lib/dto.js';
import type { Person, PublicUser } from '../lib/dto.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app-error.js';
import { ROLES } from '../config/roles.js';
import type {
  CreateNoteInput,
  UpdateNoteInput,
} from '../schemas/note.schema.js';
import {
  assertBeneficiaryActive,
  findBeneficiaryOrFail,
} from './beneficiary.service.js';

type NoteWithAuthor = Note & { user: Person };

export const NOTE_AUTHOR_MESSAGE =
  "Seul l'auteur de la note ou un administrateur peut la modifier ou la supprimer.";

const ARCHIVED_NOTES_MESSAGE =
  "Les notes d'un dossier archivé ne peuvent pas être modifiées. Désarchivez-le d'abord.";

/** Format renvoyé au front. */
function toNoteDto(note: NoteWithAuthor) {
  return {
    id: note.note_id,
    title: note.title,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    author: toPerson(note.user),
    beneficiaryId: note.beneficiary_id,
  };
}

type CurrentUser = Pick<PublicUser, 'id' | 'role'>;

/**
 * Vérifie que la note existe et appartient bien à ce bénéficiaire (sinon 404),
 * puis que la personne connectée peut la modifier : son auteur ou un admin (sinon 403).
 */
async function assertCanEditNote(
  beneficiaryId: number,
  noteId: number,
  currentUser: CurrentUser,
) {
  const note = await prisma.note.findFirst({
    where: { note_id: noteId, beneficiary_id: beneficiaryId },
  });
  if (!note) throw new NotFoundError('Note introuvable.');

  const isAuthor = note.user_id === currentUser.id;
  if (!isAuthor && currentUser.role !== ROLES.ADMIN) {
    throw new ForbiddenError(NOTE_AUTHOR_MESSAGE);
  }
}

/** Les notes liées à une tâche ou à un rendez-vous doivent exister. */
export async function assertNotesExist(ids: number[]) {
  const count = await prisma.note.count({ where: { note_id: { in: ids } } });
  if (count !== ids.length) throw new BadRequestError('Note introuvable.');
}

/** Liste les notes d'un bénéficiaire, de la plus récente à la plus ancienne. */
export async function findAllByBeneficiary(beneficiaryId: number) {
  await findBeneficiaryOrFail(beneficiaryId);

  const notes = await prisma.note.findMany({
    where: { beneficiary_id: beneficiaryId },
    include: { user: personSelect },
    orderBy: { created_at: 'desc' },
  });

  return notes.map(toNoteDto);
}

/** Crée une note : la personne connectée en est l'auteur. */
export async function create(
  beneficiaryId: number,
  data: CreateNoteInput,
  currentUserId: number,
) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_NOTES_MESSAGE);

  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      beneficiary_id: beneficiaryId,
      user_id: currentUserId,
    },
    include: { user: personSelect },
  });

  return toNoteDto(note);
}

/** Modifie une note. Seuls les champs envoyés sont modifiés. */
export async function update(
  beneficiaryId: number,
  noteId: number,
  data: UpdateNoteInput,
  currentUser: CurrentUser,
) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_NOTES_MESSAGE);
  await assertCanEditNote(beneficiaryId, noteId, currentUser);

  const note = await prisma.note.update({
    where: { note_id: noteId },
    data: { title: data.title, content: data.content },
    include: { user: personSelect },
  });

  return toNoteDto(note);
}

/** Supprime une note. */
export async function remove(
  beneficiaryId: number,
  noteId: number,
  currentUser: CurrentUser,
) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_NOTES_MESSAGE);
  await assertCanEditNote(beneficiaryId, noteId, currentUser);

  await prisma.note.delete({ where: { note_id: noteId } });
}
