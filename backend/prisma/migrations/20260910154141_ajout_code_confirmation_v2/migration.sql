/*
  Warnings:

  - A unique constraint covering the columns `[codeConfirmation]` on the table `Commande` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeConfirmation` to the `Commande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "codeConfirmation" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Commande_codeConfirmation_key" ON "Commande"("codeConfirmation");
