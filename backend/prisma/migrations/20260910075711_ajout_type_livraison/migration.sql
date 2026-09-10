-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "typeLivraison" TEXT NOT NULL DEFAULT 'Expédier',
ALTER COLUMN "adresse" DROP NOT NULL;
