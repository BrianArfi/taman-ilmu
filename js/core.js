/* Taman Ilmu: inti aplikasi (menu, router, suara, bintang, helper kuis).
   Tanpa build step, jalan langsung dari file://. Game mendaftar lewat TI.register({...}).
   Kontrak lengkap untuk pembuat game ada di SPEC.md. */
(function () {
  'use strict';

  const STORE = 'tamanIlmu.v1'; // mirror: tetap ditulis supaya uji otomatis dan cache tab lama tetap kebaca
  const STORE2 = 'tamanIlmu.v2'; // state gamifikasi penuh (XP, plays, profil, pekan, streak)
  const CATS = {
    islam: { label: 'Agama Islam', icon: '🕌', color: '#0e9f6e' },
    mat: { label: 'Matematika', icon: '🔢', color: '#2f6fed' },
    sains: { label: 'Sains', icon: '🔬', color: '#9b4dde' },
    logika: { label: 'Logika', icon: '🧩', color: '#e8590c' },
  };
  const LEVELS = { tk: 'TK (4-6 tahun)', sd: 'SD (7-12 tahun)' };

  const state = loadState();
  // Migrasi sekali jalan: v1 (bintang saja) jadi v2 (plus XP, plays, profil, pekan).
  // Bintang lama utuh dan langsung dihitung jadi XP (10 per bintang + 15 per selesai).
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE2);
      if (raw) { const s = JSON.parse(raw); if (s && s.v === 2) return s; }
    } catch (e) { /* lanjut migrasi */ }
    let v1 = {};
    try { v1 = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { v1 = {}; }
    let xp = 0;
    const plays = {};
    const stars = v1.stars || {};
    for (const gid in stars) for (const jen in stars[gid]) {
      const s = stars[gid][jen] || 0;
      if (s > 0) { xp += 10 * s + 15; (plays[gid] = plays[gid] || {})[jen] = 1; }
    }
    return {
      v: 2,
      level: v1.level === 'sd' ? 'sd' : 'tk',
      sound: v1.sound !== false,
      tab: v1.tab || 'semua',
      stars, plays,
      profile: {
        nama: 'Bintang ' + (10 + Math.floor(Math.random() * 90)),
        playerId: '',
        xp, level: 1, badges: {}, namaChanged: false, seenNama: false,
        createdAt: new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10),
      },
      dayLog: {}, streak: { last: null, count: 0 }, weekly: null,
      share: {}, ajakSeen: null,
    };
  }
  function saveState() {
    try {
      localStorage.setItem(STORE2, JSON.stringify(state));
      localStorage.setItem(STORE, JSON.stringify({ level: state.level, sound: state.sound, tab: state.tab, stars: state.stars }));
    } catch (e) { /* mode privat */ }
  }

  const games = [];
  const TI = (window.TI = { games, CATS, LEVELS, state });

  // ---------- helper umum ----------
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    applyProps(el, props);
    appendKids(el, kids);
    return el;
  }
  function svg(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
      else el.setAttribute(k, v);
    }
    appendKids(el, kids);
    return el;
  }
  function applyProps(el, props) {
    if (!props) return;
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
      else if (/^on[a-z]+$/.test(k) && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  function appendKids(el, kids) {
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
  }
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  // Pilihan angka di sekitar jawaban, unik, dalam [min, max].
  function numChoices(answer, n = 3, min = 0, max = answer + 6) {
    const set = new Set([answer]);
    for (let g = 0; set.size < n && g < 300; g++) { const d = answer + rand(-4, 4); if (d >= min && d <= max) set.add(d); }
    for (let f = min; set.size < n; f++) set.add(f);
    return shuffle([...set]);
  }
  // Jawaban benar + (n-1) pengecoh berbeda dari pool, diacak.
  function optionsFrom(correct, pool, n = 3, same = (a, b) => a === b) {
    const others = shuffle(pool.filter((p) => !same(p, correct))).slice(0, n - 1);
    return shuffle([correct, ...others]);
  }
  const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
  function dots(n, cls) {
    const w = h('span', { class: 'ti-dots' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) w.append(h('i'));
    return w;
  }
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // CSS khusus satu game, dipasang sekali.
  function style(id, css) {
    if (document.querySelector('style[data-game-css="' + id + '"]')) return;
    document.head.append(h('style', { 'data-game-css': id }, css));
  }

  Object.assign(TI, { h, svg, rand, pick, shuffle, sample, numChoices, optionsFrom, rupiah, dots, reduced, style });

  // ---------- suara pembaca (speechSynthesis id-ID) ----------
  const PRON = window.TI_PRON || { ci: {}, cs: {} };
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ciLower = {};
  for (const [k, v] of Object.entries(PRON.ci)) ciLower[k.toLowerCase()] = v;
  const mkRe = (keys, flags) => keys.length
    ? new RegExp('(?<![\\p{L}\\p{N}\'])(?:' + keys.sort((a, b) => b.length - a.length).map(escRe).join('|') + ')(?![\\p{L}\\p{N}])', flags)
    : null;
  const ciRe = mkRe(Object.keys(PRON.ci), 'giu');
  const csRe = mkRe(Object.keys(PRON.cs), 'gu');

  function speechText(text) {
    let t = String(text == null ? '' : text);
    t = t.replace(/[‘’ʼʻ`]/g, "'");
    t = t.replace(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+/g, ' '); // huruf Arab tidak dibaca suara Indonesia
    t = t.replace(/[\p{Extended_Pictographic}‍️⃣]/gu, ' '); // emoji tidak dibaca
    t = t.replace(new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']', 'g'), ', '); // tanda pisah panjang dibaca sebagai jeda
    if (csRe) t = t.replace(csRe, (m) => (m in PRON.cs ? PRON.cs[m] : m));
    if (ciRe) t = t.replace(ciRe, (m) => ciLower[m.toLowerCase()] ?? m);
    t = t.replace(/(?<![\p{L}])allah(?![\p{L}])/giu, 'aul loh'); // jaring pengaman: "Allah" selalu "aul loh"
    return t.replace(/\s+/g, ' ').trim();
  }
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^(id|in)([-_]|$)/i.test(v.lang));
    voice = vs.find((v) => /gadis/i.test(v.name)) || vs.find((v) => /natural|online/i.test(v.name)) ||
      vs.find((v) => /google/i.test(v.name)) || vs[0] || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function say(text, opts = {}) {
    if (!state.sound || !('speechSynthesis' in window)) return Promise.resolve();
    const t = speechText(text);
    if (!t) return Promise.resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = voice ? voice.lang : 'id-ID';
    if (voice) u.voice = voice;
    u.rate = opts.rate || (state.level === 'tk' ? 0.9 : 1);
    u.pitch = opts.pitch || 1.1;
    return new Promise((res) => {
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 2000 + t.length * 90);
    });
  }
  function hush() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  // ---------- efek suara (WebAudio, tanpa file, tanpa musik) ----------
  let ac = null;
  function audio() {
    if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, t0, len, type, vol, freqEnd) {
    const a = audio(); if (!a) return;
    const now = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, now);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, now + len);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + len);
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + len + 0.03);
  }
  const SFX = {
    tap: () => tone(660, 0, 0.06, 'triangle', 0.1),
    benar: () => { tone(880, 0, 0.12, 'sine', 0.18); tone(1320, 0.09, 0.2, 'sine', 0.16); },
    salah: () => tone(240, 0, 0.24, 'triangle', 0.16, 150),
    pop: () => tone(950, 0, 0.09, 'sine', 0.2, 280),
    whoosh: () => tone(260, 0, 0.3, 'sawtooth', 0.04, 900),
    splash: () => tone(520, 0, 0.32, 'sine', 0.12, 110),
    klik: () => tone(1200, 0, 0.03, 'square', 0.05),
    flip: () => tone(500, 0, 0.08, 'triangle', 0.08, 700),
    menang: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'sine', 0.14)),
  };
  function sfx(name) { if (!state.sound) return; try { (SFX[name] || SFX.tap)(); } catch (e) { /* audio diblokir */ } }
  TI.say = say; TI.sfx = sfx; TI.speechText = speechText; TI.save = saveState;

  // ---------- registrasi ----------
  TI.register = function (def) {
    if (!def || !def.id || typeof def.start !== 'function') { console.error('TI.register: game tidak valid', def); return; }
    if (games.some((g) => g.id === def.id)) { console.error('TI.register: id dobel', def.id); return; }
    games.push(def);
  };
  const byId = (id) => games.find((g) => g.id === id);
  const catOf = (g) => CATS[g.cat] || CATS.mat;

  // ---------- router ----------
  const root = () => document.getElementById('app');
  let current = null; // sesi game aktif

  function route() {
    const vm = location.hash.match(/^#\/(papan|lencana|nama)$/);
    if (vm && TI.VIEWS && TI.VIEWS[vm[1]]) { closeGame(); TI.VIEWS[vm[1]](); return; }
    const m = location.hash.match(/^#\/main\/([\w-]+)/);
    const g = m && byId(m[1]);
    if (g) openGame(g); else showHome();
  }

  // Kerangka layar dalam (#/papan #/lencana #/nama). Dipakai modul lewat TI.page(...).
  TI.page = function (title, sub, ...kids) {
    document.title = title + ' · Taman Ilmu';
    const app = root();
    app.replaceChildren();
    app.append(
      h('header', { class: 'page-head' },
        h('a', { class: 'icon-btn back', href: '#/', 'aria-label': 'Kembali ke menu', onclick: () => sfx('tap') }, '←'),
        h('div', { class: 'page-title' }, h('h2', null, title), sub ? h('p', null, sub) : null)),
      ...kids);
    return app;
  };

  // ---------- beranda ----------
  function totalStars() {
    return games.reduce((s, g) => s + ((state.stars[g.id] || {})[state.level] || 0), 0);
  }
  function starRow(n, cls) {
    const w = h('span', { class: 'stars ' + (cls || ''), 'aria-label': n + ' dari 3 bintang' });
    for (let i = 0; i < 3; i++) w.append(h('span', { class: 'star' + (i < n ? ' is-on' : '') }, '★'));
    return w;
  }
  // pips kemahiran: 4 berlian kecil, terisi sesuai tier (0 baru, 1 perunggu, 2 perak, 3 emas, 4 jago)
  function pips(t) {
    const w = h('span', { class: 'pips', 'aria-label': 'Kemahiran ' + t + ' dari 4' });
    for (let i = 0; i < 4; i++) w.append(h('i', { class: i < t ? 'is-on' : '' }));
    return w;
  }
  let lastUnlocked = null; // baseline unlock tiap sesi: kartu yang baru terbuka dapat animasi pop
  let freshSfxAt = 0;
  function sfxOnce(name) {
    const t = Date.now();
    if (t - freshSfxAt > 700) { freshSfxAt = t; sfx(name); }
  }
  function showHome() {
    closeGame();
    document.title = 'Taman Ilmu';
    const app = root();
    app.replaceChildren();
    const lvlBtn = (id, label) => h('button', {
      type: 'button', class: 'seg-btn', 'aria-pressed': String(state.level === id),
      onclick: () => { state.level = id; saveState(); sfx('tap'); showHome(); },
    }, label);
    const soundBtn = h('button', {
      type: 'button', class: 'icon-btn', 'aria-label': state.sound ? 'Matikan suara' : 'Nyalakan suara',
      onclick: () => { state.sound = !state.sound; saveState(); if (!state.sound) hush(); showHome(); },
    }, state.sound ? '🔊' : '🔇');

    const head = h('header', { class: 'home-head' },
      h('div', { class: 'brand' },
        h('span', { class: 'brand-mark', 'aria-hidden': 'true' }, '🌙'),
        h('div', null, h('h1', null, 'Taman Ilmu'), h('p', null, 'Main sambil belajar agama, matematika, dan sains'))),
      h('div', { class: 'head-tools' },
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Pilih jenjang' }, lvlBtn('tk', 'TK'), lvlBtn('sd', 'SD')),
        soundBtn,
        h('div', { class: 'star-total', title: 'Bintang terkumpul' }, h('span', { class: 'star is-on' }, '★'), ' ', totalStars(), h('small', null, ' / ' + games.length * 3))));

    // strip pemain: level + XP + nama + lencana + papan juara
    const Pr = TI.Progression;
    const prof = state.profile;
    const info = Pr.levelInfo(prof.xp || 0);
    const frac = Math.max(0, Math.min(1, info.maxed ? 1 : ((prof.xp || 0) - info.base) / (info.next - info.base)));
    const CIRC = 2 * Math.PI * 17;
    const ring = svg('svg', { class: 'lvl-ring', viewBox: '0 0 44 44', 'aria-hidden': 'true' },
      svg('circle', { cx: 22, cy: 22, r: 17, class: 'ring-bg' }),
      svg('circle', { cx: 22, cy: 22, r: 17, class: 'ring-fg', transform: 'rotate(-90 22 22)', style: 'stroke-dasharray:' + CIRC.toFixed(1) + ';stroke-dashoffset:' + (CIRC * (1 - frac)).toFixed(1) }),
      svg('text', { x: 22, y: 27, 'text-anchor': 'middle', class: 'ring-n', text: info.level }));
    const tea = TI.Badges.teaserIcons(3);
    const strip = h('div', { class: 'player-strip pop-in' },
      h('button', { type: 'button', class: 'strip-lvl', 'aria-label': 'Ganti nama panggilan', onclick: () => { sfx('tap'); location.hash = '#/nama'; } },
        ring,
        h('span', { class: 'strip-meta' },
          h('b', null, 'Lv ' + info.level + ' ' + info.name),
          h('span', { class: 'strip-nama' }, prof.nama || ''))),
      h('div', { class: 'strip-mid' },
        h('div', { class: 'xp-bar', role: 'progressbar', 'aria-label': 'XP pemain', 'aria-valuenow': String(prof.xp || 0), 'aria-valuemax': String(info.next) },
          h('i', { class: 'xp-fill', style: { transform: 'scaleX(' + frac + ')' } })),
        h('span', { class: 'xp-txt' }, (prof.xp || 0) + ' / ' + info.next + ' XP'),
        h('button', { type: 'button', class: 'strip-badges', 'aria-label': 'Lihat lencana', onclick: () => { sfx('tap'); location.hash = '#/lencana'; } },
          tea.icons.map((ic) => h('span', { class: 'tea-ic', 'aria-hidden': 'true' }, ic)),
          h('span', { class: 'strip-more' }, tea.icons.length ? '+' + tea.more + ' lagi' : '0 / ' + tea.total))),
      h('a', { class: 'ti-btn strip-board', href: '#/papan', onclick: () => sfx('tap') }, '🏆 Papan'));

    // tantangan pekan (rotasi deterministik, reset tiap Senin WIB)
    const ch = Pr.challengeGame();
    const chDone = !!(state.weekly && state.weekly.weekKey === Pr.weekKey() && state.weekly.tantanganDone);
    const tantangan = ch ? h('div', { class: 'tantangan' + (chDone ? ' is-done' : '') },
      h('span', { class: 'tan-icon', 'aria-hidden': 'true' }, ch.icon || '🎯'),
      h('div', { class: 'tan-body' },
        h('b', null, 'Tantangan Pekan Ini: ' + ch.title),
        h('span', { class: 'tan-note' }, 'Raih 2 bintang di game ini untuk +40 XP')),
      chDone ? h('span', { class: 'tan-done' }, '✓ Selesai')
        : h('a', { class: 'ti-btn tan-go', href: '#/main/' + ch.id, onclick: () => sfx('tap') }, 'Main'))
      : null;

    const tabs = [['semua', 'Semua', '✨'], ...Object.entries(CATS).map(([k, c]) => [k, c.label, c.icon])];
    const nav = h('nav', { class: 'tabs', 'aria-label': 'Kategori' }, tabs.map(([k, label, ic]) => h('button', {
      type: 'button', class: 'tab', 'aria-pressed': String(state.tab === k),
      onclick: () => { state.tab = k; saveState(); showHome(); },
    }, h('span', { 'aria-hidden': 'true' }, ic), ' ', label,
      h('span', { class: 'tab-n' }, k === 'semua' ? games.length : games.filter((g) => g.cat === k).length))));

    // banner nama hanya pemain baru: inline di beranda, bukan modal
    const banner = prof.seenNama ? null : h('div', { class: 'nama-banner pop-in' },
      h('span', { class: 'nama-banner-txt' }, 'Siapa namamu? Pilih nama panggilan biar tampil di papan juara.'),
      h('a', { class: 'ti-btn nama-btn', href: '#/nama', onclick: () => sfx('tap') }, 'Pilih Nama'),
      h('button', { type: 'button', class: 'nama-later', 'aria-label': 'Nanti saja', onclick: () => { prof.seenNama = true; saveState(); showHome(); } }, 'Nanti'));

    // banner ajakan dari link ?ajak=Nama (hasil tombol Bagikan teman)
    let ajak = null;
    try { ajak = new URLSearchParams(location.search).get('ajak'); } catch (e) { /* tanpa query */ }
    const ajakBanner = ajak && state.ajakSeen !== ajak
      ? h('div', { class: 'ajak-banner pop-in', role: 'status' },
        h('span', { class: 'ajak-txt' }, '🌟 ', h('b', null, ajak), ' mengajakmu main Taman Ilmu! Pilih jenjangmu, lalu mainkan gamenya.'),
        h('button', { type: 'button', class: 'nama-later', 'aria-label': 'Tutup', onclick: () => { state.ajakSeen = ajak; saveState(); showHome(); } }, 'Tutup'))
      : null;

    const list = games.filter((g) => state.tab === 'semua' || g.cat === state.tab);
    const unlocked = Pr.unlockedSet();
    const freshOpen = [];
    if (lastUnlocked) for (const id of unlocked) if (!lastUnlocked.has(id)) freshOpen.push(id);
    lastUnlocked = unlocked;
    const grid = h('section', { class: 'grid', 'aria-label': 'Daftar game' });
    list.forEach((g, i) => {
      const c = catOf(g);
      const open = unlocked.has(g.id);
      const best = (state.stars[g.id] || {})[state.level] || 0;
      const arabicIcon = /[؀-ۿ]/.test(g.icon || '');
      if (open) {
        const isNew = freshOpen.includes(g.id);
        if (isNew) sfxOnce('benar');
        grid.append(h('a', {
          class: 'card' + (isNew ? ' pop-new' : ''), href: '#/main/' + g.id, style: '--c:' + c.color + ';--i:' + i,
          onclick: () => sfx('tap'),
        },
        h('span', { class: 'card-icon' + (arabicIcon ? ' ti-arabic' : ''), 'aria-hidden': 'true' }, g.icon || c.icon),
        h('span', { class: 'card-body' },
          h('span', { class: 'card-cat' }, c.label),
          h('span', { class: 'card-title' }, g.title),
          h('span', { class: 'card-desc' }, g.desc || '')),
        h('span', { class: 'card-foot' }, pips(Pr.tier(g.id, state.level)),
          h('span', { class: 'card-best', 'aria-label': 'Bintang terbaik di jenjang ini' }, best ? '★' + best : ''))));
      } else {
        const req = Pr.reqText(g);
        grid.append(h('button', {
          type: 'button', class: 'card is-locked', style: '--c:' + c.color + ';--i:' + i,
          'aria-label': g.title + ', terkunci. ' + req,
          onclick: (ev) => {
            sfx('salah');
            say(req);
            const el = ev.currentTarget;
            el.classList.remove('is-shake'); void el.offsetWidth; el.classList.add('is-shake');
          },
        },
        h('span', { class: 'card-icon is-dim' + (arabicIcon ? ' ti-arabic' : ''), 'aria-hidden': 'true' }, g.icon || c.icon),
        h('span', { class: 'card-body' },
          h('span', { class: 'card-cat' }, c.label),
          h('span', { class: 'card-title' }, g.title),
          h('span', { class: 'card-desc' }, g.desc || '')),
        h('span', { class: 'card-lock', 'aria-hidden': 'true' }, '🔒'),
        h('span', { class: 'card-req' }, req)));
      }
    });
    if (!list.length) grid.append(h('p', { class: 'empty' }, 'Belum ada game di kategori ini.'));

    app.append(head, strip);
    if (tantangan) app.append(tantangan);
    app.append(
      h('p', { class: 'level-note' }, 'Jenjang: ', h('b', null, LEVELS[state.level]), '. Soal menyesuaikan jenjang ini.'),
      nav);
    if (banner) app.append(banner);
    if (ajakBanner) app.append(ajakBanner);
    app.append(grid,
      h('footer', { class: 'home-foot' },
        h('button', { type: 'button', class: 'ajak-btn', 'aria-label': 'Ajak teman main Taman Ilmu', onclick: () => { sfx('tap'); if (TI.Share) TI.Share.invite(); } }, '📣 Ajak teman main'),
        h('span', null, 'Dibuat untuk anak-anak. Tanpa iklan. Papan juara butuh internet, sisanya main offline.')));
  }

  // ---------- layar game ----------
  function closeGame() {
    if (!current) return;
    const s = current; current = null;
    s.ctx.alive = false;
    s.cleanup.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    hush();
  }

  function openGame(g) {
    closeGame();
    const level = state.level;
    const c = catOf(g);
    document.title = g.title + ' · Taman Ilmu';
    const app = root();
    app.replaceChildren();

    const bar = h('span', { class: 'progress-bar' });
    const promptText = h('p', { class: 'prompt-text', 'aria-live': 'polite' });
    const stage = h('main', { class: 'stage', id: 'stage' });
    const shell = h('div', { class: 'play lvl-' + level, style: '--c:' + c.color, 'data-game': g.id },
      h('header', { class: 'play-head' },
        h('a', { class: 'icon-btn back', href: '#/', 'aria-label': 'Kembali ke menu', onclick: () => sfx('tap') }, '←'),
        h('div', { class: 'play-title' },
          h('span', { 'aria-hidden': 'true', class: 'play-icon' + (/[؀-ۿ]/.test(g.icon || '') ? ' ti-arabic' : '') }, g.icon || c.icon),
          h('span', { class: 'play-name' }, g.title),
          h('span', { class: 'play-level' }, level.toUpperCase())),
        h('span', { class: 'progress', role: 'progressbar', 'aria-label': 'Kemajuan' }, bar)),
      h('div', { class: 'prompt' }, promptText,
        h('button', { type: 'button', class: 'icon-btn say-again', 'aria-label': 'Dengar lagi', onclick: () => ctx.lastSpoken && say(ctx.lastSpoken) }, '🔊')),
      stage);
    app.append(shell);

    const session = { game: g, cleanup: [], ctx: null };
    const ctx = makeCtx(g, level, { stage, promptText, bar, shell, session });
    session.ctx = ctx;
    current = session;

    try {
      const ret = g.start(ctx);
      if (typeof ret === 'function') session.cleanup.push(ret);
      if (ret && typeof ret.catch === 'function') ret.catch(fail);
    } catch (e) { fail(e); }

    function fail(e) {
      console.error('Game error [' + g.id + ']', e);
      if (!ctx.alive) return;
      stage.replaceChildren(h('div', { class: 'ti-panel' },
        h('p', { class: 'ti-big' }, '🛠️'), h('p', null, 'Waduh, game ini lagi rusak. Coba game lain dulu ya.')));
    }
  }

  // ---------- konteks game (API untuk pembuat game, lihat SPEC.md) ----------
  const PRAISE = ['Benar!', 'Hebat!', 'Pintar!', 'Betul sekali!', 'Keren!', 'Alhamdulillah, benar!'];
  const OOPS = ['Coba lagi ya.', 'Hampir! Coba lagi.', 'Belum tepat, ayo coba lagi.'];

  function makeCtx(game, level, els) {
    const cleanup = els.session.cleanup;
    let finished = false;
    const ctx = {
      game, level, el: els.stage, alive: true, mistakes: 0, total: 0, lastSpoken: '',
      isTK: level === 'tk', isSD: level === 'sd',
      h, svg, say, sfx, hush,

      ask(text, opts = {}) {
        els.promptText.textContent = text;
        ctx.lastSpoken = opts.say != null ? opts.say : text;
        return opts.speak === false ? Promise.resolve() : say(ctx.lastSpoken);
      },
      sayWait(text) {
        const n = String(text).length;
        if (!state.sound) return ctx.wait(Math.min(3500, 700 + n * 35)); // tanpa suara: cukup waktu membaca
        return Promise.race([say(text), ctx.wait(Math.min(7000, 1200 + n * 65))]);
      },
      clear() { els.stage.replaceChildren(); },
      progress(done, total) {
        ctx.total = total;
        const p = total ? Math.max(0, Math.min(1, done / total)) : 0;
        els.bar.style.transform = 'scaleX(' + p + ')';
        els.bar.parentElement.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      },
      after(ms, fn) {
        const id = setTimeout(() => { if (ctx.alive) fn(); }, ms);
        cleanup.push(() => clearTimeout(id));
        return id;
      },
      wait(ms) { return new Promise((res) => ctx.after(ms, res)); },
      every(ms, fn) {
        const id = setInterval(() => { if (ctx.alive) fn(); }, ms);
        const stop = () => clearInterval(id);
        cleanup.push(stop);
        return stop;
      },
      loop(fn) {
        let last = performance.now(), id = 0, stopped = false;
        const step = (now) => {
          if (stopped || !ctx.alive) return;
          const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
          if (fn(dt, now) === false) { stopped = true; return; }
          id = requestAnimationFrame(step);
        };
        id = requestAnimationFrame(step);
        const stop = () => { stopped = true; cancelAnimationFrame(id); };
        cleanup.push(stop);
        return stop;
      },
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        cleanup.push(() => target.removeEventListener(type, fn, opts));
      },
      onExit(fn) { cleanup.push(fn); },

      correct(el, opts = {}) {
        sfx(opts.sfx || 'benar');
        if (el) { el.classList.remove('is-wrong'); el.classList.add('is-correct'); }
        let p = Promise.resolve();
        if (opts.say !== false) {
          const praise = typeof opts.say === 'string' ? opts.say : pick(PRAISE);
          p = say(opts.prefix ? opts.prefix + '. ' + praise : praise);
        }
        return Promise.race([Promise.all([p, ctx.wait(opts.min || 650)]), ctx.wait(opts.max || 1800)]);
      },
      wrong(el, opts = {}) {
        ctx.mistakes++;
        sfx('salah');
        if (el) {
          el.classList.remove('is-wrong'); void el.offsetWidth; el.classList.add('is-wrong');
          ctx.after(450, () => el.classList.remove('is-wrong'));
        }
        if (opts.say !== false) {
          const msg = typeof opts.say === 'string' ? opts.say : pick(OOPS);
          say(opts.prefix ? opts.prefix + '. ' + msg : msg);
        }
        return ctx.wait(opts.min || 450);
      },

      // Tombol pilihan ganda. Resolve saat jawaban benar dipilih: { firstTry, value }.
      choose(opts) {
        const { options, answer, into, layout, retry = true } = opts;
        const speakLabel = opts.speakLabel != null ? opts.speakLabel : ctx.isTK;
        const isAns = typeof answer === 'function' ? answer : (v) => v === answer;
        return new Promise((resolve) => {
          const wrap = into || h('div', { class: 'ti-choices' + (layout ? ' ' + layout : '') });
          if (!into) els.stage.append(wrap);
          let first = true, locked = false;
          const btns = [], vals = [];
          options.forEach((o, i) => {
            const opt = (o !== null && typeof o === 'object' && !o.nodeType) ? o : { label: o, value: o };
            const val = 'value' in opt ? opt.value : opt.label;
            vals.push(val);
            const content = opt.node || opt.label;
            const spoken = opt.say != null ? opt.say : (typeof content === 'string' || typeof content === 'number' ? String(content) : '');
            const btn = h('button', {
              type: 'button', class: 'choice pop-in' + (opt.cls ? ' ' + opt.cls : ''), style: '--i:' + i,
              'aria-label': opt.aria || (spoken || null),
            }, content);
            btn.addEventListener('click', async () => {
              if (locked || btn.disabled) return;
              if (isAns(val)) {
                locked = true;
                btns.forEach((b) => { if (b !== btn) b.disabled = true; });
                btn.setAttribute('aria-disabled', 'true');
                await ctx.correct(btn, { prefix: speakLabel ? spoken : '', say: opts.praise });
                resolve({ firstTry: first, value: val, button: btn });
              } else {
                first = false;
                await ctx.wrong(btn, { prefix: speakLabel ? spoken : '' });
                if (retry) btn.disabled = true;
                else {
                  locked = true;
                  btns.forEach((b, j) => { b.disabled = true; if (isAns(vals[j])) b.classList.add('is-correct'); });
                  await ctx.wait(900);
                  resolve({ firstTry: false, value: val, button: btn });
                }
              }
            });
            btns.push(btn);
            wrap.append(btn);
          });
        });
      },

      // Ketuk kartu sesuai urutan. items diberikan dalam URUTAN BENAR, tampil diacak.
      // guide: 'always' (urutan disebut tiap langkah), 'after-wrong' (petunjuk setelah 2 salah), 'never'.
      // start: nomor slot pertama (mis. 6 untuk babak kedua langkah 6-10).
      order(opts) {
        const { items, into, onStep, guide = 'after-wrong', label = 'Langkah', start = 1 } = opts;
        return new Promise((resolve) => {
          const wrap = h('div', { class: 'ti-order' });
          const track = h('ol', { class: 'ti-track' + (items.length > 6 ? ' is-long' : '') });
          items.forEach((it, i) => track.append(h('li', { class: 'ti-slot' }, h('span', { class: 'ti-slot-n' }, start + i))));
          const pool = h('div', { class: 'ti-pool' });
          let next = 0, missHere = 0;
          const nameOf = (it) => (it.say != null ? it.say : it.label);
          const face = (it) => [it.icon ? h('span', { class: 'ti-ic', 'aria-hidden': 'true' }, it.icon) : null, it.node ? it.node.cloneNode(true) : null, it.label ? h('span', { class: 'ti-lbl' }, it.label) : null];
          const pieces = [];
          const guideNow = () => { if (guide === 'always' && next < items.length) say(label + ' ' + (start + next) + ': ' + nameOf(items[next])); };
          shuffle(items.map((it, i) => ({ it, i }))).forEach(({ it, i }, k) => {
            const btn = h('button', { type: 'button', class: 'choice ti-piece pop-in', style: '--i:' + k, 'aria-label': nameOf(it) }, face(it));
            pieces[i] = btn;
            btn.addEventListener('click', async () => {
              if (btn.disabled) return;
              if (i === next) {
                btn.disabled = true; btn.classList.add('is-used');
                const slot = track.children[i];
                slot.classList.add('is-filled');
                slot.append(...face(it).filter(Boolean));
                pieces.forEach((p) => p && p.classList.remove('is-hint'));
                sfx('benar');
                next++; missHere = 0;
                if (onStep) onStep(next, items.length);
                if (next === items.length) { say(nameOf(it) + '. Selesai, hebat!'); ctx.after(1100, resolve); }
                else if (guide === 'always') { await say(nameOf(it)); guideNow(); }
                else say(nameOf(it));
              } else {
                missHere++;
                await ctx.wrong(btn, { say: guide === 'never' || missHere < 2 ? undefined : false });
                if (guide !== 'never' && missHere >= 2) {
                  pieces[next].classList.add('is-hint');
                  say('Petunjuk: ' + label.toLowerCase() + ' ke-' + (start + next) + ' adalah ' + nameOf(items[next]));
                }
              }
            });
            pool.append(btn);
          });
          wrap.append(track, pool);
          (into || els.stage).append(wrap);
          ctx.after(400, guideNow);
        });
      },

      // Satu benda tampil, anak mengetuk keranjang yang benar. items: [{label, icon?, node?, bin, why?}]
      sort(opts) {
        const { items, bins, onStep, into } = opts;
        return new Promise((resolve) => {
          const wrap = h('div', { class: 'ti-sort' });
          const show = h('div', { class: 'ti-sort-show' });
          const note = h('p', { class: 'ti-note', 'aria-live': 'polite', hidden: true });
          const binWrap = h('div', { class: 'ti-bins' });
          const binEls = {};
          const counts = {};
          bins.forEach((b, i) => {
            counts[b.id] = 0;
            const cnt = h('span', { class: 'ti-bin-count' }, '0');
            const btn = h('button', { type: 'button', class: 'choice ti-bin pop-in', style: '--i:' + i, 'aria-label': b.label },
              b.icon ? h('span', { class: 'ti-ic', 'aria-hidden': 'true' }, b.icon) : null, h('span', { class: 'ti-lbl' }, b.label), cnt);
            btn._cnt = cnt;
            binEls[b.id] = btn;
            binWrap.append(btn);
          });
          let idx = 0, busy = false, card = null;
          function showItem() {
            const it = items[idx];
            card = h('div', { class: 'ti-card ti-sort-card pop-in' },
              it.icon ? h('div', { class: 'ti-sort-ic', 'aria-hidden': 'true' }, it.icon) : null,
              it.node || null,
              h('div', { class: 'ti-sort-lbl' }, it.label));
            show.replaceChildren(card);
            note.hidden = true;
            say(it.say != null ? it.say : it.label);
          }
          bins.forEach((b) => binEls[b.id].addEventListener('click', async () => {
            if (busy || idx >= items.length) return;
            const it = items[idx];
            const target = binEls[b.id];
            if (b.id === it.bin) {
              busy = true;
              if (!reduced()) {
                const r1 = card.getBoundingClientRect(), r2 = target.getBoundingClientRect();
                card.style.transition = 'transform 260ms var(--ease-out), opacity 260ms var(--ease-out)';
                card.style.transform = 'translate(' + (r2.left + r2.width / 2 - r1.left - r1.width / 2) + 'px,' + (r2.top + r2.height / 2 - r1.top - r1.height / 2) + 'px) scale(0.4)';
              }
              card.style.opacity = '0';
              counts[b.id]++; target._cnt.textContent = counts[b.id];
              await ctx.correct(target, { say: it.why ? false : undefined });
              if (it.why) { note.textContent = it.why; note.hidden = false; await ctx.sayWait(it.why); }
              idx++;
              if (onStep) onStep(idx, items.length);
              busy = false;
              if (idx === items.length) resolve(); else showItem();
            } else {
              await ctx.wrong(target, { say: it.hint || undefined });
              if (it.hint) { note.textContent = it.hint; note.hidden = false; }
            }
          }));
          wrap.append(show, note, binWrap);
          (into || els.stage).append(wrap);
          showItem();
        });
      },

      // Kepingan ke tempatnya: ketuk kepingan lalu ketuk tempat, ATAU seret kepingan ke tempat.
      // pieces: [{ id, label?, icon?, node?, target }]  target = id slot yang benar (string atau array).
      // slots:  [{ id, el }]  el = elemen yang SUDAH ada di DOM (HTML atau SVG).
      // Resolve saat semua kepingan terpasang. Kepingan HTML dipindah ke slot HTML (move:false untuk mematikan);
      // untuk slot SVG atau visual khusus pakai onPlace(piece, slot).
      place(opts) {
        const { pieces, slots, onPlace, onStep, move = true, sayLabel = true } = opts;
        const tray = opts.tray || h('div', { class: 'ti-tray' });
        if (!opts.tray) els.stage.append(tray);
        return new Promise((resolve) => {
          let selected = null, done = 0;
          const fits = (p, s) => (Array.isArray(p.target) ? p.target.includes(s.id) : p.target === s.id);
          const slotOf = (el) => {
            const t = el && el.closest && el.closest('[data-slot]');
            return t ? slots.find((s) => s.id === t.getAttribute('data-slot')) : null;
          };
          const select = (p) => {
            if (selected) { selected.btn.classList.remove('is-selected'); selected.btn.setAttribute('aria-pressed', 'false'); }
            selected = p;
            if (p) {
              p.btn.classList.add('is-selected'); p.btn.setAttribute('aria-pressed', 'true'); sfx('tap');
              if (sayLabel && p.say !== false) say(p.say || p.label || '');
            }
          };
          async function attempt(p, s) {
            if (!p || p.placed || !s || s.full) return false;
            if (!fits(p, s)) { select(null); await ctx.wrong(s.el instanceof HTMLElement ? s.el : p.btn); return false; }
            p.placed = true; s.full = !opts.multi;
            select(null);
            const b = p.btn;
            b.disabled = true; b.classList.add('is-placed'); b.style.transform = '';
            if (move && s.el instanceof HTMLElement) {
              const r1 = b.getBoundingClientRect();
              s.el.append(b);
              const r2 = b.getBoundingClientRect();
              if (!reduced()) {
                b.style.transition = 'none';
                b.style.transform = 'translate(' + (r1.left - r2.left) + 'px,' + (r1.top - r2.top) + 'px)';
                void b.offsetWidth;
                b.style.transition = 'transform 260ms var(--ease-in-out)';
                b.style.transform = '';
              }
            } else b.classList.add(opts.collapse ? 'is-collapsed' : 'is-gone'); // collapse: nampan ikut menyusut
            if (s.el.classList) s.el.classList.add('is-filled');
            sfx('benar');
            if (onPlace) await onPlace(p, s);
            done++;
            if (onStep) onStep(done, pieces.length);
            if (done === pieces.length) ctx.after(350, resolve);
            return true;
          }
          slots.forEach((s) => {
            s.el.setAttribute('data-slot', s.id);
            s.el.setAttribute('data-tap', '');
            if (!s.el.hasAttribute('role')) s.el.setAttribute('role', 'button');
            s.el.setAttribute('tabindex', '0');
            if (s.label && !s.el.hasAttribute('aria-label')) s.el.setAttribute('aria-label', s.label);
            const go = () => { if (selected) attempt(selected, s); else if (!s.full) say('Pilih kepingannya dulu ya.'); };
            s.el.addEventListener('click', go);
            s.el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
          });
          shuffle(pieces).forEach((p, i) => {
            const btn = h('button', { type: 'button', class: 'choice ti-chip pop-in', style: '--i:' + i, 'aria-pressed': 'false', 'aria-label': p.aria || p.label || null },
              p.icon ? h('span', { class: 'ti-ic', 'aria-hidden': 'true' }, p.icon) : null,
              p.node || null,
              p.label && !p.hideLabel ? h('span', { class: 'ti-lbl' }, p.label) : null);
            p.btn = btn;
            let drag = null;
            btn.addEventListener('pointerdown', (e) => {
              if (p.placed || e.button > 0) return;
              drag = { x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
            });
            btn.addEventListener('pointermove', (e) => {
              if (!drag || e.pointerId !== drag.id) return;
              const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
              if (!drag.on && Math.hypot(dx, dy) > 10) {
                drag.on = true;
                try { btn.setPointerCapture(e.pointerId); } catch (_) { /* tidak didukung */ }
                btn.classList.add('is-drag'); select(p);
              }
              if (drag.on) btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.04)';
            });
            btn.addEventListener('pointerup', async (e) => {
              if (!drag) return;
              const wasDrag = drag.on; drag = null;
              if (!wasDrag) return;
              btn.classList.remove('is-drag');
              btn.style.visibility = 'hidden';
              const under = document.elementFromPoint(e.clientX, e.clientY);
              btn.style.visibility = '';
              btn._dragEnd = performance.now();
              const ok = await attempt(p, slotOf(under));
              if (!ok && !p.placed) {
                select(null);
                btn.style.transition = 'transform 220ms var(--ease-out)';
                btn.style.transform = '';
                ctx.after(240, () => { btn.style.transition = ''; });
              }
            });
            btn.addEventListener('pointercancel', () => { if (drag) { drag = null; btn.classList.remove('is-drag'); btn.style.transform = ''; } });
            btn.addEventListener('click', () => {
              if (btn._dragEnd && performance.now() - btn._dragEnd < 350) return; // klik bawaan setelah seret
              if (p.placed) return;
              select(selected === p ? null : p);
            });
            tray.append(btn);
          });
        });
      },

      // Kotak "Tahukah kamu?" + dibacakan.
      note(text, opts = {}) {
        const n = h('div', { class: 'ti-note pop-in' }, opts.title !== false ? h('b', null, (opts.title || 'Tahukah kamu?') + ' ') : null, text);
        (opts.into || els.stage).append(n);
        if (opts.speak !== false) say(text);
        return n;
      },
      // Tombol besar "Lanjut"; resolve saat diketuk.
      next(label = 'Lanjut') {
        return new Promise((resolve) => {
          const b = h('button', { type: 'button', class: 'ti-btn pop-in' }, label, ' ➜');
          b.addEventListener('click', () => { sfx('tap'); b.disabled = true; resolve(); });
          els.stage.append(b);
          b.focus({ preventScroll: true });
        });
      },

      // Jalankan soal satu per satu, progress otomatis, finish() di akhir.
      async series(items, fn, finishOpts) {
        const total = items.length;
        for (let i = 0; i < total; i++) {
          if (!ctx.alive) return;
          ctx.progress(i, total);
          ctx.clear();
          await fn(items[i], i);
        }
        if (ctx.alive) { ctx.progress(total, total); ctx.finish(finishOpts || {}); }
      },

      finish(opts = {}) {
        if (finished || !ctx.alive) return;
        finished = true;
        const tot = opts.total || ctx.total || 1;
        const stars = opts.stars != null ? Math.max(1, Math.min(3, opts.stars))
          : ctx.mistakes === 0 ? 3 : ctx.mistakes <= Math.max(1, Math.round(tot * 0.34)) ? 2 : 1;
        const rec = state.stars[game.id] || (state.stars[game.id] = {});
        const prevBest = rec[level] || 0;
        const isBest = stars > prevBest;
        if (isBest) { rec[level] = stars; }
        let gain = null;
        try { gain = TI.Progression ? TI.Progression.onFinish(game, level, stars, prevBest) : null; } catch (e) { console.error('Gamifikasi gagal', e); }
        saveState();
        try { if (TI.Board && TI.Board.report) TI.Board.report(level); } catch (e) { /* papan gagal diam saja */ }
        showResult(ctx, stars, opts, els, gain);
      },
    };
    return ctx;
  }

  // ---------- layar hasil (jarang terjadi, di sini tempat perayaan) ----------
  function showResult(ctx, stars, opts, els, gain) {
    const msg = opts.message || (stars === 3 ? 'Masya Allah, hebat sekali!' : stars === 2 ? 'Bagus! Ayo main lagi biar dapat 3 bintang.' : 'Terus berlatih ya, kamu pasti bisa!');
    const big = h('div', { class: 'result-stars' });
    for (let i = 0; i < 3; i++) big.append(h('span', { class: 'rstar' + (i < stars ? ' is-on' : ''), style: '--i:' + i }, '★'));
    const again = h('button', { type: 'button', class: 'ti-btn', onclick: () => { sfx('tap'); openGame(ctx.game); } }, 'Main Lagi');
    const share = TI.Share ? h('button', { type: 'button', class: 'ti-btn', onclick: () => TI.Share.scoreResult(ctx.game, stars, gain) }, '📣 Bagikan') : null;
    const menu = h('a', { class: 'ti-btn is-ghost', href: '#/', onclick: () => sfx('tap') }, 'Pilih Game');
    const dlg = h('div', { class: 'result', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Hasil' },
      h('div', { class: 'result-card' },
        big,
        gain && gain.xp > 0 ? h('p', { class: 'xp-chip pop-in' }, '+' + gain.xp + ' XP') : null,
        gain && gain.levelUp ? h('p', { class: 'level-up pop-in' }, 'Naik ke Level ' + gain.level + '!') : null,
        gain && gain.challengeDone ? h('p', { class: 'challenge-done pop-in' }, 'Tantangan pekan selesai!') : null,
        h('h2', null, msg),
        opts.lesson ? h('p', { class: 'result-lesson' }, h('b', null, 'Pelajaran hari ini: '), opts.lesson) : null,
        h('div', { class: 'result-actions' }, again, share, menu)));
    els.shell.append(dlg);
    again.focus({ preventScroll: true });
    // Perayaan penuh untuk 2-3 bintang; 1 bintang (mis. kalah balapan) cukup disemangati.
    const celebrate = opts.celebrate != null ? opts.celebrate : stars >= 2;
    sfx(celebrate ? 'menang' : 'pop');
    say(msg + (opts.lesson ? '. ' + opts.lesson : ''));
    if (celebrate && !reduced()) confetti(ctx, els.shell);
  }

  function confetti(ctx, host) {
    const cv = h('canvas', { class: 'confetti', 'aria-hidden': 'true' });
    host.append(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = (cv.width = host.clientWidth * dpr), H = (cv.height = host.clientHeight * dpr);
    const g = cv.getContext('2d');
    const cols = ['#ffd23f', '#0e9f6e', '#2f6fed', '#ff6b6b', '#9b4dde', '#ff9f1c'];
    const ps = Array.from({ length: 110 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35, vx: (Math.random() - 0.5) * 14 * dpr, vy: (-6 - Math.random() * 10) * dpr,
      s: (5 + Math.random() * 7) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: pick(cols),
    }));
    let t = 0;
    ctx.loop((dt) => {
      t += dt;
      g.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.vy += 22 * dpr * dt; p.x += p.vx * dt * 30; p.y += p.vy * dt * 30; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - t / 2.2);
        g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
      }
      if (t > 2.2) { cv.remove(); return false; }
    });
    ctx.onExit(() => cv.remove());
  }

  // ---------- keyboard: Escape langsung kembali ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) { e.preventDefault(); location.hash = '#/'; }
  });
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route); else setTimeout(route, 0);
})();
