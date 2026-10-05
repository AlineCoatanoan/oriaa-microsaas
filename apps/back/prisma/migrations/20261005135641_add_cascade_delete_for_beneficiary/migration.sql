-- DropForeignKey
ALTER TABLE "BeneficiaryAppointment" DROP CONSTRAINT "BeneficiaryAppointment_beneficiary_id_fkey";

-- DropForeignKey
ALTER TABLE "BeneficiaryTask" DROP CONSTRAINT "BeneficiaryTask_beneficiary_id_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_beneficiary_id_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_beneficiary_id_fkey";

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryTask" ADD CONSTRAINT "BeneficiaryTask_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryAppointment" ADD CONSTRAINT "BeneficiaryAppointment_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE CASCADE ON UPDATE CASCADE;
