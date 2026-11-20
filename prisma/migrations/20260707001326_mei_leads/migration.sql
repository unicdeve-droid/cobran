-- CreateTable
CREATE TABLE "MeiLead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "dataAbertura" TIMESTAMP(3),
    "cep" TEXT,
    "uf" TEXT NOT NULL,
    "municipioCodigo" TEXT NOT NULL,
    "cnae" TEXT,
    "modulo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeiLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "codigo" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("codigo","uf")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeiLead_cnpj_key" ON "MeiLead"("cnpj");

-- CreateIndex
CREATE INDEX "MeiLead_uf_idx" ON "MeiLead"("uf");

-- CreateIndex
CREATE INDEX "MeiLead_municipioCodigo_idx" ON "MeiLead"("municipioCodigo");

-- CreateIndex
CREATE INDEX "MeiLead_modulo_idx" ON "MeiLead"("modulo");

-- CreateIndex
CREATE INDEX "MeiLead_cnae_idx" ON "MeiLead"("cnae");

-- CreateIndex
CREATE INDEX "MeiLead_dataAbertura_idx" ON "MeiLead"("dataAbertura");

-- CreateIndex
CREATE INDEX "MeiLead_nome_idx" ON "MeiLead"("nome");
