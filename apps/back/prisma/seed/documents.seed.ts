import prisma from '../../src/lib/prisma.js';
import { daysFromNow, idOf, type SeedIds } from './helpers.js';

/** Petit PDF fictif, pour les données de démonstration. */
const demoPdf = Buffer.from('%PDF-1.4\n% Document de démonstration\n');

type SeedDocument = {
  beneficiary: string;
  author: string;
  title: string;
  /** Dossier dans lequel le document est rangé. */
  category: string;
  daysAgo: number;
};

// prettier-ignore
const documents: SeedDocument[] = [
  { beneficiary: 'durand', author: 'george', title: "Attestation d'hébergement", category: 'Hébergement', daysAgo: 290 },
  { beneficiary: 'durand', author: 'george', title: 'Notification RSA', category: 'Ressources', daysAgo: 24 },
  { beneficiary: 'durand', author: 'george', title: 'Bulletins de salaire', category: 'Ressources', daysAgo: 6 },
  { beneficiary: 'petit', author: 'george', title: 'Livret de famille', category: 'État civil', daysAgo: 240 },
  { beneficiary: 'petit', author: 'george', title: 'Jugement de divorce', category: 'Justice', daysAgo: 200 },
  { beneficiary: 'moreau', author: 'george', title: 'Demande de logement social', category: 'Logement', daysAgo: 360 },
  { beneficiary: 'moreau', author: 'ines', title: 'Tableau de budget', category: 'Budget', daysAgo: 30 },
  { beneficiary: 'traore', author: 'george', title: 'Attestation de domiciliation', category: 'Administratif', daysAgo: 38 },
  { beneficiary: 'traore', author: 'george', title: 'Inscription France Travail', category: 'Emploi', daysAgo: 30 },
  { beneficiary: 'lefevre', author: 'ines', title: 'Attestation CAF', category: 'Ressources', daysAgo: 170 },
  { beneficiary: 'lefevre', author: 'ines', title: 'Contrat de mutuelle', category: 'Santé', daysAgo: 15 },
  { beneficiary: 'nguyen', author: 'ines', title: 'Demande de complémentaire santé', category: 'Santé', daysAgo: 35 },
  { beneficiary: 'robert', author: 'ines', title: 'Formulaire MDPH', category: 'Santé', daysAgo: 5 },
  { beneficiary: 'robert', author: 'ines', title: 'Relevé de carrière', category: 'Retraite', daysAgo: 20 },
  { beneficiary: 'diallo', author: 'ines', title: 'Certificats de scolarité', category: 'Scolarité', daysAgo: 10 },
  { beneficiary: 'diallo', author: 'ines', title: 'Titres de séjour', category: 'Administratif', daysAgo: 90 },
  { beneficiary: 'garcia', author: 'paul', title: 'CV', category: 'Emploi', daysAgo: 6 },
  { beneficiary: 'bernard', author: 'paul', title: 'Contrat de séjour', category: 'Hébergement', daysAgo: 20 },
  { beneficiary: 'haddad', author: 'george', title: 'Proposition de logement', category: 'Logement', daysAgo: 12 },
  { beneficiary: 'martin', author: 'paul', title: "Carte d'identité", category: 'État civil', daysAgo: 10 },
  { beneficiary: 'kone', author: 'paul', title: 'Attestation de formation', category: 'Emploi', daysAgo: 100 },
  { beneficiary: 'roux', author: 'ines', title: "Demande d'aide FSL", category: 'Logement', daysAgo: 3 },
  { beneficiary: 'mercier', author: 'helene', title: "Contrats d'intérim", category: 'Emploi', daysAgo: 75 },
  { beneficiary: 'simon', author: 'george', title: 'Bail signé', category: 'Logement', daysAgo: 16 },
  { beneficiary: 'gauthier', author: 'paul', title: 'Contrat de travail', category: 'Emploi', daysAgo: 130 },
];

/** « Demande d'aide FSL » → « demande_d_aide_fsl.pdf » */
const toFileName = (title: string) =>
  `${title
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')}.pdf`;

export async function seedDocuments(users: SeedIds, beneficiaries: SeedIds) {
  await prisma.document.createMany({
    data: documents.map((document) => ({
      title: document.title,
      file_name: toFileName(document.title),
      category: document.category,
      mime_type: 'application/pdf',
      size_bytes: demoPdf.length,
      content: demoPdf,
      created_at: daysFromNow(-document.daysAgo),
      beneficiary_id: idOf(beneficiaries, document.beneficiary),
      user_id: idOf(users, document.author),
    })),
  });
}
