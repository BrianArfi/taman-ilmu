/* 65 Menara Pola. Susun balok warna mengikuti polanya (AB, AAB, ABC).
   Ketuk balok warna di nampan untuk menaruhnya di menara sesuai urutan.
   TK: pola AB 6 balok. SD: AAB dan ABC 9 balok + tebak 2 balok berikutnya. */
(function () {
  const { h, shuffle } = TI;

  const WARNA = {
    Merah: '#e5484d', Kuning: '#f0a800', Biru: '#2f6fed', Hijau: '#37b24d',
  };
  const swatch = (nama, besar) => h('span', {
    class: 'mp-sw', 'aria-hidden': 'true',
    style: { background: WARNA[nama], width: besar ? '54px' : '30px', height: besar ? '54px' : '30px' },
  });

  const CSS = `
.play[data-game="pola-menara"] .mp-wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="pola-menara"] .mp-panduan { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; padding: 10px 14px; }
.play[data-game="pola-menara"] .mp-panduan .mp-sw { border-radius: 8px; border: 3px solid rgba(0,0,0,0.15); }
.play[data-game="pola-menara"] .mp-tower { display: flex; flex-direction: column-reverse; align-items: center; gap: 4px; min-height: 60px; width: 100%; padding: 10px 0 0; border-bottom: 8px solid #8a6a45; }
.play[data-game="pola-menara"] .mp-blok { width: min(64%, 220px); height: 46px; border-radius: 9px; box-shadow: inset 0 -5px 0 rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.4); border: 3px solid rgba(0,0,0,0.12); }
.play[data-game="pola-menara"] .mp-blok.is-hint { animation: mp-hint 800ms var(--ease-in-out) 3; } /* motion-ok: petunjuk berkedip lembut */
@keyframes mp-hint { 50% { opacity: 0.45; } }
.play[data-game="pola-menara"] .mp-tray { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.play[data-game="pola-menara"] .mp-tray .choice { min-width: 96px; min-height: 96px; font-size: 1.1rem; font-weight: 800; flex-direction: column; }
.play[data-game="pola-menara"] .mp-sw { display: inline-block; border-radius: 10px; border: 3px solid rgba(0,0,0,0.15); }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="pola-menara"] .mp-blok.is-hint { animation: none !important; }
}`;

  TI.register({
    id: 'pola-menara',
    title: 'Menara Pola',
    cat: 'mat',
    icon: '🗼',
    desc: 'Susun balok warna mengikuti polanya.',
    async start(ctx) {
      TI.style('pola-menara', CSS);
      const ronde = ctx.isTK
        ? [
          { pola: ['Merah', 'Kuning', 'Merah', 'Kuning', 'Merah', 'Kuning'], nama: 'merah kuning' },
          { pola: ['Biru', 'Hijau', 'Biru', 'Hijau', 'Biru', 'Hijau'], nama: 'biru hijau' },
        ]
        : [
          { pola: ['Merah', 'Merah', 'Kuning', 'Merah', 'Merah', 'Kuning', 'Merah', 'Merah', 'Kuning'], nama: 'merah merah kuning' },
          { pola: ['Merah', 'Kuning', 'Biru', 'Merah', 'Kuning', 'Biru', 'Merah', 'Kuning', 'Biru'], nama: 'merah kuning biru' },
        ];
      const totalBlok = ronde.reduce((s, r) => s + r.pola.length, 0);
      let sudah = 0;
      ctx.progress(0, totalBlok);

      for (let r = 0; r < ronde.length; r++) {
        if (!ctx.alive) return;
        const { pola, nama } = ronde[r];
        const warnaUnik = [...new Set(pola)];
        ctx.ask('Ikuti polanya: ' + nama + '. Ketuk balok warna yang benar!');

        const wrap = h('div', { class: 'mp-wrap' });
        const panduan = h('div', { class: 'ti-panel mp-panduan', role: 'img', 'aria-label': 'Pola: ' + nama });
        pola.forEach((w) => panduan.append(swatch(w)));
        const tower = h('div', { class: 'mp-tower', 'aria-hidden': 'true' });
        const tray = h('div', { class: 'mp-tray' });
        wrap.append(panduan, tower, tray);
        ctx.el.append(wrap);

        let pos = 0, gagal = 0, blokTerakhir = null;
        const selesai = new Promise((res) => {
          warnaUnik.forEach((w) => {
            const b = h('button', { type: 'button', class: 'choice', 'aria-label': 'Balok ' + w }, swatch(w, true), h('span', null, w));
            b.addEventListener('click', async () => {
              if (pos >= pola.length || b.disabled) return;
              if (w === pola[pos]) {
                gagal = 0;
                const blok = h('div', { class: 'mp-blok pop-in', style: { background: WARNA[w] } });
                tower.append(blok);
                blokTerakhir = blok;
                pos++; sudah++;
                ctx.sfx('benar');
                ctx.progress(sudah, totalBlok);
                ctx.say(w);
                if (pos >= pola.length) { tray.querySelectorAll('button').forEach((x) => { x.disabled = true; }); ctx.after(700, res); }
              } else {
                gagal++;
                await ctx.wrong(b);
                if (gagal >= 3) {
                  // Tunjukkan: pasang balok yang benar otomatis.
                  gagal = 0;
                  const benar = pola[pos];
                  const blok = h('div', { class: 'mp-blok is-hint', style: { background: WARNA[benar] } });
                  tower.append(blok);
                  ctx.say('Yang benar balok ' + benar + '.');
                  pos++; sudah++;
                  ctx.progress(sudah, totalBlok);
                  if (pos >= pola.length) { tray.querySelectorAll('button').forEach((x) => { x.disabled = true; }); ctx.after(900, res); }
                }
              }
            });
            tray.append(b);
          });
        });
        await selesai;
        if (!ctx.alive) return;
        await ctx.wait(300);
        ctx.clear();
      }

      // SD: tebak 2 balok berikutnya. Pola berulang: balok ke-(panjang+k) sama dengan balok ke-k.
      if (ctx.isSD) {
        const pola = ronde[ronde.length - 1].pola;
        const warnaUnik = [...new Set(pola)];
        for (let k = 0; k < 2; k++) {
          if (!ctx.alive) return;
          const want = pola[k % pola.length];
          const baris = h('div', { class: 'ti-panel mp-panduan' });
          pola.forEach((w) => baris.append(swatch(w)));
          baris.append(h('b', null, ' + ?'));
          ctx.el.append(h('div', { class: 'mp-wrap' }, baris));
          ctx.ask(k === 0 ? 'Pola berlanjut. Balok berikutnya warna apa?' : 'Hebat! Satu lagi, setelah itu warna apa?');
          const opsi = shuffle(warnaUnik);
          await ctx.choose({
            options: opsi.map((w) => ({ node: swatch(w, true), value: w, say: w, aria: 'Balok ' + w })),
            answer: want,
            speakLabel: true,
          });
          ctx.clear();
        }
      }
      ctx.finish({ lesson: 'Pola adalah urutan yang berulang. Kalau tahu aturannya, kita bisa menebak lanjutannya.' });
    },
  });
})();
