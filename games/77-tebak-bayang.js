/* 77 Tebak Bayangan. Lihat siluetnya, tebak bendanya.
   Urut gampang dulu (bentuk khas, lalu yang mirip). Nama terungkap tiap benar. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const T = '#2b2d42'; // siluet hitam keabuan
  const SILUET = {
    payung: [
      svg('path', { d: 'M12 62 A38 32 0 0 1 88 62 Q76 50 68 58 Q62 48 56 58 Q50 48 44 58 Q36 50 32 58 Q24 52 12 62 Z', fill: T }),
      svg('rect', { x: 48.5, y: 20, width: 3, height: 62, fill: T }),
      svg('path', { d: 'M50 82 v10 a8 8 0 0 1 -16 0', fill: 'none', stroke: T, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    ],
    cangkir: [
      svg('path', { d: 'M22 34 H78 L70 78 H30 Z', fill: T }),
      svg('path', { d: 'M78 42 h6 a10 10 0 0 1 0 20 h-9', fill: 'none', stroke: T, 'stroke-width': 6 }),
      svg('rect', { x: 18, y: 84, width: 64, height: 5, rx: 2.5, fill: T }),
    ],
    kunci: [
      svg('circle', { cx: 32, cy: 42, r: 16, fill: 'none', stroke: T, 'stroke-width': 9 }),
      svg('rect', { x: 44, y: 38, width: 40, height: 9, fill: T }),
      svg('rect', { x: 70, y: 38, width: 7, height: 16, fill: T }),
      svg('rect', { x: 80, y: 38, width: 7, height: 12, fill: T }),
    ],
    topi: [
      svg('path', { d: 'M32 62 V44 a18 14 0 0 1 36 0 V62 Z', fill: T }),
      svg('ellipse', { cx: 50, cy: 66, rx: 36, ry: 8, fill: T }),
    ],
    gunting: [
      svg('circle', { cx: 34, cy: 30, r: 10, fill: 'none', stroke: T, 'stroke-width': 7 }),
      svg('circle', { cx: 34, cy: 70, r: 10, fill: 'none', stroke: T, 'stroke-width': 7 }),
      svg('path', { d: 'M42 36 L84 70 M42 64 L84 30', stroke: T, 'stroke-width': 7, 'stroke-linecap': 'round' }),
    ],
    sendok: [
      svg('ellipse', { cx: 50, cy: 28, rx: 15, ry: 19, fill: T }),
      svg('rect', { x: 47, y: 44, width: 6, height: 42, rx: 3, fill: T }),
    ],
    buku: [
      svg('path', { d: 'M50 30 Q34 22 14 28 V78 Q34 72 50 80 Z', fill: T }),
      svg('path', { d: 'M50 30 Q66 22 86 28 V78 Q66 72 50 80 Z', fill: T }),
      svg('rect', { x: 48.5, y: 28, width: 3, height: 54, fill: '#fff' }),
    ],
    sisir: [
      svg('rect', { x: 16, y: 28, width: 68, height: 12, rx: 6, fill: T }),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => svg('rect', { x: 20 + i * 8, y: 40, width: 4.5, height: 30, rx: 2, fill: T })),
    ],
  };
  const NAMA = {
    payung: 'Payung', cangkir: 'Cangkir', kunci: 'Kunci', topi: 'Topi',
    gunting: 'Gunting', sendok: 'Sendok', buku: 'Buku', sisir: 'Sisir',
  };
  const SEMUA = Object.keys(SILUET);

  function siluet(id) {
    return svg('svg', { viewBox: '0 0 100 100', class: 'tb-bayang', role: 'img', 'aria-label': 'Bayangan benda', focusable: 'false' }, SILUET[id]);
  }

  const CSS = `
.play[data-game="tebak-bayang"] .tb-bayang { display: block; width: 130px; height: 130px; }
.play[data-game="tebak-bayang"] .tb-kartu { display: grid; place-items: center; width: auto; min-width: 200px; padding: 18px 34px; background: #fffbe8; }
@media (max-width: 560px) {
  .play[data-game="tebak-bayang"] .tb-bayang { width: 112px; height: 112px; }
}`;

  async function satuSoal(ctx, id, nOpsi) {
    ctx.ask('Bayangan apa ini? Tebak bendanya!');
    ctx.el.append(h('div', { class: 'ti-card tb-kartu pop-in' }, siluet(id)));
    ctx.sfx('pop');
    const opsi = shuffle([id, ...sample(SEMUA.filter((k) => k !== id), nOpsi - 1)]);
    const m0 = ctx.mistakes;
    await ctx.choose({
      options: opsi.map((k) => ({ label: NAMA[k], value: k, say: NAMA[k] })),
      answer: id,
      layout: 'is-col',
      speakLabel: true,
    });
    ctx.el.append(h('p', { class: 'ti-label' }, 'Benar! Ini ' + NAMA[id] + '.'));
    const salah = ctx.mistakes - m0;
    if (salah >= 3) {
      ctx.el.append(h('p', { class: 'ti-label' }, 'Kamu salah ' + salah + ' kali, tidak apa. Ingat-ingat bentuk ' + NAMA[id] + ' ya!'));
      ctx.say('Ingat-ingat bentuk ' + NAMA[id] + ' ya!');
    }
    ctx.sfx('pop');
    await ctx.wait(350);
  }

  TI.register({
    id: 'tebak-bayang',
    title: 'Tebak Bayangan',
    cat: 'sains',
    icon: '🕯️',
    desc: 'Lihat siluetnya, tebak bendanya.',
    start(ctx) {
      TI.style('tebak-bayang', CSS);
      const lesson = ctx.isTK
        ? 'Setiap benda punya bentuk bayangan yang khas.'
        : 'Bayangan terjadi karena cahaya terhalang benda. Bentuk bayangan mengikuti bentuk bendanya.';
      const SULIT = { sendok: 0, buku: 0, topi: 0, payung: 1, cangkir: 1, kunci: 1, gunting: 2, sisir: 2 };
      if (ctx.isTK) {
        const daftar = sample(SEMUA, 6).map((id) => ({ id, sulit: SULIT[id] })).sort((a, b) => a.sulit - b.sulit);
        let ke = 0;
        ctx.series(daftar, async ({ id }) => {
          ke++;
          if (ke === 3) ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' });
          await satuSoal(ctx, id, 3);
        }, { lesson });
      } else {
        const daftar = shuffle(SEMUA).map((id) => ({ id, sulit: SULIT[id] })).sort((a, b) => a.sulit - b.sulit);
        ctx.series(daftar.map((o, i) => ({ ...o, i })), async ({ id, i }) => {
          if (i === 4) {
            ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' });
            ctx.note('Bayangan terjadi karena cahaya terhalang benda. Benda padat membuat bayangan gelap.', { title: 'Tahukah kamu?' });
            await ctx.next();
            ctx.clear();
          }
          await satuSoal(ctx, id, 4);
        }, { lesson });
      }
    },
  });
})();
