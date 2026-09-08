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

function initCartButtons() {

  const cartBtns = document.querySelectorAll('.add-to-cart');

  cartBtns.forEach(btn => {
    btn.addEventListener('click', function () {

      const original = this.innerHTML;

      this.innerHTML         = '<i class="ti ti-check" aria-hidden="true"></i> Ajouté !';
      this.style.background  = '#22C55E';
      this.style.color       = '#FFF';
      this.style.borderColor = '#22C55E';

      setTimeout(() => {
        this.innerHTML         = original;
        this.style.background  = '';
        this.style.color       = '';
        this.style.borderColor = '';
      }, 1500);
    });
  });
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const original = btn.innerHTML;

    btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Message envoyé !';
    btn.style.background = '#22C55E';

    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      form.reset();
    }, 2200);
  });
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