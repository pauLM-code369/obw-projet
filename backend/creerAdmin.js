require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const motDePasseHache = await bcrypt.hash('OBWOpenBusinessWorld2019a', 10);

  const admin = await prisma.admin.create({
    data: {
      email: 'Boss@openbusiness.ci',
      motDePasse: motDePasseHache,
      nom: 'Gestion OBW',
    },
  });

  console.log('Compte admin cree :', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());