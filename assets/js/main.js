/* PCOS, Made Simple: sales page scripts. No libraries. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- Always start at the top after a reload (unless a #link is used) ---------- */
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------- Checkout link (data-checkout-url on the <body> tag in index.html) ---------- */
  var body = document.body;
  var checkoutUrl = (body.getAttribute('data-checkout-url') || '').trim();
  $$('[data-buy]').forEach(function (a) {
    if (checkoutUrl) {
      a.setAttribute('href', checkoutUrl);
    }
  });

  /* ---------- Meta Pixel: InitiateCheckout when someone taps "Get the book" ----------
     The value is read from the price on the page (.price__now), so it stays in step with it.
     The checkout opens in the same tab, so a plain click waits a moment (max 300ms)
     to let the event reach Meta before leaving the page. */
  var priceEl = $('.price__now');
  var price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : 0;
  var checkoutSent = false;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-buy]');
    if (!a || typeof window.fbq !== 'function') return;
    var params = { currency: 'INR', content_name: 'PCOS, Made Simple', content_type: 'product', num_items: 1 };
    if (price) params.value = price;
    if (!checkoutSent) { window.fbq('track', 'InitiateCheckout', params); checkoutSent = true; }
    /* New tab / modified clicks leave this page open, so no wait is needed. */
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    e.preventDefault();
    var href = a.href, left = false;
    function leave() { if (!left) { left = true; window.location.href = href; } }
    setTimeout(leave, 300);
  });

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Landing animation: wait only for the cover, never more than 1.2s ---------- */
  var hero = $('.hero');
  function go() { hero.classList.add('is-go'); }
  if (reduce) { go(); }
  else {
    var cover = $('.book__front img');
    var ready = cover && cover.decode ? cover.decode().catch(function () {}) : Promise.resolve();
    Promise.race([ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(function () { requestAnimationFrame(go); });
  }

  /* ---------- Book tilt that follows the pointer (desktop only) ---------- */
  var tilt = $('#tilt');
  if (tilt && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tilt.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(2) + 'deg');
      tilt.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', function () {
      tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg');
    });
  }

  /* ==========================================================
     Parallax: only for elements near the screen; read first, then write
     ========================================================== */
  var px = $$('[data-parallax]').map(function (el) { return { el: el, ref: el.parentElement, k: parseFloat(el.getAttribute('data-parallax')), img: false }; })
    .concat($$('[data-parallax-img]').map(function (el) { return { el: el, ref: el.closest('.frame, .band__media'), k: parseFloat(el.getAttribute('data-parallax-img')) || 0.08, img: true }; }));
  var visible = new Set();
  if (!reduce && 'IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var item = px.filter(function (i) { return i.ref === e.target; });
        item.forEach(function (i) { if (e.isIntersecting) visible.add(i); else visible.delete(i); });
      });
      kick();
    }, { rootMargin: '200px 0px' });
    px.forEach(function (i) { pio.observe(i.ref); });
  }
  function measureParallax() {
    px.forEach(function (i) { if (i.img) i.extra = Math.max(0, (i.el.offsetHeight - i.ref.clientHeight) / 2 - 2); });
  }
  function runParallax(vh) {
    var out = [];
    visible.forEach(function (i) {                       // read
      var r = i.ref.getBoundingClientRect();
      out.push([i, r.top + r.height / 2 - vh / 2]);
    });
    out.forEach(function (o) {                           // write
      var i = o[0], d = o[1];
      if (i.img) i.el.style.setProperty('--pi', clamp(d * i.k, -(i.extra || 0), i.extra || 0).toFixed(1) + 'px');
      else i.el.style.setProperty('--py', clamp(d * i.k, -140, 140).toFixed(1) + 'px');
    });
  }

  /* ---------- Header background after a little scroll ---------- */
  var header = $('#siteHeader');

  /* ---------- One animation loop for scroll work ---------- */
  var raf = 0;
  function frame() {
    raf = 0;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
    if (!reduce) runParallax(window.innerHeight);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  window.addEventListener('scroll', kick, { passive: true });

  var rebuildTimer = 0;
  function scheduleRebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () { measureParallax(); kick(); }, 120);
  }
  window.addEventListener('resize', scheduleRebuild);
  window.addEventListener('load', scheduleRebuild);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleRebuild).observe(document.body);
  measureParallax(); kick();

  /* ---------- Tabs: parts of the book ---------- */
  var tabs = $$('.parts__tab'), panels = $$('.panel');
  function select(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('is-on', on);
    });
    if (focus) tabs[i].focus();
  }
  if (tabs.length) {
    select(0, false);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, k = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') k = (i + 1) % n;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') k = (i - 1 + n) % n;
        else if (e.key === 'Home') k = 0;
        else if (e.key === 'End') k = n - 1;
        if (k !== null) { e.preventDefault(); select(k, true); }
      });
    });
  }

  /* ---------- Starter checklist (remembers ticks on this device) ---------- */
  var KEY = 'pcos-made-simple:starter-v1';
  var boxes = $$('#check input[type="checkbox"]');
  var count = $('#checkCount'), bar = $('#checkBar'), done = $('#checkDone');
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(boxes.map(function (b) { return b.checked; }))); } catch (e) { /* storage unavailable */ } }
  function paint() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    count.textContent = n + ' of ' + boxes.length + ' done';
    bar.style.setProperty('--p', (n / boxes.length * 100) + '%');
    done.hidden = n !== boxes.length;
  }
  var saved = load();
  boxes.forEach(function (b, i) { b.checked = !!saved[i]; b.addEventListener('change', function () { save(); paint(); }); });
  paint();

  /* ==========================================================
     Look inside: page through an open book
     ========================================================== */
  var track = $('#peekTrack');
  if (track) {
    var pages = $$('.peek__page', track);
    var prevB = $('#peekPrev'), nextB = $('#peekNext'), countEl = $('#peekCount');
    var perView = function () { return window.matchMedia('(min-width: 760px)').matches ? 2 : 1; };
    var current = function () {
      var w = pages[0].getBoundingClientRect().width || 1;
      return Math.round(track.scrollLeft / w);
    };
    var paintPeek = function () {
      var i = current(), n = perView(), last = pages.length - n;
      if (n === 2) countEl.textContent = 'Pages ' + (i + 1) + ' and ' + Math.min(i + 2, pages.length) + ' of ' + pages.length;
      else countEl.textContent = 'Page ' + (i + 1) + ' of ' + pages.length;
      prevB.disabled = i <= 0;
      nextB.disabled = i >= last;
    };
    var peekGo = function (dir) {
      var n = perView(), i = clamp(current() + dir * n, 0, pages.length - n);
      var target = pages[i];
      track.scrollTo({ left: target.offsetLeft - pages[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    };
    prevB.addEventListener('click', function () { peekGo(-1); });
    nextB.addEventListener('click', function () { peekGo(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); peekGo(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); peekGo(-1); }
    });
    var peekRaf = 0;
    track.addEventListener('scroll', function () { if (!peekRaf) peekRaf = requestAnimationFrame(function () { peekRaf = 0; paintPeek(); }); }, { passive: true });
    window.addEventListener('resize', paintPeek);
    paintPeek();
  }

  /* ==========================================================
     Page viewer for the preview and the cheat sheets
     ========================================================== */
  var lb = $('#lightbox');
  if (lb && lb.showModal) {
    var groups = {};
    $$('[data-lb]').forEach(function (el) {
      var g = el.getAttribute('data-lb');
      (groups[g] = groups[g] || []).push({ src: el.getAttribute('data-lb-src'), caption: el.getAttribute('data-lb-caption') });
      if (el.hasAttribute('data-lb-more')) groups[g].more = +el.getAttribute('data-lb-more');
    });
    var lbImg = $('#lbImg'), lbAvif = $('#lbAvif'), lbWebp = $('#lbWebp'), lbFig = $('.lb__fig', lb);
    var lbCap = $('#lbCaption'), lbCount = $('#lbCount'), lbMore = $('#lbMore');
    var lbPrev = $('#lbPrev'), lbNext = $('#lbNext');
    var state = { g: null, i: 0, opener: null };
    var SIZES = 'min(92vw, 68vh)';
    var set = function (name) {
      var base = 'assets/img/pages/' + name + '-';
      lbAvif.srcset = base + '900.avif 900w, ' + base + '1400.avif 1400w'; lbAvif.sizes = SIZES;
      lbWebp.srcset = base + '900.webp 900w, ' + base + '1400.webp 1400w'; lbWebp.sizes = SIZES;
      lbImg.src = base + '900.webp';
    };
    var preload = function (name) {
      if (!name) return;
      var i = new Image(); i.sizes = SIZES;
      i.srcset = 'assets/img/pages/' + name + '-900.webp 900w, assets/img/pages/' + name + '-1400.webp 1400w';
    };
    var show = function (i, dir) {
      var list = groups[state.g]; state.i = i;
      var item = list[i];
      set(item.src);
      lbImg.alt = item.caption;
      lbCap.textContent = item.caption;
      lbCount.textContent = (i + 1) + ' of ' + list.length;
      var last = i === list.length - 1;
      lbMore.hidden = !(last && list.more);
      if (list.more) lbMore.textContent = '+ ' + list.more + ' more pages in the book';
      lbPrev.disabled = i === 0; lbNext.disabled = last;
      if (!reduce && dir) { lbFig.style.setProperty('--from', (dir * 40) + 'px'); lbFig.classList.remove('is-swap'); void lbFig.offsetWidth; lbFig.classList.add('is-swap'); }
      preload(list[i + 1] && list[i + 1].src);
    };
    var step = function (d) {
      var list = groups[state.g]; var j = state.i + d;
      if (j >= 0 && j < list.length) show(j, d);
    };
    $$('button[data-lb]').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.getAttribute('data-lb'), src = b.getAttribute('data-lb-src');
        state.g = g; state.opener = b;
        var idx = groups[g].map(function (x) { return x.src; }).indexOf(src);
        show(Math.max(0, idx), 0);
        document.documentElement.classList.add('lb-open');
        lb.showModal();
      });
    });
    lbPrev.addEventListener('click', function () { step(-1); });
    lbNext.addEventListener('click', function () { step(1); });
    $('#lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('close', function () {
      document.documentElement.classList.remove('lb-open');
      if (state.opener) state.opener.focus();
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'lbStage') lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var sx = null;
    var stage = $('#lbStage');
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
  }

  /* ---------- Sticky buy bar on phones ---------- */
  var buybar = $('#buybar');
  var seen = { hero: true, buy: false };
  function showBar() {
    var on = !seen.hero && !seen.buy;
    buybar.classList.toggle('is-on', on);
    buybar.setAttribute('aria-hidden', on ? 'false' : 'true');
    var a = $('a', buybar); if (a) a.tabIndex = on ? 0 : -1;
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id === 'top' ? 'hero' : 'buy'] = e.isIntersecting; });
      showBar();
    }, { threshold: 0.15 });
    io.observe(hero);
    var buySec = $('#buy'); if (buySec) io.observe(buySec);
  }
})();
