/*
  Warnings:

  - A unique constraint covering the columns `[user_id_define,type_listing]` on the table `FilterPreference` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FilterPreference_user_id_define_type_listing_key" ON "FilterPreference"("user_id_define", "type_listing");
