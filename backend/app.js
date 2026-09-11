const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());

function verifierAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Authentification requise' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (erreur) {
    return res.status(401).json({ erreur: 'Token invalide ou expiré' });
  }
}

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
      actif: true,
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

    function genererCodeConfirmation() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return code;
}

        const codeConfirmation = genererCodeConfirmation();

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
        codeConfirmation,
        lignes: {
          create: articles.map(a => ({
            produitId: a.produitId,
            quantite: a.quantite,
            prixUnitaire: a.prix,
          })),
        },
      },
      include: {
        lignes: {
          include: { produit: true },
        },
      },
    });

    res.status(201).json(commande);

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors de la création de la commande' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { nom, email, telephone, message } = req.body;

  if (!nom || !email || !telephone || !message) {
    return res.status(400).json({ erreur: 'Tous les champs sont requis' });
  }

  try {
    const messageContact = await prisma.messageContact.create({
      data: { nom, email, telephone, message },
    });

    res.status(201).json({ succes: true, id: messageContact.id });

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors de l\'envoi du message' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ erreur: 'Email et mot de passe requis' });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ erreur: 'Identifiants incorrects' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, admin.motDePasse);

    if (!motDePasseValide) {
      return res.status(401).json({ erreur: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, nom: admin.nom, email: admin.email });

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors de la connexion' });
  }
});

app.get('/api/admin/verification', verifierAdmin, (req, res) => {
  res.json({ message: 'Accès autorisé', admin: req.admin });
});

app.get('/api/admin/produits', verifierAdmin, async (req, res) => {
  const produits = await prisma.produit.findMany({
    include: { categorie: true },
    orderBy: { id: 'asc' },
  });
  res.json(produits);
});

app.put('/api/admin/produits/:id', verifierAdmin, async (req, res) => {
  const { nom, description, prix, imagePrincipale, imageHover } = req.body;

  try {
    const produit = await prisma.produit.update({
      where: { id: parseInt(req.params.id) },
      data: { nom, description, prix, imagePrincipale, imageHover },
    });

    res.json(produit);

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors de la modification' });
  }
});

app.patch('/api/admin/produits/:id/toggle', verifierAdmin, async (req, res) => {
  try {
    const produit = await prisma.produit.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!produit) {
      return res.status(404).json({ erreur: 'Produit non trouve' });
    }

    const produitMisAJour = await prisma.produit.update({
      where: { id: parseInt(req.params.id) },
      data: { actif: !produit.actif },
    });

    res.json(produitMisAJour);

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors du changement de statut' });
  }
});

app.post('/api/admin/produits', verifierAdmin, async (req, res) => {
  const { nom, description, prix, imagePrincipale, imageHover, categorieId } = req.body;

  if (!nom || !prix || !imagePrincipale || !categorieId) {
    return res.status(400).json({ erreur: 'Informations manquantes' });
  }

  try {
    const produit = await prisma.produit.create({
      data: {
        nom,
        description,
        prix: parseInt(prix),
        imagePrincipale,
        imageHover,
        categorieId: parseInt(categorieId),
      },
    });

    res.status(201).json(produit);

  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ erreur: 'Erreur lors de la creation du produit' });
  }
});

app.get('/api/admin/categories', verifierAdmin, async (req, res) => {
  const categories = await prisma.categorie.findMany({
    orderBy: { nom: 'asc' },
  });
  res.json(categories);
});

app.get('/api/admin/commandes', verifierAdmin, async (req, res) => {
  const commandes = await prisma.commande.findMany({
    include: { lignes: { include: { produit: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(commandes);
});

app.get('/api/admin/messages', verifierAdmin, async (req, res) => {
  const messages = await prisma.messageContact.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(messages);
});

module.exports = app;