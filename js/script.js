const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const whatsappForm = document.querySelector('#whatsapp-form');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scrollTicking = false;

function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 18);
  scrollTicking = false;
}

function requestHeaderUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateHeader);
}

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.classList.remove('active');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = !navigation.classList.contains('open');
    navigation.classList.toggle('open', open);
    menuButton.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

navLinks.forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
window.addEventListener('resize', requestHeaderUpdate, { passive: true });
updateHeader();

// Navegación interna con distancia correcta respecto al encabezado fijo.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    if (!selector || selector === '#') return;

    const target = document.querySelector(selector);
    if (!target) return;

    event.preventDefault();
    closeMenu();

    const headerHeight = header?.offsetHeight ?? 0;
    const destination = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - headerHeight - 12
    );

    window.scrollTo({
      top: destination,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });

    window.history.replaceState(null, '', selector);
  });
});

const revealElements = [...document.querySelectorAll('.reveal')];

// Pequeños retrasos escalonados para que las tarjetas entren de forma natural.
document.querySelectorAll('.services-grid .reveal, .steps .reveal').forEach((element, index) => {
  element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 70}ms`);
});

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible', 'motion-complete'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');
      entry.target.addEventListener('transitionend', () => {
        entry.target.classList.add('motion-complete');
      }, { once: true });
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -6% 0px'
  });

  revealElements.forEach((element) => revealObserver.observe(element));
}

// Detiene animaciones continuas cuando no están visibles para evitar tirones al desplazarse.
if ('IntersectionObserver' in window && !reduceMotion) {
  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('motion-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.01 });

  document.querySelectorAll('.hero, .trust-strip').forEach((element) => motionObserver.observe(element));
}

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

if (whatsappForm) {
  whatsappForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nombre = document.querySelector('#nombre')?.value.trim() ?? '';
    const equipo = document.querySelector('#equipo')?.value ?? '';
    const servicio = document.querySelector('#servicio')?.value ?? '';
    const problema = document.querySelector('#problema')?.value.trim() ?? '';

    const message = [
      'Hola TEC Computer, deseo solicitar un presupuesto.',
      '',
      `Nombre: ${nombre}`,
      `Equipo: ${equipo}`,
      `Servicio: ${servicio}`,
      `Problema: ${problema}`
    ].join('\n');

    const whatsappUrl = `https://wa.me/593998062413?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}
