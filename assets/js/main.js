/* It's Cleaning Time! - page behaviour
   Sections: settings, helpers, effects (fog, spray, sparkle, highlighter),
   hero review rotator, reviews scroller, before/after slider, quote chat. */
(function () {
  'use strict';

  /* ---------- Settings you might want to change ---------- */
  var PHONE_DISPLAY = '0421 925 134';
  var PHONE_TEL = '0421925134';

  var SERVICES = ['Regular home clean', 'Deep clean', 'Kitchen', 'Bathroom', 'Windows', 'Move-in', 'End-of-lease', 'Tricky job', 'Office / workplace', 'Commercial premises'];
  var SUBURBS = ['Carrum', 'Patterson Lakes', 'Chelsea', 'Bonbeach', 'Seaford', 'Somewhere nearby'];
  var FREQUENCIES = ['One-off', 'Ongoing', 'Not sure yet'];
  var GREETING = "G'day, Kev here! What do you need a hand with?";

  // Short pull-quotes for the rotating card in the hero (real Google reviews).
  var HERO_REVIEWS = [
    { pull: 'We have the utmost peace of mind now', name: 'Brandon Crimmins', avatar: 'assets/img/review-brandon.webp' },
    { pull: 'So impressed at how my kitchen sparkles', name: 'Anastassia Murray', avatar: 'assets/img/review-anastassia.webp' },
    { pull: 'Far beyond my expectations', name: 'Paul Llewellyn', avatar: 'assets/img/review-paul.webp' },
    { pull: 'So easy to deal with and did a fantastic job', name: 'Geoff and Karen', avatar: 'assets/img/review-geoff-karen.webp' },
    { pull: 'Very professional, affordable and so clean', name: 'Lynessa Lucero', avatar: 'assets/img/review-lynessa.webp' }
  ];

  /* ---------- Helpers ---------- */
  var root = document.getElementById('page');
  var fxLayer = document.getElementById('fxLayer');
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ICONS = 'assets/icons.svg#';

  function $(id) { return document.getElementById(id); }
  function later(fn, ms) { return setTimeout(fn, ms); }
  function icon(name) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ic');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(ns, 'use');
    use.setAttribute('href', ICONS + name);
    svg.appendChild(use);
    return svg;
  }
  // Position of an element relative to the page wrapper (where the effects layer lives).
  function box(el) {
    var b = el.getBoundingClientRect(), r = root.getBoundingClientRect();
    return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
  }

  var yearEl = $('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Burst effect (droplets, sparkles, optional spray bottle) ---------- */
  function burst(x, y, o) {
    o = o || {};
    if (!fxLayer || reduceMotion || !fxLayer.animate) return;
    function add(css, frames, opts, child) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;pointer-events:none;' + css;
      if (child) d.appendChild(child);
      fxLayer.appendChild(d);
      var a = d.animate(frames, opts);
      a.onfinish = function () { d.remove(); };
    }
    var dl = o.bottle ? 260 : 0;
    if (o.bottle) {
      add('left:' + (x + 8) + 'px;top:' + (y - 30) + 'px;width:40px;height:40px;color:#1F6FE5;filter:drop-shadow(0 4px 10px rgba(11,36,99,.2));transform-origin:50% 100%',
        [{ opacity: 0, transform: 'translate(14px,10px) rotate(-6deg)' }, { opacity: 1, transform: 'translate(0,0) rotate(-16deg)', offset: .2 }, { opacity: 1, transform: 'rotate(-32deg)', offset: .35 }, { opacity: 1, transform: 'rotate(-16deg)', offset: .5 }, { opacity: 0, transform: 'translate(8px,6px) rotate(-8deg)' }],
        { duration: 1200, easing: 'ease-out' }, icon('sanitizer'));
    }
    add('left:' + x + 'px;top:' + y + 'px;width:140px;height:140px;margin:-70px;border-radius:50%;background:radial-gradient(circle,rgba(140,200,255,.5),rgba(140,200,255,0) 68%)',
      [{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: 750, delay: dl, easing: 'ease-out', fill: 'backwards' });
    for (var i = 0; i < 16; i++) {
      var s = 3 + Math.random() * 7;
      var ang = o.bottle ? Math.PI * (0.7 + Math.random() * 0.7) : Math.random() * Math.PI * 2;
      var rad = 24 + Math.random() * 60;
      add('left:' + x + 'px;top:' + y + 'px;width:' + s + 'px;height:' + s + 'px;margin:' + (-s / 2) + 'px;border-radius:50%;background:rgba(90,165,255,.5);box-shadow:inset -1px -1px 0 rgba(255,255,255,.85)',
        [{ transform: 'translate(0,0) scale(.3)', opacity: 1 }, { transform: 'translate(' + Math.cos(ang) * rad + 'px,' + (Math.sin(ang) * rad + 10) + 'px) scale(1)', opacity: 0 }],
        { duration: 600 + Math.random() * 500, delay: dl, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'backwards' });
    }
    if (o.sparkle) {
      for (var j = 0; j < 3; j++) {
        var ss = 12 + Math.random() * 16, dx = (Math.random() - .5) * 80, dy = (Math.random() - .5) * 60;
        add('left:' + (x + dx) + 'px;top:' + (y + dy) + 'px;width:' + ss + 'px;height:' + ss + 'px;margin:' + (-ss / 2) + 'px;background:' + (j % 2 ? '#FFD21F' : '#1F6FE5') + ';clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)',
          [{ transform: 'scale(0) rotate(0)', opacity: 1 }, { transform: 'scale(1) rotate(45deg)', opacity: 1, offset: .5 }, { transform: 'scale(0) rotate(90deg)', opacity: 0 }],
          { duration: 900, delay: dl + j * 90, easing: 'ease-out', fill: 'backwards' });
      }
    }
  }

  function spray(el) {
    var items = [].slice.call(el.querySelectorAll('[data-sp]'), 0, 4);
    var W = root.offsetWidth;
    (items.length ? items : [el]).forEach(function (it, i) {
      later(function () {
        var b = box(it);
        if (b.x > W - 40) return;
        burst(Math.min(b.x + b.w - 30, W - 70), b.y + 28, { bottle: true, sparkle: true });
        var sh = it.querySelector('[data-sheen]');
        if (sh && sh.animate && !reduceMotion) {
          sh.animate([{ transform: 'translateX(-110%)' }, { transform: 'translateX(110%)' }], { duration: 1000, delay: 300, easing: 'cubic-bezier(.5,0,.3,1)' });
        }
      }, i * 280);
    });
  }

  function sparkleAround(el) {
    var b = box(el);
    for (var i = 0; i < 5; i++) {
      (function (k) {
        later(function () { burst(b.x + b.w * (0.15 + Math.random() * 0.7), b.y + b.h * (0.1 + Math.random() * 0.6), { sparkle: true }); }, 200 + k * 150);
      })(i);
    }
  }

  /* ---------- Fog wipe on the service photos ---------- */
  var fogs = new Map();

  function initFog(c) {
    if (!c) return;
    var W = c.offsetWidth, H = c.offsetHeight;
    if (!W || !H) return;
    var d = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(W * d); c.height = Math.round(H * d);
    var g = c.getContext('2d');
    g.setTransform(d, 0, 0, d, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(226,236,247,0.9)'; g.fillRect(0, 0, W, H);
    var area = W * H, i;
    for (i = 0; i < Math.min(50, 8 + area / 9000); i++) {
      var x = Math.random() * W, y = Math.random() * H, r = 12 + Math.random() * Math.min(80, W * 0.2);
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(140,128,104,0.16)'); gr.addColorStop(1, 'rgba(140,128,104,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineCap = 'round';
    for (i = 0; i < Math.min(14, 3 + W / 50); i++) {
      var sx = Math.random() * W; g.lineWidth = 1 + Math.random() * 2.5;
      g.beginPath(); g.moveTo(sx, Math.random() * H * 0.3);
      g.bezierCurveTo(sx + 8, H * 0.45, sx - 8, H * 0.6, sx + Math.random() * 14 - 7, H * (0.55 + Math.random() * 0.45)); g.stroke();
    }
    for (i = 0; i < Math.min(520, area / 500); i++) {
      g.fillStyle = 'rgba(255,255,255,' + (0.35 + Math.random() * 0.45) + ')';
      g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 0.6 + Math.random() * 2, 0, 7); g.fill();
    }
    c.style.background = 'transparent'; c.style.opacity = '1';
    fogs.set(c, { g: g, W: W, H: H, done: false, busy: false });
  }

  function wipeSeg(g, a, b, lw) {
    g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = lw; g.shadowColor = '#000'; g.shadowBlur = 16; g.strokeStyle = '#000';
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x + 0.01, b.y); g.stroke();
  }

  function makeCloth() {
    var d = document.createElement('div');
    d.style.cssText = 'position:absolute;left:0;top:0;width:64px;height:48px;margin:-24px 0 0 -32px;border-radius:14px 18px 12px 20px;background-color:#FFE14A;background-image:repeating-linear-gradient(45deg,rgba(0,0,0,.05) 0 2px,transparent 2px 6px);box-shadow:inset 0 -6px 0 rgba(0,0,0,.08),0 10px 20px rgba(11,36,99,.25);opacity:0;transition:opacity .25s;pointer-events:none';
    fxLayer.appendChild(d);
    return d;
  }

  function autoWipe(c) {
    if (!c) return;
    var f = fogs.get(c);
    if (!f) { initFog(c); f = fogs.get(c); }
    if (!f || f.busy || f.done) return;
    if (reduceMotion) { f.done = true; c.style.opacity = '0'; return; }
    f.busy = true;
    var W = f.W, H = f.H;
    var rows = Math.max(2, Math.min(4, Math.round(H / Math.max(110, W * 0.38))));
    var lw = Math.max(44, H / rows * 1.3), pts = [];
    for (var r = 0; r < rows; r++) {
      var y = H * (r + .5) / rows, ltr = r % 2 === 0;
      for (var i = 0; i <= 18; i++) {
        var t = i / 18;
        pts.push({ x: W * (ltr ? -0.06 + 1.12 * t : 1.06 - 1.12 * t), y: y + Math.sin(t * Math.PI * 2) * H * 0.025 });
      }
    }
    var cloth = makeCloth(), N = pts.length - 1, dur = 560 * rows + 200, last = 0, t0 = null;
    function step(now) {
      if (t0 === null) { t0 = now; cloth.style.opacity = '1'; }
      var tt = Math.min(1, (now - t0) / dur), k = Math.round(tt * N);
      for (var j = last + 1; j <= k; j++) wipeSeg(f.g, pts[j - 1], pts[j], lw);
      last = Math.max(last, k);
      var p = pts[k], q = pts[Math.max(0, k - 1)], b = box(c);
      cloth.style.transform = 'translate(' + (b.x + p.x) + 'px,' + (b.y + p.y) + 'px) rotate(' + Math.max(-22, Math.min(22, (p.x - q.x) * 0.8)) + 'deg)';
      if (tt < 1) { requestAnimationFrame(step); return; }
      cloth.style.opacity = '0';
      later(function () { cloth.remove(); }, 320);
      c.style.opacity = '0'; f.done = true; f.busy = false;
      burst(b.x + b.w * 0.7, b.y + b.h * 0.3, { sparkle: true });
      later(function () { burst(b.x + b.w * 0.3, b.y + b.h * 0.62, { sparkle: true }); }, 160);
    }
    requestAnimationFrame(step);
  }

  function refog() { fogs.forEach(function (f, c) { if (!f.done && !f.busy) initFog(c); }); }
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = later(refog, 120); });

  /* ---------- Hero review rotator ---------- */
  (function heroReviews() {
    var card = $('heroReview'), quote = $('heroQuote'), avatar = $('heroAvatar'), name = $('heroName'), dotsWrap = $('heroDots');
    if (!card || !quote) return;
    var dots = [].slice.call(dotsWrap.querySelectorAll('.dot'));
    var current = 0, paused = false;
    function show(i) {
      current = (i + HERO_REVIEWS.length) % HERO_REVIEWS.length;
      var r = HERO_REVIEWS[current];
      function swap() {
        quote.textContent = '\u201C' + r.pull + '\u201D';
        avatar.src = r.avatar;
        name.textContent = r.name;
        quote.classList.remove('is-fading');
      }
      if (reduceMotion) swap(); else { quote.classList.add('is-fading'); later(swap, 200); }
      dots.forEach(function (d, k) {
        d.classList.toggle('is-active', k === current);
        if (k === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });
    card.addEventListener('pointerenter', function () { paused = true; });
    card.addEventListener('pointerleave', function () { paused = false; });
    card.addEventListener('focusin', function () { paused = true; });
    card.addEventListener('focusout', function () { paused = false; });
    setInterval(function () { if (!paused && !document.hidden) show(current + 1); }, 5500);
  })();

  /* ---------- Reviews scroller arrows ---------- */
  (function reviewArrows() {
    var row = $('reviewRow');
    if (!row) return;
    function go(dir) { row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    $('revPrev').addEventListener('click', function () { go(-1); });
    $('revNext').addEventListener('click', function () { go(1); });
  })();

  /* ---------- Before / after slider ---------- */
  var ba = $('ba'), baAfter = $('baAfter'), baHandle = $('baHandle'), baGrip = $('baGrip');
  var baDrag = false, baRaf = 0, baPos = 50;

  function setBA(p) {
    baPos = p;
    baAfter.style.clipPath = 'inset(0 0 0 ' + p + '%)';
    baHandle.style.left = p + '%';
    baGrip.setAttribute('aria-valuenow', String(Math.round(p)));
    baGrip.setAttribute('aria-valuetext', Math.round(100 - p) + '% after showing');
  }

  function baAuto() {
    if (reduceMotion) { setBA(50); return; }
    var segs = [[97, 4, 1700], [4, 50, 700]], si = 0, t0 = null, lastB = 0;
    function step(now) {
      if (baDrag) return;
      if (t0 === null) t0 = now;
      var s = segs[si], t = Math.min(1, (now - t0) / s[2]);
      var e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setBA(s[0] + (s[1] - s[0]) * e);
      if (si === 0 && now - lastB > 160) {
        lastB = now;
        var hb = box(baHandle);
        burst(hb.x, hb.y + hb.h * (0.3 + Math.random() * 0.4), { sparkle: Math.random() > 0.5 });
      }
      if (t < 1) baRaf = requestAnimationFrame(step);
      else if (++si < segs.length) { t0 = null; baRaf = requestAnimationFrame(step); }
    }
    baRaf = requestAnimationFrame(step);
  }

  if (ba && baGrip) {
    if (!reduceMotion) setBA(97); // starts mostly "before", then sweeps when scrolled into view
    baGrip.addEventListener('pointerdown', function (e) {
      baDrag = true; cancelAnimationFrame(baRaf);
      if (baGrip.setPointerCapture) baGrip.setPointerCapture(e.pointerId);
    });
    baGrip.addEventListener('pointermove', function (e) {
      if (!baDrag) return;
      var r = ba.getBoundingClientRect();
      setBA(Math.max(2, Math.min(98, (e.clientX - r.left) / r.width * 100)));
    });
    function up() { baDrag = false; }
    baGrip.addEventListener('pointerup', up);
    baGrip.addEventListener('pointercancel', up);
    baGrip.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 5, p = null;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') p = baPos - step;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') p = baPos + step;
      else if (e.key === 'Home') p = 2;
      else if (e.key === 'End') p = 98;
      if (p === null) return;
      e.preventDefault(); cancelAnimationFrame(baRaf); baDrag = false;
      setBA(Math.max(2, Math.min(98, p)));
    });
  }

  /* ---------- Quote chat ---------- */
  var chat = (function () {
    var log = $('chatLog'), opts = $('chatOpts'), form = $('chatForm'), done = $('chatDone');
    var nameIn = $('cfName'), contactIn = $('cfContact'), noteIn = $('cfNote'), hpIn = $('cfCompany'), errEl = $('chatErr');
    var quoteSection = $('quote'), chatCard = $('chatCard');
    var endpointMeta = document.querySelector('meta[name="enquiry-endpoint"]');
    var ENDPOINT = endpointMeta ? endpointMeta.getAttribute('content') : '';
    if (!log) return null;

    var state = { step: 'idle', typing: false, started: false, sending: false, source: 'chat', answers: { service: '', suburb: '', frequency: '' } };
    var timers = [];
    var typingEl = null;

    function wait(fn, ms) { timers.push(later(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function kevAvatar() {
      var img = document.createElement('img');
      img.className = 'msg-avatar'; img.src = 'assets/img/kev-photo.webp'; img.alt = ''; img.width = 30; img.height = 30;
      return img;
    }
    function addKev(text) {
      var row = document.createElement('div');
      row.className = 'msg-kev';
      var b = document.createElement('div');
      b.className = 'bubble-kev';
      var parts = text.split(PHONE_DISPLAY);
      parts.forEach(function (part, i) {
        b.appendChild(document.createTextNode(part));
        if (i < parts.length - 1) {
          var a = document.createElement('a');
          a.href = 'tel:' + PHONE_TEL; a.textContent = PHONE_DISPLAY;
          b.appendChild(a);
        }
      });
      row.appendChild(kevAvatar()); row.appendChild(b);
      log.appendChild(row);
    }
    function addMe(text) {
      var d = document.createElement('div');
      d.className = 'msg-me'; d.textContent = text;
      log.appendChild(d);
    }
    function setTyping(on) {
      state.typing = on;
      if (on && !typingEl) {
        typingEl = document.createElement('div');
        typingEl.className = 'typing';
        typingEl.setAttribute('aria-label', 'Kev is typing');
        var dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        typingEl.appendChild(kevAvatar()); typingEl.appendChild(dots);
        log.appendChild(typingEl);
      } else if (!on && typingEl) {
        typingEl.remove(); typingEl = null;
      }
    }

    function optionsFor(step) {
      if (step === 'service') return SERVICES;
      if (step === 'area') return SUBURBS;
      if (step === 'freq') return FREQUENCIES;
      return [];
    }
    function render() {
      var list = optionsFor(state.step);
      opts.innerHTML = '';
      list.forEach(function (label) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = label;
        b.addEventListener('click', function () { answer(state.step, label); });
        opts.appendChild(b);
      });
      opts.hidden = list.length === 0;
      form.hidden = state.step !== 'contact';
      done.hidden = state.step !== 'done';
    }
    function focusNext() {
      var el = state.step === 'contact' ? nameIn : opts.querySelector('.chip');
      if (state.step === 'done') el = $('chatAgain');
      if (el) el.focus();
    }

    var NEXT = { service: 'area', area: 'freq', freq: 'contact' };
    function kevSays(next, v) {
      if (next === 'area') return 'Nice one - ' + v.toLowerCase() + '. Which suburb are you in?';
      if (next === 'freq') return v + ', perfect. Is this a one-off or something ongoing?';
      return "Last thing - what's your name and the best way to reach you?";
    }
    function answer(step, value) {
      if (state.typing || state.step !== step) return;
      if (step === 'service') state.answers.service = value;
      if (step === 'area') state.answers.suburb = value;
      if (step === 'freq') state.answers.frequency = value;
      var next = NEXT[step];
      addMe(value);
      state.step = 'wait'; render(); setTyping(true);
      wait(function () {
        setTyping(false);
        state.step = next;
        addKev(kevSays(next, value));
        render(); focusNext();
      }, 750);
    }

    function start() {
      if (state.started) return;
      state.started = true;
      setTyping(true);
      wait(function () {
        setTyping(false);
        if (state.step === 'idle') {
          state.step = 'service';
          addKev(GREETING);
          render();
        }
      }, 900);
    }

    function reset(source) {
      clearTimers(); setTyping(false);
      log.innerHTML = '';
      state.started = true; state.sending = false; state.source = source || 'chat';
      state.answers = { service: '', suburb: '', frequency: '' };
      setError('');
    }
    function restart() {
      reset('chat');
      nameIn.value = ''; contactIn.value = ''; noteIn.value = '';
      state.step = 'service';
      addKev(GREETING);
      render(); focusNext();
    }
    function pickService(label) {
      reset('service-tile');
      state.answers.service = label;
      addKev(GREETING); addMe(label); addKev(kevSays('area', label));
      state.step = 'area';
      render();
      var top = quoteSection.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      wait(function () { var c = opts.querySelector('.chip'); if (c) c.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
    }

    /* Contact detection: an email address or an Australian phone number. */
    function parseContact(raw) {
      var v = raw.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return { type: 'email', value: v.toLowerCase() };
      var digits = v.replace(/[\s\-().]/g, '');
      if (/^\+61/.test(digits)) digits = '0' + digits.slice(3);
      else if (/^61\d{9}$/.test(digits)) digits = '0' + digits.slice(2);
      if (/^04\d{8}$/.test(digits)) return { type: 'phone', value: digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7) };
      if (/^0[2378]\d{8}$/.test(digits)) return { type: 'phone', value: digits.slice(0, 2) + ' ' + digits.slice(2, 6) + ' ' + digits.slice(6) };
      return null;
    }
    function setError(msg, field) {
      [nameIn, contactIn].forEach(function (f) { f.removeAttribute('aria-invalid'); });
      if (!msg) { errEl.hidden = true; errEl.textContent = ''; return; }
      errEl.textContent = msg; errEl.hidden = false;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    }

    function send(payload) {
      if (!ENDPOINT || ENDPOINT.indexOf('supabase.co') === -1) {
        console.warn('Enquiry endpoint not set in index.html (meta name=enquiry-endpoint).');
        return Promise.reject(new Error('endpoint not configured'));
      }
      var ctrl = window.AbortController ? new AbortController() : null;
      var t = ctrl ? later(function () { ctrl.abort(); }, 15000) : null;
      return fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        if (t) clearTimeout(t);
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error((data && data.error) || ('HTTP ' + res.status));
          return data;
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.sending || state.step !== 'contact') return;
      var name = nameIn.value.trim(), contactRaw = contactIn.value.trim(), note = noteIn.value.trim();
      if (!name) return setError('What should Kev call you?', nameIn);
      if (!contactRaw) return setError('Add a phone number or email so Kev can reply.', contactIn);
      var contact = parseContact(contactRaw);
      if (!contact) return setError("That doesn't look like a phone number or email. Try 04xx xxx xxx or name@example.com.", contactIn);
      setError('');

      var payload = {
        service: state.answers.service,
        suburb: state.answers.suburb,
        frequency: state.answers.frequency,
        name: name,
        contact: contact.value,
        contactType: contact.type,
        email: contact.type === 'email' ? contact.value : '',
        phone: contact.type === 'phone' ? contact.value : '',
        note: note,
        source: state.source,
        pageUrl: window.location.href,
        submittedAt: new Date().toISOString(),
        company: hpIn ? hpIn.value : ''
      };

      state.sending = true;
      addMe(name + ' · ' + contact.value + (note ? ' - ' + note : ''));
      state.step = 'wait'; render(); setTyping(true);

      var minDelay = new Promise(function (r) { later(r, 850); });
      Promise.all([send(payload), minDelay]).then(function () {
        setTyping(false); state.sending = false;
        var first = name.split(/\s+/)[0];
        addKev('Thanks ' + first + "! Got everything I need. I'll be in touch shortly to sort out your free quote.");
        state.step = 'done'; render(); focusNext();
        var b = box(chatCard);
        for (var i = 0; i < 6; i++) {
          (function (k) { later(function () { burst(b.x + b.w * (0.15 + Math.random() * 0.7), b.y + b.h * (0.15 + Math.random() * 0.6), { sparkle: true }); }, k * 110); })(i);
        }
      }).catch(function (err) {
        minDelay.then(function () {
          setTyping(false); state.sending = false;
          if (window.console) console.error('Enquiry failed:', err);
          addKev("Hmm, that didn't send. Give me a call on " + PHONE_DISPLAY + '.');
          state.step = 'contact'; render(); // inputs keep what the person typed
        });
      });
    });

    [nameIn, contactIn, noteIn].forEach(function (f) { f.addEventListener('input', function () { if (!errEl.hidden) setError(''); }); });
    $('chatRestart').addEventListener('click', restart);
    $('chatAgain').addEventListener('click', restart);

    // Service tiles jump to the chat with the service already answered.
    [].slice.call(document.querySelectorAll('.tile[data-service]')).forEach(function (t) {
      t.addEventListener('click', function () { pickService(t.getAttribute('data-service')); });
    });

    render();
    return { start: start };
  })();

  /* ---------- Play each effect once, when 35% visible ---------- */
  var canvases = [].slice.call(document.querySelectorAll('[data-fx="fog"] canvas'));
  if (reduceMotion) canvases.forEach(function (c) { c.style.display = 'none'; });
  else canvases.forEach(initFog);

  function play(el) {
    var k = el.getAttribute('data-fx'), d = +(el.getAttribute('data-delay') || 0);
    if (k === 'fog') later(function () { autoWipe(el.querySelector('canvas')); }, d + 200);
    else if (k === 'hl') el.classList.add('is-on');
    else if (k === 'spray') spray(el);
    else if (k === 'spark') sparkleAround(el);
    else if (k === 'ba') later(baAuto, 300);
    else if (k === 'chat' && chat) chat.start();
  }

  var fxEls = [].slice.call(document.querySelectorAll('[data-fx]'));
  if (!('IntersectionObserver' in window)) {
    fxEls.forEach(play);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); play(e.target); }
      });
    }, { threshold: 0.35 });
    fxEls.forEach(function (e) { io.observe(e); });
  }
})();
