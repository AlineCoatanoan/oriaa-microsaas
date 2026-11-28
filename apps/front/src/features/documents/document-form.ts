import { z } from 'zod/mini';
import { requiredText } from '@/lib/form';

/** Mêmes limites que le back : 5 Mo maximum. */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Formats acceptés (le back vérifie aussi le contenu réel du fichier). */
export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const documentFields = {
  title: requiredText(100, 'Saisissez le titre.'),
  category: requiredText(50, 'Choisissez ou créez un dossier.'),
};

/** Modification : le titre et le dossier. */
export const documentFormSchema = z.object(documentFields);

/**
 * Ajout : le fichier en plus, en premier comme dans le formulaire.
 * Sans fichier choisi, le champ envoie un fichier vide.
 */
export const newDocumentFormSchema = z.object({
  file: z
    .file()
    .check(
      z.minSize(1, 'Choisissez un fichier.'),
      z.maxSize(
        MAX_FILE_SIZE,
        'Le fichier dépasse la taille maximale de 5 Mo.',
      ),
      z.mime(
        ACCEPTED_TYPES,
        'Seuls les fichiers PDF, JPEG et PNG sont acceptés.',
      ),
    ),
  ...documentFields,
});

type NewDocumentValues = z.infer<typeof newDocumentFormSchema>;

/** Prépare l'envoi du fichier (multipart/form-data). */
export function toDocumentFormData({
  title,
  category,
  file,
}: NewDocumentValues) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('file', file);
  return formData;
}
