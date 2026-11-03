/*
  Warnings:

  - Made the column `beneficiary_id` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "beneficiary_id" SET NOT NULL;
