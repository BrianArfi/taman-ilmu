/* 69 Lompat Bintang. Garis bilangan bintang bernomor, ketuk kelipatan N berurutan.
   Bintang jebakan: salah dihitung wrong lalu lanjut (bintang yang pasti salah dinonaktifkan).
   TK: kelipatan 2 sampai 10 dan 12. SD: kelipatan 3, 4, 5 bergantian sampai 30.
   SD urut lompatan 5, 4, 3 (gampang dulu). Antar ronde ada pujian naik. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="lompat-bintang"] .lb-wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="lompat-bintang"] .lb-info { display: flex; gap: 10px 22px; flex-wrap: wrap; justify-content: center; padding: 8px 16px; font-size: 1.2rem; font-weight: 800; }
.play[data-game="lompat-bintang"] .lb-info b { color: var(--c); }
.play[data-game="lompat-bintang"] .lb-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; width: 100%; }
.play[data-game="lompat-bintang"] .lb-star { min-width: 0; min-height: 76px; border-radius: 16px; border: 3px solid rgba(0,0,0,0.12); background: #fff8e6; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; font-weight: 800; padding: 4px; }
.play[data-game="lompat-bintang"] .lb-star .lb-ic { font-size: 1.7rem; line-height: 1; color: #c9a227; }
.play[data-game="lompat-bintang"] .lb-star .lb-n { font-size: 1.05rem; }
.play[data-game="lompat-bintang"] .lb-star.is-done { background: #d3f9d8; border-color: #37b24d; }
.play[data-game="lompat-bintang"] .lb-star.is-done .lb-ic { color: #2b8a3e; }
.play[data-game="lompat-bintang"] .lb-star.is-out { opacity: 0.35; }
.play[data-game="lompat-bintang"] .lb-star.is-hint { border-color: #ffb703; animation: lb-hint 800ms var(--ease-in-out) 3; } /* motion-ok: petunjuk berkedip lembut */
@keyframes lb-hint { 50% { background: #fff3bf; } }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="lompat-bintang"] .lb-star.is-hint { animation: none !important; }
}`;

  TI.register({
    id: 'lompat-bintang',
    title: 'Lompat Bintang',
    cat: 'mat',
    icon: '⭐',
    desc: 'Lompat dari bintang ke bintang kelipatan N.',
    async start(ctx) {
      TI.style('lompat-bintang', CSS);
      const ronde = ctx.isTK
        ? [{ n: 2, maks: 10 }, { n: 2, maks: 12 }]
        : [{ n: 5, maks: 30 }, { n: 4, maks: 28 }, { n: 3, maks: 30 }];

      const totalLompat = ronde.reduce((s, r) => s + Math.floor(r.maks / r.n), 0);
      let sudah = 0;
      ctx.progress(0, totalLompat);

      for (let r = 0; r < ronde.length; r++) {
        if (!ctx.alive) return;
        const { n, maks } = ronde[r];
        const target = [];
        for (let v = n; v <= maks; v += n) target.push(v);
        ctx.ask('Lompat ' + n + ' ' + n + ' ya! Ketuk bintang ' + target[0] + ', lalu ' + target[1] + ', dan seterusnya.');

        const wrap = h('div', { class: 'lb-wrap' });
        const info = h('div', { class: 'ti-panel lb-info' },
          h('span', null, 'Lompatan: ', h('b', null, String(n))),
          h('span', null, 'Sudah: ', h('b', null, '0'), ' dari ' + target.length));
        const infoB = info.querySelectorAll('b')[1];
        const grid = h('div', { class: 'lb-grid' });
        wrap.append(info, grid);
        ctx.el.append(wrap);

        let pos = 0, gagal = 0;
        const btns = {};
        for (let v = 1; v <= maks; v++) {
          const b = h('button', {
            type: 'button', class: 'lb-star pop-in', style: '--i:' + (v % 8),
            'aria-label': 'Bintang ' + v,
          }, h('span', { class: 'lb-ic', 'aria-hidden': 'true' }, '★'), h('span', { class: 'lb-n' }, String(v)));
          b.addEventListener('click', async () => {
            if (b.disabled || pos >= target.length) return;
            if (v === target[pos]) {
              gagal = 0;
              b.disabled = true;
              grid.querySelectorAll('.is-hint').forEach((x) => x.classList.remove('is-hint'));
              b.classList.add('is-done');
              pos++; sudah++;
              infoB.textContent = String(pos);
              ctx.sfx('benar');
              ctx.say(String(v));
              ctx.progress(sudah, totalLompat);
              if (pos >= target.length) {
                Object.values(btns).forEach((x) => { x.disabled = true; });
                await ctx.wait(700);
              }
            } else {
              gagal++;
              const pastiSalah = v % n !== 0 || v < target[pos];
              if (pastiSalah) { b.disabled = true; b.classList.add('is-out'); }
              await ctx.wrong(b, { say: 'Belum urutannya. Cari ' + target[pos] + '!' });
              if (gagal >= 3 && btns[target[pos]] && !btns[target[pos]].disabled) {
                btns[target[pos]].classList.add('is-hint');
              }
            }
          });
          btns[v] = b;
          grid.append(b);
        }
        while (pos < target.length && ctx.alive) await ctx.wait(300);
        if (!ctx.alive) return;
        await ctx.wait(300);
        if (r < ronde.length - 1) ctx.correct(null, { say: ctx.isTK ? 'Bagus! Terus naik lebih jauh!' : 'Bagus! Terus naik ke lompatan ' + ronde[r + 1].n + '!' });
        ctx.clear();
      }
      ctx.finish({ lesson: 'Kelipatan adalah hasil lompatan yang sama besar. Kelipatan 2: 2, 4, 6, 8, 10.' });
    },
  });
})();
