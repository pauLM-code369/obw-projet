/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Categorie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Categorie_nom_key" ON "Categorie"("nom");
