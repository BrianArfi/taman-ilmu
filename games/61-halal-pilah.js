/* 61 Halal atau Haram. Pilah makanan dan perbuatan ke keranjang yang benar.
   Ikon tiap item beda (makanan dan simbol, tanpa wajah). Makanan konkret dulu,
   perbuatan abstrak belakangan; tengah jalan ada pujian + naik tingkat.
   TK: 6 item. SD: 10 item + alasan singkat. Tiap salah ada petunjuk suara. */
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
      const IKON = { 'Apel': '🍎', 'Susu': '🥛', 'Roti': '🍞', 'Kurma': '🌴', 'Madu': '🍯', 'Minuman keras': '🍾', 'Daging babi': '🍖', 'Judi': '🎲', 'Mencuri': '💰', 'Berdusta': '💬' };
      const PERBUATAN = ['Judi', 'Mencuri', 'Berdusta'];
      const labels = ctx.isTK
        ? shuffle(HALAL).slice(0, 3).concat(shuffle(HARAM).slice(0, 3))
        : HALAL.concat(HARAM);
      const items = shuffle(labels).map((label) => ({
        label,
        icon: IKON[label],
        bin: HALAL.includes(label) ? 'halal' : 'haram',
        why: ctx.isSD ? WHY[label] : undefined,
        hint: PERBUATAN.includes(label) ? 'Itu perbuatan. ' + WHY[label] : WHY[label],
        say: label,
        sulit: PERBUATAN.includes(label) ? 1 : 0,
      }));
      // Makanan konkret dulu, perbuatan abstrak belakangan (acak di dalam grup).
      items.sort((a, b) => a.sulit - b.sulit);
      const nGampang = items.filter((x) => !x.sulit).length;
      ctx.ask('Mana yang halal dan mana yang haram? Ketuk keranjang yang benar!');
      ctx.progress(0, items.length);
      await ctx.sort({
        items,
        bins: [
          { id: 'halal', label: 'HALAL', icon: '✅' },
          { id: 'haram', label: 'HARAM', icon: '🚫' },
        ],
        onStep: (i, n) => {
          ctx.progress(i, n);
          if (i === nGampang) ctx.correct(null, { say: 'Bagus! Sekarang naik ke perbuatan.' });
        },
      });
      ctx.finish({ lesson: 'Makanan halal baik untuk tubuh kita. Yang haram harus dijauhi.' });
    },
  });
})();
