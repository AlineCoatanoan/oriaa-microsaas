-- DropForeignKey
ALTER TABLE "NoteAppointment" DROP CONSTRAINT "NoteAppointment_note_id_fkey";

-- DropForeignKey
ALTER TABLE "Subtask" DROP CONSTRAINT "Subtask_task_id_fkey";

-- DropForeignKey
ALTER TABLE "TaskNote" DROP CONSTRAINT "TaskNote_note_id_fkey";

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNote" ADD CONSTRAINT "TaskNote_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "Note"("note_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAppointment" ADD CONSTRAINT "NoteAppointment_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "Note"("note_id") ON DELETE CASCADE ON UPDATE CASCADE;
