/* 96 Balok yang Pas. Lubang bentuk di dinding, balok mana yang pas? Termasuk putaran 90 derajat. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const CSS = `
.play[data-game="balok-pas"] .bp-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="balok-pas"] .bp-wall { width: min(100%, 300px); padding: 14px; border-radius: 22px; background: #8a6d3b; box-shadow: 0 5px 0 var(--shadow); }
.play[data-game="balok-pas"] .bp-wall svg { width: 100%; height: auto; display: block; }
.play[data-game="balok-pas"] .bp-lab { margin: 0; font-weight: 800; text-align: center; color: var(--muted); }
`;

  // Bentuk digambar dari kotak 100x100. putar: derajat diputar (0 atau 90).
  const BENTUK = [
    { nama: 'lingkaran', gambar: () => svg('circle', { cx: 50, cy: 50, r: 34, fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4 }) },
    { nama: 'segitiga', gambar: () => svg('path', { d: 'M50 14 L88 80 H12 Z', fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4, 'stroke-linejoin': 'round' }) },
    { nama: 'persegi', gambar: () => svg('rect', { x: 18, y: 18, width: 64, height: 64, rx: 6, fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4 }) },
    { nama: 'persegi panjang', gambar: () => svg('rect', { x: 8, y: 28, width: 84, height: 44, rx: 8, fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4 }) },
    { nama: 'oval', gambar: () => svg('ellipse', { cx: 50, cy: 50, rx: 40, ry: 26, fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4 }) },
    { nama: 'bintang', gambar: () => svg('path', { d: 'M50 10 L61 38 L91 38 L67 56 L75 86 L50 68 L25 86 L33 56 L9 38 L39 38 Z', fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4, 'stroke-linejoin': 'round' }) },
    { nama: 'belah ketupat', gambar: () => svg('path', { d: 'M50 10 L86 50 L50 90 L14 50 Z', fill: 'FILL', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 4, 'stroke-linejoin': 'round' }) },
  ];
  const WARNA_B = ['#e5484d', '#2f6fed', '#12a150', '#e8b400', '#7c4dff', '#0e9fb5'];

  function bentukSVG(bi, putar, isLubang) {
    const inner = BENTUK[bi].gambar();
    const g = putar ? svg('g', { transform: 'rotate(' + putar + ' 50 50)' }, inner) : inner;
    return svg('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false' }, g);
  }
  const gantiFill = (node, warna) => {
    node.querySelectorAll('[fill]').forEach((el) => {
      if (el.getAttribute('fill') === 'FILL') el.setAttribute('fill', warna);
    });
    return node;
  };

  TI.register({
    id: 'balok-pas',
    title: 'Balok yang Pas',
    cat: 'logika',
    icon: '📦',
    desc: 'Balok mana yang pas ke lubangnya?',
    start(ctx) {
      TI.style('balok-pas', CSS);
      const tk = ctx.isTK;
      const jumlah = tk ? 6 : 8;
      const nOpsi = tk ? 3 : 4;

      // susun soal: bentuk acak + putaran 0/90 (lingkaran dan bintang tidak diputar, putarannya tidak terlihat beda)
      const bisaPutar = [1, 3, 4, 6];
      const idxBentuk = shuffle([...Array(BENTUK.length).keys()]).slice(0, jumlah);
      const soal = idxBentuk.map((bi, i) => {
        const putar = bisaPutar.includes(bi) && i % 2 === 0 ? 90 : 0;
        return { bi, putar, warna: WARNA_B[i % WARNA_B.length] };
      });

      ctx.series(soal, async ({ bi, putar, warna }) => {
        const lubang = h('div', { class: 'bp-wall pop-in' });
        const lsvg = bentukSVG(bi, putar);
        gantiFill(lsvg, '#4a3520');
        lubang.append(lsvg);
        ctx.el.append(h('div', { class: 'bp-wrap' }, lubang, h('p', { class: 'bp-lab' }, 'Lubang bentuk ' + BENTUK[bi].nama)));
        ctx.ask('Balok mana yang pas ke lubangnya? Awas, ada yang miring!');

        const kandidat = [{ bi, putar, benar: true }];
        if (bisaPutar.includes(bi) && kandidat.length < nOpsi) {
          kandidat.push({ bi, putar: putar === 0 ? 90 : 0, benar: false });
        }
        const lain = shuffle([...Array(BENTUK.length).keys()].filter((x) => x !== bi));
        for (const lb of lain) {
          if (kandidat.length >= nOpsi) break;
          kandidat.push({ bi: lb, putar: bisaPutar.includes(lb) && Math.random() < 0.5 ? 90 : 0, benar: false });
        }
        const opsi = shuffle(kandidat).map((k, i) => {
          const node = bentukSVG(k.bi, k.putar);
          gantiFill(node, WARNA_B[(bi + i + 1) % WARNA_B.length]);
          const ucap = 'Balok ' + BENTUK[k.bi].nama + (k.putar ? ' miring' : '');
          return { node, value: k.benar ? 'ya' : 'tidak' + i, say: ucap, aria: ucap, cls: 'is-big' };
        });
        await ctx.choose({
          options: opsi,
          answer: 'ya',
          speakLabel: true,
        });
      }, {
        lesson: 'Bentuk yang sama pasti pas. Balok yang miring harus diputar dulu dalam bayanganmu.',
      });
    },
  });
})();
