/* 55 Sehari Berpuasa. Babak 1: urutkan dari sahur sampai buka (ctx.order).
   Babak 2: pilah yang membatalkan dan tidak (ctx.sort); SD + keranjang
   ketiga "Lakukan saat puasa" untuk 2 item sepanjang-hari (adil, bukan urutan).
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
    { label: 'Berbuka saat magrib', icon: '🌙' },
    { label: 'Makan secukupnya', icon: '🥛' },
    { label: 'Shalat Magrib', icon: '🕌' },
  ];
  // Sepanjang-hari (bukan titik urutan): dipilah, bukan diurutkan.
  const LAKU_SD = [
    { label: 'Menahan marah, berkata baik', icon: '💬' },
    { label: 'Tetap shalat dan belajar', icon: '📖' },
  ];

  const BINS = [
    { id: 'batal', label: 'Membatalkan', icon: '🚫' },
    { id: 'tidak', label: 'Tidak membatalkan', icon: '✅' },
  ];
  const BINS_SD = [...BINS, { id: 'laku', label: 'Lakukan saat puasa', icon: '💪' }];
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
${P} .ps-sort .choice { min-height: 72px; }
${P} .ps-langit { position: relative; display: flex; align-items: center; justify-content: space-between; height: 46px; padding: 0 10px; margin-bottom: 8px; border-radius: 999px; background: linear-gradient(90deg, #ffe9a8, #ffd23f 45%, #ff9f1c 75%, #7b5ea7); overflow: hidden; }
${P} .ps-langit-tepi { font-size: .8rem; font-weight: 800; color: #5b4a00; z-index: 1; }
${P} .ps-matahari { position: absolute; top: 50%; left: 8%; transform: translate(-50%, -50%); font-size: 1.6rem; line-height: 1; transition: left var(--dur-ui) var(--ease-out); }`;

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
      const items1 = TK ? URUT_TK : URUT_SD;
      const hitung1 = h('p', { class: 'ti-label', 'aria-live': 'polite' }, '0 dari ' + items1.length + ' terpasang');
      // Strip langit: matahari bergeser tiap item terpasang (menyusun = menjalani hari).
      const cca = h('span', { class: 'ps-matahari', 'aria-hidden': 'true' }, '☀️');
      const langit = h('div', { class: 'ps-langit', role: 'img', 'aria-label': 'Perjalanan hari: pagi' },
        h('span', { class: 'ps-langit-tepi' }, '🌅 Pagi'), cca, h('span', { class: 'ps-langit-tepi' }, 'Magrib 🌙'));
      const tahap = (f) => f <= 0 ? 'pagi' : f < 0.5 ? 'siang' : f < 1 ? 'sore' : 'magrib';
      w1.append(hitung1, langit);
      await ctx.order({ items: items1, guide: TK ? 'always' : 'after-wrong', into: w1,
        onStep: (n, t) => {
          hitung1.textContent = n + ' dari ' + t + ' terpasang'; ctx.progress(n / t, 2);
          const f = t ? n / t : 0;
          cca.style.left = 'calc(' + (8 + f * 84) + '%)';
          langit.setAttribute('aria-label', 'Perjalanan hari: ' + tahap(f));
        } });
      if (!ctx.alive) return;
      ctx.progress(1, 2);
      ctx.correct(null, { say: 'Bagus! Terus naik ke babak 2.' });
      ctx.note('Puasa dimulai sejak fajar sampai magrib. Sahur dulu, lalu niat, lalu menahan diri sampai beduk magrib.', { title: 'Hebat!' });
      await ctx.next();
      if (!ctx.alive) return;

      ctx.clear();
      ctx.ask(TK ? 'Babak 2: mana yang membatalkan puasa? Ketuk keranjang yang benar!'
        : 'Babak 2: pilah ke keranjang yang benar!');
      const w2 = h('div', { class: 'ps-sort pop-in' });
      ctx.el.append(w2);
      ctx.sfx('pop');
      const sortSD = [...SORT_SD, ...LAKU_SD.map((x) => ({ ...x, bin: 'laku' }))];
      await ctx.sort({ items: TK ? SORT_TK : sortSD, bins: TK ? BINS : BINS_SD, into: w2 });
      if (!ctx.alive) return;
      ctx.progress(2, 2);
      ctx.finish({ lesson: 'Puasa melatih kita menahan lapar, haus, dan marah dari subuh sampai magrib.' });
    },
  });
})();
