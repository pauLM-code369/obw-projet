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
    include: { categorie: true },
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

app.use(express.json());

app.post('/api/commandes', async (req, res) => {
  const { nom, email, telephone, adresse, ville, modePaiement, typeLivraison, articles } = req.body;

  if (!nom || !telephone || !articles || articles.length === 0) {
    return res.status(400).json({ erreur: 'Informations manquantes' });
  }

  if (typeLivraison === 'Expédier' && !adresse) {
    return res.status(400).json({ erreur: 'Adresse requise pour l\'expédition' });
  }

  try {
    const total = articles.reduce((somme, a) => somme + (a.prix * a.quantite), 0);

    const commande = await prisma.commande.create({
      data: {
        nom,
        email,
        telephone,
        typeLivraison,
        adresse,
        ville,
        modePaiement,
        total,
        lignes: {
          create: articles.map(a => ({
            produitId: a.produitId,
            quantite: a.quantite,
            prixUnitaire: a.prix,
          })),
        },
      },
      include: { lignes: true },
    });

    res.status(201).json(commande);

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors de la création de la commande' });
  }
});

module.exports = app;