/* 52 Tertib Gerakan Shalat. ctx.order gerakan shalat dari takbir sampai salam.
   TK: 5 gerakan. SD: 8 gerakan + kuis jumlah rakaat tiap shalat. Tanpa teks Arab. */
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
        const wadah = h('div', { class: 'ts-order' });
        ctx.el.append(wadah);
        await ctx.order({ items, guide: 'always', into: wadah });
        if (!ctx.alive) return;
        ctx.progress(1, 1);
        ctx.note('Shalat dimulai dengan takbir dan diakhiri dengan salam.', { title: 'Ingat!' });
        await ctx.next();
        ctx.finish({ lesson: 'Gerakan shalat berurutan dari takbir sampai salam. Kerjakan dengan tenang dan tertib.' });
        return;
      }

      // SD: urutan 8 gerakan + 3 kuis rakaat.
      const kuis = sample(RAKAAT, 3);
      const total = 1 + kuis.length;
      ctx.progress(0, total);
      ctx.ask('Urutkan 8 gerakan shalat dari takbir sampai salam!');
      const wadah = h('div', { class: 'ts-order' });
      ctx.el.append(wadah);
      await ctx.order({ items: SEMUA, guide: 'never', into: wadah });
      if (!ctx.alive) return;
      ctx.progress(1, total);

      await ctx.series(kuis, async (s) => {
        ctx.ask('Shalat ' + s.nama + ' berapa rakaat?', { say: 'Shalat ' + s.nama + ' berapa rakaat?' });
        await ctx.choose({
          options: shuffle([2, 3, 4]).map((n) => ({ label: String(n), value: n, say: sebut[n] + ' rakaat' })),
          answer: s.n,
          speakLabel: true,
        });
      }, {
        lesson: 'Gerakan shalat berurutan dari takbir sampai salam. Subuh 2, Zuhur 4, Ashar 4, Maghrib 3, Isya 4 rakaat.',
      });
    },
  });
})();
