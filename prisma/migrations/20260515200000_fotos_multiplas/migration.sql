-- AlterTable: rename fotoUrl to fotos and change to JSON array string
ALTER TABLE "Indicacao" ADD COLUMN "fotos" TEXT NOT NULL DEFAULT '[]';

-- Migrate existing data
UPDATE "Indicacao" SET "fotos" = '["' || "fotoUrl" || '"]' WHERE "fotoUrl" IS NOT NULL AND "fotoUrl" != '';

-- Drop old column
ALTER TABLE "Indicacao" DROP COLUMN "fotoUrl";
