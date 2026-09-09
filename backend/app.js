const cors = require('cors');
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Le serveur OBW fonctionne !');
});

app.get('/api/produits', async (req, res) => {
  const produits = await prisma.produit.findMany();
  res.json(produits);
});

app.get('/api/produits/:id', async (req, res) => {
  const produit = await prisma.produit.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!produit) {
    return res.status(404).json({ erreur: 'Produit non trouvé' });
  }

  res.json(produit);
});


app.get('/api/produits/categorie/:nomCategorie', async (req, res) => {
  const produits = await prisma.produit.findMany({
    where: {
      categorie: {
        nom: req.params.nomCategorie,
      },
    },
  });
  res.json(produits);
});

module.exports = app;