/* 60 Urut Kisah Nabi. ctx.order peristiwa penting sirah Nabi Muhammad
   Shallallahu 'alaihi wa sallam: Lahir di Mekah, Wahyu pertama di Gua Hira,
   Isra Mikraj, Hijrah ke Madinah, Fathu Mekah. Kuis urut gampang dulu. */
(function () {
  const { h, shuffle, sample } = TI;

  const SEMUA = [
    { label: 'Lahir di Mekah', icon: '🏠' },
    { label: 'Wahyu pertama di Gua Hira', icon: '📖' },
    { label: 'Isra Mikraj', icon: '🌙' },
    { label: 'Hijrah ke Madinah', icon: '🗺️' },
    { label: 'Fathu Mekah', icon: '🕋' },
  ];
  const SALAWAT = "Nabi Muhammad Shallallahu 'alaihi wa sallam";

  const P = '.play[data-game="sirah-urut"]';
  const CSS = `
${P} .su-order .choice { min-height: 64px; font-size: 1.1rem; }
${P} .su-kuis .choice { min-height: 64px; }`;

  TI.register({
    id: 'sirah-urut',
    title: 'Urut Kisah Nabi',
    cat: 'islam',
    icon: '📆',
    desc: 'Urutkan peristiwa penting sirah Nabi Muhammad.',
    async start(ctx) {
      TI.style('sirah-urut', CSS);
      const TK = ctx.isTK;
      const items = TK ? [SEMUA[0], SEMUA[1], SEMUA[3], SEMUA[4]] : SEMUA;

      ctx.ask('Urutkan kisah ' + SALAWAT + ' dari yang paling awal!');
      const w = h('div', { class: 'su-order pop-in' });
      ctx.el.append(w);
      await ctx.order({ items, guide: TK ? 'always' : 'after-wrong', into: w });
      if (!ctx.alive) return;
      ctx.sfx('pop');
      ctx.note(SALAWAT + ' lahir di Mekah, menerima wahyu di Gua Hira, lalu hijrah ke Madinah.', { title: 'Masya Allah!' });
      await ctx.next();
      if (!ctx.alive) return;

      if (!TK) {
        const kuis = [
          { q: SALAWAT + ' lahir di kota?', a: 'Makkah', x: ['Madinah', 'Thaif'], sulit: 0 },
          { q: 'Wahyu pertama turun kepada beliau di gua?', a: 'Gua Hira', x: ['Gua Tsur', 'Gua Kahfi'], sulit: 1 },
        ];
        kuis.sort((a, b) => a.sulit - b.sulit); // gampang dulu
        let ke = 0;
        await ctx.series(kuis, async (s) => {
          ke++;
          if (ke === 2) ctx.correct(null, { say: 'Benar! Satu lagi.' });
          ctx.sfx('pop');
          ctx.ask(s.q);
          const wadah = h('div', { class: 'su-kuis' });
          const m0 = ctx.mistakes;
          ctx.el.append(wadah);
          await ctx.choose({
            options: shuffle([s.a, ...s.x]),
            answer: s.a,
            into: wadah,
            layout: 'is-col',
          });
          const salah = ctx.mistakes - m0;
          if (salah >= 3) {
            ctx.el.append(h('p', { class: 'ti-label' }, 'Kamu salah ' + salah + ' kali, tidak apa. Ingat-ingat kisahnya, lalu pilih lagi ya!'));
            ctx.say('Ingat-ingat kisahnya, lalu pilih lagi ya!');
          }
        }, {
          lesson: SALAWAT + ' lahir di Mekah dan berjuang menyebarkan Islam sampai Fathu Mekah.',
        });
        return;
      }

      ctx.finish({ lesson: SALAWAT + ' lahir di Mekah dan berjuang menyebarkan Islam sampai Fathu Mekah.' });
    },
  });
})();
