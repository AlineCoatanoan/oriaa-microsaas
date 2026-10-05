import prisma from '../../src/lib/prisma.js';

export async function seedNotes(
  users: {
    admin: { user_id: number };
    user: { user_id: number };
  },
  beneficiaries: {
    beneficiary1: { beneficiary_id: number };
    beneficiary2: { beneficiary_id: number };
    beneficiary3: { beneficiary_id: number };
  },
) {
  const note1 = await prisma.note.create({
    data: {
      title: 'Point administratif',
      content: `Un point administratif a été réalisé avec le bénéficiaire concernant les démarches actuellement en cours. Les documents nécessaires au dossier ont été vérifiés et les pièces manquantes ont été identifiées. Le bénéficiaire doit transmettre les justificatifs restants avant le prochain rendez-vous. Une vérification sera effectuée à réception des documents.`,
      created_at: new Date('2026-09-20'),
      updated_at: new Date('2026-09-20'),
      beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
      user_id: users.user.user_id,
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'Situation familiale',
      content: `Un entretien a permis de faire le point sur la situation familiale et les démarches engagées au cours des dernières semaines. Le bénéficiaire indique que plusieurs démarches sont actuellement en cours et souhaite être accompagné dans leur suivi. Les prochaines échéances ont été rappelées et les documents nécessaires ont été listés. Un nouveau point sera réalisé lors du prochain rendez-vous afin d'évaluer l'avancement des différentes démarches.`,
      created_at: new Date('2026-09-22'),
      updated_at: new Date('2026-09-23'),
      beneficiary_id: beneficiaries.beneficiary2.beneficiary_id,
      user_id: users.admin.user_id,
    },
  });

  const note3 = await prisma.note.create({
    data: {
      title: "Réunion d'équipe",
      content: `Bilan intermédiaire concernant l'accompagnement. Les objectifs définis lors du précédent échange ont été repris afin d'identifier les démarches réalisées et celles restant à engager. La situation apparaît globalement stable. Plusieurs actions administratives restent toutefois à finaliser. Le bénéficiaire semble avoir identifié les prochaines étapes et a indiqué souhaiter poursuivre l'accompagnement sur les démarches en cours. Une nouvelle évaluation de la situation sera réalisée lors du prochain entretien.`,
      created_at: new Date('2026-09-24'),
      updated_at: new Date('2026-09-24'),
      user_id: users.user.user_id,
    },
  });

  const note4 = await prisma.note.create({
    data: {
      title: 'Suivi du parcours',
      content: `Bilan de parcours réalisé à partir des différents échanges et démarches effectués depuis le début de l'accompagnement.
        Au cours de la période observée, plusieurs démarches administratives ont été engagées et certaines ont déjà abouti. Le bénéficiaire a progressivement gagné en autonomie dans la réalisation de certaines démarches et sollicite principalement un soutien lorsqu'une situation nécessite des informations complémentaires ou plusieurs interlocuteurs.
        Les principaux objectifs identifiés lors des précédents entretiens ont été réévalués. Certains sont désormais considérés comme atteints, tandis que d'autres nécessitent encore un accompagnement. Une attention particulière devra être portée au suivi des prochaines échéances afin d'éviter toute interruption dans les démarches engagées.
        Le prochain rendez-vous permettra de faire un nouveau point sur l'évolution de la situation, les démarches réalisées depuis ce bilan et les éventuels besoins d'accompagnement supplémentaires.`,
      created_at: new Date('2026-09-25'),
      updated_at: new Date('2026-09-25'),
      beneficiary_id: beneficiaries.beneficiary3.beneficiary_id,
      user_id: users.user.user_id,
    },
  });

  return {
    note1,
    note2,
    note3,
    note4,
  };
}
