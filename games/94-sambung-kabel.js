/* 94 Sambung Kabel. Ketuk ujung warna lalu ketuk sel sebelahnya untuk menarik kabel. Sambungkan tiap pasang tanpa bersinggungan.
   Kabel kedua jalurnya lebih panjang (naik). */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="sambung-kabel"] .sk-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="sambung-kabel"] .sk-board { display: grid; gap: 5px; width: min(100%, 370px); padding: 10px; border-radius: 22px; background: #2b2d42; box-shadow: 0 5px 0 var(--shadow); grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="sambung-kabel"] .sk-cell { position: relative; aspect-ratio: 1; min-height: 64px; min-width: 0; padding: 0; border: 0; border-radius: 12px; background: #4a4e69; cursor: pointer; transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease; }
.play[data-game="sambung-kabel"] .sk-cell:active { transform: scale(0.95); }
.play[data-game="sambung-kabel"] .sk-dot { position: absolute; inset: 22%; border-radius: 50%; background: var(--kc); box-shadow: 0 0 0 3px rgba(255,255,255,0.85); }
.play[data-game="sambung-kabel"] .sk-cell.is-wire { background: var(--kc); }
.play[data-game="sambung-kabel"] .sk-cell.is-head { box-shadow: inset 0 0 0 4px #fff; }
.play[data-game="sambung-kabel"] .sk-cell.is-done { box-shadow: inset 0 0 0 3px rgba(255,255,255,0.7); }
.play[data-game="sambung-kabel"] .sk-cell.is-sel { box-shadow: inset 0 0 0 4px #fff; }
.play[data-game="sambung-kabel"] .sk-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
`;

  const WARNA = [
    { c: '#e5484d', nama: 'merah' }, { c: '#2f6fed', nama: 'biru' }, { c: '#12a150', nama: 'hijau' },
  ];
  const P = (r, c) => [r, c];
  const SAMA = (a, b) => a[0] === b[0] && a[1] === b[1];
  const DEKAT = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

  // solusi: jalur tiap warna dari ujung A ke ujung B, tidak bersinggungan.
  const TK = [
    {
      n: 4,
      kabel: [
        { jalur: [P(0, 0), P(1, 0), P(2, 0), P(2, 1), P(3, 1), P(3, 2)] },
        { jalur: [P(0, 3), P(1, 3), P(2, 3), P(3, 3)] },
      ],
    },
    {
      n: 4,
      kabel: [
        { jalur: [P(0, 0), P(0, 1), P(0, 2), P(0, 3), P(1, 3), P(2, 3), P(3, 3)] },
        { jalur: [P(3, 0), P(2, 0), P(1, 0), P(1, 1), P(2, 1)] },
      ],
    },
  ];
  const SD = [
    {
      n: 5,
      kabel: [
        { jalur: [P(0, 0), P(1, 0), P(2, 0), P(3, 0), P(4, 0)] },
        { jalur: [P(0, 4), P(1, 4), P(2, 4), P(3, 4), P(4, 4)] },
        { jalur: [P(2, 1), P(2, 2), P(2, 3)] },
      ],
    },
    {
      n: 5,
      kabel: [
        { jalur: [P(0, 0), P(1, 0), P(2, 0), P(2, 1), P(2, 2), P(3, 2), P(4, 2), P(4, 3), P(4, 4)] },
        { jalur: [P(0, 4), P(1, 4), P(2, 4), P(2, 3), P(3, 3), P(3, 4)] },
        { jalur: [P(0, 1), P(0, 2), P(0, 3)] },
      ],
    },
  ];

  TI.register({
    id: 'sambung-kabel',
    title: 'Sambung Kabel',
    cat: 'logika',
    icon: '🔌',
    desc: 'Sambungkan warna sama tanpa bersinggungan.',
    start(ctx) {
      TI.style('sambung-kabel', CSS);
      const tk = ctx.isTK;
      const soal = tk ? TK : SD;

      const main = async () => {
        for (let pi = 0; pi < soal.length && ctx.alive; pi++) {
          ctx.progress(pi, soal.length);
          ctx.clear();
          await satu(pi);
          if (pi < soal.length - 1 && ctx.alive) ctx.correct(null, { say: 'Bagus! Terus naik ke babak ' + (pi + 2) + '!' });
        }
        if (!ctx.alive) return;
        ctx.progress(soal.length, soal.length);
        ctx.finish({ lesson: 'Kabel warna sama harus tersambung. Jalur yang rapi tidak bersinggungan.' });
      };

      function satu(pi) {
        return new Promise((resolve) => {
          const { n, kabel } = soal[pi];
          const NK = kabel.length;
          // jalan[ki] = sel yang sudah terisi (mulai dari ujung A). done[ki] = sudah sampai ujung B.
          let jalan = kabel.map((k) => [k.jalur[0]]);
          let done = kabel.map(() => false);
          let pilih = 0, mandek = 0, ketukN = 0, selesai = false;

          ctx.ask(pi === 0
            ? 'Sambungkan warna yang sama! Ketuk ujung warna, lalu ketuk sel sebelahnya.'
            : 'Babak ' + (pi + 1) + '. Sambungkan semua warna!');

          const chip = h('div', { class: 'sk-chip' }, 'Babak ' + (pi + 1) + ' dari ' + soal.length);
          const papan = h('div', { class: 'sk-board', style: '--n:' + n, 'aria-label': 'Papan kabel' });
          const bReset = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '↺ Ulang');
          const bBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          bReset.addEventListener('click', () => {
            if (selesai) return;
            jalan = kabel.map((k) => [k.jalur[0]]); done = kabel.map(() => false);
            mandek = 0; ctx.sfx('tap'); gambar();
            ctx.say('Diulang. Tarik lagi kabelnya.');
          });
          bBantu.addEventListener('click', () => { if (!selesai) bantu(true); });
          ctx.el.append(h('div', { class: 'sk-wrap' }, chip, papan,
            h('div', { class: 'ti-toolbar' }, bReset, bBantu)));

          const ujungA = (ki) => kabel[ki].jalur[0];
          const ujungB = (ki) => kabel[ki].jalur[kabel[ki].jalur.length - 1];
          const kepala = (ki) => jalan[ki][jalan[ki].length - 1];
          function pemilik(r, c) {
            for (let ki = 0; ki < NK; ki++) {
              if (done[ki]) {
                if (kabel[ki].jalur.some((s) => s[0] === r && s[1] === c)) return { ki, kunci: true };
              } else if (jalan[ki].some((s) => s[0] === r && s[1] === c)) return { ki, kunci: false };
            }
            return null;
          }

          function gambar() {
            papan.replaceChildren();
            for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
              const p = pemilik(r, c);
              const ki = p ? p.ki : -1;
              const sel = [r, c];
              const ujung = ki < 0 && kabel.some((k) => SAMA(k.jalur[0], sel) || SAMA(k.jalur[k.jalur.length - 1], sel));
              const isUjung = (k) => SAMA(k.jalur[0], sel) || SAMA(k.jalur[k.jalur.length - 1], sel);
              const b = h('button', {
                type: 'button',
                class: 'sk-cell' + (ki >= 0 ? ' is-wire' : '')
                  + (ki >= 0 && !p.kunci && SAMA(kepala(ki), sel) && jalan[ki].length > 1 ? ' is-head' : '')
                  + (ki >= 0 && p.kunci ? ' is-done' : '')
                  + (ki >= 0 && ki === pilih && !done[ki] ? ' is-sel' : ''),
                style: ki >= 0 ? '--kc:' + WARNA[ki].c : '',
                'aria-label': ki >= 0 ? 'Kabel ' + WARNA[ki].nama : 'Kotak kosong baris ' + (r + 1) + ' kolom ' + (c + 1),
              });
              if (ki < 0 && ujung) {
                const w = kabel.findIndex(isUjung);
                b.append(h('span', { class: 'sk-dot', style: '--kc:' + WARNA[w].c, 'aria-hidden': 'true' }));
              } else if (ki >= 0 && isUjung(kabel[ki]) && !p.kunci && jalan[ki].length === 1) {
                b.append(h('span', { class: 'sk-dot', style: '--kc:' + WARNA[ki].c, 'aria-hidden': 'true' }));
              }
              b.addEventListener('click', () => ketuk(r, c));
              papan.append(b);
            }
          }

          async function ketuk(r, c) {
            if (selesai) return;
            ketukN++;
            const sel = [r, c];
            const p = pemilik(r, c);
            // ketuk ujung atau jalurnya sendiri: pilih warna itu
            if (p && !p.kunci) {
              pilih = p.ki;
              // ketuk sel kedua dari belakang: mundur satu langkah
              const j = jalan[p.ki];
              if (j.length > 1 && SAMA(j[j.length - 2], sel)) {
                j.pop(); mandek = 0; ctx.sfx('tap'); gambar(); jaga(); return;
              }
              ctx.sfx('tap'); gambar(); jaga(); return;
            }
            if (p && p.kunci) { ctx.say('Kabel ' + WARNA[p.ki].nama + ' sudah tersambung.'); return; }
            const ujung = kabel.findIndex((k, ki) => !done[ki] && (SAMA(k.jalur[0], sel) || SAMA(k.jalur[k.jalur.length - 1], sel)));
            if (ujung >= 0) {
              pilih = ujung;
              // mulai dari ujung yang diketuk kalau jalurnya masih satu sel
              if (jalan[ujung].length === 1 && !SAMA(jalan[ujung][0], sel)) jalan[ujung] = [sel];
              ctx.sfx('tap'); gambar(); jaga(); return;
            }
            // tarik dari kepala warna terpilih
            if (!done[pilih] && DEKAT(kepala(pilih), sel) && !pemilik(r, c)) {
              jalan[pilih].push(sel);
              mandek = 0;
              const B = ujungB(pilih), A = ujungA(pilih);
              const ujungLain = SAMA(A, jalan[pilih][0]) ? B : A;
              if (SAMA(sel, ujungLain)) {
                done[pilih] = true;
                ctx.sfx('benar');
                ctx.say('Kabel ' + WARNA[pilih].nama + ' tersambung!');
                gambar();
                if (done.every(Boolean)) { menang(); return; }
                const sisa = done.findIndex((d) => !d);
                pilih = sisa;
                gambar(); jaga();
                return;
              }
              ctx.sfx('pop'); gambar(); jaga(); return;
            }
            mandek++;
            await ctx.wrong(null, { say: 'Tidak bisa ke sana. Ketuk sel di sebelah ujung kabel.', min: 450 });
            if (!ctx.alive || selesai) return;
            if (mandek >= 8) { mandek = 0; bantu(false); }
            else jaga();
          }

          // tiap 20 ketukan tanpa selesai, 1 kabel diisi. mentok 60 ketukan, semua diisi.
          function jaga() {
            if (selesai || !ctx.alive) return;
            if (ketukN >= 60) {
              ctx.mistakes++;
              jalan = kabel.map((k) => k.jalur.map((s) => s.slice()));
              done = kabel.map(() => true);
              ctx.sfx('benar');
              ctx.say('Lihat, semua kabel tersambung!');
              gambar();
              menang();
            } else if (ketukN % 20 === 0) {
              bantu(false);
            }
          }

          // solusi bisa diisi kalau semua selnya bebas (atau sudah milik pasang itu sendiri)
          function bisaIsi(ki) {
            return kabel[ki].jalur.every(([r, c]) => {
              const p = pemilik(r, c);
              return !p || p.ki === ki;
            });
          }
          function bantu(tombol) {
            if (selesai) return;
            if (tombol) ctx.mistakes++;
            // isi 1 kabel: pilih pasang yang solusinya bebas (progres lain tidak dihapus)
            if (done.every(Boolean)) return;
            let target = -1;
            for (let ki = 0; ki < NK; ki++) if (!done[ki] && bisaIsi(ki)) { target = ki; break; }
            if (target < 0) {
              // semua terhalang: ulang yang belum selesai, lalu isi pasang pertama
              for (let ki = 0; ki < NK; ki++) if (!done[ki]) jalan[ki] = [kabel[ki].jalur[0]];
              for (let ki = 0; ki < NK; ki++) if (!done[ki]) { target = ki; break; }
            }
            if (target < 0) return;
            jalan[target] = kabel[target].jalur.map((s) => s.slice());
            done[target] = true;
            mandek = 0;
            ctx.sfx('benar');
            ctx.say('Lihat cara benar: satu kabel terisi. Lanjutkan yang lain!');
            const sisa = done.findIndex((d) => !d);
            pilih = sisa < 0 ? 0 : sisa;
            gambar();
            if (done.every(Boolean)) menang();
          }

          async function menang() {
            if (selesai) return;
            selesai = true;
            await ctx.correct(null, { say: 'Semua kabel tersambung! Hebat!', min: 1100 });
            if (ctx.alive) { ctx.progress(pi + 1, soal.length); resolve(); }
          }

          gambar();
        });
      }

      return main();
    },
  });
})();
