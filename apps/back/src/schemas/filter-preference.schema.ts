import { z } from 'zod';
import { idField } from './common.js';

/**
 * Filtre enregistré d'une liste : l'utilisateur à afficher
 * (le responsable pour les tâches, le référent pour les bénéficiaires).
 */
export const saveFilterPreferenceSchema = z.object({ userId: idField });

export type SaveFilterPreferenceInput = z.infer<
  typeof saveFilterPreferenceSchema
>;
