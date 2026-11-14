import prisma from '../../src/lib/prisma.js';
import { idOf, type SeedIds } from './helpers.js';

/** Notes rattachées à une tâche ou à un rendez-vous. */
export async function seedLinks(
  tasks: SeedIds,
  notes: SeedIds,
  appointments: SeedIds,
) {
  await prisma.taskNote.createMany({
    data: [
      ['caf', 'durand-admin'],
      ['referent', 'petit-famille'],
      ['secu', 'nguyen-cpam'],
    ].map(([task, note]) => ({
      task_id: idOf(tasks, task),
      note_id: idOf(notes, note),
    })),
  });

  await prisma.noteAppointment.createMany({
    data: [
      ['durand-admin', 'durand-suivi'],
      ['petit-famille', 'petit-ase'],
    ].map(([note, appointment]) => ({
      note_id: idOf(notes, note),
      appointment_id: idOf(appointments, appointment),
    })),
  });
}
