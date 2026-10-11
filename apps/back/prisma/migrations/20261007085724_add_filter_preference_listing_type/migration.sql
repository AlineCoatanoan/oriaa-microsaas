/*
  Warnings:

  - Added the required column `type_listing` to the `FilterPreference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FilterPreference" ADD COLUMN     "type_listing" VARCHAR(50) NOT NULL;
