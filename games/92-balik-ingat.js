/* 92 Balik dan Ingat. Beberapa kartu berkedip lalu tertutup, ketuk kartu yang tadi berkedip. 6 ronde. */
(function () {
  const { h, shuffle } = TI;

  const CSS = `
.play[data-game="balik-ingat"] .bi-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="balik-ingat"] .bi-grid { display: grid; gap: 8px; width: min(100%, 360px); grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="balik-ingat"] .bi-card { position: relative; aspect-ratio: 1; min-height: 64px; min-width: 64px; padding: 0; border: 0; border-radius: 18px; background: #2f6fed; color: #fff; font-size: 2.2rem; line-height: 1; cursor: pointer; box-shadow: 0 5px 0 var(--shadow); transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, opacity var(--dur-ui) ease; }
.play[data-game="balik-ingat"] .bi-card:active { transform: scale(0.96); }
.play[data-game="balik-ingat"] .bi-card.is-blink { background: #ffc93c; transform: scale(1.06); }
.play[data-game="balik-ingat"] .bi-card.is-open { background: #12a150; }
.play[data-game="balik-ingat"] .bi-card.is-found { background: #12a150; box-shadow: none; }
.play[data-game="balik-ingat"] .bi-card.is-show { background: #ffc93c; }
.play[data-game="balik-ingat"] .bi-card:disabled { cursor: default; }
.play[data-game="balik-ingat"] .bi-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="balik-ingat"] .bi-card.is-blink { transform: none; }
}
`;

  const IKON = [
    { icon: '⭐', nama: 'bintang' }, { icon: '🌙', nama: 'bulan' },
    { icon: '☀️', nama: 'matahari' }, { icon: '💧', nama: 'air' },
    { icon: '🔷', nama: 'biru' }, { icon: '🔺', nama: 'segitiga' },
  ];

  TI.register({
    id: 'balik-ingat',
    title: 'Balik dan Ingat',
    cat: 'logika',
    icon: '🔄',
    desc: 'Ingat yang berkedip, tunjuk lagi.',
    start(ctx) {
      TI.style('balik-ingat', CSS);
      const tk = ctx.isTK;
      const n = tk ? 3 : 4;
      const target = tk ? 3 : 5;
      const total = 6;

      const main = async () => {
        for (let rd = 0; rd < total && ctx.alive; rd++) {
          ctx.progress(rd, total);
          ctx.clear();
          await satu(rd);
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({ lesson: 'Perhatikan baik-baik, ingat-ingat, baru tunjuk. Itu cara melatih daya ingat.' });
      };

      function satu(rd) {
        return new Promise((resolve) => {
          const selTarget = shuffle([...Array(n * n).keys()]).slice(0, target);
          const ikon = {};
          selTarget.forEach((k, i) => { ikon[k] = IKON[(rd + i) % IKON.length]; });
          let fase = 'lihat', ketemu = 0, gagal = 0, selesai = false;
          const kartu = [];

          ctx.ask('Ronde ' + (rd + 1) + '. Perhatikan kartu yang berkedip!');

          const chip = h('div', { class: 'bi-chip' }, 'Ronde ' + (rd + 1) + ' dari ' + total);
          const grid = h('div', { class: 'bi-grid', style: '--n:' + n, role: 'group', 'aria-label': 'Kartu' });
          for (let k = 0; k < n * n; k++) {
            const b = h('button', {
              type: 'button', class: 'bi-card pop-in', style: '--i:' + k,
              'aria-label': 'Kartu ' + (k + 1),
            });
            b.addEventListener('click', () => ketuk(k));
            kartu.push(b); grid.append(b);
          }
          ctx.el.append(h('div', { class: 'bi-wrap' }, chip, grid));

          const buka = (k, cls) => {
            kartu[k].textContent = ikon[k] ? ikon[k].icon : '✖️';
            kartu[k].classList.add(cls);
          };
          const tutupSemua = () => {
            kartu.forEach((b) => { b.textContent = ''; b.classList.remove('is-blink', 'is-open', 'is-show'); });
          };

          (async () => {
            await ctx.wait(600);
            if (!ctx.alive || selesai) return;
            for (let kedip = 0; kedip < 2; kedip++) {
              if (!ctx.alive || selesai) return;
              selTarget.forEach((k) => buka(k, 'is-blink'));
              ctx.sfx('pop');
              await ctx.wait(tk ? 1100 : 900);
              if (!ctx.alive || selesai) return;
              tutupSemua();
              await ctx.wait(350);
            }
            if (!ctx.alive || selesai) return;
            fase = 'tebak';
            ctx.ask('Kartu mana yang tadi berkedip? Ketuk ' + target + ' kartu!');
            ctx.say('Sekarang tunjuk kartunya.');
          })();

          async function ketuk(k) {
            if (selesai || fase !== 'tebak') return;
            if (kartu[k].disabled) return;
            if (selTarget.includes(k)) {
              kartu[k].disabled = true;
              buka(k, 'is-found');
              ketemu++;
              ctx.sfx('benar');
              if (ketemu >= target) {
                selesai = true;
                await ctx.correct(null, { say: 'Betul semua! Ingatanmu kuat.', min: 900 });
                if (ctx.alive) { ctx.progress(rd + 1, total); resolve(); }
              }
            } else {
              gagal++;
              await ctx.wrong(kartu[k], { say: 'Bukan yang itu. Ingat-ingat lagi.', min: 450 });
              if (!ctx.alive || selesai) return;
              if (gagal >= 3) {
                gagal = 0; ctx.mistakes++;
                selesai = true;
                selTarget.forEach((t) => { if (!kartu[t].disabled) buka(t, 'is-show'); });
                ctx.say('Lihat, yang kuning ini yang tadi berkedip.');
                await ctx.wait(1800);
                if (ctx.alive) { ctx.progress(rd + 1, total); resolve(); }
              }
            }
          }
        });
      }

      return main();
    },
  });
})();
