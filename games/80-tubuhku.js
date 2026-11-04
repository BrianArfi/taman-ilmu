/* 80 Tubuhku. Tempelkan bagian tubuh ke tempatnya. Bagan tubuh polos tanpa wajah. */
(function () {
  const { h, svg, shuffle } = TI;

  const T = '#2f6fed', KULIT = '#ffd9b3';

  function badanSvg() {
    return svg('svg', { viewBox: '0 0 200 340', class: 'tb-badan', role: 'img', 'aria-label': 'Bagan tubuh tanpa wajah', focusable: 'false' },
      // Kepala polos tanpa mata dan mulut.
      svg('circle', { cx: 100, cy: 42, r: 30, fill: KULIT, stroke: T, 'stroke-width': 4 }),
      // Rambut.
      svg('path', { d: 'M70 40 A30 30 0 0 1 130 40 L130 30 A30 30 0 0 0 70 30 Z', fill: '#5b4a3f' }),
      // Badan, lengan, kaki.
      svg('rect', { x: 78, y: 74, width: 44, height: 90, rx: 16, fill: '#4dabf7', stroke: T, 'stroke-width': 4 }),
      svg('rect', { x: 52, y: 80, width: 18, height: 74, rx: 9, fill: KULIT, stroke: T, 'stroke-width': 4 }),
      svg('rect', { x: 130, y: 80, width: 18, height: 74, rx: 9, fill: KULIT, stroke: T, 'stroke-width': 4 }),
      svg('rect', { x: 80, y: 166, width: 18, height: 84, rx: 9, fill: '#333f50', stroke: T, 'stroke-width': 4 }),
      svg('rect', { x: 102, y: 166, width: 18, height: 84, rx: 9, fill: '#333f50', stroke: T, 'stroke-width': 4 }),
      // Telinga kiri kanan (bentuk saja, tanpa lubang wajah).
      svg('circle', { cx: 69, cy: 44, r: 7, fill: KULIT, stroke: T, 'stroke-width': 3 }),
      svg('circle', { cx: 131, cy: 44, r: 7, fill: KULIT, stroke: T, 'stroke-width': 3 }));
  }

  const BAGIAN_TK = [
    { id: 'tangan', nama: 'Tangan', x: 8, y: 38 },
    { id: 'telinga', nama: 'Telinga', x: 88, y: 5 },
    { id: 'hidung', nama: 'Hidung', x: 14, y: 13 },
    { id: 'kaki', nama: 'Kaki', x: 28, y: 84 },
  ];
  const BAGIAN_SD = [
    ...BAGIAN_TK,
    { id: 'rambut', nama: 'Rambut', x: 50, y: -3 },
    { id: 'bahu', nama: 'Bahu', x: 72, y: 23 },
    { id: 'lutut', nama: 'Lutut', x: 28, y: 62 },
  ];

  const KUIS = [
    { tanya: 'Telinga untuk apa?', jawab: 'Mendengar', lain: ['Melihat', 'Mencium'] },
    { tanya: 'Hidung untuk apa?', jawab: 'Mencium bau', lain: ['Mendengar', 'Berjalan'] },
    { tanya: 'Kaki untuk apa?', jawab: 'Berjalan', lain: ['Melihat', 'Mendengar'] },
  ];

  const CSS = `
.play[data-game="tubuhku"] .tb-panggung { position: relative; width: min(78vw, 300px); margin: 0 auto; }
.play[data-game="tubuhku"] .tb-badan { display: block; width: 100%; height: auto; }
.play[data-game="tubuhku"] .tb-slot { position: absolute; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%;
  border: 3px dashed #9aa3b8; background: rgba(255,255,255,0.55); display: grid; place-items: center;
  font-size: 0.68rem; font-weight: 800; color: #2b2d42; line-height: 1.1; padding: 2px; text-align: center; }
.play[data-game="tubuhku"] .tb-slot.is-filled { border-style: solid; border-color: var(--good); background: var(--good-bg); font-size: 0.8rem; }
.play[data-game="tubuhku"] .tb-tray { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
@media (max-width: 560px) {
  .play[data-game="tubuhku"] .tb-panggung { width: min(72vw, 260px); }
}`;

  async function tempelBagian(ctx, daftar) {
    ctx.ask('Ketuk nama bagian tubuh, lalu ketuk titiknya pada gambar!');
    const panggung = h('div', { class: 'tb-panggung' }, badanSvg());
    const slots = daftar.map((b) => {
      const el = h('div', { class: 'tb-slot', style: 'left:' + b.x + '%;top:' + b.y + '%' }, '?');
      panggung.append(el);
      return { id: b.id, el, label: b.nama };
    });
    const tray = h('div', { class: 'ti-tray tb-tray' });
    ctx.el.append(panggung, tray);
    const pieces = shuffle(daftar).map((b) => ({ id: b.id, label: b.nama, target: b.id, say: b.nama }));
    // Setelah 3 salah, tunjukkan satu pasangan yang benar.
    let m0 = ctx.mistakes;
    const tunjuk = ctx.every(500, () => {
      if (!ctx.alive || ctx.mistakes - m0 < 3) return;
      m0 = ctx.mistakes;
      const p = pieces.find((x) => !x.placed && x.btn && !x.btn.disabled);
      if (!p) return;
      ctx.say('Lihat, ' + p.label + ' di sini ya.');
      p.btn.click();
      const s = slots.find((x) => x.id === p.target);
      if (s) s.el.click();
    });
    await ctx.place({
      pieces,
      slots,
      tray,
      move: false,
      onPlace: (piece, slot) => {
        slot.el.textContent = '✓ ' + piece.label;
      },
    });
    tunjuk();
    await ctx.correct(null, { say: 'Semua bagian sudah menempel!' });
  }

  TI.register({
    id: 'tubuhku',
    title: 'Tubuhku',
    cat: 'sains',
    icon: '🖐️',
    desc: 'Tempelkan bagian tubuh ke tempatnya.',
    start(ctx) {
      TI.style('tubuhku', CSS);
      const lesson = 'Tuhan memberi kita tubuh yang lengkap. Kita menjaganya dengan makan sehat dan berolahraga.';
      if (ctx.isTK) {
        ctx.progress(0, 1);
        tempelBagian(ctx, BAGIAN_TK).then(() => {
          if (!ctx.alive) return;
          ctx.progress(1, 1);
          ctx.finish({ lesson });
        });
      } else {
        ctx.series([{ tahap: 'tempel' }, ...KUIS.map((k) => ({ tahap: 'kuis', ...k }))], async (s) => {
          if (s.tahap === 'tempel') {
            await tempelBagian(ctx, BAGIAN_SD);
          } else {
            ctx.ask(s.tanya);
            await ctx.choose({
              options: shuffle([s.jawab, ...s.lain]),
              answer: s.jawab,
            });
          }
        }, { lesson });
      }
    },
  });
})();
