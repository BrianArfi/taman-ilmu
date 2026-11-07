/* 52 Tertib Gerakan Shalat. ctx.order gerakan shalat dari takbir sampai salam.
   TK: 5 gerakan. SD: 8 gerakan + kuis jumlah rakaat tiap shalat. Tanpa teks Arab.
   SD dua babak: kuis rakaat sebagai pemanasan, lalu naik ke urutan 8 gerakan. */
(function () {
  const { h, shuffle, sample } = TI;

  const SEMUA = [
    { label: 'Takbiratul ihram', icon: '🤲' },
    { label: 'Berdiri', icon: '⬆️' },
    { label: 'Rukuk', icon: '⤵️' },
    { label: 'Itidal', icon: '↕️' },
    { label: 'Sujud', icon: '⤵️' },
    { label: 'Duduk di antara dua sujud', icon: '💺' },
    { label: 'Duduk tasyahud', icon: '🪑' },
    { label: 'Salam', icon: '👋' },
  ];
  // Catatan: ikon di atas benda dan tangan saja, tanpa gambar orang.
  const RAKAAT = [
    { nama: 'Subuh', n: 2 }, { nama: 'Zuhur', n: 4 }, { nama: 'Ashar', n: 4 },
    { nama: 'Maghrib', n: 3 }, { nama: 'Isya', n: 4 },
  ];
  const sebut = { 2: 'dua', 3: 'tiga', 4: 'empat' };

  const P = '.play[data-game="tertib-shalat"]';
  const CSS = `
${P} .ts-order .choice { min-height: 64px; font-size: 1.1rem; }
${P} .ts-rak { display: flex; gap: 8px; justify-content: center; margin-bottom: 4px; }
${P} .ts-rak .choice { min-height: 72px; min-width: 76px; font-size: 1.6rem; font-weight: 800; }`;

  TI.register({
    id: 'tertib-shalat',
    title: 'Tertib Gerakan Shalat',
    cat: 'islam',
    icon: '📿',
    desc: 'Urutkan gerakan shalat dari takbir sampai salam.',
    async start(ctx) {
      TI.style('tertib-shalat', CSS);
      const TK = ctx.isTK;

      if (TK) {
        const items = [
          { label: 'Takbir', icon: '🤲' },
          { label: 'Rukuk', icon: '⤵️' },
          { label: 'Sujud', icon: '⬇️' },
          { label: 'Duduk', icon: '💺' },
          { label: 'Salam', icon: '👋' },
        ];
        ctx.progress(0, 1);
        ctx.ask('Urutkan gerakan shalat dari awal sampai akhir!');
        const wadah = h('div', { class: 'ts-order pop-in' });
        ctx.el.append(wadah);
        await ctx.order({ items, guide: 'always', into: wadah });
        if (!ctx.alive) return;
        ctx.progress(1, 1);
        ctx.sfx('pop');
        ctx.note('Shalat dimulai dengan takbir dan diakhiri dengan salam.', { title: 'Ingat!' });
        await ctx.next();
        ctx.finish({ lesson: 'Gerakan shalat berurutan dari takbir sampai salam. Kerjakan dengan tenang dan tertib.' });
        return;
      }

      // SD: pemanasan 3 kuis rakaat (babak 1), lalu urutan 8 gerakan (babak 2).
      const kuis = sample(RAKAAT, 3);
      const total = kuis.length + 1;
      const LESSON_SD = 'Gerakan shalat berurutan dari takbir sampai salam. Subuh 2, Zuhur 4, Ashar 4, Maghrib 3, Isya 4 rakaat.';
      ctx.progress(0, total);
      // Babak 1: kuis rakaat sebagai pemanasan.
      for (const s of kuis) {
        ctx.clear();
        ctx.ask('Babak 1: shalat ' + s.nama + ' berapa rakaat?');
        const wr = h('div', { class: 'ts-rak pop-in' });
        const m0 = ctx.mistakes;
        ctx.el.append(wr);
        await ctx.choose({
          options: shuffle([2, 3, 4]).map((n) => ({ label: String(n), value: n, say: sebut[n] + ' rakaat' })),
          answer: s.n,
          into: wr,
          speakLabel: true,
        });
        const salah = ctx.mistakes - m0;
        if (salah >= 3) {
          ctx.el.append(h('p', { class: 'ti-label' }, 'Kamu salah ' + salah + ' kali, tidak apa. Ingat-ingat jumlahnya ya!'));
          ctx.say('Ingat-ingat jumlahnya!');
        }
        if (!ctx.alive) return;
        ctx.sfx('pop');
        ctx.progress(kuis.indexOf(s) + 1, total);
      }
      // Babak 2: naik ke urutan 8 gerakan.
      ctx.clear();
      ctx.correct(null, { say: 'Bagus! Terus naik ke urutan gerakan.' });
      ctx.ask('Babak 2: urutkan 8 gerakan shalat dari takbir sampai salam!');
      const wadah = h('div', { class: 'ts-order pop-in' });
      ctx.el.append(wadah);
      ctx.sfx('pop');
      await ctx.order({ items: SEMUA, guide: 'after-wrong', into: wadah });
      if (!ctx.alive) return;
      ctx.progress(total, total);
      ctx.finish({ lesson: LESSON_SD });
    },
  });
})();
