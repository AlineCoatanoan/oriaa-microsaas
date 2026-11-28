/*
  Warnings:

  - A unique constraint covering the columns `[password_reset_token_hash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_reset_expires_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_token_hash" VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "User_password_reset_token_hash_key" ON "User"("password_reset_token_hash");
