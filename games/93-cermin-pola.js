/* 93 Cermin Pola. Kiri sudah terisi, ketuk kotak kanan agar sama seperti cermin.
   Pola pertama jarang isinya (gampang dulu), lalu makin padat. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="cermin-pola"] .cm-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="cermin-pola"] .cm-board { display: grid; gap: 6px; width: min(100%, 380px); padding: 10px; border-radius: 22px; background: #eadfc6; box-shadow: 0 5px 0 var(--shadow); grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="cermin-pola"] .cm-cell { position: relative; aspect-ratio: 1; min-height: 0; min-width: 0; padding: 0; border-radius: 12px; border: 3px solid transparent; background: #fff; box-shadow: 0 3px 0 var(--shadow); transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, border-color var(--dur-ui) ease; }
.play[data-game="cermin-pola"] button.cm-cell { cursor: pointer; }
.play[data-game="cermin-pola"] button.cm-cell:active { transform: scale(0.95); }
.play[data-game="cermin-pola"] .cm-cell.is-given { background: #2f6fed; box-shadow: none; }
.play[data-game="cermin-pola"] .cm-cell.is-on { background: #2f6fed; }
.play[data-game="cermin-pola"] .cm-cell.is-mid-l { border-right: 4px dashed #e8590c; border-radius: 12px 0 0 12px; }
.play[data-game="cermin-pola"] .cm-cell.is-mid-r { border-left: 4px dashed #e8590c; border-radius: 0 12px 12px 0; }
.play[data-game="cermin-pola"] .cm-cell.is-ok { border-color: var(--good); }
.play[data-game="cermin-pola"] .cm-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
`;

  TI.register({
    id: 'cermin-pola',
    title: 'Cermin Pola',
    cat: 'logika',
    icon: '◑',
    desc: 'Lengkapi bayangan cerminnya.',
    start(ctx) {
      TI.style('cermin-pola', CSS);
      const tk = ctx.isTK;
      const n = tk ? 4 : 6;
      const total = tk ? 3 : 4;

      const main = async () => {
        for (let pi = 0; pi < total && ctx.alive; pi++) {
          ctx.progress(pi, total);
          ctx.clear();
          await satu(pi);
          if (pi < total - 1 && ctx.alive) ctx.correct(null, { say: 'Bagus! Terus naik ke babak ' + (pi + 2) + '!' });
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({ lesson: 'Cermin memantulkan sama persis. Kanan dan kiri harus sama.' });
      };

      function polaAcak(pi) {
        const padat = pi === 0 ? 0.3 : 0.45; // pola pertama jarang, gampang dulu
        const maks = pi === 0 ? n + 1 : n * n / 2 - 1;
        for (let t = 0; t < 60; t++) {
          const kiri = Array.from({ length: n }, () => Array.from({ length: n / 2 }, () => Math.random() < padat));
          const isi = kiri.flat().filter(Boolean).length;
          if (isi >= n && isi <= maks) return kiri;
        }
        const kiri = Array.from({ length: n }, () => Array.from({ length: n / 2 }, () => false));
        kiri[0][0] = true; kiri[1][1] = true; kiri[n - 1][0] = true;
        return kiri;
      }

      function satu(pi) {
        return new Promise((resolve) => {
          const kiri = polaAcak(pi);
          const kanan = Array.from({ length: n }, () => Array(n / 2).fill(false));
          let gagal = 0, ketukN = 0, selesai = false;
          const tombol = [];

          ctx.ask(pi === 0
            ? 'Lengkapi bayangan cerminnya! Ketuk kotak putih agar sama dengan kiri.'
            : 'Babak ' + (pi + 1) + '. Buat kanan sama dengan kiri!');

          const chip = h('div', { class: 'cm-chip' }, 'Babak ' + (pi + 1) + ' dari ' + total);
          const papan = h('div', { class: 'cm-board', style: '--n:' + n, 'aria-label': 'Papan cermin' });
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
            const setengah = n / 2;
            if (c < setengah) {
              const d = h('div', {
                class: 'cm-cell' + (kiri[r][c] ? ' is-given' : '') + (c === setengah - 1 ? ' is-mid-l' : ''),
                'aria-hidden': 'true',
              });
              papan.append(d);
            } else {
              const cc = c - setengah;
              const b = h('button', {
                type: 'button',
                class: 'cm-cell' + (c === setengah ? ' is-mid-r' : ''),
                'aria-label': 'Kotak baris ' + (r + 1) + ' kolom ' + (c + 1),
              });
              b.addEventListener('click', () => ketuk(r, cc, b));
              tombol.push(b); papan.append(b);
            }
          }
          const bCek = h('button', { type: 'button', class: 'ti-btn' }, '✔ Cek');
          bCek.addEventListener('click', () => cek(false));
          ctx.el.append(h('div', { class: 'cm-wrap' }, chip, papan,
            h('div', { class: 'ti-toolbar' }, bCek)));

          const cermin = (r, cc) => kiri[r][n / 2 - 1 - cc];
          const cocokSemua = () => kanan.every((baris, r) => baris.every((v, cc) => v === cermin(r, cc)));

          function ketuk(r, cc, b) {
            if (selesai) return;
            kanan[r][cc] = !kanan[r][cc];
            b.classList.toggle('is-on', kanan[r][cc]);
            ctx.sfx('tap');
            ketukN++;
            if (cocokSemua()) { menang(); return; }
            // tiap 20 ketukan tanpa cocok, pola dilengkapi otomatis
            if (ketukN % 20 === 0) { gagal = 99; cek(false); }
          }

          async function cek(otomatis) {
            if (selesai) return;
            if (cocokSemua()) { menang(); return; }
            gagal++;
            await ctx.wrong(null, { say: 'Belum sama. Lihat lagi kiri dan kanannya.', min: 500 });
            if (!ctx.alive || selesai) return;
            if (gagal >= 3) {
              gagal = 0; ctx.mistakes++;
              for (let r = 0; r < n; r++) for (let cc = 0; cc < n / 2; cc++) {
                kanan[r][cc] = cermin(r, cc);
                tombol[r * (n / 2) + cc].classList.toggle('is-on', kanan[r][cc]);
              }
              ctx.say('Lihat caranya, kanan dibuat sama dengan kiri. Nanti coba lagi di babak berikutnya ya!');
              await ctx.wait(1500);
              if (ctx.alive) menang();
            }
            void otomatis;
          }

          async function menang() {
            if (selesai) return;
            selesai = true;
            tombol.forEach((b) => { b.classList.add('is-ok'); b.disabled = true; });
            bCek.disabled = true;
            await ctx.correct(null, { say: 'Sama persis! Kamu hebat.', min: 900 });
            if (ctx.alive) { ctx.progress(pi + 1, total); resolve(); }
          }
        });
      }

      return main();
    },
  });
})();
