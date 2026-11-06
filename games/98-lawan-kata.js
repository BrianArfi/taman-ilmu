/* 98 Lawan Kata. Memory pasangan kata dengan lawannya: panas-dingin, besar-kecil, dan kawan-kawan.
   TK intip dulu, lalu cari. Pujian tengah jalan. Dua tahap: intip lalu cari. */
(function () {
  const { h, shuffle, sample } = TI;

  const CSS = `
.play[data-game="lawan-kata"] .lk-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="lawan-kata"] .lk-grid { display: grid; gap: 8px; width: min(100%, 440px); grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="lawan-kata"] .lk-card { min-height: 76px; min-width: 0; padding: 8px 4px; border: 0; border-radius: 16px; background: #2f6fed; color: #fff; font-weight: 800; font-size: 1.15rem; line-height: 1.25; cursor: pointer; box-shadow: 0 5px 0 var(--shadow); transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, opacity var(--dur-ui) ease; }
.play[data-game="lawan-kata"] .lk-card:active { transform: scale(0.96); }
.play[data-game="lawan-kata"] .lk-card.is-open { background: #ffc93c; color: var(--ink); }
.play[data-game="lawan-kata"] .lk-card.is-found { background: #12a150; box-shadow: none; }
.play[data-game="lawan-kata"] .lk-card.is-show { background: #ffc93c; color: var(--ink); }
.play[data-game="lawan-kata"] .lk-card:disabled { cursor: default; }
.play[data-game="lawan-kata"] .lk-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="lawan-kata"] .lk-card:active { transform: none; }
}
`;

  const PASANG = [
    ['panas', 'dingin'], ['besar', 'kecil'], ['cepat', 'lambat'], ['tinggi', 'rendah'],
    ['terang', 'gelap'], ['basah', 'kering'], ['panjang', 'pendek'], ['berat', 'ringan'],
  ];

  TI.register({
    id: 'lawan-kata',
    title: 'Lawan Kata',
    cat: 'logika',
    icon: '🌡️',
    desc: 'Pasangkan kata dengan lawannya.',
    start(ctx) {
      TI.style('lawan-kata', CSS);
      const tk = ctx.isTK;
      const pasang = tk ? sample(PASANG, 4) : sample(PASANG, 6);
      const total = pasang.length;
      const kartu = [];
      pasang.forEach(([a, b], i) => {
        kartu.push({ kata: a, id: i }); kartu.push({ kata: b, id: i });
      });
      const acak = shuffle(kartu);

      ctx.ask('Tahap 2: cari pasangan lawan katanya! Ketuk dua kartu.');

      const chip = h('div', { class: 'lk-chip' }, '0 dari ' + total + ' pasang');
      const grid = h('div', { class: 'lk-grid', style: '--n:' + (tk ? 2 : 3), role: 'group', 'aria-label': 'Kartu lawan kata' });
      const tombol = acak.map((k, i) => {
        const b = h('button', { type: 'button', class: 'lk-card pop-in', style: '--i:' + i, 'aria-label': 'Kartu ' + (i + 1) }, '?');
        b.addEventListener('click', () => ketuk(i));
        grid.append(b);
        return b;
      });
      ctx.el.append(h('div', { class: 'lk-wrap' }, chip, grid));
      if (tk) { tombol.forEach((b, i) => { b.textContent = acak[i].kata; b.classList.add('is-open'); }); ctx.say('Tahap 1: ingat-ingat letaknya!'); ctx.sfx('pop'); ctx.after(2500, () => tombol.forEach((b, k) => { if (!temu(k)) { b.textContent = '?'; b.classList.remove('is-open'); } })); }

      let buka = [], ketemu = 0, miss = 0, ketukN = 0, kunci = false, selesai = false;
      const temu = (i) => tombol[i].classList.contains('is-found');
      function pasangOtomatis() {
        const sisa = acak.map((k, k2) => k2).filter((k2) => !temu(k2));
        if (sisa.length < 2) return;
        const dua = sisa.filter((k2) => acak[k2].id === acak[sisa[0]].id);
        dua.forEach((k2) => {
          tombol[k2].textContent = acak[k2].kata;
          tombol[k2].classList.add('is-found');
          tombol[k2].disabled = true;
        });
        ketemu++;
        chip.textContent = ketemu + ' dari ' + total + ' pasang';
        ctx.progress(ketemu, total);
      }

      async function ketuk(i) {
        if (kunci || selesai || temu(i) || buka.includes(i)) return;
        ketukN++;
        // tiap 15 ketukan tanpa selesai, satu pasang dicocokkan otomatis
        if (ketukN % 15 === 0 && buka.length === 0) {
          kunci = true;
          pasangOtomatis();
          ctx.sfx('benar');
          ctx.say('Satu pasang dibantu. Lanjutkan!');
          kunci = false;
          if (ketemu >= total && !selesai) {
            selesai = true;
            await ctx.wait(500);
            if (!ctx.alive) return;
            ctx.finish({
              stars: miss <= total ? 3 : miss <= total * 2 ? 2 : 1,
              lesson: 'Setiap kata punya lawan: panas lawannya dingin, besar lawannya kecil.',
            });
          }
          return;
        }
        tombol[i].textContent = acak[i].kata;
        tombol[i].classList.add('is-open');
        ctx.sfx('flip');
        ctx.say(acak[i].kata);
        buka.push(i);
        if (buka.length < 2) return;
        kunci = true;
        const [a, b] = buka;
        await ctx.wait(550);
        if (!ctx.alive) return;
        if (acak[a].id === acak[b].id) {
          tombol[a].classList.add('is-found'); tombol[b].classList.add('is-found');
          tombol[a].disabled = true; tombol[b].disabled = true;
          ketemu++;
          if (ketemu === Math.ceil(total / 2)) ctx.correct(null, { say: 'Bagus! Setengah jalan, terus naik sampai semua ketemu!' });
          chip.textContent = ketemu + ' dari ' + total + ' pasang';
          ctx.sfx('benar');
          ctx.say(acak[a].kata + ' lawannya ' + acak[b].kata + '. Hebat!');
          ctx.progress(ketemu, total);
          buka = []; kunci = false;
          if (ketemu >= total) {
            selesai = true;
            await ctx.wait(500);
            if (!ctx.alive) return;
            ctx.finish({
              stars: miss <= total ? 3 : miss <= total * 2 ? 2 : 1,
              lesson: 'Setiap kata punya lawan: panas lawannya dingin, besar lawannya kecil.',
            });
          }
        } else {
          miss++;
          tombol[a].classList.remove('is-open'); tombol[b].classList.remove('is-open');
          await ctx.wrong(null, { say: 'Belum pas. Coba ingat-ingat lagi.', min: 450 });
          if (!ctx.alive) return;
          tombol[a].textContent = '?'; tombol[b].textContent = '?';
          buka = []; kunci = false;
          if (miss >= 12) {
            miss = 0; ctx.mistakes++;
            const sisa = acak.map((k, k2) => k2).filter((k2) => !temu(k2));
            const idc = acak[sisa[0]].id;
            const dua = sisa.filter((k2) => acak[k2].id === idc);
            dua.forEach((k2) => {
              tombol[k2].textContent = acak[k2].kata;
              tombol[k2].classList.add('is-show');
            });
            ctx.say('Lihat, dua kartu ini pasangan. Ingat-ingat ya!');
            await ctx.wait(1600);
            if (!ctx.alive) return;
            dua.forEach((k2) => {
              if (!temu(k2)) { tombol[k2].textContent = '?'; tombol[k2].classList.remove('is-show'); }
            });
          }
        }
      }
      ctx.progress(0, total);
    },
  });
})();
