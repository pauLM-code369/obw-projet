require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    const categorie = await prisma.categorie.upsert({
    where: { nom: 'Imprimantes' },
    update: {},
    create: { nom: 'Imprimantes' },
  });

  await prisma.produit.create({
    data: {
      nom: 'HP LaserJet Pro 4003dn',
      description: 'Imprimante laser monochrome, réseau, recto-verso auto.',
      prix: 150000,
      imagePrincipale: 'hp-laserjet-pro-4003dn.webp',
      imageHover: 'hp-laserjet-pro-4003dn-2.webp',
      categorieId: categorie.id,
    },
  });

    await prisma.produit.create({
    data: {
      nom: 'HP LaserJet Pro 4003fdw',
      description: 'Imprimante laser monochrome, Wi-Fi, réseau, recto-verso auto.',
      prix: 165000,
      imagePrincipale: 'hp-laserjet-pro-4003dn.webp',
      imageHover: 'hp-laserjet-pro-4003dn-2.webp',
      categorieId: categorie.id,
    },
  });

  console.log('Produits de test ajoutés !');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());