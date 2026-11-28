import type { Person } from '@/lib/types';

/** Document d'un dossier bénéficiaire (sans son contenu, téléchargé à part). */
export type BeneficiaryDocument = {
  id: number;
  title: string;
  fileName: string;
  /** Nom du dossier où il est rangé (Santé, Logement…). */
  category: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  addedBy: Person;
};
