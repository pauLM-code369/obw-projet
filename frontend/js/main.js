/* ================================================================
   OPEN BUSINESS WORLD — main.js
   ----------------------------------------------------------------
   1. BARRE D'ANNONCE DYNAMIQUE  → lit les data-* du HTML
   2. SLIDER HERO                → défilement auto + flèches + dots
   3. MENU MOBILE                → hamburger ☰ ouvre/ferme la nav
   4. BOUTONS "AJOUTER AU PANIER"→ petit feedback visuel
   5. BARRE CATÉGORIES           → flèches gauche/droite
================================================================ */


/* ================================================================
   1. BARRE D'ANNONCE DYNAMIQUE
================================================================ */

function initPromoBar() {

  const bar = document.querySelector('.promo-bar');
  if (!bar) return;

  const product = bar.dataset.product || 'Offre spéciale';
  const price   = bar.dataset.price   || '';
  const date    = bar.dataset.date    || '';
  const link    = bar.dataset.link    || '#';
  const cta     = bar.dataset.cta     || "Profiter de l'offre";

  bar.innerHTML = `
    <i class="ti ti-tag" aria-hidden="true"></i>
    <strong>${product}</strong>
    ${price ? `<span>— ${price}</span>` : ''}
    ${date  ? `<span>· Offre valable avant le ${date}</span>` : ''}
        <a href="${link}" class="promo-pill">
      <i class="ti ti-bolt" aria-hidden="true"></i> ${cta}
    </a>
  `;
}


/* ================================================================
   2. SLIDER HERO
================================================================ */

function initSlider() {

  const track    = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const progress = document.getElementById('sliderProgress');

  if (!track) return;

  const slides      = track.querySelectorAll('.slide');
  const dots        = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];
  const totalSlides = slides.length;
  const INTERVAL    = 5000;

  let currentSlide = 0;
  let autoTimer    = null;

  function goToSlide(index) {
    if (index >= totalSlides) index = 0;
    if (index < 0)            index = totalSlides - 1;

    slides.forEach(slide => slide.classList.remove('active'));
    track.style.transform = `translateX(-${index * 100}%)`;

    setTimeout(() => {
      slides[index].classList.add('active');
    }, 50);

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentSlide = index;
    startProgress();
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function startProgress() {
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width      = '0%';
    setTimeout(() => {
      progress.style.transition = `width ${INTERVAL}ms linear`;
      progress.style.width      = '100%';
    }, 30);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAuto();
      goToSlide(currentSlide - 1);
      startAuto();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAuto();
      goToSlide(currentSlide + 1);
      startAuto();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      goToSlide(parseInt(dot.dataset.index));
      startAuto();
    });
  });

  let touchStartX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      if (diff > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
      startAuto();
    }
  }, { passive: true });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  goToSlide(0);
  startAuto();
}



/* ================================================================
   6. HERO VITRINE — slider en fondu (index.html)
================================================================ */

function initVitrineHero() {

  const slides  = document.querySelectorAll('.vitrine-slide');
  const dots    = document.querySelectorAll('#vitrineHeroDots .dot');
  const prevBtn = document.getElementById('vitrineHeroPrev');
  const nextBtn = document.getElementById('vitrineHeroNext');
  const progress = document.getElementById('vitrineHeroProgress');

  if (!slides.length) return;

  const total    = slides.length;
  const INTERVAL = 6000;
  let current    = 0;
  let timer      = null;

  function playTextAnim(slide) {
    const content = slide.querySelector('.vitrine-hero-content');
    if (!content) return;
    content.classList.remove('anim-in');
    void content.offsetWidth; /* force le navigateur à "oublier" l'ancienne animation */
    content.classList.add('anim-in');
  }

  function startProgress() {
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width      = '0%';
    setTimeout(() => {
      progress.style.transition = `width ${INTERVAL}ms linear`;
      progress.style.width      = '100%';
    }, 30);
  }


  function goTo(index) {
    if (index >= total) index = 0;
    if (index < 0)       index = total - 1;

    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');

    playTextAnim(slides[index]);
    startProgress(); 
    current = index;
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }
  function stop() {
    if (timer) clearInterval(timer);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); start(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); start(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      start();
    });
  });

  const heroSection = document.querySelector('.vitrine-hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stop);
    heroSection.addEventListener('mouseleave', start);
  }

  playTextAnim(slides[0]); /* lance l'animation du 1er slide au chargement */
  startProgress();  
  start();
}


/* ================================================================
   3. MENU MOBILE (hamburger)
================================================================ */

