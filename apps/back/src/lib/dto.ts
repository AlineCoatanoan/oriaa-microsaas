import type { Subtask } from '@prisma/client';

type Person = {
  user_id: number;
  first_name: string;
  last_name: string;
  archived_at: Date | null;
  deleted_at: Date | null;
};

/** Champs d'une personne à récupérer avec Prisma (auteur, responsable, référent). */
export const personSelect = {
  select: {
    user_id: true,
    first_name: true,
    last_name: true,
    archived_at: true,
    deleted_at: true,
  },
};

const toPersonStatus = (user: Person) => {
  if (user.deleted_at) return 'deleted';
  return user.archived_at ? 'archived' : 'active';
};

/** Format d'une personne renvoyé au front : le front barre le nom si elle est archivée. */
export const toPerson = (user: Person) => ({
  id: user.user_id,
  name: `${user.first_name} ${user.last_name}`,
  status: toPersonStatus(user),
});

export type { Person };

/** Format d'une sous-tâche renvoyé au front. */
export function toSubtaskDto(subtask: Subtask) {
  return {
    id: subtask.subtask_id,
    label: subtask.label,
    isCompleted: subtask.is_completed,
  };
}

type NoteLink = { note: { note_id: number; title: string | null } };

/** Notes liées à récupérer avec Prisma. */
export const noteLinksInclude = {
  include: { note: { select: { note_id: true, title: true } } },
};

/** Format d'une note liée renvoyé au front. */
export const toNoteSummary = ({ note }: NoteLink) => ({
  id: note.note_id,
  title: note.title,
});
