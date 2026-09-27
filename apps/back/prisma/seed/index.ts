import prisma from "../../src/lib/prisma.js";

import { seedRoles } from "./roles.seed.js";
import { seedUsers } from "./users.seed.js";
import { seedBeneficiaries } from "./beneficiaries.seed.js";
import { seedTasks } from "./tasks.seed.js";
import { seedSubtasks } from "./subtasks.seed.js";
import { seedNotes } from "./notes.seed.js";
import { seedAppointments } from "./appointments.seed.js";
import { seedDocuments } from "./documents.seed.js";
import { seedFilters } from "./filters.seed.js";

async function main() {
  console.log("Début du seed...");

  const roles = await seedRoles();

  const users = await seedUsers(roles);

  const beneficiaries = await seedBeneficiaries(users.user.user_id);

  const tasks = await seedTasks(users, beneficiaries);

  await seedSubtasks(tasks);

  const notes = await seedNotes(users, beneficiaries);

  const appointments = await seedAppointments(users, beneficiaries);

  await seedDocuments(beneficiaries);

  await seedFilters(users);

  await prisma.taskNote.create({
    data: {
      task_id: tasks.task1.task_id,
      note_id: notes.note1.note_id,
    },
  });

  await prisma.taskNote.create({
    data: {
      task_id: tasks.task2.task_id,
      note_id: notes.note2.note_id,
    },
  });

  await prisma.noteAppointment.create({
    data: {
      note_id: notes.note1.note_id,
      appointment_id: appointments.appointment1.appointment_id,
    },
  });

  await prisma.noteAppointment.create({
    data: {
      note_id: notes.note2.note_id,
      appointment_id: appointments.appointment2.appointment_id,
    },
  });

  console.log("Seed terminé.");
}

main()
  .catch((error) => {
    console.error("Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });