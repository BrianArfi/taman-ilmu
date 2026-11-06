/* 57 Pasangan Doa. Memory: pasangkan doa sehari-hari dengan artinya.
   Lafaz Bismillah dan Alhamdulillah dipakai ulang dari 07-adab.js.
   Doa lain hanya judul + arti, tanpa mengarang lafaz.
   TK intip dulu, lalu cari. Pujian tengah jalan. */
(function () {
  const { h, shuffle, sample } = TI;

  // t = judul doa, a = arti. Arti Bismillah dan Alhamdulillah persis dari 07-adab.js.
  const BANK = [
    { t: 'Doa mau makan', a: 'Bismillah, dengan nama Allah', icon: '🍚' },
    { t: 'Doa sesudah makan', a: 'Alhamdulillah, segala puji bagi Allah', icon: '🍽️' },
    { t: 'Doa mau tidur', a: 'Mohon dijaga Allah saat tidur', icon: '🌙' },
    { t: 'Doa bangun tidur', a: 'Memuji Allah setelah bangun tidur', icon: '☀️' },
    { t: 'Doa masuk masjid', a: 'Masuk masjid dengan kaki kanan dan berdoa', icon: '🕌' },
    { t: 'Doa keluar masjid', a: 'Keluar masjid dan mohon rezeki Allah', icon: '🚪' },
    { t: 'Doa naik kendaraan', a: 'Mohon keselamatan Allah dalam perjalanan', icon: '🚗' },
    { t: 'Doa mau belajar', a: 'Mohon ilmu yang bermanfaat sebelum belajar', icon: '📖' },
  ];

  const P = '.play[data-game="doa-pasang"]';
  const CSS = `
${P} .dp-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
${P} .dp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; width: 100%; max-width: 560px; }
${P} .dp-grid[data-n="4"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
${P} .dp-card { position: relative; display: block; padding: 0; margin: 0; border: 0; background: none; cursor: pointer; border-radius: 18px; min-height: 108px; perspective: 600px; transition: transform var(--dur-press) var(--ease-out); }
${P} .dp-card:active:not([aria-disabled="true"]) { transform: scale(0.96); }
${P} .dp-dalam { position: absolute; inset: 0; display: block; transform-style: preserve-3d; transition: transform 250ms var(--ease-in-out); }
${P} .dp-card.is-open .dp-dalam { transform: rotateY(180deg); }
${P} .dp-muka { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px; border-radius: 18px; text-align: center; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 5px 0 var(--shadow); }
${P} .dp-belakang { color: #fff; font-size: 2rem; font-weight: 800; background: linear-gradient(150deg, #1f8a5b, var(--c)); border: 3px solid rgba(255, 255, 255, 0.55); }
${P} .dp-depan { transform: rotateY(180deg); background: #fff; border: 3px solid var(--line); font-weight: 800; }
${P} .dp-depan.is-judul { background: #e6f0ff; border-color: #2f6fed; color: #173a8a; }
${P} .dp-depan.is-arti { background: #fff1d9; border-color: #ff9f1c; color: #7a4600; }
${P} .dp-card.is-done .dp-depan { border-color: var(--good); }
${P} .dp-ikon { font-size: 1.8rem; line-height: 1; }
${P} .dp-teks { font-size: 0.92rem; line-height: 1.2; }
@media (prefers-reduced-motion: reduce) {
  ${P} .dp-dalam { transition: opacity var(--dur-ui) var(--ease-out); transform: none; }
  ${P} .dp-depan { transform: none; opacity: 0; }
  ${P} .dp-belakang { opacity: 1; }
  ${P} .dp-card.is-open .dp-depan { opacity: 1; }
  ${P} .dp-card.is-open .dp-belakang { opacity: 0; }
}`;

  TI.register({
    id: 'doa-pasang',
    title: 'Pasangan Doa',
    cat: 'islam',
    icon: '💌',
    desc: 'Pasangkan doa sehari-hari dengan artinya.',
    start(ctx) {
      TI.style('doa-pasang', CSS);
      const TK = ctx.isTK;
      const pasang = TK ? sample(BANK, 3) : sample(BANK, 6);
      const jumlah = pasang.length;

      ctx.ask('Balik kartu dan temukan judul doa dengan artinya!');
      ctx.progress(0, jumlah);
      const status = h('p', { class: 'ti-label', 'aria-live': 'polite' });
      const grid = h('div', { class: 'dp-grid' });
      grid.dataset.n = String(pasang.length * 2 <= 6 ? 4 : 6);
      ctx.el.append(h('div', { class: 'dp-wrap' }, status, grid));
      const info = (n) => { status.textContent = 'Pasangan ketemu: ' + n + ' dari ' + jumlah; };
      info(0);

      const data = shuffle(pasang.flatMap((p, i) => [
        { pair: i, sisi: 'judul', teks: p.t, icon: p.icon, ucap: p.t },
        { pair: i, sisi: 'arti', teks: p.a, icon: null, ucap: p.a },
      ]));

      let pertama = null, kunci = false, ketemu = 0, salah = 0;
      const kartu = data.map((c, i) => {
        const btn = h('button', { type: 'button', class: 'dp-card pop-in', style: '--i:' + i, 'aria-label': 'Kartu tertutup nomor ' + (i + 1) },
          h('span', { class: 'dp-dalam' },
            h('span', { class: 'dp-muka dp-belakang', 'aria-hidden': 'true' }, '💌'),
            h('span', { class: 'dp-muka dp-depan is-' + c.sisi },
              c.icon ? h('span', { class: 'dp-ikon', 'aria-hidden': 'true' }, c.icon) : null,
              h('span', { class: 'dp-teks' }, c.teks))));
        const k = { c, btn, buka: false, selesai: false };
        btn.addEventListener('click', () => ketuk(k));
        grid.append(btn);
        return k;
      });
      if (TK) { kartu.forEach((x) => x.btn.classList.add('is-open')); ctx.say('Ingat-ingat letaknya!'); ctx.sfx('pop'); ctx.after(2500, () => kartu.forEach((x) => { if (!x.buka && !x.selesai) x.btn.classList.remove('is-open'); })); }

      function buka(k) {
        k.buka = true;
        k.btn.classList.add('is-open');
        k.btn.setAttribute('aria-disabled', 'true');
        ctx.sfx('flip');
        ctx.say(k.c.ucap);
      }
      function tutup(k) {
        k.buka = false;
        k.btn.classList.remove('is-open');
        k.btn.removeAttribute('aria-disabled');
      }

      async function ketuk(k) {
        if (kunci || k.selesai || k.buka) return;
        buka(k);
        if (!pertama) { pertama = k; return; }
        const a = pertama; pertama = null;
        kunci = true;
        if (a.c.pair === k.c.pair) {
          await ctx.wait(330);
          a.selesai = k.selesai = true;
          a.btn.classList.add('is-done'); k.btn.classList.add('is-done');
          ketemu++;
          if (ketemu === Math.ceil(jumlah / 2)) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          ctx.progress(ketemu, jumlah);
          info(ketemu);
          ctx.sfx('benar');
          ctx.say(pasang[a.c.pair].t + ', ' + pasang[a.c.pair].a + '. Cocok!');
          if (ketemu === jumlah) {
            await ctx.wait(1200);
            ctx.finish({ stars: salah <= jumlah ? 3 : salah <= jumlah * 2 ? 2 : 1, total: jumlah, lesson: 'Berdoa setiap hari membuat hati tenang. Allah sayang pada anak yang selalu berdoa.' });
            return;
          }
          await ctx.wait(300);
        } else {
          salah++;
          await ctx.wait(TK ? 1100 : 900);
          tutup(a); tutup(k);
          // Bantuan anti macet: setelah 10 kali salah, satu pasang dibuka otomatis.
          if (salah >= 10 && salah % 5 === 0) {
            const sisa = kartu.filter((x) => !x.selesai);
            const p0 = sisa.length ? sisa[0].c.pair : -1;
            for (const x of kartu) {
              if (x.c.pair === p0 && !x.selesai) { x.selesai = true; x.btn.classList.add('is-open', 'is-done'); x.btn.setAttribute('aria-disabled', 'true'); }
            }
            ketemu++;
            ctx.progress(ketemu, jumlah);
            info(ketemu);
            ctx.say('Ini pasangannya ya. Ayo lanjutkan.');
            if (ketemu === jumlah) {
              await ctx.wait(1200);
              ctx.finish({ stars: 1, total: jumlah, lesson: 'Berdoa setiap hari membuat hati tenang. Allah sayang pada anak yang selalu berdoa.' });
              return;
            }
          }
        }
        kunci = false;
      }
    },
  });
})();