function initMobileMenu() {

  const hamburger = document.getElementById('hamburgerBtn');
  const nav       = document.getElementById('mainNav');
  const closeBtn  = document.getElementById('navCloseBtn');

  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    nav.classList.add('nav-open');
    createOverlay();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  function closeMenu() {
    nav.classList.remove('nav-open');
    removeOverlay();
  }

  function createOverlay() {
    if (document.getElementById('navOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'navOverlay';

    Object.assign(overlay.style, {
      position:   'fixed',
      inset:      '0',
      background: 'rgba(0,0,0,0.4)',
      zIndex:     '280',
      cursor:     'pointer'
    });

    overlay.addEventListener('click', closeMenu);
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    const overlay = document.getElementById('navOverlay');
    if (overlay) overlay.remove();
  }
}


/* ================================================================
   4. BOUTONS "AJOUTER AU PANIER"
================================================================ */

function ajouterAuPanier(produitId, nom, prix, image) {
  let panier = JSON.parse(localStorage.getItem('panierOBW')) || [];

  const existant = panier.find(item => item.produitId === produitId);

  if (existant) {
    existant.quantite += 1;
  } else {
    panier.push({ produitId, nom, prix, image, quantite: 1 });
  }

  localStorage.setItem('panierOBW', JSON.stringify(panier));
  mettreAJourBadgePanier();
}

function mettreAJourBadgePanier() {
  const panier = JSON.parse(localStorage.getItem('panierOBW')) || [];
  const totalArticles = panier.reduce((somme, item) => somme + item.quantite, 0);

  document.querySelectorAll('.icon-btn[aria-label="Mon panier"] .dot-badge').forEach(badge => {
    if (totalArticles > 0) {
      badge.textContent = totalArticles;
      badge.style.display = 'flex';
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
    }
  });
}

function initCartIconLink() {
  const enSousDossier = window.location.pathname.includes('/html/');
  const lienPanier = enSousDossier ? 'panier.html' : 'html/panier.html';

  document.querySelectorAll('.icon-btn[aria-label="Mon panier"]').forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      window.location.href = lienPanier;
    });
  });
}


function initCartButtons() {

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;

    e.stopPropagation();

    const card = btn.closest('.product-card') || btn.closest('.product-detail-info');
    if (!card) return;

    const nomEl = card.querySelector('.product-name, .product-detail-name');
    const prixEl = card.querySelector('.product-price, .product-detail-price');
    const imgEl = card.querySelector('.product-photo') || document.getElementById('galleryMainImg');

    const nom = nomEl ? nomEl.textContent.trim() : 'Produit';
    const prixTexte = prixEl ? prixEl.textContent.replace(/[^\d]/g, '') : '0';
    const prix = parseInt(prixTexte) || 0;
    const image = imgEl ? imgEl.src : '';
    const produitId = btn.dataset.produitId || null;

    ajouterAuPanier(produitId, nom, prix, image);

    const original = btn.innerHTML;
    btn.innerHTML         = '<i class="ti ti-check" aria-hidden="true"></i> Ajouté !';
    btn.style.background  = '#22C55E';
    btn.style.color       = '#FFF';
    btn.style.borderColor = '#22C55E';

    setTimeout(() => {
      btn.innerHTML         = original;
      btn.style.background  = '';
      btn.style.color       = '';
      btn.style.borderColor = '';
    }, 1500);
  });

  mettreAJourBadgePanier();
}

/* ================================================================
   5. BARRE CATÉGORIES — flèches gauche/droite
   Fait défiler la piste de 300px à chaque clic.
================================================================ */

function initCategories() {

  const track   = document.getElementById('categoriesTrack');
  const prevBtn = document.getElementById('catPrev');
  const nextBtn = document.getElementById('catNext');

  if (!track) return;

  const SCROLL = 300;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollLeft -= SCROLL;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollLeft += SCROLL;
    });
  }
}


/* ================================================================
   7. FORMULAIRE DE CONTACT — confirmation visuelle (pas d'envoi réel)
================================================================ */

function initContactForm() {

  const form = document.querySelector('.contact-form');
  if (!form) return;

  const btn = form.querySelector('.contact-submit-btn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    effacerErreurChamp('cf-name');
    effacerErreurChamp('cf-phone');

    const nom = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const telephone = document.getElementById('cf-phone').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    const mots = nom.split(/\s+/).filter(mot => mot.length > 0);
    const regexMot = /^[a-zA-ZÀ-ÿ'-]{2,}$/;
    const nomValide = mots.length >= 2 && mots.every(mot => regexMot.test(mot));

    if (!nomValide) {
      afficherErreurChamp('cf-name', 'Merci de saisir votre prénom et nom complets (ex: Marc dupont).');
      return;
    }

    const regexTelephone = /^(\+225[0-9]{10}|0[0-9]{9})$/;

    if (!regexTelephone.test(telephone)) {
      afficherErreurChamp('cf-phone', 'Numéro invalide. Exemple : 0101020304 ou +2250101020304');
      return;
    }

    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Envoi en cours...';

    try {
      const reponse = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, telephone, message }),
      });

      if (!reponse.ok) throw new Error('Erreur serveur');

      btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Message envoyé !';
      btn.style.background = '#22C55E';

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 2200);

    } catch (erreur) {
      console.error(erreur);
      btn.innerHTML = original;
      btn.disabled = false;
            const erreurGeneraleEl = document.getElementById('contactFormError');
      if (erreurGeneraleEl) {
        erreurGeneraleEl.textContent = 'Une erreur est survenue. Merci de réessayer ou de nous contacter sur WhatsApp.';
        erreurGeneraleEl.style.display = 'block';
      }
    }
  });
}


