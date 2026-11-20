-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobranca" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3),
    "cep" TEXT,
    "nomeCompleto" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "mostrarRazaoSocial" BOOLEAN NOT NULL DEFAULT true,
    "mostrarCnpj" BOOLEAN NOT NULL DEFAULT true,
    "mostrarDataAbertura" BOOLEAN NOT NULL DEFAULT true,
    "mostrarCep" BOOLEAN NOT NULL DEFAULT true,
    "mostrarNomeCompleto" BOOLEAN NOT NULL DEFAULT true,
    "mostrarCpf" BOOLEAN NOT NULL DEFAULT true,
    "mostrarDataNascimento" BOOLEAN NOT NULL DEFAULT true,
    "qrCodeUrl" TEXT,
    "pixCopiaECola" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Divida" (
    "id" TEXT NOT NULL,
    "cobrancaId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Divida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cobranca_uuid_key" ON "Cobranca"("uuid");

-- CreateIndex
CREATE INDEX "Cobranca_uuid_idx" ON "Cobranca"("uuid");

-- CreateIndex
CREATE INDEX "Divida_cobrancaId_idx" ON "Divida"("cobrancaId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_chave_key" ON "Configuracao"("chave");

-- AddForeignKey
ALTER TABLE "Divida" ADD CONSTRAINT "Divida_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE CASCADE ON UPDATE CASCADE;
