/* 02 Urutan Wudhu.
   TK: dua babak urutan (langkah 1-5 lalu 6-10) + 2 soal bergambar.
   SD: satu babak penuh 10 langkah tanpa petunjuk + 3 soal "langkah berikutnya". */
(function () {
  const { h, shuffle, sample } = TI;

  // Urutan persis dari SPEC, dengan ikon tanpa wajah.
  const LANGKAH = [
    { label: 'Niat dan membaca Bismillah', icon: '🤲' },
    { label: 'Mencuci kedua telapak tangan', icon: '👐' },
    { label: 'Berkumur-kumur', icon: '💦' },
    { label: 'Membersihkan hidung', icon: '👃' },
    { label: 'Membasuh wajah', icon: '💧' },
    { label: 'Membasuh kedua tangan sampai siku', icon: '💪' },
    { label: 'Mengusap sebagian kepala', icon: '✋' },
    { label: 'Membersihkan kedua telinga', icon: '👂' },
    { label: 'Membasuh kedua kaki sampai mata kaki', icon: '🦶' },
    { label: 'Berdoa setelah wudhu', icon: '🤲' },
  ];

  const CATATAN_TK = 'Wudhu membuat kita bersih dan siap shalat.';
  const CATATAN_SD = 'Yang wajib dalam wudhu: niat, membasuh wajah, membasuh tangan sampai siku, mengusap sebagian kepala, membasuh kaki sampai mata kaki, dan tertib (berurutan). Yang lain sunnah.';
  const LESSON = 'Wudhu dilakukan berurutan, dimulai dengan niat dan diakhiri dengan doa.';

  const kecil = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  const CSS = `
    & .wd-pic { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    & .wd-ic { font-size: 3.6rem; line-height: 1; }
    & .wd-tx { font-size: 1.15rem; font-weight: 800; line-height: 1.15; }
    & .choice.is-gambar { min-width: 132px; min-height: 156px; }
    & .wd-kartu { width: 100%; max-width: 420px; padding: 10px 18px; }
    & .wd-kartu .ti-big { font-size: clamp(3.4rem, 14vw, 4.6rem); }
    @media (min-width: 561px) {
      & .ti-piece { flex: 0 0 auto; width: 192px; min-height: 108px; }
    }
    @media (max-width: 560px) {
      & .ti-order { gap: 12px; }
      & .ti-track { gap: 6px; }
      & .ti-slot { min-width: 0; padding: 4px 8px 4px 4px; }
      & .ti-pool { gap: 8px; }
      & .ti-piece { min-width: 0; flex: 1 1 calc(50% - 8px); max-width: calc(50% - 4px); min-height: 70px; padding: 8px 10px; gap: 2px; font-size: 0.95rem; }
      & .lvl-tk .ti-piece { font-size: 1rem; }
      & .ti-piece .ti-ic { font-size: 1.8rem; }
      & .choice.is-gambar { min-width: 104px; min-height: 128px; }
      & .wd-ic { font-size: 3rem; }
    }
  `.replace(/&/g, '.play[data-game="wudhu"]');

  // Pilihan bergambar: ikon besar + nama di bawahnya.
  const gambar = (icon, teks) => h('span', { class: 'wd-pic' },
    h('span', { class: 'wd-ic', 'aria-hidden': 'true' }, icon),
    h('span', { class: 'wd-tx' }, teks));

  TI.register({
    id: 'wudhu',
    title: 'Urutan Wudhu',
    cat: 'islam',
    icon: '💧',
    desc: 'Susun langkah wudhu dari niat sampai doa.',
    async start(ctx) {
      TI.style('wudhu', CSS);
      const total = ctx.isTK ? 12 : 13;
      const maju = (n) => ctx.progress(n, total);
      maju(0);

      // Soal pilihan bergambar (TK).
      async function soalGambar(teks, opsi, benar) {
        ctx.clear();
        ctx.ask(teks);
        await ctx.choose({
          options: shuffle(opsi).map((o) => ({ node: gambar(o.icon, o.teks), value: o.teks, say: o.teks, aria: o.teks, cls: 'is-gambar' })),
          answer: benar,
        });
      }

      // Catatan penutup babak urutan.
      async function catatan(teks) {
        ctx.clear();
        ctx.ask('Hebat! Urutan wudhu sudah benar.', { speak: false });
        ctx.sfx('pop'); ctx.note(teks);
        await ctx.next();
      }

      if (ctx.isTK) {
        ctx.ask('Ketuk langkah wudhu sesuai urutan!');
        await ctx.order({ items: LANGKAH.slice(0, 5), guide: 'after-wrong', label: 'Langkah', onStep: (n) => maju(n) });
        ctx.clear();
        ctx.correct(null, { say: 'Bagus! Terus naik ke lima langkah akhir.' }); ctx.ask('Bagus! Sekarang lima langkah berikutnya.');
        await ctx.order({ items: LANGKAH.slice(5), guide: 'after-wrong', label: 'Langkah', start: 6, onStep: (n) => maju(5 + n) });
        await catatan(CATATAN_TK);
        await soalGambar('Wudhu memakai apa?', [
          { icon: '💧', teks: 'Air bersih' }, { icon: '🥛', teks: 'Susu' }, { icon: '🧃', teks: 'Jus' },
        ], 'Air bersih');
        maju(11);
        await soalGambar('Sebelum apa kita berwudhu?', [
          { icon: '🕌', teks: 'Shalat' }, { icon: '🍽️', teks: 'Makan' }, { icon: '🛏️', teks: 'Tidur' },
        ], 'Shalat');
      } else {
        ctx.ask('Urutkan 10 langkah wudhu dari awal sampai akhir!');
        await ctx.order({ items: LANGKAH, guide: 'after-wrong', label: 'Langkah', onStep: (n) => maju(n) });
        await catatan(CATATAN_SD); ctx.correct(null, { say: 'Bagus! Urutan selesai!' });
        // 3 soal "Setelah X, langkah berikutnya?"
        const awal = sample([0, 1, 2, 3, 4, 5, 6, 7, 8], 3).sort((a, b) => a - b); // langkah awal dulu
        for (let k = 0; k < awal.length; k++) {
          const i = awal[k];
          if (!ctx.alive) return;
          maju(10 + k);
          ctx.clear();
          const benar = LANGKAH[i + 1];
          const lain = sample(LANGKAH.filter((_, j) => j !== i && j !== i + 1), 2);
          ctx.ask('Setelah ' + kecil(LANGKAH[i].label) + ', langkah berikutnya apa?');
          ctx.el.append(h('div', { class: 'ti-card wd-kartu pop-in' }, h('p', { class: 'ti-big', 'aria-hidden': 'true' }, LANGKAH[i].icon)));
          await ctx.choose({
            options: shuffle([benar, ...lain]).map((x) => ({ label: x.label, value: x.label })),
            answer: benar.label,
            layout: 'is-col',
          });
        }
      }
      if (!ctx.alive) return;
      maju(total);
      ctx.finish({ lesson: LESSON, total });
    },
  });
})();
