-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "label" VARCHAR(50) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "job" VARCHAR(50) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "beneficiary_id" SERIAL NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "date_of_birth" DATE,
    "address" VARCHAR(255),
    "postal_code" VARCHAR(10),
    "city" VARCHAR(100),
    "phone" VARCHAR(20),
    "family_status" VARCHAR(50),
    "number_of_children" INTEGER,
    "household_composition" VARCHAR(50),
    "pathway_status" VARCHAR(50),
    "entry_date" DATE NOT NULL,
    "exit_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("beneficiary_id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" SERIAL NOT NULL,
    "title" VARCHAR(50),
    "description" TEXT,
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(50),
    "priority" VARCHAR(50),
    "user_id_assigned" INTEGER,
    "user_id_created_by" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "Note" (
    "note_id" SERIAL NOT NULL,
    "title" VARCHAR(50),
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "beneficiary_id" INTEGER,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("note_id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "appointment_id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "location" VARCHAR(50),
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "document_id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "beneficiary_id" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "Subtask" (
    "subtask_id" SERIAL NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("subtask_id")
);

-- CreateTable
CREATE TABLE "FilterPreference" (
    "filter_preference_id" SERIAL NOT NULL,
    "user_id_target" INTEGER NOT NULL,
    "user_id_define" INTEGER NOT NULL,

    CONSTRAINT "FilterPreference_pkey" PRIMARY KEY ("filter_preference_id")
);

-- CreateTable
CREATE TABLE "TaskNote" (
    "task_id" INTEGER NOT NULL,
    "note_id" INTEGER NOT NULL,

    CONSTRAINT "TaskNote_pkey" PRIMARY KEY ("task_id","note_id")
);

-- CreateTable
CREATE TABLE "NoteAppointment" (
    "note_id" INTEGER NOT NULL,
    "appointment_id" INTEGER NOT NULL,

    CONSTRAINT "NoteAppointment_pkey" PRIMARY KEY ("note_id","appointment_id")
);

-- CreateTable
CREATE TABLE "BeneficiaryTask" (
    "beneficiary_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "BeneficiaryTask_pkey" PRIMARY KEY ("beneficiary_id","task_id")
);

-- CreateTable
CREATE TABLE "BeneficiaryAppointment" (
    "beneficiary_id" INTEGER NOT NULL,
    "appointment_id" INTEGER NOT NULL,

    CONSTRAINT "BeneficiaryAppointment_pkey" PRIMARY KEY ("beneficiary_id","appointment_id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_user_id_assigned_fkey" FOREIGN KEY ("user_id_assigned") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_user_id_created_by_fkey" FOREIGN KEY ("user_id_created_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterPreference" ADD CONSTRAINT "FilterPreference_user_id_target_fkey" FOREIGN KEY ("user_id_target") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterPreference" ADD CONSTRAINT "FilterPreference_user_id_define_fkey" FOREIGN KEY ("user_id_define") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNote" ADD CONSTRAINT "TaskNote_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNote" ADD CONSTRAINT "TaskNote_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "Note"("note_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAppointment" ADD CONSTRAINT "NoteAppointment_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "Note"("note_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAppointment" ADD CONSTRAINT "NoteAppointment_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryTask" ADD CONSTRAINT "BeneficiaryTask_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryTask" ADD CONSTRAINT "BeneficiaryTask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryAppointment" ADD CONSTRAINT "BeneficiaryAppointment_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "Beneficiary"("beneficiary_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryAppointment" ADD CONSTRAINT "BeneficiaryAppointment_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
