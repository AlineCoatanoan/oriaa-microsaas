import type { Note, User } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { authorSelect, toAuthorName } from '../lib/dto.js';
import { NotFoundError } from '../errors/app-error.js';
import type {
  CreateNoteInput,
  UpdateNoteInput,
} from '../schemas/note.schema.js';
import {
  assertBeneficiaryActive,
  findBeneficiaryOrFail,
} from './beneficiary.service.js';

type NoteWithAuthor = Note & { user: Pick<User, 'first_name' | 'last_name'> };

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
    author: toAuthorName(note.user),
    beneficiaryId: note.beneficiary_id,
  };
}

/** Vérifie que la note existe et appartient bien à ce bénéficiaire, sinon 404. */
async function assertNoteExists(beneficiaryId: number, noteId: number) {
  const note = await prisma.note.findFirst({
    where: { note_id: noteId, beneficiary_id: beneficiaryId },
  });
  if (!note) throw new NotFoundError('Note introuvable.');
}

/** Liste les notes d'un bénéficiaire, de la plus récente à la plus ancienne. */
export async function findAllByBeneficiary(beneficiaryId: number) {
  await findBeneficiaryOrFail(beneficiaryId);

  const notes = await prisma.note.findMany({
    where: { beneficiary_id: beneficiaryId },
    include: { user: authorSelect },
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
    include: { user: authorSelect },
  });

  return toNoteDto(note);
}

/** Modifie une note. Seuls les champs envoyés sont modifiés. */
export async function update(
  beneficiaryId: number,
  noteId: number,
  data: UpdateNoteInput,
) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_NOTES_MESSAGE);
  await assertNoteExists(beneficiaryId, noteId);

  const note = await prisma.note.update({
    where: { note_id: noteId },
    data: { title: data.title, content: data.content },
    include: { user: authorSelect },
  });

  return toNoteDto(note);
}

/** Supprime une note. */
export async function remove(beneficiaryId: number, noteId: number) {
  await assertBeneficiaryActive(beneficiaryId, ARCHIVED_NOTES_MESSAGE);
  await assertNoteExists(beneficiaryId, noteId);

  await prisma.note.delete({ where: { note_id: noteId } });
}
