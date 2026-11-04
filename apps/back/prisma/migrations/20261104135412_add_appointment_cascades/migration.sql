-- DropForeignKey
ALTER TABLE "BeneficiaryAppointment" DROP CONSTRAINT "BeneficiaryAppointment_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "NoteAppointment" DROP CONSTRAINT "NoteAppointment_appointment_id_fkey";

-- AddForeignKey
ALTER TABLE "NoteAppointment" ADD CONSTRAINT "NoteAppointment_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryAppointment" ADD CONSTRAINT "BeneficiaryAppointment_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;
