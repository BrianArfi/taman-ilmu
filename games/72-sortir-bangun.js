/* 72 Sortir Bangun. Sortir bentuk ke keranjang jumlah sisinya.
   Urut gampang dulu (segitiga dan persegi, lalu segi banyak dan yang mirip).
   Tengah jalan ada pujian, penempatan pertama berbunyi. */
(function () {
  const { h, svg, shuffle, sample, pick } = TI;

  const WARNA = [
    ['#ff6b6b', '#c92a2a'], ['#ffb703', '#c77d00'], ['#4dabf7', '#1c6fb8'],
    ['#51cf66', '#2b8a3e'], ['#b197fc', '#6f48c8'], ['#ff8fc7', '#c2417f'],
  ];

  const titik = (n, r, mulai) => Array.from({ length: n }, (_, i) => {
    const a = mulai + (i * 2 * Math.PI) / n;
    return (50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1);
  }).join(' ');
  const poligon = (points) => (a) => svg('polygon', { points, ...a });

  const GAMBAR = {
    segitiga: poligon('50,10 93,86 7,86'),
    persegi: (a) => svg('rect', { x: 15, y: 15, width: 70, height: 70, rx: 6, ...a }),
    'persegi panjang': (a) => svg('rect', { x: 6, y: 28, width: 88, height: 44, rx: 6, ...a }),
    trapesium: poligon('27,24 73,24 95,78 5,78'),
    'belah ketupat': poligon('50,6 94,50 50,94 6,50'),
    'jajar genjang': poligon('30,22 88,22 70,78 12,78'),
    'layang-layang': poligon('50,6 78,44 50,94 22,44'),
    'segi lima': poligon(titik(5, 44, -Math.PI / 2)),
    'segi enam': poligon(titik(6, 44, 0)),
    'segi delapan': poligon(titik(8, 44, Math.PI / 8)),
  };

  const NAMA = {
    segitiga: 'Segitiga', persegi: 'Persegi', 'persegi panjang': 'Persegi panjang', trapesium: 'Trapesium',
    'belah ketupat': 'Belah ketupat', 'jajar genjang': 'Jajar genjang', 'layang-layang': 'Layang-layang',
    'segi lima': 'Segi lima', 'segi enam': 'Segi enam', 'segi delapan': 'Segi delapan',
  };
  const SISI = {
    segitiga: 3, persegi: 4, 'persegi panjang': 4, trapesium: 4, 'belah ketupat': 4,
    'jajar genjang': 4, 'layang-layang': 4, 'segi lima': 5, 'segi enam': 6, 'segi delapan': 8,
  };
  const binOf = (k) => (SISI[k] === 3 ? 's3' : SISI[k] === 4 ? 's4' : 's5');
  const kataSisi = (k) => (SISI[k] === 3 ? '3 sisi' : SISI[k] === 4 ? '4 sisi' : SISI[k] + ' sisi');

  function bentukNode(kunci) {
    const [isi, garis] = pick(WARNA);
    return svg('svg', { viewBox: '0 0 100 100', class: 'sb-bentuk', 'aria-hidden': 'true', focusable: 'false' },
      GAMBAR[kunci]({ fill: isi, stroke: garis, 'stroke-width': 5, 'stroke-linejoin': 'round' }));
  }

  const CSS = `
.play[data-game="sortir-bangun"] .sb-bentuk { display: block; width: 84px; height: 84px; overflow: visible; }
.play[data-game="sortir-bangun"] .ti-sort-card .sb-bentuk { width: 104px; height: 104px; }
.play[data-game="sortir-bangun"] .ti-sort-lbl { font-weight: 800; }
.play[data-game="sortir-bangun"] .ti-bin { min-height: 88px; }
@media (max-width: 560px) {
  .play[data-game="sortir-bangun"] .sb-bentuk { width: 72px; height: 72px; }
}`;

  TI.register({
    id: 'sortir-bangun',
    title: 'Sortir Bangun',
    cat: 'mat',
    icon: '🗳️',
    desc: 'Sortir bentuk ke keranjang jumlah sisinya.',
    start(ctx) {
      TI.style('sortir-bangun', CSS);
      const kunci = ctx.isTK
        ? ['segitiga', 'persegi', 'persegi panjang', 'trapesium', 'segi lima', 'segi enam']
        : ['segitiga', 'persegi', 'persegi panjang', 'trapesium', 'belah ketupat', 'jajar genjang', 'layang-layang', 'segi lima', 'segi enam', 'segi delapan'];
      const SULIT = { segitiga: 0, persegi: 0, 'persegi panjang': 1, 'segi lima': 1, 'segi enam': 1, 'segi delapan': 2, trapesium: 2, 'belah ketupat': 2, 'jajar genjang': 2, 'layang-layang': 2 };
      const items = shuffle(kunci).map((k) => ({
        label: NAMA[k],
        say: NAMA[k] + '. Punya berapa sisi?',
        node: bentukNode(k),
        bin: binOf(k),
        why: NAMA[k] + ' punya ' + kataSisi(k) + '.',
        hint: 'Hitung sisinya satu per satu ya.',
        sulit: SULIT[k],
      }));
      items.sort((a, b) => a.sulit - b.sulit);
      ctx.ask('Hitung sisinya, lalu ketuk keranjang yang benar!');
      ctx.sfx('pop');
      ctx.progress(0, items.length);
      ctx.sort({
        items,
        bins: [
          { id: 's3', label: '3 sisi', icon: '🔺' },
          { id: 's4', label: '4 sisi', icon: '🟥' },
          { id: 's5', label: 'Banyak sisi', icon: '⬢' },
        ],
        onStep: (done) => {
          ctx.progress(done, items.length);
          if (done === 1) ctx.sfx('pop');
          if (done === Math.ceil(items.length / 2)) { ctx.el.append(h('p', { class: 'ti-label pop-in' }, 'Tahap 2: sisi banyak')); ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' }); }
        },
      }).then(() => {
        if (!ctx.alive) return;
        ctx.progress(items.length, items.length);
        ctx.finish({ lesson: 'Segitiga punya 3 sisi, segi empat punya 4 sisi, segi lima ke atas punya banyak sisi.' });
      });
    },
  });
})();
