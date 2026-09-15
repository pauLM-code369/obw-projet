require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const dossiersParCategorie = {
  'Imprimantes': 'imprimantes',
  'Imprimantes HP Laser': 'imprimantes',
  'Photocopieuses': 'photocopieuses',
  'Scanneurs & lecteurs': 'scanneurs-lecteurs',
};

async function main() {
  const produits = await prisma.produit.findMany({
    include: { categorie: true },
  });

  let corriges = 0;
  let dejaBons = 0;

  for (const p of produits) {
    const dossier = dossiersParCategorie[p.categorie.nom];

    if (!dossier) {
      console.log(`Categorie non geree, ignore : ${p.nom} (${p.categorie.nom})`);
      continue;
    }

    // Si le chemin contient deja un "/", on considere qu'il a deja ete corrige
    if (p.imagePrincipale.includes('/')) {
      dejaBons++;
      continue;
    }

    const nouvelleImagePrincipale = `${dossier}/${p.imagePrincipale}`;
    const nouvelleImageHover = p.imageHover ? `${dossier}/${p.imageHover}` : null;

    await prisma.produit.update({
      where: { id: p.id },
      data: {
        imagePrincipale: nouvelleImagePrincipale,
        imageHover: nouvelleImageHover,
      },
    });

    console.log(`Corrige : ${p.nom} -> ${nouvelleImagePrincipale}`);
    corriges++;
  }

  console.log(`\nTermine ! ${corriges} produits corriges, ${dejaBons} deja a jour.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
