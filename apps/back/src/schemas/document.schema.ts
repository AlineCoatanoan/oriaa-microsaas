import { z } from 'zod';
import {
  atLeastOneField,
  idParam,
  idParamsSchema,
  requiredText,
} from './common.js';

/** Champs saisis à l'import ; le fichier est reçu à part, par multer. */
export const createDocumentSchema = z.object({
  title: requiredText(100),
  category: requiredText(50), // nom du dossier
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

/** Modifier le titre et/ou changer de dossier : au moins un champ. */
export const updateDocumentSchema = atLeastOneField(
  createDocumentSchema.partial(),
);

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

/** Paramètres :id (bénéficiaire) et :documentId dans l'URL. */
export const documentParamsSchema = idParamsSchema.extend({
  documentId: idParam,
});
