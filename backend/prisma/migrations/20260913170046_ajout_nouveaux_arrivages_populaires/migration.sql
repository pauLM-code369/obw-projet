-- AlterTable
ALTER TABLE "Produit" ADD COLUMN     "estNouveauArrivage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estPopulaire" BOOLEAN NOT NULL DEFAULT false;
