/* ─── Nav scroll ─── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Hamburger ─── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
});
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

/* ─── Custom Cursor ─── */
const cursorRing = document.getElementById('cursorRing');
const cursorDot  = document.getElementById('cursorDot');
const cursorCut  = document.getElementById('cursorCut');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
  cursorCut.style.left = mouseX + 'px';
  cursorCut.style.top  = mouseY + 'px';
});

// Smooth ring follow
(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

// Hover states
const hoverEls = document.querySelectorAll('a, button, .work-card');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

// Razor tool switches cursor to cut mode
const toolRazor = document.getElementById('toolRazor');
let razorActive = false;
toolRazor.addEventListener('click', () => {
  razorActive = !razorActive;
  toolRazor.classList.toggle('active', razorActive);
  document.getElementById('toolSelect').classList.toggle('active', !razorActive);
  cursorRing.classList.toggle('cutting', razorActive);
  cursorDot.classList.toggle('cutting', razorActive);
  cursorCut.classList.toggle('cutting', razorActive);
});

/* ─── Timecode HUD ─── */
const tcDisplay = document.getElementById('tcDisplay');
const startTime = Date.now();
const FPS = 24;

function updateTimecode() {
  const elapsed = (Date.now() - startTime) / 1000;
  const h  = Math.floor(elapsed / 3600);
  const m  = Math.floor((elapsed % 3600) / 60);
  const s  = Math.floor(elapsed % 60);
  const f  = Math.floor((elapsed % 1) * FPS);
  tcDisplay.textContent =
    String(h).padStart(2,'0') + ':' +
    String(m).padStart(2,'0') + ':' +
    String(s).padStart(2,'0') + ':' +
    String(f).padStart(2,'0');
  requestAnimationFrame(updateTimecode);
}
updateTimecode();

/* ─── Timeline Playhead ─── */
const tlPlayhead = document.getElementById('tlPlayhead');
const tlTimecode = document.getElementById('tlTimecode');
let   tlPos = 0;
let   tlDir = 1;
const tlSpeed = 0.012; // % per frame

(function animatePlayhead() {
  tlPos += tlSpeed * tlDir;
  if (tlPos >= 100) { tlPos = 100; tlDir = -1; }
  if (tlPos <= 0)   { tlPos = 0;   tlDir = 1;  }
  tlPlayhead.style.left = tlPos + '%';

  // Convert position to fake timecode
  const totalSec = (tlPos / 100) * 180; // max 3 min
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const f = Math.floor((totalSec % 1) * FPS);
  tlTimecode.textContent =
    '00:' + String(m).padStart(2,'0') + ':' +
    String(s).padStart(2,'0') + ':' +
    String(f).padStart(2,'0');

  requestAnimationFrame(animatePlayhead);
})();

// Click to scrub timeline
const tlTrackArea = document.querySelector('.tl-track-area');
if (tlTrackArea) {
  tlTrackArea.addEventListener('click', e => {
    const rect = tlTrackArea.getBoundingClientRect();
    tlPos = ((e.clientX - rect.left) / rect.width) * 100;
    tlDir = 1;
  });
}

/* ─── Edit Toolbar — tool select ─── */
document.querySelectorAll('.tool-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item === toolRazor) return; // handled separately
    document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
    item.classList.add('active');
    // deactivate razor
    razorActive = false;
    cursorRing.classList.remove('cutting');
    cursorDot.classList.remove('cutting');
    cursorCut.classList.remove('cutting');
  });
});

/* ─── Filter + Cut Flash ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');
const cutFlash   = document.getElementById('cutFlash');

function triggerCutFlash() {
  cutFlash.classList.remove('flash');
  void cutFlash.offsetWidth; // reflow
  cutFlash.classList.add('flash');
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    triggerCutFlash();

    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        requestAnimationFrame(() => card.classList.remove('fade-out'));
      } else {
        card.classList.add('fade-out');
        setTimeout(() => card.classList.add('hidden'), 300);
      }
    });
  });
});

/* ─── Scroll reveal ─── */
const revealEls = document.querySelectorAll(
  '.hero-eyebrow, .hero-title, .hero-sub, .btn-primary, ' +
  '.section-header, .filter-bar, .work-card, ' +
  '.about-text, .stat-item, ' +
  '.contact-inner'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

workCards.forEach((card, i) => {
  card.style.transitionDelay = `${(i % 3) * 80}ms`;
});

/* ─── Lightbox ─── */
const lightbox         = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxContent  = document.getElementById('lightboxContent');
const lightboxCaption  = document.getElementById('lightboxCaption');

function buildEmbed(card) {
  const type = card.dataset.mediaType;
  const id   = card.dataset.mediaId;
  const hue  = card.querySelector('[style*="--hue"]')?.style.getPropertyValue('--hue') || '0';

  if (type === 'youtube' && id && !id.startsWith('YOUTUBE_ID')) {
    return `<div class="lb-iframe-wrap">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>`;
  }
  if (type === 'gdrive' && id && !id.startsWith('GDRIVE_FILE_ID')) {
    return `<div class="lb-iframe-wrap">
      <iframe
        src="https://drive.google.com/file/d/${id}/preview"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>`;
  }
  // Fallback placeholder
  const badge = card.querySelector('.card-type-badge')?.textContent?.trim() || '';
  return `<div class="lb-placeholder" style="--hue:${hue}">
    <div class="lb-text">
      <p class="lb-badge">${badge}</p>
      <p class="lb-hint">ใส่ YouTube ID หรือ Google Drive ID<br/>ในแอตทริบิวต์ data-media-id</p>
    </div>
  </div>`;
}

function openLightbox(card) {
  const title = card.dataset.title || card.querySelector('.card-title')?.textContent || '';
  const desc  = card.dataset.desc  || card.querySelector('.card-desc')?.textContent  || '';

  lightboxContent.innerHTML = buildEmbed(card);
  lightboxCaption.innerHTML =
    `<strong style="color:var(--accent)">${title}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;<span style="color:var(--ink-muted)">${desc}</span>`;

  lightbox.classList.add('open');
  lightboxBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

workCards.forEach(card => {
  card.addEventListener('click', () => openLightbox(card));
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ─── Client logos infinite scroll (duplicate items) ─── */
const clientsTrack = document.getElementById('clientsTrack');
if (clientsTrack) {
  clientsTrack.innerHTML += clientsTrack.innerHTML; // duplicate for seamless loop
}

/* ─── Smooth anchor offset ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
