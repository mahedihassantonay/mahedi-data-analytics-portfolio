const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      const shouldShow = filter === 'all' || categories.includes(filter);
      card.classList.toggle('hidden', !shouldShow);
    });
  });
});

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.querySelector('.site-header');
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  siteHeader.classList.toggle('scrolled', scrollTop > 20);

  let activeId = '';
  sections.forEach(section => {
    const top = section.offsetTop - 160;
    if (scrollTop >= top) activeId = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

document.getElementById('currentYear').textContent = new Date().getFullYear();


// Auto-changing project screenshot carousels.
// Add/remove .project-slide blocks in HTML; no JS changes are needed.
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('.project-slide')];
  if (slides.length < 2) return;

  const counter = carousel.querySelector('.carousel-counter');
  const interval = Number(carousel.dataset.interval || 3600);
  let index = 0;
  let timer;
  let paused = false;

  carousel.style.setProperty('--carousel-duration', `${interval}ms`);

  const update = () => {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    carousel.classList.remove('carousel-running');
    void carousel.offsetWidth;
    if (!paused) carousel.classList.add('carousel-running');
  };

  const start = () => {
    clearInterval(timer);
    if (paused) return;
    update();
    timer = setInterval(() => {
      index = (index + 1) % slides.length;
      update();
    }, interval);
  };

  carousel.addEventListener('mouseenter', () => {
    paused = true;
    clearInterval(timer);
    carousel.classList.remove('carousel-running');
  });

  carousel.addEventListener('mouseleave', () => {
    paused = false;
    start();
  });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else clearInterval(timer);
  }, { threshold: 0.15 });
  visibilityObserver.observe(carousel);
  update();
});

// Reusable premium project details modal.
const projectModal = document.getElementById('projectModal');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalBody = document.getElementById('projectModalBody');
let lastModalTrigger = null;

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove('open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastModalTrigger) lastModalTrigger.focus();
}

document.querySelectorAll('[data-project-modal]').forEach((button) => {
  button.addEventListener('click', () => {
    lastModalTrigger = button;
    projectModalTitle.textContent = button.dataset.title || 'Project details';
    const template = document.getElementById(button.dataset.template);
    projectModalBody.innerHTML = template ? template.innerHTML : '<p>Add project details here.</p>';
    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    projectModal.querySelector('.modal-close').focus();
  });
});

document.querySelectorAll('[data-modal-close]').forEach((element) => element.addEventListener('click', closeProjectModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && projectModal?.classList.contains('open')) closeProjectModal();
});