function selectPayment(element) {
  document.querySelectorAll('.payment-box').forEach(box => {
    box.classList.remove('active');
  });
  element.classList.add('active');

  const valeur = element.dataset.valeur;
  const inputPaiement = document.getElementById('cmd-paiement');
  if (inputPaiement && valeur) {
    inputPaiement.value = valeur;
  }
}


/* ================================================================
   POINT D'ENTRÉE — DOMContentLoaded
   ----------------------------------------------------------------
   Se déclenche quand tout le HTML est analysé par le navigateur.
   On appelle toutes nos fonctions ici dans l'ordre.
================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  initPromoBar();     /* 1. Barre d'annonce dynamique */
  initSlider();       /* 2. Slider hero               */
  initMobileMenu();   /* 3. Menu hamburger mobile     */
  initCartButtons();  /* 4. Boutons panier            */
  initCategories();   /* 5. Barre catégories          */
  initVitrineHero();  /* 6. Hero vitrine (fondu)      */
  initContactForm();  /* 7. Formulaire contact */
  initMegaMenu();  /* 8. Méga-menu mobile */
  initSubcatTabs();  /* 9. Onglets sous-catégories actifs au clic */
  initProductDetail();  /* 10. Page produit détaillée */
  chargerProduitsImprimantes();/* pour cahrger dynamiquement */
  chargerProduitsPhotocopieuses();
  chargerProduitsImprimantesHpLaser();
  chargerProduitsScanneurs();
  chargerFicheProduit();
  afficherPanier();
  initCartIconLink();
  initFormCommande();
  initToggleLivraison();
  initAdminLogin();
  initAdminDashboard();
  initAdminCommandes();

});

/* ================================================================
   8. MÉGA-MENU MOBILE — clic pour ouvrir/fermer (nav)
================================================================ */

function initMegaMenu() {

  const navItem = document.querySelector('.nav-item');
  if (!navItem) return;

  const link = navItem.querySelector('.nav-link');

  link.addEventListener('click', function (e) {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      navItem.classList.toggle('mega-open');
    }
  });
}

/* ================================================================
   9. ONGLETS SOUS-CATÉGORIES — actif au clic (ex: pc-gamer.html)
================================================================ */

function initSubcatTabs() {

  const tabs = document.querySelectorAll('.subcat-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('on'));
      this.classList.add('on');
    });
  });
}

/* ================================================================
   10. PAGE PRODUIT — galerie de miniatures + sélecteur de quantité
================================================================ */

function initProductDetail() {

  const mainImg = document.getElementById('galleryMainImg');
  const thumbs  = document.querySelectorAll('.thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg) mainImg.src = thumb.src;
    });
  });

  const qtyValue = document.getElementById('qtyValue');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus  = document.getElementById('qtyPlus');

  if (qtyValue && qtyMinus && qtyPlus) {
    let qty = 1;
    qtyMinus.addEventListener('click', () => {
      if (qty > 1) qty--;
      qtyValue.textContent = qty;
    });
    qtyPlus.addEventListener('click', () => {
      qty++;
      qtyValue.textContent = qty;
    });
  }
}

/* ================================================================
   11. CHARGEMENT DYNAMIQUE DES PRODUITS DEPUIS L'API
================================================================ */

async function chargerProduitsImprimantes() {

  const grille = document.getElementById('grilleImprimantes');
  if (!grille) return;

  try {
    const reponse = await fetch('http://localhost:3000/api/produits/categorie/Imprimantes');
    const produits = await reponse.json();

    produits.forEach(produit => {
      const carte = document.createElement('div');
      carte.className = 'product-card';

      carte.style.cursor = 'pointer';
      carte.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart')) {
          window.location.href = `product.html?id=${produit.id}`;
        }
      });
      
      carte.innerHTML = `
        <div class="product-img">
          <img src="../images/produits/imprimantes/${produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-main" />
          <img src="../images/produits/imprimantes/${produit.imageHover || produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-hover" />
        </div>
        <div class="product-info">
          <div class="product-name">${produit.nom}</div>
          <div class="product-spec">${produit.description || ''}</div>
          <div class="product-footer">
            <span class="product-price">${produit.prix.toLocaleString('fr-FR')} F CFA</span>
           <button class="add-to-cart" data-produit-id="${produit.id}"><i class="ti ti-shopping-cart" aria-hidden="true"></i> Ajouter</button>
          </div>
        </div>
      `;

      grille.appendChild(carte);
    });

  } catch (erreur) {
    console.error('Erreur lors du chargement des produits :', erreur);
  }
}

//PARTIE CHARGER PHOTOCOPIEUSES

