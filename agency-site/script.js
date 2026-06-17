// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navCta = document.querySelector('.nav-cta');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navCta.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile nav after clicking a link
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navCta.classList.remove('open');
  });
});

// Header shadow on scroll
const siteHeader = document.querySelector('.site-header');
const onScroll = () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 8);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Scroll-reveal animations
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// 3D tilt effect — hero mockup
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tiltStage = document.getElementById('tiltStage');
const tiltCard = document.getElementById('tiltCard');
if (tiltStage && tiltCard && !reduceMotion) {
  tiltStage.addEventListener('mousemove', (e) => {
    const rect = tiltStage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * 18;
    const rotateX = -y * 18 + 8; // base tilt of 8deg
    tiltCard.style.transform = `rotate3d(${-y}, ${x}, 0, ${Math.hypot(rotateX, rotateY)}deg)`;
  });
  tiltStage.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'rotate3d(1, -1, 0, 8deg)';
  });
}

// 3D tilt effect — pricing cards
if (!reduceMotion) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


// Animated stat counters
const counterEls = document.querySelectorAll('[data-count-to]');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.countTo);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';

      if (reduceMotion) {
        el.textContent = `${prefix}${target}${suffix}`;
      } else {
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          el.textContent = `${prefix}${value}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counterEls.forEach((el) => counterObserver.observe(el));

// Capability tags stagger-in animation
const capRow = document.querySelector('.capability-row');
if (capRow) {
  const capObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          capObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  capObserver.observe(capRow);
}

// Hide Calendly skeleton once the widget is ready, with a 5s fallback
function hideCalskel() {
  const skel = document.getElementById('calendlySkeleton');
  if (skel) skel.classList.add('hidden');
}
const calFallback = setTimeout(hideCalskel, 5000);
window.addEventListener('message', (e) => {
  let evt;
  try { evt = typeof e.data === 'string' ? JSON.parse(e.data).event : e.data?.event; } catch (_) {}
  if (evt === 'calendly.event_type_viewed' || evt === 'calendly.date_and_time_selected') {
    clearTimeout(calFallback);
    hideCalskel();
  }
});

// Scroll parallax for the hero visual
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual && !reduceMotion) {
  window.addEventListener('scroll', () => {
    heroVisual.style.transform = `translateY(${window.scrollY * 0.12}px)`;
  }, { passive: true });
}
