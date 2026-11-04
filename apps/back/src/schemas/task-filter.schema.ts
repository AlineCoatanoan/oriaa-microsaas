import { z } from 'zod';
import { idField } from './common.js';

/** Filtre enregistré de la page des tâches : l'utilisateur à afficher. */
export const saveTaskFilterSchema = z.object({ assigneeId: idField });

export type SaveTaskFilterInput = z.infer<typeof saveTaskFilterSchema>;