async function chargerProduitsPhotocopieuses() {

  const grille = document.getElementById('grillePhotocopieuses');
  if (!grille) return;

  try {
    const reponse = await fetch('http://localhost:3000/api/produits/categorie/Photocopieuses');
    const produits = await reponse.json();

    produits.forEach(produit => {
      const carte = document.createElement('div');
      carte.className = 'product-card';

      carte.style.cursor = 'pointer';
      carte.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart')) {
          window.location.href = `product.html?id=${produit.id}`;
        }
      });

      carte.innerHTML = `
        <div class="product-img">
          <img src="../images/produits/photocopieuses/${produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-main" />
          <img src="../images/produits/photocopieuses/${produit.imageHover || produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-hover" />
        </div>
        <div class="product-info">
          <div class="product-name">${produit.nom}</div>
          <div class="product-spec">${produit.description || ''}</div>
          <div class="product-footer">
            <span class="product-price">${produit.prix.toLocaleString('fr-FR')} F CFA</span>
          <button class="add-to-cart" data-produit-id="${produit.id}"><i class="ti ti-shopping-cart" aria-hidden="true"></i> Ajouter</button>
          </div>
        </div>
      `;

      grille.appendChild(carte);
    });

  } catch (erreur) {
    console.error('Erreur lors du chargement des produits :', erreur);
  }
}

// chargerProduitsImprimantesHpLaser

async function chargerProduitsImprimantesHpLaser() {

  const grille = document.getElementById('grilleImprimantesHpLaser');
  if (!grille) return;

  try {
    const reponse = await fetch('http://localhost:3000/api/produits/categorie/Imprimantes HP Laser');
    const produits = await reponse.json();

    produits.forEach(produit => {
      const carte = document.createElement('div');
      carte.className = 'product-card';

      carte.style.cursor = 'pointer';
      carte.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart')) {
          window.location.href = `product.html?id=${produit.id}`;
        }
      });

      carte.innerHTML = `
        <div class="product-img">
          <img src="../images/produits/imprimantes/${produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-main" />
          <img src="../images/produits/imprimantes/${produit.imageHover || produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-hover" />
        </div>
        <div class="product-info">
          <div class="product-name">${produit.nom}</div>
          <div class="product-spec">${produit.description || ''}</div>
          <div class="product-footer">
            <span class="product-price">${produit.prix.toLocaleString('fr-FR')} F CFA</span>
         <button class="add-to-cart" data-produit-id="${produit.id}"><i class="ti ti-shopping-cart" aria-hidden="true"></i> Ajouter</button>
          </div>
        </div>
      `;

      grille.appendChild(carte);
    });

  } catch (erreur) {
    console.error('Erreur lors du chargement des produits :', erreur);
  }
}

// chargerProduitsScanneurs

async function chargerProduitsScanneurs() {

  const grille = document.getElementById('grilleScanneurs');
  if (!grille) return;

  try {
    const reponse = await fetch('http://localhost:3000/api/produits/categorie/' + encodeURIComponent('Scanneurs & lecteurs'));
    const produits = await reponse.json();

    produits.forEach(produit => {
      const carte = document.createElement('div');
      carte.className = 'product-card';

      carte.style.cursor = 'pointer';
      carte.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart')) {
          window.location.href = `product.html?id=${produit.id}`;
        }
      });

      carte.innerHTML = `
        <div class="product-img">
          <img src="../images/produits/scanneurs-lecteurs/${produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-main" />
          <img src="../images/produits/scanneurs-lecteurs/${produit.imageHover || produit.imagePrincipale}" alt="${produit.nom}" class="product-photo img-hover" />
        </div>
        <div class="product-info">
          <div class="product-name">${produit.nom}</div>
          <div class="product-spec">${produit.description || ''}</div>
          <div class="product-footer">
            <span class="product-price">${produit.prix.toLocaleString('fr-FR')} F CFA</span>
          <button class="add-to-cart" data-produit-id="${produit.id}"><i class="ti ti-shopping-cart" aria-hidden="true"></i> Ajouter</button>
          </div>
        </div>
      `;

      grille.appendChild(carte);
    });

  } catch (erreur) {
    console.error('Erreur lors du chargement des produits :', erreur);
  }
}

/* ================================================================
   12. FICHE PRODUIT DYNAMIQUE (product.html?id=X)
================================================================ */

// Table de correspondance : nom de catégorie → nom de dossier images
const dossiersImages = {
  'Imprimantes': 'imprimantes',
  'Imprimantes HP Laser': 'imprimantes',
  'Photocopieuses': 'photocopieuses',
  'Scanneurs & lecteurs': 'scanneurs-lecteurs',
};

