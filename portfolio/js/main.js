/* ═══════════════════════════════════
   MAIN.JS — Portfolio interactions
   ═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── LOADER ──────────────────────────────────
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.add('loaded');
    animateHeroIn();
  }, 2200);

  // ── THEME TOGGLE ────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

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
    document.querySelector('.hero-reel')?.classList.add('slide-in-right');
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
  function renderProjects(filter = 'all') {
    const grid = document.getElementById('projectsGrid');
    const filtered = filter === 'all'
      ? portfolioData.projects
      : portfolioData.projects.filter(p => p.cat === filter);

    grid.innerHTML = filtered.map(p => `
      <div class="project-card" data-cat="${p.cat}">
        <div class="project-thumb">
          <div class="thumb-placeholder">
            <div class="thumb-icon">▶</div>
          </div>
          <div class="project-overlay">
            <span class="mono">View Case Study</span>
          </div>
        </div>
        <div class="project-info">
          <div class="project-meta">
            <span class="mono project-cat">${p.cat.replace('-',' ').toUpperCase()}</span>
            <span class="mono project-delivery">⚡ ${p.delivery}</span>
          </div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-client">${p.client}</p>
          <div class="project-stats">
            <div class="ps"><span class="ps-val accent">${p.retention}</span><span class="ps-label">Retention</span></div>
            <div class="ps"><span class="ps-val accent">${p.views}</span><span class="ps-label">Views</span></div>
          </div>
          <p class="project-result">✦ ${p.result}</p>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.project-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 0.07}s`;
      card.classList.add('card-enter');
    });
  }

  renderProjects();

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProjects(tab.getAttribute('data-filter'));
    });
  });

  // ── SERVICES ────────────────────────────────
  const sg = document.getElementById('servicesGrid');
  if (sg) {
    sg.innerHTML = portfolioData.services.map(s => `
      <div class="service-card">
        <div class="service-icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>
    `).join('');
  }

  // ── PROCESS ─────────────────────────────────
  const pt = document.getElementById('processTimeline');
  if (pt) {
    pt.innerHTML = portfolioData.process.map((p, i) => `
      <div class="process-step" style="animation-delay:${i*0.1}s">
        <div class="ps-num mono">${p.step}</div>
        <div class="ps-connector ${i < portfolioData.process.length-1 ? 'has-line' : ''}"></div>
        <div class="ps-content">
          <h4>${p.title}</h4>
          <p>${p.desc}</p>
        </div>
      </div>
    `).join('');
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

  // ── TESTIMONIALS ────────────────────────────
  const tt = document.getElementById('testimonialsTrack');
  if (tt) {
    tt.innerHTML = portfolioData.testimonials.map(t => `
      <div class="testimonial-card">
        <div class="test-stars">★★★★★</div>
        <p class="test-text">"${t.text}"</p>
        <div class="test-author">
          <div class="test-avatar">${t.avatar}</div>
          <div>
            <strong>${t.name}</strong>
            <small>${t.role}</small>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── FAQ — dynamic per language ──────────────
  function renderFAQ(lang) {
    const fl = document.getElementById('faqList');
    if (!fl) return;
    const t = translations[lang] || translations.en;
    const faqs = t.faq || [];
    fl.innerHTML = faqs.map((f, i) => `
      <div class="faq-item">
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

    baDivider.addEventListener('mousedown', () => dragging = true);
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

  document.querySelectorAll('.service-card, .process-step, .pricing-card, .testimonial-card, .faq-item').forEach(el => {
    observer.observe(el);
  });

  // ── SMOOTH SCROLL ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
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

      const subject = encodeURIComponent(`New Project Request — ${service}`);
      const body    = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${msg}`
      );

      // ⚠️ غيّر YOUR@EMAIL.COM بإيميلك الحقيقي
      window.location.href = `mailto:YOUR@EMAIL.COM?subject=${subject}&body=${body}`;

      const btn = form.querySelector('button[type=submit]');
      btn.textContent = '✓ Opening Email...';
      btn.style.background = 'var(--accent)';
      btn.style.color = '#000';
      setTimeout(() => {
        btn.textContent = 'Send Message →';
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
  document.querySelectorAll('a, button, .tab, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

});
