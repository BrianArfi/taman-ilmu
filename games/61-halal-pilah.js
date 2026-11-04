/* 61 Halal atau Haram. Pilah makanan dan perbuatan ke keranjang yang benar.
   Semua item berupa TEKS (bukan gambar hewan). TK: 6 item. SD: 10 item + alasan singkat. */
(function () {
  const { h, shuffle } = TI;

  const HALAL = ['Apel', 'Susu', 'Roti', 'Kurma', 'Madu'];
  const HARAM = ['Minuman keras', 'Daging babi', 'Judi', 'Mencuri', 'Berdusta'];
  const WHY = {
    'Apel': 'Apel buah yang halal dan baik untuk tubuh.',
    'Susu': 'Susu minuman yang halal dan menyehatkan.',
    'Roti': 'Roti makanan yang halal dan mengenyangkan.',
    'Kurma': 'Kurma buah yang halal dan penuh berkah.',
    'Madu': 'Madu minuman yang halal dan menyehatkan.',
    'Minuman keras': 'Minuman keras memabukkan, dilarang untuk diminum.',
    'Daging babi': 'Daging babi haram, tidak boleh dimakan.',
    'Judi': 'Judi taruhan yang dilarang dan merugikan.',
    'Mencuri': 'Mencuri mengambil milik orang lain, dilarang.',
    'Berdusta': 'Berdusta berkata tidak jujur, dilarang.',
  };

  const CSS = `
.play[data-game="halal-pilah"] .ti-sort-card { min-height: 120px; }
.play[data-game="halal-pilah"] .ti-sort-lbl { font-size: 1.6rem; font-weight: 800; }
.play[data-game="halal-pilah"] .ti-bin { min-height: 96px; font-size: 1.25rem; }
.play[data-game="halal-pilah"] .ti-note { max-width: 560px; }`;

  TI.register({
    id: 'halal-pilah',
    title: 'Halal atau Haram',
    cat: 'islam',
    icon: '🍽️',
    desc: 'Pilah makanan dan perbuatan ke keranjang benar.',
    async start(ctx) {
      TI.style('halal-pilah', CSS);
      const labels = ctx.isTK
        ? shuffle(HALAL).slice(0, 3).concat(shuffle(HARAM).slice(0, 3))
        : HALAL.concat(HARAM);
      const items = shuffle(labels).map((label) => ({
        label,
        icon: '🍽️',
        bin: HALAL.includes(label) ? 'halal' : 'haram',
        why: ctx.isSD ? WHY[label] : undefined,
        say: label,
      }));
      ctx.ask('Mana yang halal dan mana yang haram? Ketuk keranjang yang benar!');
      ctx.progress(0, items.length);
      await ctx.sort({
        items,
        bins: [
          { id: 'halal', label: 'HALAL', icon: '✅' },
          { id: 'haram', label: 'HARAM', icon: '🚫' },
        ],
        onStep: (i, n) => ctx.progress(i, n),
      });
      ctx.finish({ lesson: 'Makanan halal baik untuk tubuh kita. Yang haram harus dijauhi.' });
    },
  });
})();
