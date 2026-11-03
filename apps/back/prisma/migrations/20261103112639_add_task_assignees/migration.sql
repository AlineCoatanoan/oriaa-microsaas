/*
  Warnings:

  - You are about to drop the column `user_id_assigned` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BeneficiaryTask" DROP CONSTRAINT "BeneficiaryTask_task_id_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_user_id_assigned_fkey";

-- DropForeignKey
ALTER TABLE "TaskNote" DROP CONSTRAINT "TaskNote_task_id_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "user_id_assigned";

-- CreateTable
CREATE TABLE "TaskAssignee" (
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "TaskAssignee_pkey" PRIMARY KEY ("task_id","user_id")
);

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNote" ADD CONSTRAINT "TaskNote_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryTask" ADD CONSTRAINT "BeneficiaryTask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;
