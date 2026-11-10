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
${P} .su-kuis .choice { min-height: 64px; }
${P} .su-cerita { display: grid; gap: 10px; }
${P} .su-kartu { display: flex; align-items: center; gap: 10px; text-align: left; min-height: 64px; }
${P} .su-no { min-width: 2rem; height: 2rem; border-radius: 999px; background: var(--c); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; flex: none; }
${P} .su-ico { font-size: 1.6rem; flex: none; }
${P} .su-lab { font-size: 1.05rem; }`;

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

      // Babak 1: ajar dulu. Kartu tampil BERURUTAN bernomor, anak mengetuk
      // 1 sampai N. Bukan kuis: salah ketuk cuma dapat petunjuk, tanpa nilai salah.
      ctx.ask('Ketuk kartu nomor 1 sampai ' + items.length + ' berurutan, biar hafal kisahnya!');
      const papan = h('div', { class: 'su-cerita pop-in' });
      ctx.el.append(papan);
      let sudah = 0;
      await new Promise((tuntas) => {
        ctx.onExit(tuntas);
        papan.append(...items.map((it, i) => h('button', {
          type: 'button', class: 'choice su-kartu', 'aria-label': 'Kartu ' + (i + 1) + ': ' + it.label,
          on: { click: () => ketuk(i) },
        }, h('span', { class: 'su-no' }, String(i + 1)), h('span', { class: 'su-ico' }, it.icon), h('span', { class: 'su-lab' }, it.label))));
        function ketuk(i) {
          if (!ctx.alive) { tuntas(); return; }
          if (i === sudah) {
            ctx.sfx('pop');
            papan.children[sudah].disabled = true;
            papan.children[sudah].classList.add('is-correct');
            ctx.say(items[sudah].label);
            sudah++;
            ctx.progress(sudah, items.length + 1);
            if (sudah >= items.length) tuntas();
          } else {
            ctx.sfx('salah');
            ctx.say('Ketuk nomor ' + (sudah + 1) + ' dulu!');
          }
        }
      });
      if (!ctx.alive) return;
      ctx.correct(null, { say: 'Hebat! Sekarang urutkan sendiri tanpa nomor!' });
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
