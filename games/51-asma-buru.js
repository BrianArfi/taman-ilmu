/* 51 Buru Asmaul Husna. Arcade: nama-nama Allah yang indah jatuh dari atas,
   ketuk yang artinya cocok dengan arti di prompt. Bank Asmaul Husna + arti
   dipakai ulang dari 06-kartu.js (hanya Latin, tanpa teks Arab baru).
   Tiap ronde maks 20 detik lalu lanjut otomatis. */
(function () {
  const { h, shuffle, sample, pick } = TI;

  // Sama persis dengan dek Asmaul Husna di 06-kartu.js, tanpa kolom Arab.
  const BANK = [
    ['Ar-Rahman', 'Maha Pengasih'], ['Ar-Rahim', 'Maha Penyayang'],
    ['Al-Malik', 'Maha Merajai'], ['Al-Quddus', 'Maha Suci'],
    ['As-Salam', 'Maha Memberi Keselamatan'], ['Al-Khaliq', 'Maha Pencipta'],
    ["Al-'Alim", 'Maha Mengetahui'], ["As-Sami'", 'Maha Mendengar'],
    ['Al-Bashir', 'Maha Melihat'], ['Al-Ghaffar', 'Maha Pengampun'],
    ['Ar-Razzaq', 'Maha Pemberi Rezeki'], ['Al-Karim', 'Maha Mulia'],
  ].map(([nama, arti]) => ({ nama, arti }));

  const P = '.play[data-game="asma-buru"]';
  const CSS = `
${P} .ab-panel { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; min-height: 76px; }
${P} .ab-arti { padding: 8px 22px; border-radius: 999px; background: var(--good-bg); border: 3px solid var(--good); color: #0a6b49; font-size: 1.4rem; font-weight: 800; }
${P} .ab-scene { min-height: 340px; touch-action: manipulation; }
${P} .ab-item {
  position: absolute; left: 0; top: 0; min-height: 64px; min-width: 96px; max-width: 46%;
  padding: 10px 14px; border-radius: 18px; border: 3px solid var(--line); background: #fff;
  font-size: 1.12rem; font-weight: 800; color: var(--ink); cursor: pointer; will-change: transform;
  box-shadow: 0 4px 0 var(--shadow);
  transition: transform var(--dur-press) var(--ease-out), border-color var(--dur-ui) ease, background-color var(--dur-ui) ease;
}
${P} .ab-item:active { transform: scale(0.96); }
${P} .ab-item.is-target.is-reveal { border-color: var(--good); background: var(--good-bg); }
${P} .ab-waktu { width: 100%; max-width: 520px; height: 10px; border-radius: 999px; background: var(--line); overflow: hidden; }
${P} .ab-waktu i { display: block; height: 100%; background: linear-gradient(90deg, #37b24d, #ffd23f); transform-origin: left center; }
@media (prefers-reduced-motion: reduce) {
  ${P} .ab-item { transition: opacity var(--dur-ui) var(--ease-out); }
}`;

  TI.register({
    id: 'asma-buru',
    title: 'Buru Asmaul Husna',
    cat: 'islam',
    icon: '🏷️',
    desc: 'Tangkap nama Allah yang artinya cocok.',
    start(ctx) {
      TI.style('asma-buru', CSS);
      const TK = ctx.isTK;
      const JML = TK ? 6 : 10;
      const NAMA_LAYAR = TK ? 3 : 5;
      const BATAS = 20;
      const reduced = TI.reduced();
      const ronde = sample(BANK, JML);

      return ctx.series(ronde, async (target) => {
        ctx.ask('Tangkap nama yang artinya: ' + target.arti, { say: 'Tangkap nama Allah yang artinya ' + target.arti });
        const panel = h('div', { class: 'ti-panel ab-panel' },
          h('span', { class: 'ti-label' }, 'Artinya:'),
          h('span', { class: 'ab-arti pop-in' }, target.arti));
        const bar = h('div', { class: 'ab-waktu', 'aria-hidden': 'true' }, h('i', null));
        const scene = h('div', { class: 'ti-scene ab-scene', 'aria-label': 'Nama-nama yang jatuh. Ketuk yang artinya cocok.' });
        ctx.el.append(panel, bar, scene);

        // Pengecoh: arti lain, nama lain.
        const lawan = shuffle(BANK.filter((x) => x.nama !== target.nama)).slice(0, NAMA_LAYAR - 1);
        const daftar = shuffle([target, ...lawan]);
        let W = scene.clientWidth || 340, H = scene.clientHeight || 340;
        const ukur = () => { W = scene.clientWidth || 340; H = scene.clientHeight || 340; };
        ukur();
        ctx.on(window, 'resize', ukur);

        const items = daftar.map((d, i) => {
          const btn = h('button', { type: 'button', class: 'ab-item pop-in', style: '--i:' + i }, d.nama);
          scene.append(btn);
          return {
            d, el: btn, benar: d.nama === target.nama,
            x: ((i + 0.5) / daftar.length) * W,
            y: 24 - i * (TK ? 150 : 110) - Math.random() * 40,
            v: (H / (TK ? 13 : 8.5)) * (0.92 + Math.random() * 0.16) * (reduced ? 0.8 : 1),
          };
        });
        const gambar = (it) => {
          const w = it.el.offsetWidth || 110;
          const x = Math.max(4, Math.min(W - w - 4, it.x - w / 2));
          it.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + it.y.toFixed(1) + 'px,0)';
        };
        items.forEach(gambar);

        let selesai = false, gagal = 0, jalan = 0;
        const akhir = { fn: null };
        const berhenti = () => { selesai = true; };
        const stop = ctx.loop((dt) => {
          if (selesai) return false;
          jalan += dt;
          bar.firstChild.style.transform = 'scaleX(' + Math.max(0, 1 - jalan / BATAS).toFixed(3) + ')';
          for (const it of items) {
            it.y += it.v * dt;
            if (it.y > H + 20) { it.y = -80 - Math.random() * 40; }
            gambar(it);
          }
          if (jalan >= BATAS && akhir.fn) { const f = akhir.fn; akhir.fn = null; f('waktu'); }
        });

        await new Promise((lanjut) => {
          akhir.fn = async (sebab) => {
            if (selesai) return;
            berhenti();
            if (sebab === 'benar') { await ctx.correct(null, { say: target.nama + ' artinya ' + target.arti + '. Masya Allah!' }); }
            else {
              const b = items.find((x) => x.benar);
              if (b) b.el.classList.add('is-target', 'is-reveal');
              await ctx.sayWait(sebab === 'waktu' ? 'Waktunya habis. Yang benar ' + target.nama + ', artinya ' + target.arti + '.' : 'Nah, yang benar ' + target.nama + ', artinya ' + target.arti + '.');
            }
            stop();
            lanjut();
          };
          items.forEach((it) => it.el.addEventListener('click', () => {
            if (selesai) return;
            if (it.benar) {
              const f = akhir.fn; akhir.fn = null;
              ctx.sfx('pop');
              if (f) f('benar');
            } else {
              gagal++;
              ctx.wrong(it.el, { say: 'Bukan itu. Cari yang artinya ' + target.arti + '.' });
              if (gagal >= 3 && akhir.fn) { const f = akhir.fn; akhir.fn = null; f('bantu'); }
            }
          }));
        });
        if (!ctx.alive) return;
        ctx.say(pick(['Hebat!', 'Pintar!', 'Keren!']));
      }, {
        lesson: 'Asmaul Husna adalah nama-nama Allah yang indah. Contohnya Ar-Rahman artinya Maha Pengasih.',
      });
    },
  });
})();
