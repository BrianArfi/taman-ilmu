/* 101 Banjir Warna (logika). Papan kotak warna-warni: ketuk warna dan banjir
   menyebar dari pojok kiri atas. Penuhi seluruh papan dengan satu warna
   sebelum langkah habis. TK 6 soal, SD 7 soal. Papan makin besar dan warna
   makin banyak (gampang dulu, sulit naik). Bantu: +3 langkah sekali per papan. */
(function () {
  const { h, shuffle } = TI;

  const WARNA = [
    { nama: 'merah', hex: '#e5484d' },
    { nama: 'kuning', hex: '#ffd23f' },
    { nama: 'hijau', hex: '#30a46c' },
    { nama: 'biru', hex: '#3e63dd' },
    { nama: 'ungu', hex: '#8e4ec6' },
  ];
  const CSS = `
.play[data-game="banjir-warna"] .bw-wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="banjir-warna"] .bw-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.play[data-game="banjir-warna"] .bw-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.1rem; }
.play[data-game="banjir-warna"] .bw-grid { display: grid; gap: 4px; width: min(100%, 420px); aspect-ratio: 1; padding: 8px; border-radius: 18px; background: var(--card); box-shadow: 0 5px 0 var(--shadow); }
.play[data-game="banjir-warna"] .bw-grid i { border-radius: 7px; min-width: 0; min-height: 0; }
.play[data-game="banjir-warna"] .bw-pilih { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; }
.play[data-game="banjir-warna"] .bw-warna { min-width: 72px; min-height: 72px; border-radius: 18px; border: 4px solid rgba(0,0,0,0.15); font-weight: 800; font-size: 1.3rem; color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,0.3); }
.play[data-game="banjir-warna"] .bw-warna[disabled] { opacity: 0.45; }`;

  // Serap tetangga yang warnanya sama dengan pojok ke dalam wilayah banjir.
  function luas(grid, n, wilayah) {
    const w = grid[0], antri = [...wilayah];
    while (antri.length) {
      const i = antri.pop(), x = i % n, y = (i / n) | 0;
      const sisi = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (let k = 0; k < 4; k++) {
        const nx = x + sisi[k][0], ny = y + sisi[k][1];
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const j = ny * n + nx;
        if (!wilayah.has(j) && grid[j] === w) { wilayah.add(j); antri.push(j); }
      }
    }
  }
  // Satu gerak: ganti warna wilayah jadi baru lalu serap. Warna sama = gratis.
  function gerak(grid, n, wilayah, baru) {
    if (grid[0] === baru) return false;
    wilayah.forEach((i) => { grid[i] = baru; });
    luas(grid, n, wilayah);
    return true;
  }

  TI.register({
    id: 'banjir-warna',
    title: 'Banjir Warna',
    cat: 'logika',
    icon: '🪣',
    desc: 'Penuhi papan dengan satu warna sebelum langkah habis.',
    async start(ctx) {
      TI.style('banjir-warna', CSS);
      const tk = ctx.isTK;
      // Ronde gampang dulu: papan kecil + sedikit warna, lalu naik.
      const daftar = tk ? [
        { n: 4, warna: 3, langkah: 12, sulit: 0 }, { n: 4, warna: 3, langkah: 12, sulit: 1 },
        { n: 4, warna: 4, langkah: 14, sulit: 2 }, { n: 4, warna: 4, langkah: 14, sulit: 3 },
        { n: 5, warna: 4, langkah: 14, sulit: 4 }, { n: 5, warna: 4, langkah: 12, sulit: 5 },
      ] : [
        { n: 5, warna: 4, langkah: 16, sulit: 0 }, { n: 5, warna: 4, langkah: 16, sulit: 1 },
        { n: 5, warna: 5, langkah: 16, sulit: 2 }, { n: 6, warna: 5, langkah: 18, sulit: 3 },
        { n: 6, warna: 5, langkah: 18, sulit: 4 }, { n: 6, warna: 5, langkah: 16, sulit: 5 },
        { n: 6, warna: 5, langkah: 16, sulit: 6 },
      ];
      daftar.sort((a, b) => a.sulit - b.sulit); // gampang dulu
      const tengah = Math.ceil(daftar.length / 2);
      let ke = 0;

      // Kibor: angka memilih tombol warna yang tampil (aksesibilitas desktop).
      let pilihAktif = null, nWarna = 0;
      ctx.on(document, 'keydown', (e) => {
        if (!ctx.alive || e.ctrlKey || e.metaKey || e.altKey || !pilihAktif) return;
        const i = ['1', '2', '3', '4', '5'].indexOf(e.key);
        if (i < 0 || i >= nWarna) return;
        pilihAktif(i);
      });

      await ctx.series(daftar, async (cfg) => {
        ke++;
        if (ke === tengah + 1) ctx.correct(null, { say: tk ? 'Bagus! Setengah jalan!' : 'Bagus! Papannya makin besar!' });
        await papan(ctx, cfg, tk, (fn) => { pilihAktif = fn; });
        pilihAktif = null;
      }, { lesson: 'Rencanakan langkahmu: pilih warna yang menyentuh wilayah terluas supaya banjir cepat penuh.' });
      if (!ctx.alive) return;

      async function papan(ctx, cfg, tk, pasang) {
        const palet = shuffle([0, 1, 2, 3, 4]).slice(0, cfg.warna);
        let grid, wilayah, sisa;
        const acakPapan = () => {
          for (let g = 0; g < 20; g++) {
            grid = Array.from({ length: cfg.n * cfg.n }, () => palet[Math.floor(Math.random() * palet.length)]);
            wilayah = new Set([0]);
            luas(grid, cfg.n, wilayah);
            if (wilayah.size < cfg.n * cfg.n) break;
          }
          sisa = cfg.langkah;
        };
        acakPapan();

        ctx.ask('Penuhi papan dengan satu warna! Ketuk warna di bawah.');
        const sel = [];
        const grid2 = h('div', { class: 'bw-grid pop-in', role: 'img', 'aria-label': 'Papan ' + cfg.n + ' kali ' + cfg.n });
        grid2.style.setProperty('--n', cfg.n);
        grid2.style.gridTemplateColumns = 'repeat(' + cfg.n + ', 1fr)';
        for (let i = 0; i < cfg.n * cfg.n; i++) { const c = h('i'); sel.push(c); grid2.append(c); }
        const langkahChip = h('span', { class: 'bw-chip', 'aria-live': 'polite' });
        const info = h('div', { class: 'bw-info' }, langkahChip);
        const baris = h('div', { class: 'bw-pilih' });
        const bantuBtn = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        ctx.el.append(h('div', { class: 'bw-wrap' }, info, grid2, baris, h('div', { class: 'ti-toolbar' }, bantuBtn)));
        const gambar = () => {
          for (let i = 0; i < sel.length; i++) sel[i].style.background = WARNA[grid[i]].hex;
          langkahChip.textContent = 'Sisa ' + sisa + ' langkah';
        };
        gambar();

        let selesai = false, menang = false, bantuPakai = false;
        const pilih = async (c) => {
          if (!ctx.alive || selesai || menang) return;
          if (!gerak(grid, cfg.n, wilayah, c)) return;
          sisa--;
          gambar();
          ctx.sfx('tap');
          ctx.say(WARNA[c].nama);
          if (wilayah.size === cfg.n * cfg.n) {
            menang = true;
            ctx.sfx('pop');
            await ctx.correct(null, { say: 'Papan penuh! Hebat!' });
            selesai = true;
            return 'menang';
          }
          if (sisa <= 0) {
            ctx.mistakes++;
            await ctx.wrong(null, { say: 'Langkah habis. Yuk coba lagi dengan papan baru!' });
            acakPapan();
            bantuPakai = false;
            bantuBtn.disabled = false;
            gambar();
          }
          return 'lanjut';
        };
        palet.forEach((c, i) => {
          const b = h('button', {
            type: 'button', class: 'bw-warna pop-in', style: '--i:' + i + ';background:' + WARNA[c].hex,
            'aria-label': 'Warna ' + WARNA[c].nama + ', tombol ' + (i + 1),
          }, String(i + 1));
          b.addEventListener('click', () => pilih(c));
          baris.append(b);
        });
        bantuBtn.addEventListener('click', () => {
          if (selesai || bantuPakai || !ctx.alive) return;
          bantuPakai = true;
          bantuBtn.disabled = true;
          ctx.mistakes++;
          sisa += 3;
          gambar();
          ctx.sfx('tap');
          ctx.say('Bantu: tambah 3 langkah!');
        });
        nWarna = palet.length;
        pasang((i) => pilih(palet[i]));
        while (!selesai && ctx.alive) await ctx.wait(300);
      }
    },
  });
})();
