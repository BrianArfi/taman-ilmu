/* 13 Jam Berapa? Jam analog digambar sendiri dengan SVG: jarum pendek (jam) dan jarum panjang (menit).
   TK: kenali dulu baru baca. SD: tepat, setengah, seperempat, lalu menit bebas. */
(function () {
  const { h, svg, rand, pick, shuffle, sample, numChoices } = TI;

  const SAT = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const kata = (n) => (n < 12 ? SAT[n] : n < 20 ? SAT[n - 10] + ' belas' : SAT[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SAT[n % 10] : ''));
  const dua = (n) => String(n).padStart(2, '0');
  const digital = (j, m) => dua(j) + '.' + dua(m);
  // "jam tiga lewat tiga puluh menit"
  const ucap = (j, m) => (m === 0 ? 'jam ' + kata(j) + ' tepat' : 'jam ' + kata(j) + ' lewat ' + kata(m) + ' menit');
  const berikut = (j) => (j % 12) + 1;

  // Jam analog. kecil = tanpa garis menit, angka lebih besar (untuk pilihan jawaban).
  function jamSvg(j, m, kecil, animasi) {
    const sudutJam = (j % 12) * 30 + m * 0.5, sudutMenit = m * 6;
    const els = [svg('circle', { cx: 100, cy: 100, r: 95, fill: '#fffdf8', stroke: '#2f6fed', 'stroke-width': 9 }),
      svg('circle', { cx: 100, cy: 100, r: 86, fill: 'none', stroke: '#dbe6fb', 'stroke-width': 2 })];
    for (let i = 0; i < 60; i++) {
      const besar = i % 5 === 0;
      if (!besar && kecil) continue;
      const a = (i * 6 * Math.PI) / 180, r1 = besar ? 77 : 82, r2 = 86;
      els.push(svg('line', {
        x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a), x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a),
        stroke: besar ? '#2b2d42' : '#9aa3b8', 'stroke-width': besar ? 3 : 1.5, 'stroke-linecap': 'round',
      }));
    }
    const rAngka = kecil ? 62 : 64;
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      els.push(svg('text', {
        x: 100 + rAngka * Math.sin(a), y: 100 - rAngka * Math.cos(a), dy: '.36em', 'text-anchor': 'middle',
        class: 'jm-angka', 'font-size': kecil ? 27 : 21, text: String(n),
      }));
    }
    const tangan = (cls, panjang, ekor, tebal, warna, sudut) => svg('g', {
      class: 'jm-tangan ' + cls,
      style: 'transform-origin:100px 100px;transform:rotate(' + (animasi ? 0 : sudut) + 'deg)',
    }, svg('line', { x1: 100, y1: 100 + ekor, x2: 100, y2: 100 - panjang, stroke: warna, 'stroke-width': tebal, 'stroke-linecap': 'round' }));
    const gJam = tangan('jm-jam', 46, 9, 9, '#2f6fed', sudutJam);
    const gMenit = tangan('jm-menit', 70, 12, 5.5, '#e5484d', sudutMenit);
    els.push(gJam, gMenit, svg('circle', { cx: 100, cy: 100, r: 8, fill: '#2b2d42' }), svg('circle', { cx: 100, cy: 100, r: 3, fill: '#fff' }));
    const el = svg('svg', { viewBox: '0 0 200 200', class: 'jm-clock' + (kecil ? ' is-kecil' : ''), role: 'img', 'aria-label': 'Jam analog ' + digital(j, m), focusable: 'false' }, els);
    // Jarum bergerak halus ke posisinya (hanya jam besar).
    el._pasang = () => { gJam.style.transform = 'rotate(' + sudutJam + 'deg)'; gMenit.style.transform = 'rotate(' + sudutMenit + 'deg)'; };
    return el;
  }

  // Pengecoh untuk jam (j, m): salah baca jarum (tukar), jam sama menit beda, jam beda menit sama, dan acak.
  function pengecoh(j, m, n, minutPool) {
    const ada = new Set([j + ':' + m]), hasil = [];
    const coba = (a, b) => {
      a = ((a - 1 + 12) % 12) + 1;
      const k = a + ':' + b;
      if (b < 0 || b > 59 || ada.has(k)) return;
      ada.add(k); hasil.push([a, b]);
    };
    if (m % 5 === 0 && m !== 0) coba(m / 5, j * 5 === 60 ? 0 : (j * 5) % 60); // tertukar: jarum jam dibaca menit
    coba(j, pick(minutPool)); coba(j + pick([-1, 1, 2]), m); coba(j + 1, m); coba(j - 1, m);
    for (let g = 0; hasil.length < n && g < 80; g++) coba(rand(1, 12), pick(minutPool));
    return hasil.slice(0, n);
  }

  const CSS = `
.play[data-game="jam"] .jm-clock { display: block; width: min(64vw, 280px); height: auto; aspect-ratio: 1; filter: drop-shadow(0 6px 0 rgba(0,0,0,0.08)); }
.play[data-game="jam"] .jm-clock.is-kecil { width: 110px; filter: none; }
.play[data-game="jam"] .jm-angka { font-family: var(--font); font-weight: 800; fill: #2b2d42; }
.play[data-game="jam"] .jm-tangan { transition: transform var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="jam"] .jm-kartu { display: grid; place-items: center; width: auto; padding: 14px 24px 12px; gap: 8px; }
.play[data-game="jam"] .jm-legenda { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 14px; margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--muted); }
.play[data-game="jam"] .jm-legenda i { display: inline-block; width: 22px; height: 7px; margin-right: 6px; border-radius: 4px; vertical-align: 2px; }
.play[data-game="jam"] .jm-opsi { padding: 6px; }
.play[data-game="jam"] .jm-digital { font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }
.lvl-sd.play[data-game="jam"] .jm-clock:not(.is-kecil) { width: min(56vw, 240px); }
@media (max-width: 560px) {
  .play[data-game="jam"] .jm-clock.is-kecil { width: 84px; }
  .play[data-game="jam"] .jm-opsi { padding: 5px; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="jam"] .jm-tangan { transition: none; }
}`;

  function kartuJam(ctx, j, m) {
    const el = jamSvg(j, m, false, !TI.reduced());
    const legenda = h('p', { class: 'jm-legenda', 'aria-hidden': 'true' },
      h('span', null, h('i', { style: 'background:#2f6fed' }), 'Jarum pendek: jam'),
      h('span', null, h('i', { style: 'background:#e5484d' }), 'Jarum panjang: menit'));
    ctx.el.append(h('div', { class: 'ti-card jm-kartu pop-in' }, el, legenda));
    ctx.sfx('pop');
    if (!TI.reduced()) ctx.after(60, el._pasang);
  }

  const opsiAnalog = (pasangan, warna) => pasangan.map(([a, b]) => ({
    node: jamSvg(a, b, true), value: a + ':' + b, say: ucap(a, b), aria: 'Jam ' + digital(a, b), cls: 'is-big jm-opsi',
  }));

  // ---------- TK: hanya jam tepat ----------
  async function soalTK(ctx, s) {
    const j = s.j;
    if (s.tipe === 'baca') {
      ctx.ask('Jam berapa ini?');
      kartuJam(ctx, j, 0);
      await ctx.choose({
        options: TI.numChoices(j, 3, 1, 12).map((x) => ({ label: 'Jam ' + x, value: x, say: 'Jam ' + kata(x) })),
        answer: j,
        speakLabel: true,
      });
    } else {
      ctx.ask('Mana jam ' + j + '?', { say: 'Mana jam ' + kata(j) + '?' });
      const lain = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((x) => x !== j), 2);
      const opsi = shuffle([j, ...lain]).map((x) => [x, 0]);
      await ctx.choose({ options: opsiAnalog(opsi), answer: j + ':0', speakLabel: true });
    }
  }

  // ---------- SD ----------
  const KEGIATAN = [
    ['Kamu berangkat sekolah', 6, 45], ['Kamu bangun tidur', 5, 30], ['Kamu makan siang', 12, 15],
    ['Kamu mulai belajar', 7, 0], ['Kamu pergi ke masjid', 6, 15], ['Kamu pulang sekolah', 11, 30],
  ];

  async function soalSD(ctx, s) {
    const { j, m } = s;
    if (s.tipe === 'kegiatan') {
      const teks = s.nama + ' jam ' + digital(j, m) + '. Mana jamnya?';
      ctx.ask(teks, { say: s.nama + ' ' + ucap(j, m) + '. Mana jamnya?' });
      const opsi = shuffle([[j, m], ...pengecoh(j, m, 2, [0, 15, 30, 45])]);
      await ctx.choose({ options: opsiAnalog(opsi), answer: j + ':' + m });
      return;
    }
    ctx.ask('Jam berapa ini?');
    kartuJam(ctx, j, m);
    const pool = s.tipe === 'lima' ? [5, 10, 20, 25, 35, 40, 50, 55] : [0, 15, 30, 45];
    const opsi = shuffle([[j, m], ...pengecoh(j, m, 3, pool)]);
    await ctx.choose({
      options: opsi.map(([a, b]) => ({
        label: h('span', { class: 'jm-digital' }, digital(a, b)), value: digital(a, b), say: ucap(a, b), aria: 'Jam ' + digital(a, b),
      })),
      answer: digital(j, m),
      layout: 'is-grid2',
    });
    if (s.tipe === 'setengah' && s.catatan) {
      ctx.note('Jam ' + digital(j, m) + ' sering disebut setengah ' + kata(berikut(j)) + '.');
      await ctx.next();
    }
  }

  TI.register({
    id: 'jam',
    title: 'Jam Berapa?',
    cat: 'mat',
    icon: '⏰',
    desc: 'Baca jam analog: jarum pendek untuk jam, jarum panjang untuk menit.',
    start(ctx) {
      TI.style('jam', CSS);
      const lesson = 'Jarum pendek menunjuk jam, jarum panjang menunjuk menit.';
      if (ctx.isTK) {
        const jam = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 8);
        // Kenali dulu (mana), baru baca: pengenalan lebih gampang dari mengingat.
        const soal = [...jam.slice(0, 6).map((j) => ({ tipe: 'baca', sulit: 1, j })), ...jam.slice(6).map((j) => ({ tipe: 'mana', sulit: 0, j }))];
        soal.sort((a, b) => a.sulit - b.sulit);
        let ke = 0;
        ctx.series(soal, async (s) => {
          ke++;
          if (ke === 4) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          await soalTK(ctx, s);
        }, { lesson });
      } else {
        const jam = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 6);
        const tipe = ['tepat', 'setengah', 'seperempat', 'lima', 'setengah', 'lima'];
        const sulitTipe = { tepat: 0, setengah: 1, kegiatan: 1, seperempat: 2, lima: 3 };
        const menit = (t) => (t === 'tepat' ? 0 : t === 'setengah' ? 30 : t === 'seperempat' ? pick([15, 45]) : pick([5, 10, 20, 25, 35, 40, 50, 55]));
        let sudahCatatan = false;
        const soal = tipe.map((t, i) => {
          const o = { tipe: t, sulit: sulitTipe[t], j: jam[i], m: menit(t) };
          if (t === 'setengah' && !sudahCatatan) { o.catatan = true; sudahCatatan = true; }
          return o;
        });
        const keg = sample(KEGIATAN, 2).map(([nama, j, m]) => ({ tipe: 'kegiatan', sulit: 1, nama, j, m }));
        const semua = [...soal, ...keg];
        semua.sort((a, b) => a.sulit - b.sulit);
        let ke = 0;
        ctx.series(semua, async (s) => {
          ke++;
          if (ke === 4) ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' });
          await soalSD(ctx, s);
        }, { lesson });
      }
    },
  });
})();
