-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INDICADOR',
    "chavePix" TEXT,
    "tipoChavePix" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'BRONZE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Indicacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicadorId" TEXT NOT NULL,
    "nomeEstabelecimento" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "tipoLocal" TEXT NOT NULL,
    "horarioFuncionamento" TEXT NOT NULL,
    "fluxoPessoas" TEXT NOT NULL,
    "nomeDecissor" TEXT NOT NULL,
    "telefoneDecissor" TEXT NOT NULL,
    "cargoDecissor" TEXT,
    "interesseDecissor" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "temEspaco" TEXT NOT NULL,
    "temEnergia" TEXT NOT NULL,
    "temConcorrente" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INDICADO',
    "dataInstalacao" DATETIME,
    "faturamentoMensal" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Indicacao_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicacaoId" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "mesReferencia" TEXT,
    "comprovanteUrl" TEXT,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pagamento_indicacaoId_fkey" FOREIGN KEY ("indicacaoId") REFERENCES "Indicacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpfCnpj_key" ON "User"("cpfCnpj");
