/*
  Warnings:

  - You are about to drop the column `file_path` on the `Document` table. All the data in the column will be lost.
  - Added the required column `content` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_bytes` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "file_path",
ADD COLUMN     "content" BYTEA NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mime_type" VARCHAR(50) NOT NULL,
ADD COLUMN     "size_bytes" INTEGER NOT NULL,
ADD COLUMN     "title" VARCHAR(100) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
