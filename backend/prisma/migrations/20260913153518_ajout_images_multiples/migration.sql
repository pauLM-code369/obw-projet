-- CreateTable
CREATE TABLE "ImageProduit" (
    "id" SERIAL NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "produitId" INTEGER NOT NULL,

    CONSTRAINT "ImageProduit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageProduit" ADD CONSTRAINT "ImageProduit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
