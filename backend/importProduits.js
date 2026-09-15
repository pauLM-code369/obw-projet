require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const donnees = JSON.parse(fs.readFileSync('./produits-import.json', 'utf-8'));

  let totalCrees = 0;

  for (const nomCategorie of Object.keys(donnees)) {
    const categorie = await prisma.categorie.upsert({
      where: { nom: nomCategorie },
      update: {},
      create: { nom: nomCategorie },
    });

    const produits = donnees[nomCategorie];

    for (const p of produits) {
      const dejaExistant = await prisma.produit.findFirst({
        where: { nom: p.nom, categorieId: categorie.id },
      });

      if (dejaExistant) {
        console.log(`Deja present, ignore : ${p.nom}`);
        continue;
      }

      await prisma.produit.create({
        data: {
          nom: p.nom,
          description: p.description,
          prix: 1000,
          imagePrincipale: p.imagePrincipale,
          imageHover: p.imageHover,
          categorieId: categorie.id,
        },
      });

      totalCrees++;
      console.log(`Cree : ${p.nom} (${nomCategorie})`);
    }
  }

  console.log(`\nTermine ! ${totalCrees} produits crees au total.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
