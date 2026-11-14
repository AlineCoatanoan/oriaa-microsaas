import prisma from '../../src/lib/prisma.js';
import { daysFromNow, idOf, type SeedIds } from './helpers.js';

type SeedNote = {
  /** Uniquement pour les notes reliées à une tâche ou à un rendez-vous. */
  key?: string;
  beneficiary: string;
  author: string;
  title: string;
  content: string;
  daysAgo: number;
};

// prettier-ignore
const notes: SeedNote[] = [
  { key: 'durand-admin', beneficiary: 'durand', author: 'george', daysAgo: 6, title: 'Point administratif', content: 'Point sur les démarches en cours. Les documents du dossier CAF ont été vérifiés et les pièces manquantes identifiées. M. Durand doit transmettre ses trois derniers bulletins de salaire avant le prochain rendez-vous.' },
  { beneficiary: 'durand', author: 'george', daysAgo: 25, title: 'Ouverture des droits RSA', content: "Les droits RSA sont ouverts. Premier versement attendu le mois prochain. M. Durand se montre soulagé et plus disponible pour aborder la recherche d'emploi." },
  { beneficiary: 'durand', author: 'paul', daysAgo: 12, title: 'Projet professionnel', content: 'Échange sur le projet professionnel : intérêt pour la logistique. Inscription à une information collective sur le métier de cariste proposée.' },

  { key: 'petit-famille', beneficiary: 'petit', author: 'george', daysAgo: 4, title: 'Situation familiale', content: 'Entretien sur la situation familiale. Mme Petit souhaite être accompagnée dans les démarches liées à la garde des enfants. Les prochaines échéances ont été rappelées et les documents nécessaires listés.' },
  { beneficiary: 'petit', author: 'ines', daysAgo: 18, title: "Lien avec l'école", content: "Contact avec la directrice de l'école : les enfants sont bien intégrés. Une réunion avec l'enseignante est prévue au prochain trimestre." },

  { beneficiary: 'moreau', author: 'george', daysAgo: 8, title: 'Préparation à la sortie', content: 'Mme Moreau a gagné en autonomie dans ses démarches. Elle souhaite un logement autonome sur Nîmes. Le renouvellement de la demande de logement social est à faire rapidement.' },
  { beneficiary: 'moreau', author: 'ines', daysAgo: 30, title: 'Gestion du budget', content: 'Mme Moreau tient son budget seule depuis deux mois. Elle a commencé une épargne pour le dépôt de garantie.' },

  { beneficiary: 'traore', author: 'george', daysAgo: 40, title: "Entretien d'accueil", content: "Premier entretien après l'arrivée. M. Traoré a peu de ressources et pas de compte bancaire. Priorités : domiciliation, ouverture d'un compte, inscription à France Travail." },
  { beneficiary: 'traore', author: 'george', daysAgo: 9, title: 'Démarches bancaires', content: "Le premier rendez-vous à la banque n'a pas abouti faute de justificatif de domicile. L'attestation d'hébergement a été remise, un nouveau rendez-vous est à fixer." },

  { beneficiary: 'lefevre', author: 'ines', daysAgo: 3, title: 'Budget familial', content: 'Travail sur le budget familial avec Mme Lefèvre. Les charges fixes ont été listées. Elle envisage de demander une aide pour les frais de cantine.' },
  { beneficiary: 'lefevre', author: 'ines', daysAgo: 50, title: 'Mutuelle', content: 'La mutuelle actuelle est trop chère. Comparaison des offres faite ensemble, Mme Lefèvre choisit une offre adaptée à la famille.' },

  { key: 'nguyen-cpam', beneficiary: 'nguyen', author: 'ines', daysAgo: 7, title: 'Complémentaire santé', content: 'La demande de complémentaire santé solidaire a été envoyée il y a un mois, sans réponse. Une relance auprès de la CPAM est nécessaire.' },
  { beneficiary: 'nguyen', author: 'paul', daysAgo: 22, title: 'Vie dans la résidence', content: "Le couple participe aux temps collectifs. Mme Nguyen a proposé d'animer un atelier de cuisine vietnamienne." },

  { beneficiary: 'robert', author: 'ines', daysAgo: 5, title: 'Dossier MDPH', content: 'Le formulaire MDPH est rempli. Il manque le certificat médical, à demander au médecin traitant. Le dossier reste prioritaire.' },
  { beneficiary: 'robert', author: 'ines', daysAgo: 35, title: 'Projet de sortie', content: 'M. Robert souhaite se rapprocher de sa fille à Montpellier. Orientation envisagée vers une résidence autonomie.' },

  { beneficiary: 'diallo', author: 'ines', daysAgo: 2, title: 'Scolarité des enfants', content: "Trois enfants sur quatre sont inscrits. Le carnet de vaccination du plus jeune est à retrouver avant l'inscription à l'école maternelle." },
  { beneficiary: 'diallo', author: 'paul', daysAgo: 28, title: 'Installation', content: "La famille s'est installée dans le logement. Besoin de lits supplémentaires signalé au service : une demande a été faite auprès d'une association." },

  { beneficiary: 'garcia', author: 'paul', daysAgo: 6, title: "Recherche d'emploi", content: 'M. Garcia a identifié trois offres dans le bâtiment. Son CV est à mettre à jour avant de postuler.' },

  { beneficiary: 'bernard', author: 'paul', daysAgo: 15, title: "Entretien d'accueil", content: 'Arrivée de Mme Bernard avec son fils de 2 ans. Priorité : trouver un mode de garde pour lui permettre de reprendre sa formation.' },

  { beneficiary: 'haddad', author: 'george', daysAgo: 11, title: 'Logement trouvé', content: "M. Haddad a obtenu un logement social. Entrée prévue dans deux semaines : organisation du déménagement et de l'état des lieux de sortie." },
  { beneficiary: 'haddad', author: 'george', daysAgo: 60, title: 'Droit de visite', content: 'M. Haddad accueille ses enfants un week-end sur deux. Le futur logement devra permettre de les recevoir.' },

  { beneficiary: 'martin', author: 'paul', daysAgo: 8, title: "Entretien d'accueil", content: "Mme Martin, 23 ans, arrive après une fin de prise en charge. Elle souhaite reprendre ses études. Sa carte d'identité expire bientôt." },

  { beneficiary: 'kone', author: 'paul', daysAgo: 14, title: 'Projet de formation', content: "M. Koné souhaite se former dans la propreté et l'hygiène. Recherche de formations financées à faire avec France Travail." },

  { beneficiary: 'dubois', author: 'george', daysAgo: 10, title: 'Pension alimentaire', content: "M. Dubois ne reçoit plus la pension alimentaire. Information donnée sur la saisine du juge aux affaires familiales et sur l'aide de la CAF." },

  { beneficiary: 'roux', author: 'ines', daysAgo: 4, title: 'Préparation à la sortie', content: "Une proposition de logement est attendue. Mme Roux n'a pas les fonds pour le dépôt de garantie : une demande d'aide FSL va être déposée." },

  { beneficiary: 'mercier', author: 'helene', daysAgo: 70, title: 'Bilan semestriel', content: 'Bilan positif : M. Mercier travaille en intérim et règle sa participation chaque mois. Objectif suivant : un logement autonome.' },

  { beneficiary: 'simon', author: 'george', daysAgo: 16, title: "Fin d'accompagnement", content: "M. Simon a signé son bail et quitte la résidence. Fin de l'accompagnement, avec un contact possible en cas de besoin." },
  { beneficiary: 'benhamou', author: 'ines', daysAgo: 42, title: 'Sortie', content: 'La famille Benhamou quitte la résidence pour un logement social à Alès. Le courrier a été transféré.' },
];

export async function seedNotes(
  users: SeedIds,
  beneficiaries: SeedIds,
): Promise<SeedIds> {
  const ids: SeedIds = {};

  for (const note of notes) {
    const date = daysFromNow(-note.daysAgo);
    const created = await prisma.note.create({
      data: {
        title: note.title,
        content: note.content,
        created_at: date,
        updated_at: date,
        beneficiary_id: idOf(beneficiaries, note.beneficiary),
        user_id: idOf(users, note.author),
      },
    });
    if (note.key) ids[note.key] = created.note_id;
  }

  return ids;
}
