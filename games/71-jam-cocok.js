/* 71 Jam Cocok. Cocokkan jam analog dengan jam digital.
   SD urut gampang dulu (tepat, setengah, seperempat). Jawaban terungkap
   sebagai digital + pujian tengah jalan. */
(function () {
  const { h, svg, shuffle, sample, rand, pick } = TI;

  const SAT = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const kata = (n) => (n < 12 ? SAT[n] : n < 20 ? SAT[n - 10] + ' belas' : SAT[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SAT[n % 10] : ''));
  const dua = (n) => String(n).padStart(2, '0');
  const digital = (j, m) => dua(j) + '.' + dua(m);
  const ucap = (j, m) => (m === 0 ? 'jam ' + kata(j) + ' tepat' : 'jam ' + kata(j) + ' lewat ' + kata(m) + ' menit');

  function jamSvg(j, m, kecil) {
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
        class: 'jc-angka', 'font-size': kecil ? 27 : 21, text: String(n),
      }));
    }
    const tangan = (panjang, ekor, tebal, warna, sudut) => svg('g', {
      style: 'transform-origin:100px 100px;transform:rotate(' + sudut + 'deg)',
    }, svg('line', { x1: 100, y1: 100 + ekor, x2: 100, y2: 100 - panjang, stroke: warna, 'stroke-width': tebal, 'stroke-linecap': 'round' }));
    els.push(tangan(46, 9, 9, '#2f6fed', sudutJam), tangan(70, 12, 5.5, '#e5484d', sudutMenit));
    els.push(svg('circle', { cx: 100, cy: 100, r: 8, fill: '#2b2d42' }), svg('circle', { cx: 100, cy: 100, r: 3, fill: '#fff' }));
    return svg('svg', { viewBox: '0 0 200 200', class: 'jc-clock', role: 'img', 'aria-label': 'Jam analog ' + digital(j, m), focusable: 'false' }, els);
  }

  function pengecoh(j, m, n, pool) {
    const ada = new Set([j + ':' + m]), hasil = [];
    const coba = (a, b) => {
      a = ((a - 1 + 12) % 12) + 1;
      const k = a + ':' + b;
      if (b < 0 || b > 59 || ada.has(k)) return;
      ada.add(k); hasil.push([a, b]);
    };
    if (m % 5 === 0 && m !== 0) coba(m / 5, (j * 5) % 60);
    coba(j, pick(pool)); coba(j + pick([-1, 1, 2]), m); coba(j + 1, m); coba(j - 1, m);
    for (let g = 0; hasil.length < n && g < 80; g++) coba(rand(1, 12), pick(pool));
    return hasil.slice(0, n);
  }

  const CSS = `
.play[data-game="jam-cocok"] .jc-clock { display: block; width: min(64vw, 280px); height: auto; aspect-ratio: 1; filter: drop-shadow(0 6px 0 rgba(0,0,0,0.08)); }
.play[data-game="jam-cocok"] .jc-angka { font-family: var(--font); font-weight: 800; fill: #2b2d42; }
.play[data-game="jam-cocok"] .jc-kartu { display: grid; place-items: center; width: auto; padding: 14px 24px 12px; gap: 8px; }
.play[data-game="jam-cocok"] .jc-legenda { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 14px; margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--muted); }
.play[data-game="jam-cocok"] .jc-legenda i { display: inline-block; width: 22px; height: 7px; margin-right: 6px; border-radius: 4px; vertical-align: 2px; }
.play[data-game="jam-cocok"] .jc-digital { font-variant-numeric: tabular-nums; letter-spacing: 0.04em; font-size: 1.5rem; font-weight: 800; }
@media (max-width: 560px) {
  .play[data-game="jam-cocok"] .jc-digital { font-size: 1.3rem; }
}`;

  async function satuSoal(ctx, j, m, nOpsi, pool) {
    ctx.ask('Jam berapa ini? Cocokkan dengan jam digitalnya.');
    const jam = jamSvg(j, m, false);
    const legenda = h('p', { class: 'jc-legenda', 'aria-hidden': 'true' },
      h('span', null, h('i', { style: 'background:#2f6fed' }), 'Jarum pendek: jam'),
      h('span', null, h('i', { style: 'background:#e5484d' }), 'Jarum panjang: menit'));
    ctx.el.append(h('div', { class: 'ti-card jc-kartu pop-in' }, jam, legenda));
    ctx.sfx('pop');
    const opsi = shuffle([[j, m], ...pengecoh(j, m, nOpsi - 1, pool)]);
    await ctx.choose({
      options: opsi.map(([a, b]) => ({
        label: h('span', { class: 'jc-digital' }, digital(a, b)), value: digital(a, b), say: ucap(a, b), aria: 'Jam ' + digital(a, b),
      })),
      answer: digital(j, m),
      layout: 'is-grid2',
    });
    ctx.el.append(h('p', { class: 'ti-label' }, 'Tadi: ' + digital(j, m)));
    ctx.sfx('pop');
    await ctx.wait(350);
  }

  TI.register({
    id: 'jam-cocok',
    title: 'Jam Cocok',
    cat: 'mat',
    icon: '🕰️',
    desc: 'Cocokkan jam analog dengan jam digital.',
    start(ctx) {
      TI.style('jam-cocok', CSS);
      const lesson = 'Jarum pendek menunjuk jam, jarum panjang menunjuk menit. Jam 07.00 dibaca jam tujuh tepat.';
      if (ctx.isTK) {
        const jam = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 6);
        const soal = jam.map((j) => ({ j, m: 0, sulit: 0 }));
        soal.sort((a, b) => a.sulit - b.sulit);
        let ke = 0;
        ctx.series(soal, async (s) => {
          ke++;
          if (ke === 3) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          await satuSoal(ctx, s.j, s.m, 3, [0]);
        }, { lesson });
      } else {
        const jam = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 8);
        const tipe = ['tepat', 'tepat', 'tepat', 'setengah', 'setengah', 'setengah', 'seperempat', 'seperempat'];
        const soal = jam.map((j, i) => {
          const t = tipe[i];
          const m = t === 'tepat' ? 0 : t === 'setengah' ? 30 : pick([15, 45]);
          return { j, m, sulit: t === 'tepat' ? 0 : t === 'setengah' ? 1 : 2 };
        });
        soal.sort((a, b) => a.sulit - b.sulit);
        let ke = 0;
        ctx.series(soal, async (s) => {
          ke++;
          if (ke === 4) ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' });
          await satuSoal(ctx, s.j, s.m, 4, [0, 15, 30, 45]);
        }, { lesson });
      }
    },
  });
})();
