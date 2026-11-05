/* 55 Sehari Berpuasa. Babak 1: urutkan dari sahur sampai buka (ctx.order).
   Babak 2: pilah yang membatalkan dan tidak (ctx.sort).
   Dua babak berlabel; naik ke babak pilah setelah urutan. */
(function () {
  const { h } = TI;

  const URUT_TK = [
    { label: 'Sahur', icon: '🍚' },
    { label: 'Niat', icon: '✨' },
    { label: 'Menahan lapar dan haus', icon: '🍽️' },
    { label: 'Berbuka', icon: '🌙' },
    { label: 'Shalat Magrib', icon: '🕌' },
  ];
  const URUT_SD = [
    { label: 'Sahur', icon: '🍚' },
    { label: 'Niat', icon: '✨' },
    { label: 'Menahan lapar dan haus', icon: '🍽️' },
    { label: 'Menahan marah, berkata baik', icon: '💬' },
    { label: 'Tetap shalat dan belajar', icon: '📖' },
    { label: 'Berbuka saat magrib', icon: '🌙' },
    { label: 'Makan secukupnya', icon: '🥛' },
    { label: 'Shalat Magrib', icon: '🕌' },
  ];

  const BINS = [
    { id: 'batal', label: 'Membatalkan', icon: '🚫' },
    { id: 'tidak', label: 'Tidak membatalkan', icon: '✅' },
  ];
  const SORT_TK = [
    { label: 'Makan siang', icon: '🍚', bin: 'batal' },
    { label: 'Minum', icon: '🥛', bin: 'batal' },
    { label: 'Muntah dengan sengaja', icon: '⚠️', bin: 'batal' },
    { label: 'Berwudhu', icon: '💧', bin: 'tidak' },
    { label: 'Tidur siang', icon: '🛏️', bin: 'tidak' },
  ];
  const SORT_SD = [
    { label: 'Makan dengan sengaja', icon: '🍚', bin: 'batal', why: 'Makan dengan sengaja membatalkan puasa.' },
    { label: 'Minum dengan sengaja', icon: '🥛', bin: 'batal', why: 'Minum dengan sengaja membatalkan puasa.' },
    { label: 'Muntah dengan sengaja', icon: '⚠️', bin: 'batal', why: 'Muntah yang disengaja membatalkan puasa.' },
    { label: 'Berwudhu', icon: '💧', bin: 'tidak', why: 'Berwudhu tidak membatalkan puasa, airnya dibuang lagi.' },
    { label: 'Tidur siang', icon: '🛏️', bin: 'tidak', why: 'Tidur tidak membatalkan puasa.' },
    { label: 'Berkumur saat wudhu', icon: '💦', bin: 'tidak', why: 'Berkumur saat wudhu tidak membatalkan, asal airnya dibuang.' },
    { label: 'Makan karena lupa', icon: '🍽️', bin: 'tidak', why: 'Makan karena lupa tidak membatalkan. Allah memaafkan yang lupa.' },
    { label: 'Menangis', icon: '🌧️', bin: 'tidak', why: 'Menangis tidak membatalkan puasa.' },
  ];

  const P = '.play[data-game="puasa-sehari"]';
  const CSS = `
${P} .ps-order .choice { min-height: 64px; font-size: 1.08rem; }
${P} .ps-sort .choice { min-height: 72px; }`;

  TI.register({
    id: 'puasa-sehari',
    title: 'Sehari Berpuasa',
    cat: 'islam',
    icon: '🌅',
    desc: 'Dari sahur sampai buka, apa saja urutannya?',
    async start(ctx) {
      TI.style('puasa-sehari', CSS);
      const TK = ctx.isTK;

      ctx.progress(0, 2);
      ctx.ask('Babak 1: urutkan kegiatan puasa dari pagi sampai sore!');
      const w1 = h('div', { class: 'ps-order pop-in' });
      ctx.el.append(w1);
      ctx.sfx('pop');
      await ctx.order({ items: TK ? URUT_TK : URUT_SD, guide: TK ? 'always' : 'after-wrong', into: w1 });
      if (!ctx.alive) return;
      ctx.progress(1, 2);
      ctx.correct(null, { say: 'Bagus! Terus naik ke babak 2.' });
      ctx.note('Puasa dimulai sejak fajar sampai magrib. Sahur dulu, lalu niat, lalu menahan diri sampai beduk magrib.', { title: 'Hebat!' });
      await ctx.next();
      if (!ctx.alive) return;

      ctx.clear();
      ctx.ask('Babak 2: mana yang membatalkan puasa? Ketuk keranjang yang benar!');
      const w2 = h('div', { class: 'ps-sort pop-in' });
      ctx.el.append(w2);
      ctx.sfx('pop');
      await ctx.sort({ items: TK ? SORT_TK : SORT_SD, bins: BINS, into: w2 });
      if (!ctx.alive) return;
      ctx.progress(2, 2);
      ctx.finish({ lesson: 'Puasa melatih kita menahan lapar, haus, dan marah dari subuh sampai magrib.' });
    },
  });
})();
