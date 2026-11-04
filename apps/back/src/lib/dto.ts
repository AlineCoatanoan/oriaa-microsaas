import type { Subtask } from '@prisma/client';

/** Champs de l'auteur à récupérer avec Prisma. */
export const authorSelect = {
  select: { first_name: true, last_name: true },
};

/** Nom affiché de l'auteur : "Marie Dupont". */
export const toAuthorName = (user: { first_name: string; last_name: string }) =>
  `${user.first_name} ${user.last_name}`;

/** Format d'une sous-tâche renvoyé au front. */
export function toSubtaskDto(subtask: Subtask) {
  return {
    id: subtask.subtask_id,
    label: subtask.label,
    isCompleted: subtask.is_completed,
  };
}
