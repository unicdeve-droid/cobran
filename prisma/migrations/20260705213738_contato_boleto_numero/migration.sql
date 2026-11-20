/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `Cobranca` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cobranca" ADD COLUMN     "boletoUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "numero" SERIAL NOT NULL,
ADD COLUMN     "telefone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cobranca_numero_key" ON "Cobranca"("numero");
