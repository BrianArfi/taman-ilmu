/* 30 Bagi Martabak.
   Martabak bundar (SVG, cokelat keemasan, taburan cokelat) dipotong menjadi juring. Juring bisa diketuk: bergeser
   keluar, berwarna lebih terang, dan bertanda centang. Pecahan ditulis bertingkat (pembilang di atas garis,
   penyebut di bawah) dan ikut berubah saat anak mengambil juring. TK: bagi sama besar, setengah, menghitung potongan.
   SD: ambil 3/4, 2/6, banding 1/2 dan 1/4, pecahan dari sekumpulan kue. */
(function () {
  const { h, shuffle, rand, numChoices } = TI;

  const KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];
  const kata = (n) => KATA[n] || String(n);
  function ucapPecahan(n, d) {
    if (n === 1 && d === 2) return 'setengah';
    if (d === 3) return n === 1 ? 'sepertiga' : kata(n) + ' pertiga';
    if (d === 4) return n === 1 ? 'seperempat' : kata(n) + ' perempat';
    return kata(n) + ' per ' + kata(d);
  }

  // ---------- gambar martabak ----------
  const CX = 150, CY = 150, R = 118;
  let uid = 0;
  const rad = (deg) => ((deg - 90) * Math.PI) / 180; // 0 derajat = atas, searah jarum jam
  const pt = (deg, r) => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))];
  function juringPath(a0, a1, r) {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    return 'M' + CX + ' ' + CY + 'L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + 'Z';
  }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Taburan cokelat dan butiran krim di dalam satu juring (posisi tetap per juring).
  function taburan(a0, a1) {
    const rng = mulberry(Math.round(a0 * 7 + a1 * 13 + 11));
    const jumlah = Math.max(5, Math.min(16, Math.round((44 * (a1 - a0)) / 360)));
    let s = '';
    for (let k = 0; k < jumlah; k++) {
      const a = a0 + (a1 - a0) * (0.14 + 0.72 * rng()), r = R * (0.26 + 0.6 * rng());
      const [x, y] = pt(a, r);
      if (k % 4 === 3) s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.6" fill="#fff1c9"/>';
      else s += '<rect x="-4.5" y="-1.5" width="9" height="3" rx="1.5" fill="' + (k % 2 ? '#5a2d0c' : '#7d4217') + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + Math.round(rng() * 180) + ')"/>';
    }
    return s;
  }

  /* Martabak SVG. batas = sudut batas juring dalam derajat, mis. [0,90,180,270,360].
     gaya(i) = 'normal' | 'pucat' (bagian yang tidak dihitung) | 'hilang' (sudah dimakan).
     interaktif = true: tiap juring diberi data-tap. kecil = true: tanpa piring dan angka. */
  function martabak(batas, { interaktif = false, kecil = false, gaya = () => 'normal', putar = 0, selang = false } = {}) {
    const id = ++uid;
    const n = batas.length - 1;
    let juring = '';
    for (let i = 0; i < n; i++) {
      const a0 = batas[i] + putar, a1 = batas[i + 1] + putar, mid = (a0 + a1) / 2;
      const [mx, my] = pt(mid, R * 0.6);
      const dx = Math.cos(rad(mid)) * 15, dy = Math.sin(rad(mid)) * 15;
      const g = gaya(i);
      const isi = g === 'normal'
        ? '<path d="' + juringPath(a0, a1, R) + '" fill="rgba(60,30,0,0.16)" transform="translate(3 6)"/>' +
          '<path d="' + juringPath(a0, a1, R) + '" fill="#bd7a2b" stroke="#fff6dc" stroke-width="' + (kecil ? 8 : 3) + '" stroke-linejoin="round"/>' +
          '<path d="' + juringPath(a0, a1, R - 12) + '" fill="url(#mbG' + id + ')"/>' + taburan(a0, a1) +
          (selang && i % 2 ? '<path d="' + juringPath(a0, a1, R) + '" fill="#fff" opacity="0.34"/>' : '')
        : g === 'pucat'
          ? '<path d="' + juringPath(a0, a1, R) + '" fill="#f6eed9" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'
          : '<path d="' + juringPath(a0, a1, R - 4) + '" fill="rgba(255,255,255,0.4)" stroke="#d4c6a3" stroke-width="2.5" stroke-dasharray="7 6" stroke-linejoin="round"/>';
      const ekstra = interaktif
        ? '<path class="mb-glow" d="' + juringPath(a0, a1, R) + '" fill="#fff"/>' +
          '<g class="mb-check" transform="translate(' + mx.toFixed(1) + ' ' + my.toFixed(1) + ')"><circle r="14" fill="#0e9f6e" stroke="#fff" stroke-width="3"/><path d="M-6.5 0.5L-2 5L7 -5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>' +
          '<g class="mb-numg" transform="translate(' + mx.toFixed(1) + ' ' + my.toFixed(1) + ')"><circle r="16" fill="#fff" stroke="#2f6fed" stroke-width="3.5"/><text class="mb-num" text-anchor="middle" dominant-baseline="central" font-size="19" font-weight="800" fill="#2f6fed" font-family="inherit"></text></g>'
        : '';
      juring += '<g class="mb-juring' + (g === 'normal' ? '' : ' is-' + g) + '"' + (interaktif ? ' data-i="' + i + '"' : '') + ' style="--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) + 'px">' + isi + ekstra + '</g>';
    }
    const piring = kecil ? '' : '<circle cx="' + CX + '" cy="' + CY + '" r="134" fill="#fff" stroke="#eadfc7" stroke-width="4"/><circle cx="' + CX + '" cy="' + CY + '" r="126" fill="none" stroke="#f3ead7" stroke-width="2"/>';
    const el = h('div', {
      class: 'mb-pic' + (kecil ? ' is-kecil' : ''),
      html: '<svg viewBox="0 0 300 300" focusable="false" aria-hidden="true"><defs><radialGradient id="mbG' + id + '" gradientUnits="userSpaceOnUse" cx="' + CX + '" cy="' + CY + '" r="' + R + '"><stop offset="0" stop-color="#f8cf6a"/><stop offset="1" stop-color="#e29a34"/></radialGradient></defs>' +
        piring + '<g class="mb-body">' + juring + '</g><g class="mb-fx"></g></svg>',
    });
    return el;
  }
  const sama = (n) => Array.from({ length: n + 1 }, (_, i) => (360 * i) / n);

  const frac = (a, b) => h('span', { class: 'mb-frac', 'aria-label': a + ' per ' + b }, h('span', null, String(a)), h('span', null, String(b)));

  const CSS = `
    & .mb-wrap { width: 100%; max-width: 720px; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none; }
    & .mb-pic { display: block; width: 100%; line-height: 0; }
    & .mb-pic svg { display: block; width: 100%; height: auto; overflow: visible; }
    & .mb-board { width: min(100%, 330px); }
    & .mb-juring { transition: transform var(--dur-ui) var(--ease-out), opacity var(--dur-ui) var(--ease-out); }
    & .mb-pic:not(.is-kecil) .mb-juring[data-i] { cursor: pointer; }
    & .mb-juring.is-sel { transform: translate(var(--dx), var(--dy)); }
    & .mb-glow, & .mb-check, & .mb-numg { opacity: 0; pointer-events: none; transition: opacity var(--dur-ui) var(--ease-out); }
    & .mb-juring.is-sel .mb-glow { opacity: 0.26; }
    & .mb-juring.is-sel .mb-check { opacity: 1; }
    & .mb-juring.is-counted .mb-numg { opacity: 1; }
    & .mb-board.is-done .mb-juring:not(.is-sel) { opacity: 0.45; }
    & .mb-juring:focus-visible { outline: 4px solid #ffb703; outline-offset: -2px; }
    & .mb-juring.is-hint { animation: mb-hint 800ms var(--ease-in-out) 3; } /* motion-ok: juring yang benar berkedip lembut sebagai petunjuk */
    @keyframes mb-hint { 50% { opacity: 0.55; } }
    & .mb-spark { transform-box: fill-box; transform-origin: center; animation: mb-spark 650ms var(--ease-out) forwards; } /* motion-ok: percikan kecil saat benar */
    @keyframes mb-spark { from { opacity: 1; transform: translate(0, 0) scale(0.7); } to { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(1.3); } }
    & .mb-shake { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .mb-frac { display: inline-flex; flex-direction: column; align-items: center; font-weight: 800; line-height: 1; vertical-align: middle; }
    & .mb-frac > span:first-child { padding: 0 0.28em 0.1em; border-bottom: 0.11em solid currentColor; }
    & .mb-frac > span:last-child { padding-top: 0.12em; }
    & .mb-info { display: flex; align-items: center; justify-content: center; gap: 12px 30px; flex-wrap: wrap; padding: 10px 18px; width: auto; min-width: 240px; }
    & .mb-grp { display: flex; align-items: center; gap: 12px; }
    & .mb-lab { font-size: 1.05rem; font-weight: 800; color: var(--muted); text-align: right; line-height: 1.1; }
    & .mb-big { font-size: 2.1rem; font-weight: 800; }
    & .mb-grp.is-live .mb-big { color: var(--c); }
    & .mb-word { font-size: 1.5rem; font-weight: 800; }
    & .mb-ctl { display: flex; justify-content: center; width: 100%; }
    & .mb-ctl .ti-btn { min-width: 190px; min-height: 68px; font-size: 1.55rem; }
    & .mb-choice { padding: 8px; min-width: 0; min-height: 0; }
    & .mb-choice .mb-pic { width: 138px; }
    & .mb-choice.is-lab { flex-direction: column; gap: 6px; }
    & .mb-choice.is-lab .mb-pic { width: 128px; }
    & .mb-choice .mb-big { font-size: 1.9rem; }
    & .mb-frac-opt { font-size: 2.1rem; padding: 0 12px; }
    & .mb-kue { display: grid; grid-template-columns: repeat(5, auto); gap: 4px 8px; justify-content: center; font-size: clamp(2rem, 8vw, 2.8rem); line-height: 1.1; }
    & .mb-kue span { transition: opacity var(--dur-ui) var(--ease-out), transform var(--dur-ui) var(--ease-out); }
    & .mb-kue.is-done span.is-b { opacity: 0.3; }
    & .mb-kue-lab { margin: 6px 0 0; font-weight: 800; color: var(--muted); }
    & .mb-angka { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    & .mb-angka b { font-size: 2.4rem; line-height: 1; }
    @media (max-width: 560px) {
      & .mb-choice .mb-pic { width: 84px; }
      & .mb-choice.is-lab .mb-pic { width: 112px; }
      & .mb-big { font-size: 1.8rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .mb-spark { display: none; }
    }
  `.replace(/&/g, '.play[data-game="martabak"]');

  // Gaya klik untuk elemen SVG: alat uji memanggil el.click(), yang tidak ada pada elemen SVG.
  function tapSVG(g, fn) {
    g.setAttribute('data-tap', ''); g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
    if (typeof g.click !== 'function') g.click = () => g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    g.addEventListener('click', fn);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  const angka = (n) => h('span', { class: 'mb-angka' }, h('b', null, String(n)), TI.dots(n));

  // Percikan kecil di tengah martabak.
  function percik(ctx, pic) {
    if (TI.reduced()) return;
    const fx = pic.querySelector('.mb-fx');
    const warna = ['#ffc93c', '#ff6b6b', '#2f6fed', '#0e9f6e', '#ff9f1c', '#9b4dde'];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2, r = 70 + (k % 3) * 18;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', CX); c.setAttribute('cy', CY); c.setAttribute('r', 6); c.setAttribute('fill', warna[k % warna.length]); c.setAttribute('class', 'mb-spark');
      c.style.setProperty('--sx', (Math.cos(a) * r).toFixed(0) + 'px'); c.style.setProperty('--sy', (Math.sin(a) * r).toFixed(0) + 'px');
      fx.append(c);
      ctx.after(700, () => c.remove());
    }
  }

  // ---------- soal: ambil juring ----------
  async function soalAmbil(ctx, { n, k, judul, ucap, semua }) {
    const teks = judul || 'Ambil ' + k + '/' + n + ' martabak!';
    ctx.ask(teks, { say: ucap || 'Ambil ' + ucapPecahan(k, n) + ' martabak!' });
    const pic = martabak(sama(n), { interaktif: true });
    const board = h('div', { class: 'mb-board' }, pic);
    const juring = [...pic.querySelectorAll('.mb-juring')];
    const liveEl = h('span', { class: 'mb-big' });
    const tulis = (c) => liveEl.replaceChildren(frac(c, n));
    tulis(0);
    const target = semua ? h('span', { class: 'mb-word' }, 'semua') : h('span', { class: 'mb-big' }, frac(k, n));
    const info = h('div', { class: 'ti-card mb-info' },
      h('div', { class: 'mb-grp' }, h('span', { class: 'mb-lab' }, 'Ambil'), target),
      h('div', { class: 'mb-grp is-live' }, h('span', { class: 'mb-lab' }, 'Kamu', h('br'), 'ambil'), liveEl));
    const bCek = h('button', { type: 'button', class: 'ti-btn' }, 'Cek ✔️');
    ctx.el.append(h('div', { class: 'mb-wrap' }, info, board, h('div', { class: 'mb-ctl' }, bCek)));

    const sel = new Set();
    let sibuk = false, salah = 0;
    juring.forEach((g, i) => {
      g.setAttribute('aria-label', 'Potongan ' + (i + 1));
      tapSVG(g, () => {
        if (sibuk) return;
        if (sel.has(i)) { sel.delete(i); g.classList.remove('is-sel'); ctx.sfx('tap'); } else { sel.add(i); g.classList.add('is-sel'); ctx.sfx('pop'); }
        g.classList.remove('is-hint');
        tulis(sel.size);
      });
    });
    function pilihOtomatis() {
      sel.clear();
      juring.forEach((g, i) => { const on = i < k; g.classList.toggle('is-sel', on); if (on) sel.add(i); });
      tulis(sel.size);
    }
    const sukses = () => { board.classList.add('is-done'); percik(ctx, pic); };

    await new Promise((resolve) => {
      bCek.addEventListener('click', async () => {
        if (sibuk) return;
        if (sel.size === 0) { ctx.say('Ketuk potongan martabaknya dulu ya.'); return; }
        sibuk = true;
        if (sel.size === k) {
          sukses();
          await ctx.correct(null, { say: false, min: 500 });
          await ctx.sayWait(semua ? 'Benar! Kamu mengambil semua potongan.' : 'Benar! Kamu mengambil ' + ucapPecahan(k, n) + ' martabak.');
          resolve();
          return;
        }
        salah++;
        const kurang = sel.size < k;
        if (salah >= 3) {
          await ctx.wrong(board, { say: 'Lihat ya, ini potongan yang benar.', min: 700 });
          pilihOtomatis();
          sukses();
          await ctx.sayWait(semua ? 'Semua potongan diambil.' : 'Ambil ' + kata(k) + ' dari ' + kata(n) + ' potong, itu ' + ucapPecahan(k, n) + '.');
          resolve();
          return;
        }
        board.classList.remove('mb-shake'); void board.offsetWidth; board.classList.add('mb-shake');
        await ctx.wrong(null, {
          say: 'Kamu mengambil ' + kata(sel.size) + ' dari ' + kata(n) + ' potong. ' + (kurang ? 'Masih kurang.' : 'Kebanyakan.') + ' Coba lagi ya.',
          min: 700,
        });
        board.classList.remove('mb-shake');
        sibuk = false;
      });
    });
  }

  // ---------- TK: hitung potongan ----------
  async function soalHitung(ctx, n) {
    ctx.ask('Martabak dipotong jadi berapa?', { say: 'Martabak dipotong jadi berapa potong? Ketuk potongannya untuk menghitung.' });
    const pic = martabak(sama(n), { interaktif: true });
    const juring = [...pic.querySelectorAll('.mb-juring')];
    let hitung = 0;
    juring.forEach((g, i) => {
      g.setAttribute('aria-label', 'Potongan ' + (i + 1));
      tapSVG(g, () => {
        if (g.classList.contains('is-counted')) return;
        hitung++;
        g.querySelector('.mb-num').textContent = String(hitung);
        g.classList.add('is-counted');
        ctx.sfx('pop'); ctx.say(kata(hitung));
      });
    });
    ctx.el.append(h('div', { class: 'mb-board' }, pic));
    await ctx.choose({
      options: [2, 3, 4].map((v) => ({ node: angka(v), value: v, say: String(v), aria: v + ' potong', cls: 'is-big' })),
      answer: n,
    });
  }

  // ---------- TK: mana yang dibagi dua sama besar ----------
  async function soalSama(ctx) {
    ctx.ask('Mana yang dibagi dua sama besar?');
    const putar = rand(0, 3) * 45;
    const gambar = [
      { b: [0, 180, 360], ok: true },
      { b: [0, 105, 360], ok: false },
      { b: [0, 120, 240, 360], ok: false },
    ];
    await ctx.choose({
      options: shuffle(gambar).map((g, i) => ({
        node: martabak(g.b, { kecil: true, selang: true, putar: g.ok ? putar : putar + rand(0, 3) * 30 }),
        value: g.ok, say: 'Gambar ' + kata(i + 1), aria: 'Martabak gambar ' + (i + 1), cls: 'mb-choice',
      })),
      answer: true,
    });
    ctx.note('Dibagi dua sama besar artinya kedua potongan ukurannya sama. Satu potong disebut setengah.', { title: 'Ingat' });
    await ctx.next();
  }

  // ---------- SD: mana lebih besar ----------
  async function soalBanding(ctx) {
    ctx.ask('Mana lebih besar, 1/2 atau 1/4?', { say: 'Mana yang lebih besar, setengah atau seperempat?' });
    const putar = rand(0, 3) * 45;
    const kartu = (n) => h('span', { class: 'mb-lab-wrap', style: 'display:flex;flex-direction:column;align-items:center;gap:6px' },
      martabak(sama(n), { kecil: true, putar, gaya: (i) => (i === 0 ? 'normal' : 'pucat') }),
      h('span', { class: 'mb-big' }, frac(1, n)));
    const opsi = shuffle([2, 4]).map((n) => ({ node: kartu(n), value: n, say: ucapPecahan(1, n), aria: ucapPecahan(1, n), cls: 'mb-choice is-lab' }));
    await ctx.choose({ options: opsi, answer: 2, speakLabel: false });
    ctx.note('Makin besar angka di bawah garis (penyebut), makin kecil potongannya. Jadi 1/2 lebih besar daripada 1/4.', { title: 'Ingat' });
    await ctx.next();
  }

  // ---------- SD: pecahan dari sekumpulan kue ----------
  async function soalKue(ctx) {
    ctx.ask('1/2 dari 10 kue = ?', { say: 'Setengah dari sepuluh kue sama dengan berapa?' });
    const kue = h('div', { class: 'mb-kue', 'aria-hidden': 'true' }, Array.from({ length: 10 }, (_, i) => h('span', { class: i >= 5 ? 'is-b' : '' }, '🍪')));
    ctx.el.append(h('div', { class: 'ti-card' }, kue, h('p', { class: 'mb-kue-lab' }, 'Ada 10 kue.')));
    await ctx.choose({ options: numChoices(5, 4, 1, 10).sort((a, b) => a - b), answer: 5, layout: 'is-grid2' });
    kue.classList.add('is-done');
    ctx.note('Setengah dari 10 kue adalah 5 kue, karena 5 + 5 = 10.', { title: 'Ingat' });
    await ctx.next();
  }

  // ---------- SD: pecahan dari martabak yang dimakan ----------
  async function soalMakan(ctx) {
    ctx.ask('Martabak dipotong 8. Kamu makan 3. Bagian yang kamu makan?', { say: 'Martabak dipotong delapan. Kamu makan tiga. Bagian yang kamu makan sama dengan?' });
    const pic = martabak(sama(8), { gaya: (i) => (i < 3 ? 'hilang' : 'normal') });
    ctx.el.append(h('div', { class: 'mb-board' }, pic));
    await ctx.choose({
      options: shuffle([[3, 8], [3, 5], [5, 8]]).map(([a, b]) => ({ node: h('span', { class: 'mb-frac-opt' }, frac(a, b)), value: a + '/' + b, say: ucapPecahan(a, b), aria: ucapPecahan(a, b), cls: 'is-big' })),
      answer: '3/8',
      speakLabel: true,
    });
    ctx.note('Pecahan ditulis bagian yang diambil di atas dan jumlah seluruh potongan di bawah. Kamu makan 3 dari 8 potong, jadi 3/8.', { title: 'Ingat' });
    await ctx.next();
  }

  TI.register({
    id: 'martabak',
    title: 'Bagi Martabak',
    cat: 'mat',
    icon: '🥧',
    desc: 'Potong dan ambil martabak untuk belajar pecahan.',
    start(ctx) {
      TI.style('martabak', CSS);
      let soal;
      if (ctx.isTK) {
        soal = [
          () => soalHitung(ctx, 3),
          () => soalAmbil(ctx, { n: 2, k: 1, judul: 'Ambil setengah!', ucap: 'Ambil setengah martabaknya!' }),
          () => soalSama(ctx),
          () => soalAmbil(ctx, { n: 3, k: 3, judul: 'Ambil semua potongan!', ucap: 'Ambil semua potongannya!', semua: true }),
          () => soalHitung(ctx, 4),
          () => soalAmbil(ctx, { n: 4, k: 2, judul: 'Ambil setengah!', ucap: 'Ambil setengah! Setengah dari empat potong adalah dua potong.' }),
        ];
      } else {
        const mudah = [{ n: 3, k: 1 }, { n: 3, k: 2 }, { n: 4, k: 1 }][rand(0, 2)];
        const sulit = Math.random() < 0.5 ? { n: 5, k: rand(2, 4) } : { n: 8, k: [3, 5, 6][rand(0, 2)] };
        soal = [
          () => soalAmbil(ctx, mudah),
          () => soalAmbil(ctx, { n: 4, k: 3 }),
          () => soalAmbil(ctx, { n: 8, k: 4, judul: 'Ambil 1/2 dari martabak 8 potong!', ucap: 'Ambil setengah dari martabak yang dipotong delapan!' }),
          () => soalBanding(ctx),
          () => soalAmbil(ctx, { n: 6, k: 2 }),
          () => soalKue(ctx),
          () => soalMakan(ctx),
          () => soalAmbil(ctx, sulit),
        ];
      }
      return ctx.series(soal, (jalankan) => jalankan(), {
        lesson: 'Pecahan adalah bagian dari keseluruhan. 1/2 artinya satu dari dua bagian yang sama besar.',
      });
    },
  });
})();
