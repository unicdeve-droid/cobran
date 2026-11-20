/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `MeiLead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MeiLead" ADD COLUMN     "numero" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MeiLead_numero_key" ON "MeiLead"("numero");

-- CreateIndex
CREATE INDEX "MeiLead_numero_idx" ON "MeiLead"("numero");
