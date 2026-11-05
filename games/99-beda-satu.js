/* 99 Mana yang Beda. 9 gambar tampil, 1 beda. Ketuk yang beda secepatnya. Semua emoji tanpa wajah.
   Urut gampang dulu (warna dan arah, lalu yang mirip dan jumlah). */
(function () {
  const { h, shuffle } = TI;

  const CSS = `
.play[data-game="beda-satu"] .bs-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="beda-satu"] .bs-grid { display: grid; gap: 8px; width: min(100%, 380px); grid-template-columns: repeat(3, minmax(0, 1fr)); }
.play[data-game="beda-satu"] .bs-cell { aspect-ratio: 1; min-height: 76px; min-width: 0; padding: 4px; border: 0; border-radius: 18px; background: var(--card); box-shadow: 0 4px 0 var(--shadow); font-size: 2.6rem; line-height: 1; cursor: pointer; transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease; }
.play[data-game="beda-satu"] .bs-cell:active { transform: scale(0.95); }
.play[data-game="beda-satu"] .bs-cell.is-out { background: #d3f9d8; box-shadow: none; }
.play[data-game="beda-satu"] .bs-cell.is-tunjuk { background: #fff0b3; box-shadow: inset 0 0 0 4px #f5b301; }
.play[data-game="beda-satu"] .bs-cell:disabled { cursor: default; }
.play[data-game="beda-satu"] .bs-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
`;

  // [mayoritas, yang beda]. Semua tanpa wajah dan mata.
  const TK = [
    ['⬆️', '⬇️', 0], ['🟢', '🟡', 0], ['⭐', '🌙', 0], ['⚽', '🏀', 1],
    ['🍎', '🍏', 1], ['🔺', '🔻', 1], ['🥛', '🧃', 1], ['🍒', '🍇', 2],
  ];
  const SD = [
    ['🟥', '🟧', 1], ['🟦', '🟪', 1], ['🍏', '🍐', 1], ['🍋', '🍌', 1], ['🔵', '🟣', 1],
    ['⭐', '🌟', 2], ['🍇', '🫐', 2], ['⬆️', '↗️', 2], ['🟢', '🟩', 2], ['🍒', '🍒🍒', 3],
  ];

  TI.register({
    id: 'beda-satu',
    title: 'Mana yang Beda',
    cat: 'logika',
    icon: '🍒',
    desc: 'Satu yang beda, temukan cepat.',
    start(ctx) {
      TI.style('beda-satu', CSS);
      const tk = ctx.isTK;
      const ronde = (tk ? TK : SD).slice();
      ronde.sort((a, b) => a[2] - b[2]); // gampang dulu
      const total = ronde.length;
      let mulaiSemua = 0;

      const main = async () => {
        mulaiSemua = Date.now();
        for (let i = 0; i < total && ctx.alive; i++) {
          if (i === Math.floor(total / 2)) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          ctx.progress(i, total);
          ctx.clear();
          await satu(i);
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        const detik = Math.round((Date.now() - mulaiSemua) / 1000);
        const m = ctx.mistakes;
        ctx.finish({
          stars: m <= 1 ? 3 : m <= 4 ? 2 : 1,
          message: 'Selesai dalam ' + detik + ' detik!',
          lesson: 'Lihat dengan teliti: warna, arah, dan jumlahnya. Yang beda satu pasti ketemu.',
        });
      };

      function satu(i) {
        return new Promise((resolve) => {
          const [mayor, beda] = ronde[i];
          const posisi = Math.floor(Math.random() * 9);
          let gagal = 0, selesai = false;

          ctx.ask('Ronde ' + (i + 1) + '. Mana yang beda? Ketuk cepat!');
          const chip = h('div', { class: 'bs-chip' }, 'Ronde ' + (i + 1) + ' dari ' + total);
          const grid = h('div', { class: 'bs-grid', role: 'group', 'aria-label': 'Sembilan gambar' });
          const tombol = [];
          for (let k = 0; k < 9; k++) {
            const aneh = k === posisi;
            const b = h('button', {
              type: 'button', class: 'bs-cell pop-in', style: '--i:' + k,
              'aria-label': 'Gambar ' + (k + 1),
            }, aneh ? beda : mayor);
            b.addEventListener('click', () => ketuk(k, b));
            tombol.push(b); grid.append(b);
          }
          ctx.el.append(h('div', { class: 'bs-wrap' }, chip, grid));

          async function ketuk(k, b) {
            if (selesai || b.disabled) return;
            if (k === posisi) {
              selesai = true;
              b.classList.add('is-out');
              await ctx.correct(b, { say: 'Ketemu! Matamu jeli.', min: 700 });
              if (ctx.alive) { ctx.progress(i + 1, total); resolve(); }
            } else {
              b.disabled = true;
              gagal++;
              await ctx.wrong(b, { say: 'Bukan itu. Lihat lagi!', min: 400 });
              if (!ctx.alive || selesai) return;
              if (gagal >= 3) {
                selesai = true; ctx.mistakes++;
                tombol[posisi].classList.add('is-tunjuk');
                ctx.say('Lihat, yang ini yang beda.');
                await ctx.wait(1700);
                if (ctx.alive) { ctx.progress(i + 1, total); resolve(); }
              }
            }
          }
        });
      }

      return main();
    },
  });
})();
