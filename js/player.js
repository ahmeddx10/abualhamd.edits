/* ═══════════════════════════════════
   PLAYER.JS — custom video player for the Selected Work section
   Opens from a work card; supports quality, speed, volume, loop,
   PiP, fullscreen, keyboard shortcuts, prev/next and "up next".
   Deep link: #work/<slug>
   ═══════════════════════════════════ */

(() => {
  const $ = id => document.getElementById(id);
  const vp = $('vp'), stage = $('vpStage'), video = $('vpVideo');
  if (!vp) return;

  const QUALITIES = [1080, 720, 480];
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('vp_' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('vp_' + k, JSON.stringify(v)); } catch {} },
  };

  let list = [], index = 0, project = null;
  let quality = store.get('quality', 'auto');   // 'auto' | 1080 | 720 | 480
  let speed = 1;
  let lastFocus = null, idleTimer = null, upNextTimer = null;

  const lang = () => document.documentElement.getAttribute('data-lang') || 'en';
  const tr = key => (translations[lang()] || translations.en)[key] || translations.en[key] || key;
  const fmt = s => {
    if (!isFinite(s)) return '0:00';
    s = Math.floor(s);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const byslug = slug => portfolioData.projects.concat(portfolioData.extras || []).find(p => p.slug === slug);

  // Pick a rendition from screen size and connection when quality is "auto"
  function autoQuality() {
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))) return 480;
    // Lean sharp: a portfolio should look crisp, so ask for ~1.6× the displayed pixels
    const need = Math.min(stage.clientWidth, stage.clientHeight) * (window.devicePixelRatio || 1) * 1.6;
    return [480, 720, 1080].find(q => q >= need) || 1080;
  }
  const cap = () => (project && project.maxQ) || 1080;   // highest rendition this video has
  const resolved = () => Math.min(quality === 'auto' ? Math.min(autoQuality(), autoCap || 1080) : quality, cap());
  const srcFor = (p, q) => `assets/work/${p.slug}/${q}.mp4`;

  // ── OPEN / CLOSE ──────────────────────────
  function open(slug, slugs) {
    list = (slugs && slugs.length ? slugs : portfolioData.projects.map(p => p.slug));
    if (!list.includes(slug)) list = [slug];   // e.g. the showreel: plays on its own
    index = list.indexOf(slug);
    if (vp.hidden) {
      lastFocus = document.activeElement;
      vp.hidden = false;
      document.documentElement.classList.add('vp-open');
      document.body.style.overflow = 'hidden';
      document.dispatchEvent(new Event('vp:open'));
    }
    load(list[index], true);
    $('vpPlay').focus({ preventScroll: true });
  }

  function close() {
    if (vp.hidden) return;
    hideUpNext();
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    vp.hidden = true;
    vp.className = 'vp';
    document.documentElement.classList.remove('vp-open');
    document.body.style.overflow = '';
    if (location.hash.startsWith('#work/')) history.replaceState(null, '', location.pathname + location.search);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    document.dispatchEvent(new Event('vp:close'));
  }

  function load(slug, autoplay) {
    project = byslug(slug);
    if (!project) return;
    hideUpNext();
    const c = project[lang()] || project.en;
    $('vpCat').textContent = tr(window.WORK_CATS[project.cat]).toUpperCase();
    $('vpTitle').textContent = c.title;
    $('vpClient').textContent = c.client;
    $('vpCount').textContent = `${index + 1} / ${list.length}`;
    $('vpPrev').disabled = index === 0;
    $('vpNext').disabled = index === list.length - 1;
    vp.classList.toggle('single', list.length === 1);

    const ar = project.v ? 9 / 16 : 16 / 9;
    stage.style.setProperty('--vp-ar', project.v ? '9/16' : '16/9');
    stage.style.setProperty('--vp-arn', ar);

    video.poster = `assets/work/${slug}/poster.jpg`;
    video.src = srcFor(project, resolved());
    video.playbackRate = speed;
    video.loop = vp.classList.contains('looping');
    renderQualityMenu();
    vp.classList.remove('ended');
    vp.classList.add('loading');
    history.replaceState(null, '', '#work/' + slug);
    if (autoplay) video.play().catch(() => vp.classList.remove('loading'));
    wake();
  }

  const go = step => {
    const n = index + step;
    if (n < 0 || n >= list.length) return;
    index = n;
    load(list[index], true);
  };

  // ── PLAYBACK ──────────────────────────────
  const togglePlay = () => {
    if (video.paused || video.ended) { hideUpNext(); video.play(); flash('play'); }
    else { video.pause(); flash('pause'); }
  };
  const seekBy = s => {
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + s));
    flash((s > 0 ? '+' : '−') + Math.abs(s) + 's');
  };

  const ICONS = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  };
  function flash(what) {
    const f = $('vpFlash');
    f.innerHTML = ICONS[what] || what;
    f.classList.remove('show'); void f.offsetWidth; f.classList.add('show');
  }

  video.addEventListener('play', () => { vp.classList.add('playing'); vp.classList.remove('ended'); wake(); });
  video.addEventListener('pause', () => { vp.classList.remove('playing'); wake(); });
  // Auto mode: if playback keeps stalling, step down one quality level
  let stalls = [], autoCap = null;
  video.addEventListener('waiting', () => {
    vp.classList.add('loading');
    if (quality !== 'auto' || video.currentTime < 0.5) return;
    const now = Date.now();
    stalls = stalls.filter(t => now - t < 15000).concat(now);
    const cur = resolved(), lower = QUALITIES[QUALITIES.indexOf(cur) + 1];
    if (stalls.length >= 3 && lower) {
      stalls = [];
      autoCap = lower;
      switchSource();
      renderMenu();
    }
  });
  video.addEventListener('playing', () => vp.classList.remove('loading'));
  video.addEventListener('canplay', () => vp.classList.remove('loading'));
  video.addEventListener('loadedmetadata', () => { $('vpDur').textContent = fmt(video.duration); });
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('progress', updateBuffered);
  video.addEventListener('ended', () => {
    vp.classList.remove('playing');
    vp.classList.add('ended');
    wake();
    if (index < list.length - 1) showUpNext();
  });
  video.addEventListener('contextmenu', e => e.preventDefault());
  video.addEventListener('click', togglePlay);
  video.addEventListener('dblclick', toggleFs);

  // ── PROGRESS BAR ──────────────────────────
  const progress = $('vpProgress');
  function updateProgress() {
    if (dragging) return;
    const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    $('vpPlayed').style.width = pct + '%';
    $('vpCur').textContent = fmt(video.currentTime);
  }
  function updateBuffered() {
    const b = video.buffered;
    if (!b.length || !video.duration) return;
    $('vpBuffered').style.width = (b.end(b.length - 1) / video.duration) * 100 + '%';
  }
  const pctAt = x => {
    const r = progress.getBoundingClientRect();
    return Math.max(0, Math.min(1, (x - r.left) / r.width));
  };
  let dragging = false;
  progress.addEventListener('pointerdown', e => {
    dragging = true;
    progress.classList.add('dragging');
    progress.setPointerCapture(e.pointerId);
    scrub(e.clientX);
  });
  progress.addEventListener('pointermove', e => {
    const p = pctAt(e.clientX);
    const ht = $('vpHoverTime');
    ht.textContent = fmt(p * (video.duration || 0));
    ht.style.left = Math.max(24, Math.min(progress.clientWidth - 24, p * progress.clientWidth)) + 'px';
    if (dragging) scrub(e.clientX);
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false;
    progress.classList.remove('dragging');
    if (video.duration) video.currentTime = pctAt(e.clientX) * video.duration;
  };
  progress.addEventListener('pointerup', endDrag);
  progress.addEventListener('pointercancel', endDrag);
  function scrub(x) {
    const p = pctAt(x);
    $('vpPlayed').style.width = p * 100 + '%';
    $('vpCur').textContent = fmt(p * (video.duration || 0));
  }

  // ── VOLUME ────────────────────────────────
  const vol = $('vpVol');
  function setVolume(v, muted) {
    video.volume = Math.max(0, Math.min(1, v));
    video.muted = muted ?? video.volume === 0;
    vol.value = video.muted ? 0 : video.volume;
    vol.style.setProperty('--vol', vol.value * 100 + '%');
    vp.classList.toggle('muted', video.muted || video.volume === 0);
    store.set('volume', video.volume);
    store.set('muted', video.muted);
  }
  setVolume(store.get('volume', 1), store.get('muted', false));
  vol.addEventListener('input', () => setVolume(+vol.value, +vol.value === 0));
  $('vpMute').addEventListener('click', () => {
    if (video.muted || video.volume === 0) setVolume(video.volume || 0.8, false);
    else setVolume(video.volume, true);
  });

  // ── SETTINGS MENU (main panel → Quality / Speed sub-panels, Loop toggle) ──
  const menu = $('vpMenu');
  let panel = 'main';
  const looping = () => vp.classList.contains('looping');
  function renderMenu() {
    const cur = resolved();
    const qText = quality === 'auto' ? `${tr('vp_auto')} (${cur}p)` : `${cur}p`;
    const sText = speed === 1 ? tr('vp_normal') : speed + '×';
    if (panel === 'main') {
      menu.innerHTML =
        `<button data-panel="quality"><span>${tr('vp_quality')}</span><small>${qText} ›</small></button>` +
        `<button data-panel="speed"><span>${tr('vp_speed')}</span><small>${sText} ›</small></button>` +
        `<button data-loop><span>${tr('vp_loop')}</span><span class="vp-switch${looping() ? ' on' : ''}"></span></button>`;
    } else if (panel === 'quality') {
      menu.innerHTML = `<button class="vp-menu-back" data-panel="main">‹ ${tr('vp_quality')}</button>` +
        `<button data-q="auto" class="${quality === 'auto' ? 'active' : ''}">${tr('vp_auto')} <small>${cur}p</small></button>` +
        QUALITIES.filter(q => q <= cap()).map(q => `<button data-q="${q}" class="${quality !== 'auto' && resolved() === q ? 'active' : ''}">${q}p${q === 1080 ? ' <small>HD</small>' : ''}</button>`).join('');
    } else {
      menu.innerHTML = `<button class="vp-menu-back" data-panel="main">‹ ${tr('vp_speed')}</button>` +
        SPEEDS.map(s => `<button data-speed="${s}" class="${s === speed ? 'active' : ''}">${s === 1 ? tr('vp_normal') : s + '×'}</button>`).join('');
    }
    $('vpQualityLabel').textContent = quality === 'auto' ? 'AUTO' : `${resolved()}p`;
  }
  const renderQualityMenu = renderMenu;
  menu.addEventListener('click', e => {
    e.stopPropagation();
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.panel) { panel = b.dataset.panel; return renderMenu(); }
    if ('loop' in b.dataset) {
      vp.classList.toggle('looping');
      video.loop = looping();
      return renderMenu();
    }
    if (b.dataset.speed) {
      speed = +b.dataset.speed;
      video.playbackRate = speed;
    } else if (b.dataset.q) {
      const before = resolved();
      quality = b.dataset.q === 'auto' ? 'auto' : +b.dataset.q;
      store.set('quality', quality);
      if (resolved() !== before) switchSource();
    }
    panel = 'main';
    renderMenu();
  });
  // Swap rendition without losing position, speed or play state
  function switchSource() {
    const t = video.currentTime, wasPlaying = !video.paused;
    vp.classList.add('loading');
    video.src = srcFor(project, resolved());
    video.addEventListener('loadedmetadata', function once() {
      video.removeEventListener('loadedmetadata', once);
      video.currentTime = t;
      video.playbackRate = speed;
      if (wasPlaying) video.play().catch(() => {});
    });
  }
  const closeMenus = () => menu.classList.remove('open');
  $('vpQualityBtn').addEventListener('click', e => {
    e.stopPropagation();
    if (menu.classList.contains('open')) return closeMenus();
    panel = 'main';
    renderMenu();
    menu.classList.add('open');
    clearTimeout(idleTimer);
  });
  vp.addEventListener('click', e => { if (!e.target.closest('.vp-menu-wrap')) closeMenus(); });

  // ── PIP / FULLSCREEN ──────────────────────
  const pipBtn = $('vpPip');
  if (!document.pictureInPictureEnabled) pipBtn.style.display = 'none';
  pipBtn.addEventListener('click', () => {
    if (document.pictureInPictureElement) document.exitPictureInPicture();
    else video.requestPictureInPicture().catch(() => {});
  });
  function toggleFs() {
    if (document.fullscreenElement) return document.exitFullscreen();
    if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();   // iPhone
  }
  $('vpFs').addEventListener('click', toggleFs);
  document.addEventListener('fullscreenchange', () => vp.classList.toggle('fs', !!document.fullscreenElement));

  // ── BUTTONS ───────────────────────────────
  $('vpPlay').addEventListener('click', togglePlay);
  $('vpBack').addEventListener('click', () => seekBy(-10));
  $('vpFwd').addEventListener('click', () => seekBy(10));
  $('vpPrev').addEventListener('click', () => go(-1));
  $('vpNext').addEventListener('click', () => go(1));
  vp.querySelectorAll('[data-vp-close]').forEach(el => el.addEventListener('click', close));

  // Double-tap the left/right side on touch screens to skip 10s; single tap shows controls
  let lastTap = 0;
  vp.querySelectorAll('.vp-tap').forEach(zone => zone.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 300) seekBy(+zone.dataset.skip);
    else if (stage.classList.contains('idle')) wake();
    else togglePlay();
    lastTap = now;
  }));

  // ── UP NEXT ───────────────────────────────
  function showUpNext() {
    const next = byslug(list[index + 1]);
    if (!next) return;
    const c = next[lang()] || next.en;
    $('vpUpNextImg').src = `assets/work/${next.slug}/poster.jpg`;
    $('vpUpNextTitle').textContent = c.title;
    $('vpUpNext').querySelector('[data-i18n="vp_upnext"]').textContent = tr('vp_upnext');
    $('vpUpNextCancel').textContent = tr('vp_cancel');
    $('vpUpNext').hidden = false;
    let n = 5;
    const btn = $('vpUpNextPlay');
    const tick = () => { btn.textContent = `▶ ${tr('vp_playnow')} (${n})`; };
    tick();
    upNextTimer = setInterval(() => { n--; if (n <= 0) { hideUpNext(); go(1); } else tick(); }, 1000);
  }
  function hideUpNext() { clearInterval(upNextTimer); $('vpUpNext').hidden = true; }
  $('vpUpNextPlay').addEventListener('click', () => { hideUpNext(); go(1); });
  $('vpUpNextCancel').addEventListener('click', hideUpNext);

  // ── AUTO-HIDE CONTROLS ────────────────────
  function wake() {
    stage.classList.remove('idle');
    clearTimeout(idleTimer);
    if (!video.paused && !document.querySelector('.vp-menu.open')) {
      idleTimer = setTimeout(() => stage.classList.add('idle'), 2500);
    }
  }
  stage.addEventListener('pointermove', wake);
  stage.addEventListener('pointerleave', () => { if (!video.paused) stage.classList.add('idle'); });

  // ── KEYBOARD ──────────────────────────────
  document.addEventListener('keydown', e => {
    if (vp.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.matches('input[type=range]') && /Arrow/.test(e.key)) return;
    const k = e.key.toLowerCase();
    const handled = {
      ' ': togglePlay, k: togglePlay,
      arrowright: () => e.shiftKey ? go(1) : seekBy(5),
      arrowleft: () => e.shiftKey ? go(-1) : seekBy(-5),
      l: () => seekBy(10), j: () => seekBy(-10),
      arrowup: () => { setVolume(video.volume + 0.1, false); flash(Math.round(video.volume * 100) + '%'); },
      arrowdown: () => { setVolume(video.volume - 0.1); flash(Math.round(video.volume * 100) + '%'); },
      m: () => $('vpMute').click(), f: toggleFs,
      escape: () => {
        if (menu.classList.contains('open')) closeMenus();
        else if (!document.fullscreenElement) close();
      },
      n: () => go(1), p: () => go(-1),
    }[k];
    if (/^[0-9]$/.test(k) && video.duration) { video.currentTime = video.duration * (+k / 10); e.preventDefault(); wake(); return; }
    if (handled) {
      // Space on a focused button would also click it — let our handler own it
      e.preventDefault();
      handled();
      wake();
    }
  });

  // Keep focus inside the dialog
  vp.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = [...vp.querySelectorAll('button:not([disabled]), input')].filter(el => el.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  // ── DEEP LINK ─────────────────────────────
  function fromHash() {
    const m = location.hash.match(/^#work\/([\w-]+)$/);
    if (m && byslug(m[1])) open(m[1]);
  }
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('load', fromHash);

  renderMenu();
  window.VP = { open, close };
})();
