-- CreateTable
CREATE TABLE "Comunicacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicacaoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comunicacao_indicacaoId_fkey" FOREIGN KEY ("indicacaoId") REFERENCES "Indicacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comunicacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
