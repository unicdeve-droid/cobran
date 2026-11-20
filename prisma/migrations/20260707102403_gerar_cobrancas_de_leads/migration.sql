/*
  Warnings:

  - A unique constraint covering the columns `[cobrancaId]` on the table `MeiLead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MeiLead" ADD COLUMN     "cobrancaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MeiLead_cobrancaId_key" ON "MeiLead"("cobrancaId");

-- AddForeignKey
ALTER TABLE "MeiLead" ADD CONSTRAINT "MeiLead_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE SET NULL ON UPDATE CASCADE;
