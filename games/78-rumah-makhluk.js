/* 78 Rumah Makhluk. Antar tiap makhluk ke rumahnya. Makhluk tampil sebagai siluet
   tanpa wajah. Urut gampang dulu (hewan akrab, lalu yang jarang ditemui).
   Tengah jalan ada pujian. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const T = '#3a3f4b'; // warna siluet
  const SILUET = {
    ikan: (a) => svg('g', a, svg('ellipse', { cx: 42, cy: 55, rx: 26, ry: 15, fill: T }), svg('polygon', { points: '66,55 88,40 88,70', fill: T })),
    gurita: (a) => svg('g', a,
      svg('path', { d: 'M28 52 A22 20 0 0 1 72 52 Z', fill: T }),
      svg('rect', { x: 30, y: 52, width: 7, height: 24, rx: 3.5, fill: T }),
      svg('rect', { x: 46.5, y: 52, width: 7, height: 28, rx: 3.5, fill: T }),
      svg('rect', { x: 63, y: 52, width: 7, height: 24, rx: 3.5, fill: T })),
    udang: (a) => svg('g', a,
      svg('path', { d: 'M22 62 Q45 40 72 56', fill: 'none', stroke: T, 'stroke-width': 11, 'stroke-linecap': 'round' }),
      svg('polygon', { points: '72,56 88,48 86,66', fill: T })),
    kucing: (a) => svg('g', a,
      svg('rect', { x: 22, y: 42, width: 46, height: 26, rx: 9, fill: T }),
      svg('rect', { x: 62, y: 30, width: 20, height: 22, rx: 6, fill: T }),
      svg('polygon', { points: '62,32 67,20 72,30', fill: T }),
      svg('polygon', { points: '77,32 82,20 87,30', fill: T }),
      ...[0, 1, 2, 3].map((i) => svg('rect', { x: 26 + i * 12, y: 66, width: 7, height: 16, rx: 3, fill: T })),
      svg('path', { d: 'M22 50 Q10 44 12 30', fill: 'none', stroke: T, 'stroke-width': 5, 'stroke-linecap': 'round' })),
    kuda: (a) => svg('g', a,
      svg('rect', { x: 18, y: 44, width: 48, height: 24, rx: 9, fill: T }),
      svg('rect', { x: 58, y: 22, width: 13, height: 30, rx: 5, fill: T }),
      svg('rect', { x: 56, y: 14, width: 17, height: 12, rx: 4, fill: T }),
      ...[0, 1, 2, 3].map((i) => svg('rect', { x: 22 + i * 12, y: 66, width: 7, height: 18, rx: 3, fill: T }))),
    kelinci: (a) => svg('g', a,
      svg('rect', { x: 28, y: 48, width: 40, height: 24, rx: 10, fill: T }),
      svg('circle', { cx: 68, cy: 52, r: 12, fill: T }),
      svg('rect', { x: 62, y: 22, width: 6, height: 22, rx: 3, fill: T }),
      svg('rect', { x: 70, y: 22, width: 6, height: 22, rx: 3, fill: T }),
      ...[0, 1, 2].map((i) => svg('rect', { x: 32 + i * 13, y: 70, width: 7, height: 14, rx: 3, fill: T }))),
    burung: (a) => svg('g', a,
      svg('ellipse', { cx: 46, cy: 58, rx: 22, ry: 14, fill: T }),
      svg('circle', { cx: 66, cy: 46, r: 10, fill: T }),
      svg('polygon', { points: '75,46 86,42 86,51', fill: T }),
      svg('polygon', { points: '26,56 8,44 14,62', fill: T }),
      svg('rect', { x: 42, y: 70, width: 4, height: 12, fill: T }),
      svg('rect', { x: 50, y: 70, width: 4, height: 12, fill: T })),
    kupu: (a) => svg('g', a,
      svg('ellipse', { cx: 34, cy: 44, rx: 15, ry: 20, fill: T }),
      svg('ellipse', { cx: 66, cy: 44, rx: 15, ry: 20, fill: T }),
      svg('ellipse', { cx: 36, cy: 70, rx: 11, ry: 13, fill: T }),
      svg('ellipse', { cx: 64, cy: 70, rx: 11, ry: 13, fill: T }),
      svg('rect', { x: 47, y: 30, width: 6, height: 46, rx: 3, fill: T })),
    capung: (a) => svg('g', a,
      svg('rect', { x: 46, y: 26, width: 8, height: 56, rx: 4, fill: T }),
      svg('rect', { x: 12, y: 36, width: 30, height: 7, rx: 3.5, fill: T, transform: 'rotate(-24 27 39)' }),
      svg('rect', { x: 58, y: 36, width: 30, height: 7, rx: 3.5, fill: T, transform: 'rotate(24 73 39)' }),
      svg('rect', { x: 16, y: 52, width: 26, height: 6, rx: 3, fill: T, transform: 'rotate(-14 29 55)' }),
      svg('rect', { x: 58, y: 52, width: 26, height: 6, rx: 3, fill: T, transform: 'rotate(14 71 55)' })),
  };

  const MAKHLUK = [
    { id: 'ikan', nama: 'Ikan', rumah: 'air', why: 'Ikan hidup di air dan bernapas dengan insang.' },
    { id: 'gurita', nama: 'Gurita', rumah: 'air', why: 'Gurita hidup di laut dan berenang dengan tentakelnya.' },
    { id: 'udang', nama: 'Udang', rumah: 'air', why: 'Udang hidup di air, di laut dan di sungai.' },
    { id: 'kucing', nama: 'Kucing', rumah: 'darat', why: 'Kucing berjalan di darat dengan empat kakinya.' },
    { id: 'kuda', nama: 'Kuda', rumah: 'darat', why: 'Kuda hidup di darat dan larinya kencang.' },
    { id: 'kelinci', nama: 'Kelinci', rumah: 'darat', why: 'Kelinci tinggal di darat dan suka melompat.' },
    { id: 'burung', nama: 'Burung', rumah: 'udara', why: 'Burung terbang di udara dengan sayapnya.' },
    { id: 'kupu', nama: 'Kupu-kupu', rumah: 'udara', why: 'Kupu-kupu terbang dari bunga ke bunga.' },
    { id: 'capung', nama: 'Capung', rumah: 'udara', why: 'Capung terbang cepat di udara dengan empat sayap.' },
  ];

  const CSS = `
.play[data-game="rumah-makhluk"] .rm-siluet { display: block; width: 76px; height: 76px; }
.play[data-game="rumah-makhluk"] .ti-sort-lbl { font-weight: 800; }
.play[data-game="rumah-makhluk"] .ti-bin { min-height: 88px; }
@media (max-width: 560px) {
  .play[data-game="rumah-makhluk"] .rm-siluet { width: 64px; height: 64px; }
}`;

  TI.register({
    id: 'rumah-makhluk',
    title: 'Rumah Makhluk',
    cat: 'sains',
    icon: '🏕️',
    desc: 'Antar tiap makhluk ke rumahnya.',
    start(ctx) {
      TI.style('rumah-makhluk', CSS);
      const daftar = ctx.isTK
        ? shuffle(['ikan', 'kucing', 'burung', 'gurita', 'kuda', 'kupu'])
        : shuffle(MAKHLUK.map((m) => m.id));
      // Hewan akrab dulu (ikan, kucing, burung), yang jarang ditemui belakangan.
      const SULIT = { ikan: 0, kucing: 0, burung: 0, kuda: 1, kelinci: 1, kupu: 1, gurita: 2, udang: 2, capung: 2 };
      const items = daftar.map((id) => {
        const m = MAKHLUK.find((x) => x.id === id);
        return {
          label: m.nama,
          say: m.nama + '. Rumahnya di mana?',
          node: svg('svg', { viewBox: '0 0 100 100', class: 'rm-siluet', 'aria-hidden': 'true', focusable: 'false' }, SILUET[id]({})),
          bin: m.rumah,
          why: m.why,
          hint: 'Pikirkan di mana ia hidup: di air, di darat, atau di udara?',
          sulit: SULIT[id],
        };
      });
      items.sort((a, b) => a.sulit - b.sulit);
      ctx.ask('Di mana rumah makhluk ini? Ketuk tempat tinggalnya!');
      ctx.sfx('pop');
      ctx.progress(0, items.length);
      ctx.sort({
        items,
        bins: [
          { id: 'air', label: 'Air', icon: '💧' },
          { id: 'darat', label: 'Darat', icon: '🌳' },
          { id: 'udara', label: 'Udara', icon: '☁️' },
        ],
        onStep: (done) => {
          ctx.progress(done, items.length);
          if (done === Math.ceil(items.length / 2)) ctx.correct(null, { say: 'Bagus! Sekarang naik ke yang sulit.' });
        },
      }).then(() => {
        if (!ctx.alive) return;
        ctx.progress(items.length, items.length);
        ctx.finish({ lesson: 'Ikan hidup di air, kucing di darat, burung di udara. Setiap makhluk punya rumahnya sendiri.' });
      });
    },
  });
})();
