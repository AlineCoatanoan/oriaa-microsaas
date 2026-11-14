import prisma from '../../src/lib/prisma.js';
import {
  COMPLETED_TASK_STATUS as DONE,
  DEFAULT_TASK_PRIORITY as NORMAL,
  DEFAULT_TASK_STATUS as TODO,
  IN_PROGRESS_TASK_STATUS as IN_PROGRESS,
  LOW_TASK_PRIORITY as LOW,
  URGENT_TASK_PRIORITY as HIGH,
} from '../../src/config/constants.js';
import { daysFromNow, idOf, type SeedIds } from './helpers.js';

type SeedTask = {
  key: string;
  title: string;
  description?: string;
  /** Échéance en jours par rapport à aujourd'hui (négatif = en retard ou passée). */
  dueIn?: number;
  status: string;
  priority: string;
  createdBy: string;
  assignees: string[];
  /** Aucun bénéficiaire : tâche liée au fonctionnement du service. */
  beneficiaries?: string[];
  subtasks?: { label: string; done?: boolean }[];
};

// prettier-ignore
const tasks: SeedTask[] = [
  // Aujourd'hui
  { key: 'caf', title: 'Préparer le dossier CAF', description: 'Vérifier les documents nécessaires avant le rendez-vous.', dueIn: 0, status: TODO, priority: HIGH, createdBy: 'aline', assignees: ['george'], beneficiaries: ['durand'], subtasks: [{ label: 'Vérifier les justificatifs', done: true }, { label: 'Scanner les documents' }, { label: 'Envoyer le dossier en ligne' }] },
  { key: 'referent', title: 'Appeler le référent ASE', description: 'Faire le point sur la situation des enfants.', dueIn: 0, status: IN_PROGRESS, priority: NORMAL, createdBy: 'george', assignees: ['george', 'ines'], beneficiaries: ['petit'] },
  { key: 'cv', title: 'Relire le CV', description: 'Relecture avant envoi aux offres repérées par France Travail.', dueIn: 0, status: TODO, priority: NORMAL, createdBy: 'paul', assignees: ['paul'], beneficiaries: ['garcia'] },
  { key: 'accueil', title: "Préparer le livret d'accueil", description: 'Imprimer le règlement de fonctionnement et le contrat de séjour.', dueIn: 0, status: TODO, priority: HIGH, createdBy: 'martine', assignees: ['paul'], beneficiaries: ['lambert'], subtasks: [{ label: 'Règlement de fonctionnement' }, { label: 'Contrat de séjour' }, { label: 'Remise des clés' }] },

  // En retard
  { key: 'mdph', title: 'Compléter le dossier MDPH', description: "Le certificat médical doit dater de moins d'un an.", dueIn: -3, status: IN_PROGRESS, priority: HIGH, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['robert'], subtasks: [{ label: 'Formulaire de demande', done: true }, { label: 'Certificat médical' }] },
  { key: 'banque', title: 'Accompagner à la banque', description: "Ouverture d'un compte avec le droit au compte.", dueIn: -2, status: TODO, priority: NORMAL, createdBy: 'george', assignees: ['george'], beneficiaries: ['traore'] },
  { key: 'secu', title: 'Relancer la CPAM', description: 'Pas de réponse à la demande de complémentaire santé solidaire.', dueIn: -5, status: TODO, priority: HIGH, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['nguyen'] },
  { key: 'reattribuer', title: 'Réattribuer le dossier Mercier', description: 'Sa référente a quitté la structure.', dueIn: -1, status: TODO, priority: HIGH, createdBy: 'martine', assignees: ['martine'], beneficiaries: ['mercier'] },

  // À venir
  { key: 'budget', title: 'Établir un budget mensuel', description: 'Lister les ressources et les charges fixes.', dueIn: 2, status: IN_PROGRESS, priority: NORMAL, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['lefevre'], subtasks: [{ label: 'Relevés de compte', done: true }, { label: 'Liste des charges', done: true }, { label: 'Tableau de budget' }] },
  { key: 'logement', title: 'Déposer la demande de logement social', description: 'Renouvellement annuel du numéro unique.', dueIn: 4, status: TODO, priority: HIGH, createdBy: 'george', assignees: ['george'], beneficiaries: ['moreau'] },
  { key: 'ecole', title: "Inscrire les enfants à l'école", dueIn: 3, status: IN_PROGRESS, priority: HIGH, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['diallo'], subtasks: [{ label: 'Certificat de scolarité', done: true }, { label: 'Carnet de vaccination' }, { label: 'Inscription à la cantine' }] },
  { key: 'formation', title: 'Rechercher une formation', description: "Piste : CAP agent de propreté et d'hygiène.", dueIn: 7, status: TODO, priority: NORMAL, createdBy: 'paul', assignees: ['paul'], beneficiaries: ['kone'] },
  { key: 'creche', title: 'Trouver un mode de garde', description: 'Places en crèche ou assistante maternelle.', dueIn: 6, status: TODO, priority: NORMAL, createdBy: 'paul', assignees: ['paul'], beneficiaries: ['bernard'] },
  { key: 'identite', title: "Renouveler la carte d'identité", description: 'Prendre rendez-vous en mairie.', dueIn: 10, status: TODO, priority: LOW, createdBy: 'paul', assignees: ['paul'], beneficiaries: ['martin'] },
  { key: 'demenagement', title: 'Organiser le déménagement', description: 'Sortie prévue : réserver un véhicule et prévoir les cartons.', dueIn: 14, status: TODO, priority: NORMAL, createdBy: 'george', assignees: ['george', 'paul'], beneficiaries: ['haddad'], subtasks: [{ label: 'Réserver un véhicule' }, { label: 'État des lieux de sortie' }] },
  { key: 'fsl', title: 'Demander une aide FSL', description: 'Aide du fonds de solidarité logement pour le dépôt de garantie.', dueIn: 9, status: TODO, priority: HIGH, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['roux'] },
  { key: 'retraite', title: 'Préparer le dossier retraite', dueIn: 21, status: TODO, priority: NORMAL, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['robert'] },
  { key: 'pension', title: 'Saisir le juge aux affaires familiales', description: 'Demande de pension alimentaire.', dueIn: 12, status: TODO, priority: NORMAL, createdBy: 'george', assignees: ['george'], beneficiaries: ['dubois'] },
  { key: 'atelier', title: 'Préparer un atelier cuisine', description: 'Trouver les personnes intéressées, préparer la liste de courses.', dueIn: 5, status: IN_PROGRESS, priority: LOW, createdBy: 'paul', assignees: ['paul', 'george'], beneficiaries: ['traore', 'martin', 'garcia'], subtasks: [{ label: 'Liste des inscrits', done: true }, { label: 'Liste de courses' }] },

  // Fonctionnement du service (sans bénéficiaire)
  { key: 'reunion', title: "Préparer la réunion d'équipe", description: 'Rassembler les situations à aborder.', dueIn: 1, status: TODO, priority: NORMAL, createdBy: 'martine', assignees: ['martine'] },
  { key: 'rapport', title: "Rédiger le rapport d'activité", description: 'Bilan annuel pour le financeur.', dueIn: 30, status: IN_PROGRESS, priority: NORMAL, createdBy: 'martine', assignees: ['martine', 'aline'] },
  { key: 'presentation', title: "Présenter Oriaa à l'équipe", description: 'Démonstration des fiches bénéficiaires et du planning.', dueIn: 0, status: IN_PROGRESS, priority: NORMAL, createdBy: 'martine', assignees: ['aline'] },
  { key: 'sauvegardes', title: 'Vérifier les sauvegardes', description: 'Contrôler la dernière sauvegarde de la base de données.', dueIn: -2, status: TODO, priority: HIGH, createdBy: 'aline', assignees: ['aline'] },
  { key: 'planning', title: 'Mettre à jour le planning des astreintes', dueIn: -1, status: TODO, priority: LOW, createdBy: 'martine', assignees: ['george'] },

  // Terminées
  { key: 'rsa', title: 'Ouvrir les droits RSA', dueIn: -20, status: DONE, priority: HIGH, createdBy: 'george', assignees: ['george'], beneficiaries: ['durand'] },
  { key: 'domiciliation', title: 'Faire la domiciliation', dueIn: -40, status: DONE, priority: NORMAL, createdBy: 'george', assignees: ['george'], beneficiaries: ['traore'] },
  { key: 'mutuelle', title: 'Changer de mutuelle', dueIn: -15, status: DONE, priority: LOW, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['lefevre'] },
  { key: 'bail', title: 'Signer le bail', description: 'Accompagnement à la signature du nouveau logement.', dueIn: -18, status: DONE, priority: HIGH, createdBy: 'george', assignees: ['george'], beneficiaries: ['simon'] },
  { key: 'sortie', title: 'Préparer la sortie', dueIn: -45, status: DONE, priority: NORMAL, createdBy: 'ines', assignees: ['ines'], beneficiaries: ['benhamou'], subtasks: [{ label: 'Transfert du courrier', done: true }, { label: 'État des lieux', done: true }] },
  { key: 'ehpad', title: "Visiter l'EHPAD", dueIn: -210, status: DONE, priority: NORMAL, createdBy: 'helene', assignees: ['helene'], beneficiaries: ['morel'] },
];

export async function seedTasks(
  users: SeedIds,
  beneficiaries: SeedIds,
): Promise<SeedIds> {
  const ids: SeedIds = {};

  for (const task of tasks) {
    const created = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        due_date: task.dueIn === undefined ? null : daysFromNow(task.dueIn),
        status: task.status,
        priority: task.priority,
        user_id_created_by: idOf(users, task.createdBy),
        assignees: {
          create: task.assignees.map((key) => ({ user_id: idOf(users, key) })),
        },
        beneficiaries: {
          create: (task.beneficiaries ?? []).map((key) => ({
            beneficiary_id: idOf(beneficiaries, key),
          })),
        },
        subtasks: {
          create: (task.subtasks ?? []).map(({ label, done = false }) => ({
            label,
            is_completed: done,
          })),
        },
      },
    });
    ids[task.key] = created.task_id;
  }

  return ids;
}
