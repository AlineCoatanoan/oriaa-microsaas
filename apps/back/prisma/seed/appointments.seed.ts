import prisma from '../../src/lib/prisma.js';
import { addMinutes, idOf, workdayAt, type SeedIds } from './helpers.js';

type SeedAppointment = {
  /** Uniquement pour les rendez-vous reliés à une note. */
  key?: string;
  title: string;
  description?: string;
  location?: string;
  /** Jour ouvré par rapport à aujourd'hui (négatif = passé). */
  workday: number;
  time: string;
  minutes: number;
  user: string;
  /** Aucun bénéficiaire : rendez-vous interne au service. */
  beneficiaries?: string[];
};

/** Réunion d'équipe hebdomadaire, à laquelle tout le service participe. */
const teamMeetings: SeedAppointment[] = [-8, -3, 2, 7, 12].map((workday) => ({
  title: "Réunion d'équipe",
  description: "Réunion hebdomadaire de l'équipe d'accompagnement.",
  location: 'Salle de réunion',
  workday,
  time: '14:00',
  minutes: 90,
  user: 'martine',
}));

// prettier-ignore
const appointments: SeedAppointment[] = [
  ...teamMeetings,

  // Aujourd'hui
  { key: 'durand-suivi', title: 'Entretien de suivi', description: 'Point sur les démarches en cours et les prochaines échéances.', location: 'Bureau 2', workday: 0, time: '09:30', minutes: 45, user: 'george', beneficiaries: ['durand'] },
  { title: 'Visite à domicile', description: "Point sur l'installation de la famille.", location: 'Logement 2', workday: 0, time: '11:00', minutes: 60, user: 'george', beneficiaries: ['petit'] },
  { title: "Entretien d'accueil", description: "Présentation de la structure et remise du livret d'accueil.", location: 'Bureau 1', workday: 0, time: '10:00', minutes: 60, user: 'paul', beneficiaries: ['lambert'] },
  { title: 'Point avec la cheffe de service', description: "Retours de l'équipe sur l'application.", location: 'Bureau de direction', workday: 0, time: '15:30', minutes: 30, user: 'aline' },
  { title: 'Atelier budget', description: 'Atelier collectif sur la gestion du budget.', location: 'Salle commune', workday: 0, time: '16:00', minutes: 90, user: 'ines', beneficiaries: ['lefevre', 'roux', 'nguyen'] },

  // À venir
  { key: 'petit-ase', title: 'Rendez-vous ASE', description: "Rencontre avec le référent de l'aide sociale à l'enfance.", location: 'Maison départementale', workday: 1, time: '14:00', minutes: 60, user: 'george', beneficiaries: ['petit'] },
  { title: 'Bilan de parcours', description: 'Bilan des démarches et définition des prochaines étapes.', location: 'Bureau 3', workday: 2, time: '09:00', minutes: 60, user: 'george', beneficiaries: ['moreau'] },
  { title: 'Rendez-vous banque', description: "Accompagnement pour l'ouverture du compte.", location: 'Agence bancaire', workday: 1, time: '10:30', minutes: 60, user: 'george', beneficiaries: ['traore'] },
  { title: 'Rendez-vous France Travail', location: 'Agence France Travail', workday: 3, time: '09:30', minutes: 60, user: 'paul', beneficiaries: ['garcia'] },
  { title: 'Rendez-vous MDPH', description: 'Dépôt du dossier complet.', location: 'MDPH du Gard', workday: 4, time: '14:30', minutes: 60, user: 'ines', beneficiaries: ['robert'] },
  { title: 'Rencontre avec la crèche', location: 'Crèche Les Lucioles', workday: 3, time: '11:00', minutes: 45, user: 'paul', beneficiaries: ['bernard'] },
  { title: 'Entretien de suivi', location: 'Bureau 2', workday: 1, time: '09:00', minutes: 45, user: 'george', beneficiaries: ['haddad'] },
  { title: 'Atelier cuisine', description: 'Atelier collectif ouvert aux personnes accueillies.', location: 'Cuisine collective', workday: 5, time: '10:00', minutes: 120, user: 'paul', beneficiaries: ['traore', 'martin', 'garcia'] },
  { title: 'État des lieux de sortie', location: 'Logement 11', workday: 9, time: '10:00', minutes: 60, user: 'george', beneficiaries: ['haddad'] },
  { title: 'Rendez-vous école', description: "Inscription du plus jeune à l'école maternelle.", location: 'École Jean Jaurès', workday: 2, time: '08:45', minutes: 30, user: 'ines', beneficiaries: ['diallo'] },
  { title: 'Entretien de suivi', location: 'Bureau 1', workday: 4, time: '10:00', minutes: 45, user: 'ines', beneficiaries: ['nguyen'] },
  { title: 'Visite de logement', description: 'Visite du logement proposé par le bailleur.', location: 'Habitat du Gard', workday: 6, time: '14:00', minutes: 60, user: 'ines', beneficiaries: ['roux'] },
  { title: 'Entretien de suivi', location: 'Bureau 3', workday: 5, time: '15:00', minutes: 45, user: 'george', beneficiaries: ['dubois'] },
  { title: 'Rendez-vous mairie', description: "Renouvellement de la carte d'identité.", location: 'Mairie de Nîmes', workday: 8, time: '09:15', minutes: 30, user: 'paul', beneficiaries: ['martin'] },
  { title: 'Synthèse partenaires', description: 'Synthèse avec le service de tutelle.', location: 'Salle de réunion', workday: 6, time: '10:00', minutes: 90, user: 'ines', beneficiaries: ['robert'] },
  { title: 'Entretien de suivi', location: 'Bureau 2', workday: 10, time: '11:00', minutes: 45, user: 'paul', beneficiaries: ['kone'] },
  { title: 'Formation RGPD', description: "Sensibilisation de l'équipe à la protection des données.", location: 'Salle de réunion', workday: 4, time: '09:00', minutes: 120, user: 'aline' },

  // Passés
  { title: "Entretien d'accueil", location: 'Bureau 1', workday: -9, time: '10:00', minutes: 60, user: 'paul', beneficiaries: ['martin'] },
  { title: 'Rendez-vous banque', location: 'Agence bancaire', workday: -6, time: '14:00', minutes: 45, user: 'george', beneficiaries: ['traore'] },
  { title: 'Entretien de suivi', location: 'Bureau 2', workday: -4, time: '09:30', minutes: 45, user: 'george', beneficiaries: ['durand'] },
  { title: 'Visite à domicile', location: 'Logement 8', workday: -2, time: '11:00', minutes: 60, user: 'ines', beneficiaries: ['diallo'] },
  { title: 'Rendez-vous CPAM', description: 'Dépôt de la demande de complémentaire santé.', location: 'CPAM de Nîmes', workday: -20, time: '14:00', minutes: 60, user: 'ines', beneficiaries: ['nguyen'] },
  { title: 'Signature du bail', location: 'Habitat du Gard', workday: -12, time: '10:00', minutes: 60, user: 'george', beneficiaries: ['simon'] },
  { title: 'Entretien de suivi', location: 'Bureau 3', workday: -3, time: '15:00', minutes: 45, user: 'ines', beneficiaries: ['lefevre'] },
];

export async function seedAppointments(
  users: SeedIds,
  beneficiaries: SeedIds,
): Promise<SeedIds> {
  const ids: SeedIds = {};

  for (const appointment of appointments) {
    const start = workdayAt(appointment.workday, appointment.time);
    const created = await prisma.appointment.create({
      data: {
        title: appointment.title,
        description: appointment.description,
        location: appointment.location,
        start_at: start,
        end_at: addMinutes(start, appointment.minutes),
        user_id: idOf(users, appointment.user),
        beneficiaries: {
          create: (appointment.beneficiaries ?? []).map((key) => ({
            beneficiary_id: idOf(beneficiaries, key),
          })),
        },
      },
    });
    if (appointment.key) ids[appointment.key] = created.appointment_id;
  }

  return ids;
}
