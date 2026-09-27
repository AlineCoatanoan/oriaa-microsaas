import prisma from "../../src/lib/prisma.js";

export async function seedAppointments(
  users: {
    admin: { user_id: string };
    user: { user_id: string };
  },
  beneficiaries: {
    beneficiary1: { beneficiary_id: string };
    beneficiary2: { beneficiary_id: string };
    beneficiary3: { beneficiary_id: string };
  }
) {
  const appointment1 = await prisma.appointment.create({
    data: {
      title: "Entretien de suivi",
      description:
        "Point sur les démarches en cours et identification des prochaines échéances.",
      location: "Bureau 2",
      start_at: new Date("2026-09-29T09:30:00"),
      end_at: new Date("2026-09-29T10:15:00"),
      user_id: users.user.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary1.beneficiary_id,
        },
      },
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      title: "Rendez-vous administratif",
      description:
        "Accompagnement pour une démarche administrative.",
      location: "Bureau 1",
      start_at: new Date("2026-10-01T14:00:00"),
      end_at: new Date("2026-10-01T15:00:00"),
      user_id: users.admin.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary2.beneficiary_id,
        },
      },
    },
  });

  const appointment3 = await prisma.appointment.create({
    data: {
      title: "Réunion d'équipe",
      description:
        "Réunion hebdomadaire de l'équipe d'accompagnement.",
      location: "Salle de réunion",
      start_at: new Date("2026-09-30T10:00:00"),
      end_at: new Date("2026-09-30T11:00:00"),
      user_id: users.user.user_id,
    },
  });

  const appointment4 = await prisma.appointment.create({
    data: {
      title: "Bilan de parcours",
      description:
        "Bilan des démarches réalisées et définition des prochaines étapes.",
      location: "Bureau 3",
      start_at: new Date("2026-10-06T15:30:00"),
      end_at: new Date("2026-10-06T16:30:00"),
      user_id: users.user.user_id,
      beneficiaries: {
        create: {
          beneficiary_id: beneficiaries.beneficiary3.beneficiary_id,
        },
      },
    },
  });

  return {
    appointment1,
    appointment2,
    appointment3,
    appointment4,
  };
}