async function chargerFicheProduit() {

  const nomEl = document.getElementById('productName');
  if (!nomEl) return; // on n'est pas sur product.html, on arrête tout de suite

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    nomEl.textContent = 'Produit introuvable';
    return;
  }

  try {
    const reponse = await fetch(`http://localhost:3000/api/produits/${id}`);

    if (!reponse.ok) {
      nomEl.textContent = 'Produit introuvable';
      return;
    }

    const produit = await reponse.json();
    const dossier = dossiersImages[produit.categorie.nom] || 'imprimantes';

    document.title = `OPEN Business World — ${produit.nom}`;
    document.getElementById('breadcrumbProduit').textContent = produit.nom;
    document.getElementById('productName').textContent = produit.nom;
    document.getElementById('productSpec').textContent = produit.description || '';
    document.getElementById('productDescription').textContent = produit.description || '';
    document.getElementById('productPrice').textContent = `${produit.prix.toLocaleString('fr-FR')} F CFA`;
    document.querySelector('.product-detail-cta').dataset.produitId = produit.id;

    const imgPrincipale = `../images/produits/${dossier}/${produit.imagePrincipale}`;
    const imgHover = `../images/produits/${dossier}/${produit.imageHover || produit.imagePrincipale}`;

    document.getElementById('galleryMainImg').src = imgPrincipale;
    document.getElementById('galleryMainImg').alt = produit.nom;
    document.getElementById('thumbImg1').src = imgPrincipale;
    document.getElementById('thumbImg1').alt = produit.nom;
    document.getElementById('thumbImg2').src = imgHover;
    document.getElementById('thumbImg2').alt = produit.nom;

  } catch (erreur) {
    console.error('Erreur lors du chargement du produit :', erreur);
    nomEl.textContent = 'Erreur de chargement';
  }
}

/* ================================================================
   13. PAGE PANIER
================================================================ */

function afficherPanier() {

  const listeEl = document.getElementById('listeArticles');
  if (!listeEl) return;

  const panierVideEl = document.getElementById('panierVide');
  const panierContenuEl = document.getElementById('panierContenu');
  const totalEl = document.getElementById('totalCommande');

  const panier = JSON.parse(localStorage.getItem('panierOBW')) || [];

  if (panier.length === 0) {
    panierVideEl.style.display = 'block';
    panierContenuEl.style.display = 'none';
    return;
  }

  panierVideEl.style.display = 'none';
  panierContenuEl.style.display = 'grid';

  listeEl.innerHTML = '';
  let total = 0;

  panier.forEach((item, index) => {
    total += item.prix * item.quantite;

    const ligne = document.createElement('div');
    ligne.style.cssText = 'display:flex; gap:12px; align-items:center; padding:14px 0; border-bottom:1px solid #eee;';

    ligne.innerHTML = `
      <img src="${item.image}" alt="${item.nom}" style="width:64px; height:64px; object-fit:contain; border-radius:8px; background:#f5f5f5;" />
      <div style="flex:1;">
        <div style="font-weight:600; font-size:14px;">${item.nom}</div>
        <div style="color: var(--color-primary); font-weight:700; font-size:14px;">${item.prix.toLocaleString('fr-FR')} F CFA</div>
      </div>
      <div class="qty-selector" style="transform:scale(0.85);">
        <button class="qty-btn" data-action="moins" data-index="${index}">−</button>
        <span class="qty-value">${item.quantite}</span>
        <button class="qty-btn" data-action="plus" data-index="${index}">+</button>
      </div>
      <button data-action="supprimer" data-index="${index}" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:18px;">
        <i class="ti ti-trash"></i>
      </button>
    `;

    listeEl.appendChild(ligne);
  });

  totalEl.textContent = `${total.toLocaleString('fr-FR')} F CFA`;
}

document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const index = parseInt(btn.dataset.index);
  if (isNaN(index)) return;

  let panier = JSON.parse(localStorage.getItem('panierOBW')) || [];

  if (action === 'plus') {
    panier[index].quantite += 1;
  } else if (action === 'moins') {
    panier[index].quantite -= 1;
    if (panier[index].quantite <= 0) panier.splice(index, 1);
  } else if (action === 'supprimer') {
    panier.splice(index, 1);
  } else {
    return;
  }

  localStorage.setItem('panierOBW', JSON.stringify(panier));
  mettreAJourBadgePanier();
  afficherPanier();
});

function initToggleLivraison() {
  const btnExpedier = document.getElementById('btnExpedier');
  const btnRetrait = document.getElementById('btnRetrait');
  const blocAdresse = document.getElementById('blocAdresse');
  const blocRetrait = document.getElementById('blocRetrait');
  const inputType = document.getElementById('cmd-type-livraison');
  const inputAdresse = document.getElementById('cmd-adresse');

  if (!btnExpedier) return;

  function activerExpedier() {
    inputType.value = 'Expédier';
    blocAdresse.style.display = 'block';
    blocRetrait.style.display = 'none';
    inputAdresse.required = true;

    btnExpedier.style.background = 'var(--color-primary)';
    btnExpedier.style.color = '#fff';
    btnRetrait.style.background = '';
    btnRetrait.style.color = '';
  }

  function activerRetrait() {
    inputType.value = 'Retrait';
    blocAdresse.style.display = 'none';
    blocRetrait.style.display = 'block';
    inputAdresse.required = false;

    btnRetrait.style.background = 'var(--color-primary)';
    btnRetrait.style.color = '#fff';
    btnExpedier.style.background = '';
    btnExpedier.style.color = '';
  }

  btnExpedier.addEventListener('click', activerExpedier);
  btnRetrait.addEventListener('click', activerRetrait);

  activerExpedier(); // état initial par défaut
}

