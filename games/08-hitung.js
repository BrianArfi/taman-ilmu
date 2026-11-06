/* 08 Ayo Berhitung. TK: hitung 1-10 benda dengan mengetuk (muncul angka urutan). SD: hitung 11-30 benda
   tersusun per 10, lalu perkalian kelompok (piring berisi kue). */
(function () {
  const { h, rand, shuffle, sample } = TI;

  const BENDA = [
    ['🍎', 'apel'], ['🍌', 'pisang'], ['🍊', 'jeruk'], ['🍇', 'anggur'], ['🍓', 'stroberi'],
    ['⭐', 'bintang'], ['🎈', 'balon'], ['🌙', 'bulan'], ['🍪', 'kue'], ['⚽', 'bola'],
  ];
  const MAKANAN = BENDA.filter((b) => ['apel', 'pisang', 'jeruk', 'anggur', 'stroberi', 'kue'].includes(b[1]));

  // Angka dalam kata, supaya suara pembaca tidak salah baca.
  const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  function kata(n) {
    if (n < 10) return SATUAN[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return SATUAN[n - 10] + ' belas';
    if (n < 100) return SATUAN[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SATUAN[n % 10] : '');
    return String(n);
  }

  const CSS = `
.play[data-game="hitung"] .hit-grid {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 24px 10px; padding-top: 12px;
  max-width: calc(5 * 64px + 4 * 10px);
}
.play[data-game="hitung"] .hit-item {
  position: relative; width: 64px; height: 64px; padding: 0; border: 3px solid var(--line); border-radius: 18px;
  background: var(--card); box-shadow: 0 4px 0 var(--shadow); font-size: 2.1rem; line-height: 1; cursor: pointer;
  transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, border-color var(--dur-ui) ease;
}
.play[data-game="hitung"] .hit-item:active { transform: scale(0.95); }
.play[data-game="hitung"] .hit-item.is-counted { border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, #fff); }
.play[data-game="hitung"] .hit-badge {
  position: absolute; top: -15px; left: 50%; margin-left: -15px; width: 30px; height: 30px; display: grid; place-items: center;
  border-radius: 50%; background: var(--c); color: #fff; font-size: 1rem; font-weight: 800; line-height: 1;
  box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 70%, #000); opacity: 0; transform: scale(0.95); pointer-events: none;
  transition: opacity var(--dur-ui) var(--ease-out), transform var(--dur-ui) var(--ease-out);
}
.play[data-game="hitung"] .hit-item.is-counted .hit-badge { opacity: 1; transform: none; }
.play[data-game="hitung"] .hit-tip { margin-top: 0; text-align: center; }
.play[data-game="hitung"] .hit-tip:not(:last-child) { margin-bottom: 0; }

.play[data-game="hitung"] .hit-rows { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 560px; }
.play[data-game="hitung"] .hit-row {
  display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); align-items: center; justify-items: center;
  padding: 6px 4px; border-radius: 16px; border: 3px dashed var(--line); font-size: min(2rem, 6.3vw); line-height: 1.15;
}
.play[data-game="hitung"] .hit-row.is-full { border-style: solid; border-color: color-mix(in srgb, var(--c) 35%, #fff); background: color-mix(in srgb, var(--c) 8%, #fff); }

.play[data-game="hitung"] .hit-plates { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; max-width: 560px; }
.play[data-game="hitung"] .hit-plate {
  display: grid; place-items: center; width: 98px; height: 98px; border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #fff 0, #fff 62%, #eef1f6 63%, #e1e6ee 100%);
  box-shadow: 0 4px 0 var(--shadow), inset 0 0 0 3px #d9dfe9;
}
.play[data-game="hitung"] .hit-plate-in { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; font-size: 1.35rem; line-height: 1.1; }
.play[data-game="hitung"] .hit-opts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 560px; }
.play[data-game="hitung"] .hit-opts .choice { min-width: 0; min-height: 84px; font-size: 2rem; }
@media (min-width: 700px) {
  .play[data-game="hitung"] .hit-grid { gap: 28px 14px; max-width: calc(5 * 80px + 4 * 14px); }
  .play[data-game="hitung"] .hit-item { width: 80px; height: 80px; border-radius: 22px; font-size: 2.7rem; }
  .play[data-game="hitung"] .hit-badge { top: -16px; margin-left: -16px; width: 32px; height: 32px; font-size: 1.1rem; }
}
@media (max-width: 560px) {
  .play[data-game="hitung"] .hit-opts { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 320px; }
  .play[data-game="hitung"] .hit-plate { width: 84px; height: 84px; }
  .play[data-game="hitung"] .hit-plate-in { font-size: 1.15rem; }
}`;

  // Pilihan angka untuk SD: jawaban + tiga angka yang dekat.
  function pilihanAngka(ans, n, kandidat) {
    const set = new Set([ans]);
    for (const c of shuffle(kandidat)) { if (set.size >= n) break; if (c > 0 && c !== ans) set.add(c); }
    for (let d = 1; set.size < n; d++) set.add(ans + d);
    return shuffle([...set]);
  }

  TI.register({
    id: 'hitung',
    title: 'Ayo Berhitung',
    cat: 'mat',
    icon: '🍎',
    desc: 'Hitung banyak benda satu per satu, lalu belajar kelompok yang sama banyak.',
    start(ctx) {
      TI.style('hitung', CSS);
      return ctx.isTK ? mainTK(ctx) : mainSD(ctx);
    },
  });

  // ---------- TK: hitung 1-10 benda ----------
  function mainTK(ctx) {
    const jumlah = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 8).sort((a, b) => a - b); // urut gampang dulu
    const benda = shuffle(BENDA);
    const soal = jumlah.map((n, i) => ({ n, b: benda[i % benda.length], pertama: i === 0 }));

    let ke = 0; return ctx.series(soal, async ({ n, b, pertama }) => { ke++; if (ke === 4) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
      const [emo, nama] = b;
      ctx.ask('Ada berapa ' + nama + '?', {
        say: pertama ? 'Ada berapa ' + nama + '? Ketuk setiap ' + nama + ' untuk menghitung.' : undefined,
      });
      let urut = 0;
      const grid = h('div', { class: 'ti-emoji-grid hit-grid' });
      for (let i = 0; i < n; i++) {
        const badge = h('span', { class: 'hit-badge', 'aria-hidden': 'true' });
        const btn = h('button', { type: 'button', class: 'hit-item pop-in', 'data-tap': true, style: '--i:' + Math.min(i, 9), 'aria-label': nama + ' ke-' + (i + 1) },
          h('span', { 'aria-hidden': 'true' }, emo), badge);
        let no = 0, dipuji = false;
        btn.addEventListener('click', () => {
          ctx.sfx('tap');
          if (!no) { no = ++urut; badge.textContent = String(no); btn.classList.add('is-counted'); if (urut === n && !dipuji) { dipuji = true; ctx.sfx('benar'); } }
          ctx.say(kata(no)); // ketuk lagi: hanya menyebut angkanya, tidak menghitung ulang
        });
        grid.append(btn);
      }
      ctx.el.append(grid, h('p', { class: 'ti-label hit-tip' }, 'Ketuk benda untuk menghitung'));
      await ctx.choose({
        options: TI.numChoices(n, 3, 1, 10).map((v) => ({ label: String(v), value: v, say: kata(v), cls: 'is-big' })),
        answer: n,
      });
    }, { lesson: 'Menghitung satu per satu dengan teliti membuat jawaban kita benar.' });
  }

  // ---------- SD: hitung 11-30 dan perkalian kelompok ----------
  function mainSD(ctx) {
    const hitung = sample([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29], 4).sort((a, b) => a - b) // urut gampang dulu
      .map((n, i) => ({ tipe: 'hitung', n, b: BENDA[(rand(0, 9) + i * 3) % BENDA.length] }));
    const kali = [];
    const dipakai = new Set();
    while (kali.length < 4) {
      const j = rand(2, 5), p = rand(2, 6), key = j + 'x' + p;
      if (dipakai.has(key)) continue;
      dipakai.add(key);
      kali.push({ tipe: 'kali', j, p, b: MAKANAN[(rand(0, 5) + kali.length) % MAKANAN.length] });
    }

    let ke = 0; return ctx.series([...hitung, ...kali.sort((a, b) => a.j * a.p - b.j * b.p)], async (s) => { ke++; if (ke === 4) ctx.correct(null, { say: 'Bagus! Terus naik ke perkalian!' });
      if (s.tipe === 'hitung') await soalHitung(ctx, s);
      else await soalKali(ctx, s);
    }, { lesson: 'Menghitung satu per satu dengan teliti membuat jawaban kita benar.' });
  }

  async function soalHitung(ctx, { n, b }) {
    const [emo, nama] = b;
    ctx.ask('Ada berapa ' + nama + '?', { say: 'Ada berapa ' + nama + '? Satu baris penuh isinya sepuluh.' });
    const rows = h('div', { class: 'hit-rows pop-in', role: 'img', 'aria-label': n + ' ' + nama });
    for (let sisa = n; sisa > 0; sisa -= 10) {
      const isi = Math.min(10, sisa);
      const row = h('div', { class: 'hit-row ' + (isi === 10 ? 'is-full' : 'is-part'), 'aria-hidden': 'true' });
      for (let i = 0; i < isi; i++) row.append(h('span', null, emo));
      rows.append(row);
    }
    ctx.el.append(rows, h('p', { class: 'ti-label hit-tip' }, 'Satu baris penuh isinya 10')); ctx.sfx('pop');
    await ctx.choose({
      options: pilihanAngka(n, 4, [n - 1, n + 1, n - 2, n + 2, n < 21 ? n + 10 : n - 10]).map((v) => ({ label: String(v), value: v, say: kata(v) })),
      answer: n,
      layout: 'hit-opts',
    });
  }

  async function soalKali(ctx, { j, p, b }) {
    const [emo, nama] = b;
    const total = j * p;
    ctx.ask('Ada ' + j + ' piring, tiap piring ada ' + p + ' ' + nama + '. Berapa ' + nama + ' semuanya?');
    const plates = h('div', { class: 'hit-plates', role: 'img', 'aria-label': j + ' piring, tiap piring ' + p + ' ' + nama });
    for (let i = 0; i < j; i++) {
      const isi = h('div', { class: 'hit-plate-in' });
      for (let k = 0; k < p; k++) isi.append(h('span', null, emo));
      plates.append(h('div', { class: 'hit-plate pop-in', style: '--i:' + i, 'aria-hidden': 'true' }, isi));
    }
    ctx.el.append(plates); ctx.sfx('pop');
    await ctx.choose({
      options: pilihanAngka(total, 4, [j + p, total - j, total + p, total + 1, total - 1, total + j]).map((v) => ({ label: String(v), value: v, say: kata(v) })),
      answer: total,
      layout: 'hit-opts',
    });
  }
})();
