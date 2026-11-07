/* 03 Rukun Islam & Iman.
   TK: urutkan Rukun Islam (tiap langkah disebut) + 2 soal.
   SD: urutkan Rukun Islam, urutkan Rukun Iman, pilah 6 kartu campuran, 1 soal hitung. */
(function () {
  const { h, shuffle, sample } = TI;

  const ISLAM = [
    { label: 'Mengucapkan dua kalimat syahadat', icon: '☝️' },
    { label: 'Mendirikan shalat', icon: '🕌' },
    { label: 'Membayar zakat', icon: '🪙' },
    { label: 'Puasa di bulan Ramadhan', icon: '🌙' },
    { label: 'Pergi haji bagi yang mampu', icon: '🕋' },
  ];
  // Rukun Iman tanpa ikon, cukup nomor.
  const IMAN = [
    'Iman kepada Allah',
    'Iman kepada malaikat',
    'Iman kepada kitab-kitab Allah',
    'Iman kepada para rasul',
    'Iman kepada hari akhir',
    'Iman kepada qada dan qadar',
  ].map((label) => ({ label }));

  const LESSON = 'Rukun Islam ada 5 dan Rukun Iman ada 6. Rukun Islam adalah amalan, Rukun Iman adalah keyakinan di dalam hati.';

  const CSS = `
    & .rk-num { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    & .rk-num b { font-size: 2.4rem; line-height: 1; }
    & .rk-kartu { width: 100%; max-width: 520px; padding: 10px 14px; }
    & .rk-ikon { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 8px; font-size: clamp(2rem, 9.5vw, 3.4rem); line-height: 1.1; }
    & .rk-bulan { font-size: clamp(3.4rem, 14vw, 4.6rem); line-height: 1.1; margin: 0; }
    @media (min-width: 561px) {
      & .ti-piece { flex: 0 0 auto; width: 200px; min-height: 108px; }
    }
    @media (max-width: 560px) {
      & .play-title { font-size: 0.92rem; }
      & .progress { flex-basis: 64px; }
      & .ti-order { gap: 12px; }
      & .ti-track { gap: 6px; }
      & .ti-slot { min-width: 0; padding: 4px 8px 4px 4px; }
      & .ti-pool { gap: 8px; }
      & .ti-piece { min-width: 0; flex: 1 1 calc(50% - 8px); max-width: calc(50% - 4px); min-height: 74px; padding: 8px 10px; gap: 2px; font-size: 0.95rem; }
      & .lvl-tk .ti-piece { font-size: 1rem; }
      & .ti-piece .ti-ic { font-size: 1.9rem; }
      & .ti-bin { min-width: 44%; }
    }
  `.replace(/&/g, '.play[data-game="rukun"]');

  // Pilihan angka: angka besar + titik-titik (membantu TK yang belum bisa membaca angka).
  const angka = (n) => h('span', { class: 'rk-num' }, h('b', null, String(n)), TI.dots(n));

  const petunjuk = {
    islam: 'Ini amalan yang kita kerjakan, jadi Rukun Islam.',
    iman: 'Ini keyakinan di dalam hati, jadi Rukun Iman.',
  };

  TI.register({
    id: 'rukun',
    title: 'Rukun Islam & Iman',
    cat: 'islam',
    icon: '🕋',
    desc: 'Urutkan dan pilah rukun Islam dan rukun Iman.',
    async start(ctx) {
      TI.style('rukun', CSS);
      const total = ctx.isTK ? 7 : 18;
      const maju = (n) => ctx.progress(n, total);
      maju(0);

      if (ctx.isTK) {
        // Rukun Islam dengan petunjuk suara di tiap langkah. Tunggu soal selesai dibacakan dulu
        // supaya suaranya tidak terpotong oleh petunjuk langkah pertama.
        await ctx.ask('Tahap 1: ketuk gambar rukun Islam sesuai urutan!'); ctx.sfx('pop');
        if (!ctx.alive) return;
        await ctx.order({ items: ISLAM, guide: 'always', label: 'Rukun Islam', onStep: (n) => maju(n) });

        ctx.clear();
        ctx.correct(null, { say: 'Bagus! Terus naik ke kuis.' }); ctx.ask('Tahap 2: ada berapa rukun Islam?');
        ctx.el.append(h('div', { class: 'ti-card rk-kartu pop-in' }, h('div', { class: 'rk-ikon', 'aria-hidden': 'true' }, ISLAM.map((x) => h('span', null, x.icon)))));
        await ctx.choose({
          options: shuffle([4, 5, 6]).map((n) => ({ node: angka(n), value: n, say: String(n), aria: n + ' rukun', cls: 'is-big' })),
          answer: 5,
        });
        maju(6);

        ctx.clear();
        ctx.ask('Tahap 3: puasa wajib di bulan apa?');
        ctx.el.append(h('div', { class: 'ti-card rk-kartu pop-in' }, h('p', { class: 'rk-bulan', 'aria-hidden': 'true' }, '🌙')));
        await ctx.choose({
          options: shuffle(['Ramadhan', 'Syawal', 'Muharram']).map((t) => ({ label: t, value: t })),
          answer: 'Ramadhan',
          layout: 'is-col',
        });
      } else {
        ctx.ask('Tahap 1: urutkan Rukun Islam dari yang pertama!'); ctx.sfx('pop');
        await ctx.order({ items: ISLAM, guide: 'after-wrong', label: 'Rukun Islam', onStep: (n) => maju(n) });

        ctx.clear();
        ctx.correct(null, { say: 'Bagus! Terus naik ke Rukun Iman.' }); ctx.ask('Tahap 2: sekarang urutkan Rukun Iman!');
        await ctx.order({ items: IMAN, guide: 'after-wrong', label: 'Rukun Iman', onStep: (n) => maju(5 + n) });

        // Pilah 6 kartu campuran: 3 Rukun Islam + 3 Rukun Iman.
        ctx.clear();
        ctx.ask('Tahap 3: ini Rukun Islam atau Rukun Iman? Ketuk keranjangnya!');
        const kartu = shuffle([
          ...sample(ISLAM, 3).map((x) => ({ ...x, bin: 'islam', hint: petunjuk.islam })),
          ...sample(IMAN, 3).map((x) => ({ ...x, bin: 'iman', hint: petunjuk.iman })),
        ]);
        await ctx.sort({
          items: kartu,
          bins: [{ id: 'islam', label: 'Rukun Islam', icon: '🕌' }, { id: 'iman', label: 'Rukun Iman', icon: '❤️' }],
          onStep: (n) => maju(11 + n),
        });

        ctx.clear();
        ctx.ask('Tahap 4: ada berapa rukun Iman?');
        await ctx.choose({ options: shuffle([4, 5, 6, 7]), answer: 6 });
      }
      if (!ctx.alive) return;
      maju(total);
      ctx.finish({ lesson: LESSON, total });
    },
  });
})();