function afficherErreurChamp(champId, message) {
  const champ = document.getElementById(champId);
  if (!champ) return;

  champ.style.borderColor = '#EF4444';

  let erreurEl = champ.parentElement.querySelector('.champ-erreur');
  if (!erreurEl) {
    erreurEl = document.createElement('div');
    erreurEl.className = 'champ-erreur';
    erreurEl.style.cssText = 'color:#EF4444; font-size:12px; margin-top:4px;';
    champ.insertAdjacentElement('afterend', erreurEl);
  }
  erreurEl.textContent = message;
}

function effacerErreurChamp(champId) {
  const champ = document.getElementById(champId);
  if (!champ) return;

  champ.style.borderColor = '';

  const erreurEl = champ.parentElement.querySelector('.champ-erreur');
  if (erreurEl) erreurEl.remove();
}

function initFormCommande() {
  const form = document.getElementById('formCommande');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const panier = JSON.parse(localStorage.getItem('panierOBW')) || [];

    if (panier.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

        effacerErreurChamp('cmd-telephone');

    const telephone = document.getElementById('cmd-telephone').value.trim();
    const regexTelephone = /^(\+225[0-9]{10}|0[0-9]{9})$/;

    if (!regexTelephone.test(telephone)) {
      afficherErreurChamp('cmd-telephone', 'Numéro invalide. Exemple : 0101020304 ou +2250101020304');
      return;
    }

        effacerErreurChamp('cmd-nom');

    const nom = document.getElementById('cmd-nom').value.trim();
    const mots = nom.split(/\s+/).filter(mot => mot.length > 0);
    const regexMot = /^[a-zA-ZÀ-ÿ'-]{2,}$/;

    const nomValide = mots.length >= 2 && mots.every(mot => regexMot.test(mot));

    if (!nomValide) {
      afficherErreurChamp('cmd-nom', 'Merci de saisir votre prénom et nom complets (ex: Paul Martin).');
      return;
    }

    const articlesInvalides = panier.some(item => !item.produitId);
    if (articlesInvalides) {
      alert('Un ou plusieurs articles ne peuvent pas être commandés pour le moment. Merci de les retirer et de les rajouter depuis une fiche produit.');
      return;
    }

        const donnees = {
      nom: document.getElementById('cmd-nom').value,
      telephone: document.getElementById('cmd-telephone').value,
      email: document.getElementById('cmd-email').value,
      typeLivraison: document.getElementById('cmd-type-livraison').value,
      adresse: document.getElementById('cmd-adresse').value,
      ville: document.getElementById('cmd-ville').value,
      modePaiement: document.getElementById('cmd-paiement').value,
      articles: panier.map(item => ({
        produitId: parseInt(item.produitId),
        quantite: item.quantite,
        prix: item.prix,
      })),
    };

    const btnSubmit = form.querySelector('.contact-submit-btn');
    const original = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Envoi en cours...';

    try {
      const reponse = await fetch('http://localhost:3000/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });

      if (!reponse.ok) throw new Error('Erreur serveur');

      const commande = await reponse.json();

         localStorage.removeItem('panierOBW');
      mettreAJourBadgePanier();

            const lignesHtml = commande.lignes.map(l => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:14px;">
          <span>${l.quantite} × ${l.produit.nom}</span>
          <span>${(l.prixUnitaire * l.quantite).toLocaleString('fr-FR')} F CFA</span>
        </div>
      `).join('');

      const adresseHtml = commande.typeLivraison === 'Retrait'
        ? `<strong>Point de retrait :</strong><br />Plateau, Immeuble Mali, Abidjan`
        : `<strong>Adresse de livraison :</strong><br />${commande.adresse}${commande.ville ? ', ' + commande.ville : ''}`;

      document.getElementById('panierContenu').innerHTML = `
        <div class="contact-info-card" style="grid-column: 1 / -1; max-width: 600px; margin: 0 auto;">

          <div style="text-align:center; margin-bottom:20px;">
            <i class="ti ti-circle-check" style="font-size:48px; color:#22C55E;"></i>
            <h2 style="margin:8px 0 4px;">Merci, ${commande.nom} !</h2>
            <p style="color:#666;">Confirmation n° <strong>${commande.codeConfirmation}</strong></p>
          </div>

          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px; margin-bottom:20px;">
            <strong>Votre commande est confirmée</strong><br />
            <span style="font-size:14px; color:#555;">Nous allons vous contacter au ${commande.telephone} pour confirmer les détails et organiser ${commande.typeLivraison === 'Retrait' ? 'le retrait' : 'la livraison'}.</span>
          </div>

          <h3 class="contact-card-title">Détails de la commande</h3>

          <div style="margin-bottom:16px; font-size:14px;">
            ${adresseHtml}
          </div>

          <div style="margin-bottom:16px; font-size:14px;">
            <strong>Mode de paiement :</strong><br />${commande.modePaiement}
          </div>

          <div style="margin-bottom:8px; font-size:14px;">
            <strong>Articles :</strong>
          </div>
          ${lignesHtml}

          <div style="display:flex; justify-content:space-between; padding:12px 0; font-size:18px; font-weight:700; color:var(--color-primary);">
            <span>Total</span>
            <span>${commande.total.toLocaleString('fr-FR')} F CFA</span>
          </div>

          <a href="../boutique.html" class="contact-submit-btn" style="display:block; text-align:center; text-decoration:none; margin-top:16px;">
            Retour à la boutique
          </a>
        </div>
      `;

    } catch (erreur) {
      console.error(erreur);
      alert('Une erreur est survenue. Merci de réessayer ou de nous contacter sur WhatsApp.');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = original;
    }
  });
}

function initAdminLogin() {
  const form = document.getElementById('formLogin');
  if (!form) return;

  const errorEl = document.getElementById('loginError');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    errorEl.style.display = 'none';

    const email = document.getElementById('admin-email').value.trim();
    const motDePasse = document.getElementById('admin-password').value;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Connexion...';

    try {
      const reponse = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data = await reponse.json();

      if (!reponse.ok) {
        errorEl.textContent = data.erreur || 'Erreur de connexion';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = original;
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminNom', data.nom);

      window.location.href = 'admin-dashboard.html';

    } catch (erreur) {
      console.error(erreur);
      errorEl.textContent = 'Erreur de connexion au serveur.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
}

function initAdminDashboard() {
  const tableau = document.getElementById('tableauProduits');
  if (!tableau) return;

  const token = localStorage.getItem('adminToken');

  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  document.getElementById('adminNomAffiche').textContent = localStorage.getItem('adminNom') || '';

  document.getElementById('btnDeconnexion').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminNom');
    window.location.href = 'admin-login.html';
  });

  async function chargerProduits() {
    try {
      const reponse = await fetch('http://localhost:3000/api/admin/produits', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (reponse.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
        return;
      }

      const produits = await reponse.json();

      tableau.innerHTML = '';

      produits.forEach(p => {
        const tr = document.createElement('tr');
        tr.style.borderTop = '1px solid #eee';
        tr.innerHTML = `
          <td style="padding:12px 16px; font-size:14px;">${p.id}</td>
          <td style="padding:12px 16px; font-size:14px;">${p.nom}</td>
          <td style="padding:12px 16px; font-size:14px;">${p.categorie.nom}</td>
          <td style="padding:12px 16px; font-size:14px;">${p.prix.toLocaleString('fr-FR')} F CFA</td>
          <td style="padding:12px 16px; display:flex; gap:6px;">
            <button class="qty-btn btn-modifier" data-id="${p.id}" data-nom="${p.nom}" data-description="${p.description || ''}" data-prix="${p.prix}" data-image="${p.imagePrincipale}" data-image-hover="${p.imageHover || ''}" style="padding:6px 12px; font-size:13px;">
              <i class="ti ti-pencil" aria-hidden="true"></i> Modifier
            </button>
            <button class="qty-btn btn-toggle" data-id="${p.id}" style="padding:6px 12px; font-size:13px; ${p.actif ? '' : 'background:#FEE2E2; border-color:#FCA5A5;'}">
              <i class="ti ti-${p.actif ? 'eye-off' : 'eye'}" aria-hidden="true"></i> ${p.actif ? 'Desactiver' : 'Reactiver'}
            </button>
          </td>
        `;
        tableau.appendChild(tr);
      });

    } catch (erreur) {
      console.error(erreur);
    }
  }

  chargerProduits();

  const modale = document.getElementById('modaleEdition');

  tableau.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-modifier');
    if (!btn) return;

    document.getElementById('edit-id').value = btn.dataset.id;
    document.getElementById('edit-nom').value = btn.dataset.nom;
    document.getElementById('edit-description').value = btn.dataset.description;
    document.getElementById('edit-prix').value = btn.dataset.prix;
    document.getElementById('edit-image').value = btn.dataset.image;
    document.getElementById('edit-image-hover').value = btn.dataset.imageHover;

    modale.style.display = 'flex';
  });

  tableau.addEventListener('click', async (e) => {
    const btnToggle = e.target.closest('.btn-toggle');
    if (!btnToggle) return;

    const id = btnToggle.dataset.id;

    try {
      const reponse = await fetch(`http://localhost:3000/api/admin/produits/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!reponse.ok) throw new Error('Erreur');

      chargerProduits();

    } catch (erreur) {
      console.error(erreur);
      alert('Erreur lors du changement de statut.');
    }
  });

  document.getElementById('btnAnnulerEdition').addEventListener('click', () => {
    modale.style.display = 'none';
  });

  document.getElementById('btnSauvegarderEdition').addEventListener('click', async () => {
    const id = document.getElementById('edit-id').value;
    const nom = document.getElementById('edit-nom').value;
    const description = document.getElementById('edit-description').value;
    const prix = parseInt(document.getElementById('edit-prix').value);
    const imagePrincipale = document.getElementById('edit-image').value;
    const imageHover = document.getElementById('edit-image-hover').value;

    try {
      const reponse = await fetch(`http://localhost:3000/api/admin/produits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nom, description, prix, imagePrincipale, imageHover }),
      });

      if (!reponse.ok) throw new Error('Erreur');

      modale.style.display = 'none';
      chargerProduits();

    } catch (erreur) {
      console.error(erreur);
      alert('Erreur lors de la sauvegarde.');
    }
  });

  async function chargerCategories() {
    try {
      const reponse = await fetch('http://localhost:3000/api/admin/categories', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const categories = await reponse.json();

      const select = document.getElementById('add-categorie');
      select.innerHTML = categories.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');

    } catch (erreur) {
      console.error(erreur);
    }
  }

  const modaleAjout = document.getElementById('modaleAjout');

  document.getElementById('btnAjouterProduit').addEventListener('click', () => {
    document.getElementById('add-nom').value = '';
    document.getElementById('add-description').value = '';
    document.getElementById('add-prix').value = '';
    document.getElementById('add-image').value = '';
    document.getElementById('add-image-hover').value = '';

    chargerCategories();
    modaleAjout.style.display = 'flex';
  });

  document.getElementById('btnAnnulerAjout').addEventListener('click', () => {
    modaleAjout.style.display = 'none';
  });

  document.getElementById('btnConfirmerAjout').addEventListener('click', async () => {
    const nom = document.getElementById('add-nom').value.trim();
    const description = document.getElementById('add-description').value.trim();
    const prix = document.getElementById('add-prix').value;
    const categorieId = document.getElementById('add-categorie').value;
    const imagePrincipale = document.getElementById('add-image').value.trim();
    const imageHover = document.getElementById('add-image-hover').value.trim();

    if (!nom || !prix || !imagePrincipale || !categorieId) {
      alert('Merci de remplir au moins le nom, le prix, la categorie et l\'image principale.');
      return;
    }

    try {
      const reponse = await fetch('http://localhost:3000/api/admin/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nom, description, prix, categorieId, imagePrincipale, imageHover }),
      });

      if (!reponse.ok) throw new Error('Erreur');

      modaleAjout.style.display = 'none';
      chargerProduits();

    } catch (erreur) {
      console.error(erreur);
      alert('Erreur lors de la creation du produit.');
    }
  });
}



function initAdminCommandes() {
  const listeCommandes = document.getElementById('listeCommandes');
  if (!listeCommandes) return;

  const token = localStorage.getItem('adminToken');

  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  document.getElementById('adminNomAffiche').textContent = localStorage.getItem('adminNom') || '';

  document.getElementById('btnDeconnexion').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminNom');
    window.location.href = 'admin-login.html';
  });

  async function chargerCommandes() {
    try {
      const reponse = await fetch('http://localhost:3000/api/admin/commandes', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (reponse.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
        return;
      }

      const commandes = await reponse.json();

      listeCommandes.innerHTML = '';

      if (commandes.length === 0) {
        listeCommandes.innerHTML = '<p style="color:#999;">Aucune commande pour le moment.</p>';
        return;
      }

      commandes.forEach(c => {
        const articlesTexte = c.lignes.map(l => `${l.quantite}× ${l.produit.nom}`).join(', ');
        const date = new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const carte = document.createElement('div');
        carte.style.cssText = 'background:#fff; border-radius:8px; padding:16px; box-shadow:0 1px 4px rgba(0,0,0,0.06);';
        carte.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
            <div>
              <strong>${c.nom}</strong> — ${c.telephone}
              <div style="font-size:12px; color:#999;">${date} · Code: ${c.codeConfirmation}</div>
            </div>
            <span style="background:#EFF6FF; color:var(--color-primary); padding:4px 10px; border-radius:12px; font-size:12px; font-weight:600;">${c.typeLivraison}</span>
          </div>
          <div style="font-size:14px; color:#555; margin-bottom:8px;">${articlesTexte}</div>
          <div style="font-weight:700; color:var(--color-primary);">${c.total.toLocaleString('fr-FR')} F CFA</div>
        `;
        listeCommandes.appendChild(carte);
      });

    } catch (erreur) {
      console.error(erreur);
    }
  }

  async function chargerMessages() {
    const listeMessages = document.getElementById('listeMessages');

    try {
      const reponse = await fetch('http://localhost:3000/api/admin/messages', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const messages = await reponse.json();

      listeMessages.innerHTML = '';

      if (messages.length === 0) {
        listeMessages.innerHTML = '<p style="color:#999;">Aucun message pour le moment.</p>';
        return;
      }

      messages.forEach(m => {
        const date = new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const carte = document.createElement('div');
        carte.style.cssText = 'background:#fff; border-radius:8px; padding:16px; box-shadow:0 1px 4px rgba(0,0,0,0.06);';
        carte.innerHTML = `
          <div style="margin-bottom:8px;">
            <strong>${m.nom}</strong> — ${m.telephone} · ${m.email}
            <div style="font-size:12px; color:#999;">${date}</div>
          </div>
          <div style="font-size:14px; color:#555;">${m.message}</div>
        `;
        listeMessages.appendChild(carte);
      });

    } catch (erreur) {
      console.error(erreur);
    }
  }

  chargerCommandes();
  chargerMessages();
}