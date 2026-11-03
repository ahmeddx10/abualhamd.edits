/* ═══════════════════════════════════
   MAIN.JS — Portfolio interactions
   ═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── LOADER ──────────────────────────────────
  // Hide once the page has loaded (min 400ms so it doesn't flash), max 1.5s
  const loader = document.getElementById('loader');
  const loaderStart = Date.now();
  let loaderDone = false;
  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    loader.classList.add('hidden');
    document.body.classList.add('loaded');
    animateHeroIn();
  }
  window.addEventListener('load', () => setTimeout(hideLoader, Math.max(0, 400 - (Date.now() - loaderStart))));
  setTimeout(hideLoader, 1500);

  const getLang = () => document.documentElement.getAttribute('data-lang') || 'en';
  const t = key => (translations[getLang()] || translations.en)[key] || translations.en[key];
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── THEME ────────────────────────────────────
  document.documentElement.setAttribute('data-theme', 'dark');

  // ── NAV SCROLL ──────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── HAMBURGER ───────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // ── HERO ANIMATION ──────────────────────────
  function animateHeroIn() {
    const lines = document.querySelectorAll('.line-clip');
    lines.forEach((l, i) => {
      l.style.animationDelay = `${0.1 + i * 0.15}s`;
      l.classList.add('animate-in');
    });
    document.querySelector('.hero-tag')?.classList.add('fade-in');
    document.querySelector('.hero-sub')?.classList.add('fade-in');
    document.querySelector('.hero-btns')?.classList.add('fade-in');
    document.querySelector('.hero-stats')?.classList.add('fade-in');
    document.querySelector('.hero-play')?.classList.add('slide-in-right');
    setTimeout(startCounters, 800);
  }

  // ── COUNTERS ────────────────────────────────
  function startCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'));
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 35);
    });
  }

  // ── PROJECTS GRID ───────────────────────────
  const WORK_CATS = { reels:'filter_reels', podcast:'filter_podcast', youtube:'filter_yt', story:'filter_story', color:'filter_color', showreel:'reel_title' };
  window.WORK_CATS = WORK_CATS;
  let currentFilter = 'all';
  function renderProjects(filter = currentFilter) {
    currentFilter = filter;
    const grid = document.getElementById('projectsGrid');
    const lang = getLang();
    const filtered = filter === 'all'
      ? portfolioData.projects
      : portfolioData.projects.filter(p => p.cat === filter);
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    grid.innerHTML = filtered.map(p => {
      const c = p[lang] || p.en;
      const base = `assets/work/${p.slug}`;
      return `
      <button class="work-card${p.v ? ' is-vertical' : ''}" data-slug="${p.slug}" aria-label="${c.title} — ${c.client}">
        <div class="work-media">
          <img src="${base}/poster.jpg" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'"/>
          <video muted loop playsinline preload="none" data-src="${base}/preview.mp4"></video>
          <span class="work-chip mono">${t(WORK_CATS[p.cat]).toUpperCase()}</span>
          <span class="work-dur mono">${fmt(p.dur)}</span>
          <span class="work-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
          <div class="work-info">
            <h3>${c.title}</h3>
            <p>${c.client}</p>
          </div>
        </div>
      </button>
    `;
    }).join('');

    grid.querySelectorAll('.work-card').forEach((card, i) => {
      card.style.animationDelay = `${Math.min(i, 8) * 0.06}s`;
      card.classList.add('card-enter');
      card.addEventListener('click', () => {
        window.VP && window.VP.open(card.dataset.slug, filtered.map(p => p.slug));
      });
    });
    bindPreviews(grid);
  }

  // ── HOVER PREVIEWS ──────────────────────────
  // Desktop: play the short muted loop on hover. Touch: play whichever card is centered on screen.
  const canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  function playPreview(card) {
    const v = card.querySelector('video');
    if (!v.src) v.src = v.dataset.src;
    v.play().then(() => card.classList.add('previewing')).catch(() => {});
  }
  function stopPreview(card) {
    const v = card.querySelector('video');
    card.classList.remove('previewing');
    if (v.src) { v.pause(); v.currentTime = 0; }
  }
  let touchObserver;
  function bindPreviews(grid) {
    const cards = grid.querySelectorAll('.work-card');
    if (canHover) {
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => playPreview(card));
        card.addEventListener('mouseleave', () => stopPreview(card));
      });
      return;
    }
    if (touchObserver) touchObserver.disconnect();
    touchObserver = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? playPreview(e.target) : stopPreview(e.target));
    }, { rootMargin: '-35% 0px -35% 0px' });
    cards.forEach(card => touchObserver.observe(card));
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProjects(tab.getAttribute('data-filter'));
    });
  });

  // ── HERO BACKGROUND LOOP ────────────────────
  // Muted 18s cut of the showreel. Skipped for reduced-motion / data-saver visitors (poster stays).
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    const c = navigator.connection;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches || (c && c.saveData);
    if (!calm) {
      heroVideo.src = heroVideo.dataset.src;
      heroVideo.play().catch(() => {});
      // Pause it while it's off-screen or the player is open
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && document.getElementById('vp').hidden) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      }).observe(heroVideo);
      document.addEventListener('vp:close', () => heroVideo.play().catch(() => {}));
      document.addEventListener('vp:open', () => heroVideo.pause());
    }
  }

  // ── SERVICES + PROCESS (re-rendered on language change) ──
  function renderServices() {
    const sg = document.getElementById('servicesGrid');
    if (!sg) return;
    const lang = getLang();
    sg.innerHTML = portfolioData.services.map((s, i) => {
      const c = s[lang] || s.en;
      return `
      <div class="service-card">
        <div class="service-icon">${String(i + 1).padStart(2, '0')}</div>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
      </div>
    `;
    }).join('');
  }

  function renderProcess() {
    const pt = document.getElementById('processTimeline');
    if (!pt) return;
    const lang = getLang();
    pt.innerHTML = portfolioData.process.map((p, i) => {
      const c = p[lang] || p.en;
      return `
      <div class="process-step" style="animation-delay:${i*0.1}s">
        <div class="ps-num mono">${p.step}</div>
        <div class="ps-connector ${i < portfolioData.process.length-1 ? 'has-line' : ''}"></div>
        <div class="ps-content">
          <h4>${c.title}</h4>
          <p>${c.desc}</p>
        </div>
      </div>
    `;
    }).join('');
  }

  // ── PRICING ─────────────────────────────────
  const pg = document.getElementById('pricingGrid');
  if (pg) {
    pg.innerHTML = portfolioData.pricing.map(p => `
      <div class="pricing-card ${p.featured ? 'featured' : ''}">
        ${p.featured ? '<div class="price-badge mono">MOST POPULAR</div>' : ''}
        <div class="price-type">${p.type}</div>
        <div class="price-amount"><span class="accent">${p.price}</span><span class="price-unit">${p.unit}</span></div>
        <ul class="price-features">
          ${p.features.map(f => `<li><span class="check accent">✓</span>${f}</li>`).join('')}
        </ul>
        <a href="#contact" class="btn-primary ${p.featured ? '' : 'btn-ghost'}">Get Started</a>
      </div>
    `).join('');
  }

  // ── REVIEWS ─────────────────────────────────
  // Arabic visitors see the clients' own words; English visitors see a translation with the original underneath.
  const R = portfolioData.reviews;
  const starRow = n => `<span class="rv-stars" aria-label="${n} out of 5">${'★'.repeat(Math.round(n))}${'☆'.repeat(5 - Math.round(n))}</span>`;
  const quote = r => getLang() === 'ar'
    ? `<p class="rv-text" dir="rtl" lang="ar">${r.ar}</p>`
    : `<p class="rv-text">${r.en}</p><p class="rv-orig" dir="rtl" lang="ar">${r.ar}</p>`;

  function renderReviews() {
    if (!R) return;
    const lang = getLang();
    const verified = R.mostaql.filter(r => r.shot);
    const avg = verified.reduce((s, r) => s + r.stars, 0) / verified.length;

    document.getElementById('rvSummary').innerHTML = `
      <div class="rv-score"><strong>${avg.toFixed(2)}</strong><span>/5</span></div>
      <div class="rv-summary-text">
        ${starRow(avg)}
        <p>${t('rv_avg').replace('{n}', verified.length)}</p>
      </div>
      <div class="rv-badges">
        <span class="rv-badge mono">✓ ${t('rv_badge_mostaql')}</span>
        <span class="rv-badge mono">🎙 ${R.voices.length} ${t('rv_badge_voice')}</span>
        <span class="rv-badge mono">💬 ${R.whatsapp.length} ${t('rv_badge_wa')}</span>
      </div>
      ${R.mostaqlUrl ? `<a class="btn-ghost rv-all" href="${R.mostaqlUrl}" target="_blank" rel="noopener">${t('rv_all')} ↗</a>` : ''}`;

    document.getElementById('rvMostaql').innerHTML = R.mostaql.map((r, i) => `
      <article class="rv-card${r.featured ? ' featured' : ''}">
        <div class="rv-card-top">
          ${starRow(r.stars)}
          ${r.shot ? `<span class="rv-platform mono">MOSTAQL ✓</span>` : ''}
        </div>
        ${quote(r)}
        <div class="rv-author">
          <div class="test-avatar">${r.avatar}</div>
          <div><strong dir="auto">${r.name}</strong><small>${r.project[lang] || r.project.en}</small></div>
          ${r.shot ? `<button class="rv-proof" data-lb-img="${r.shot}">${t('rv_view')} ↗</button>` : ''}
        </div>
      </article>`).join('');

    document.getElementById('rvVoices').innerHTML = R.voices.map((v, i) => `
      <button class="rv-voice" data-lb-video="${v.src}" data-poster="${v.poster}" aria-label="${t('rv_play')} ${i + 1}">
        <span class="rv-voice-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
        <span class="rv-wave" aria-hidden="true">${Array.from({ length: 28 }, (_, k) =>
          `<i style="height:${20 + Math.round(Math.abs(Math.sin((k + 1) * (i + 2) * 0.9)) * 80)}%"></i>`).join('')}</span>
        <span class="rv-voice-meta mono">0:${String(v.dur).padStart(2, '0')}</span>
        <span class="rv-voice-label">${t('rv_voice_label')} #${i + 1}</span>
      </button>`).join('');

    document.getElementById('rvChats').innerHTML = R.whatsapp.map(w => `
      <button class="rv-chat" data-lb-img="${w.shot}">
        <span class="rv-chat-img"><img src="${w.shot}" alt="" loading="lazy" style="object-position:${w.pos || 'top'}"/></span>
        <span class="rv-chat-quote" ${lang === 'ar' ? 'dir="rtl" lang="ar"' : ''}>“${lang === 'ar' ? w.ar : w.en}”</span>
      </button>`).join('');
  }

  // ── REVIEW LIGHTBOX ─────────────────────────
  const lb = document.getElementById('lb'), lbBody = document.getElementById('lbBody');
  let lbFocus = null;
  function openLightbox(html) {
    lbFocus = document.activeElement;
    lbBody.innerHTML = html;
    lb.hidden = false;
    document.documentElement.classList.add('vp-open');
    lb.querySelector('.lb-close').focus({ preventScroll: true });
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lbBody.innerHTML = '';   // also stops any playing voice note
    lb.hidden = true;
    document.documentElement.classList.remove('vp-open');
    lbFocus && lbFocus.focus({ preventScroll: true });
  }
  document.getElementById('testimonials').addEventListener('click', e => {
    const b = e.target.closest('[data-lb-img], [data-lb-video]');
    if (!b) return;
    if (b.dataset.lbImg) openLightbox(`<img src="${b.dataset.lbImg}" alt="Original review screenshot"/>`);
    else openLightbox(`<video src="${b.dataset.lbVideo}" poster="${b.dataset.poster}" controls autoplay playsinline controlslist="nodownload"></video>`);
  });
  lb.querySelectorAll('[data-lb-close]').forEach(el => el.addEventListener('click', closeLightbox));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // ── FAQ — dynamic per language ──────────────
  function renderFAQ(lang) {
    const fl = document.getElementById('faqList');
    if (!fl) return;
    const t = translations[lang] || translations.en;
    const faqs = t.faq || [];
    fl.innerHTML = faqs.map((f, i) => `
      <div class="faq-item visible">
        <button class="faq-q" data-idx="${i}">
          <span>${f.q}</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p>${f.a}</p>
        </div>
      </div>
    `).join('');
    fl.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        fl.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }
  window.renderFAQ = renderFAQ;
  const currentLang = localStorage.getItem('lang') || 'en';
  renderFAQ(currentLang);

  // ── BEFORE / AFTER SLIDER ───────────────────
  const baDivider = document.getElementById('baDivider');
  const baSlider  = document.getElementById('baSlider');
  if (baDivider && baSlider) {
    let dragging = false;

    function setSlider(x) {
      const rect = baSlider.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
      baDivider.style.left = pct + '%';
      baSlider.querySelector('.ba-before').style.clipPath = `inset(0 ${100-pct}% 0 0)`;
    }

    baSlider.addEventListener('mousedown', e => { dragging = true; setSlider(e.clientX); });
    window.addEventListener('mouseup', () => dragging = false);
    baSlider.addEventListener('mousemove', e => { if (dragging) setSlider(e.clientX); });

    baDivider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, {passive:false});
    window.addEventListener('touchend', () => dragging = false);
    baSlider.addEventListener('touchmove', e => {
      if (dragging) setSlider(e.touches[0].clientX);
    }, {passive:true});

    setSlider(baSlider.getBoundingClientRect().left + baSlider.offsetWidth / 2);
  }

  // ── INTERSECTION OBSERVER ───────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  function observeReveal() {
    document.querySelectorAll('.service-card:not(.visible), .process-step:not(.visible), .pricing-card:not(.visible), .faq-item').forEach(el => {
      observer.observe(el);
    });
  }

  function renderDynamic() {
    renderProjects();
    renderServices();
    renderProcess();
    renderReviews();
    observeReveal();
  }
  window.renderDynamic = renderDynamic;
  renderDynamic();

  // ── SMOOTH SCROLL ───────────────────────────
  // #work/<slug> links open the player (handled in player.js via hashchange), so skip them here
  document.querySelectorAll('a[href^="#"]:not([href^="#work/"])').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      const target = href.length > 1 && document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── CONTACT FORM — mailto ───────────────────
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name    = form.querySelector('input[type=text]').value.trim();
      const email   = form.querySelector('input[type=email]').value.trim();
      const service = form.querySelector('select').value;
      const msg     = form.querySelector('textarea').value.trim();

      if (!name || !email || !msg) return;

      const subject = encodeURIComponent(`New Project Inquiry — ${service}`);
      const body    = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${msg}`
      );

      window.location.href = `mailto:contact.abualhamd@gmail.com?subject=${subject}&body=${body}`;

      const btn = form.querySelector('button[type=submit]');
      btn.textContent = t('form_sending');
      btn.style.background = 'var(--accent)';
      btn.style.color = '#000';
      setTimeout(() => {
        btn.textContent = t('form_send');
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 3000);
    });
  }

  // ── CUSTOM CURSOR ───────────────────────────
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  // Delegated so cards re-rendered on filter/language change still get the hover state
  document.addEventListener('mouseover', e => {
    cursor.classList.toggle('hover', !!e.target.closest('a, button, .tab, .work-card, .ba-slider'));
  });

});
