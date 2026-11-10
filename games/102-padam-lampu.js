/* 102 Padamkan Lampu (logika). Papan lampu: ketuk satu lampu dan tetangga
   atas-bawah-kiri-kanannya ikut berubah. Padamkan semua lampu di tiap papan.
   TK 6 soal di papan 3x3, SD 7 soal di papan 4x4. Acakan makin banyak (gampang dulu, sulit
   naik). Bantu: satu langkah terbaik (BFS). Lewati: lanjut papan baru. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="padam-lampu"] .pl-wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="padam-lampu"] .pl-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.play[data-game="padam-lampu"] .pl-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.1rem; }
.play[data-game="padam-lampu"] .pl-grid { display: grid; gap: 8px; width: min(100%, 380px); aspect-ratio: 1; padding: 10px; border-radius: 18px; background: var(--card); box-shadow: 0 5px 0 var(--shadow); }
.play[data-game="padam-lampu"] .pl-sel { border-radius: 14px; border: 3px solid rgba(0,0,0,0.12); font-size: 2rem; min-width: 0; min-height: 0; background: #2b3a55; cursor: pointer; }
.play[data-game="padam-lampu"] .pl-sel.nyala { background: #ffd23f; border-color: #e0a800; box-shadow: 0 0 14px rgba(255,210,63,0.8); }
.play[data-game="padam-lampu"] .pl-sel.kursor { outline: 4px solid var(--c); outline-offset: 2px; }
.play[data-game="padam-lampu"] .pl-sel .redup { opacity: 0.25; }`;

  // Masker toggle tiap sel (diri + tetangga ortogonal), dipakai acak + BFS.
  function masker(n) {
    const m = [];
    for (let i = 0; i < n * n; i++) {
      let b = 0;
      const x = i % n, y = (i / n) | 0;
      b |= 1 << i;
      if (x > 0) b |= 1 << (i - 1);
      if (x < n - 1) b |= 1 << (i + 1);
      if (y > 0) b |= 1 << (i - n);
      if (y < n - 1) b |= 1 << (i + n);
      m.push(b);
    }
    return m;
  }

  // Langkah terbaik dari state menuju 0 (BFS di ruang bitmask).
  function langkahTerbaik(state, n, m) {
    if (state === 0) return -1;
    const total = 1 << (n * n);
    const dari = new Int32Array(total).fill(-2);
    const gerak = new Int8Array(total);
    dari[state] = -1;
    const antri = [state];
    for (let q = 0; q < antri.length; q++) {
      const s = antri[q];
      for (let i = 0; i < m.length; i++) {
        const t = s ^ m[i];
        if (dari[t] !== -2) continue;
        dari[t] = s;
        gerak[t] = i;
        if (t === 0) {
          let cur = 0;
          while (dari[cur] !== state) cur = dari[cur];
          return gerak[cur];
        }
        antri.push(t);
      }
    }
    return -1;
  }

  TI.register({
    id: 'padam-lampu',
    title: 'Padamkan Lampu',
    cat: 'logika',
    icon: '🪔',
    desc: 'Ketuk lampu sampai semua padam.',
    async start(ctx) {
      TI.style('padam-lampu', CSS);
      const tk = ctx.isTK;
      const n = tk ? 3 : 4;
      // Ronde gampang dulu: acakan sedikit, lalu naik.
      const acak = tk ? [2, 2, 3, 3, 4, 4] : [3, 3, 4, 4, 5, 5, 6];
      const daftar = acak.map((k, i) => ({ k, sulit: i }));
      daftar.sort((a, b) => a.sulit - b.sulit); // gampang dulu
      const m = masker(n);
      const tengah = Math.ceil(daftar.length / 2);
      let ke = 0, kursor = (n * n) >> 1, tekanAktif = null;

      // Kibor: panah geser kursor, Spasi/Enter ketuk (aksesibilitas desktop).
      ctx.on(document, 'keydown', (e) => {
        if (!ctx.alive || !tekanAktif) return;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].indexOf(e.key) < 0) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();
        tekanAktif(e.key);
      });

      await ctx.series(daftar, async (cfg) => {
        ke++;
        if (ke === tengah + 1) ctx.correct(null, { say: tk ? 'Bagus! Setengah jalan!' : 'Bagus! Lanjut!' });
        await papan(ctx, cfg);
        tekanAktif = null;
      }, { lesson: 'Setiap ketukan mengubah lampu tetangganya juga. Rencanakan urutan ketukanmu!' });
      if (!ctx.alive) return;

      async function papan(ctx, cfg) {
        // Acak dari kondisi padam supaya selalu ada jalan selesai.
        let state = 0;
        for (let g = 0; g < cfg.k; g++) state ^= m[Math.floor(Math.random() * m.length)];
        if (state === 0) state ^= m[Math.floor(Math.random() * m.length)];
        const stateAwal = state;

        ctx.ask('Padamkan semua lampu! Ketuk lampu yang menyala.');
        const sel = [];
        const grid = h('div', { class: 'pl-grid pop-in', role: 'group', 'aria-label': 'Papan ' + n + ' kali ' + n });
        grid.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
        for (let i = 0; i < n * n; i++) {
          const isi = h('span', null, '💡');
          const b = h('button', { type: 'button', class: 'pl-sel pop-in', style: '--i:' + i, 'aria-label': 'Lampu ' + (i + 1) }, isi);
          b.addEventListener('click', () => ketuk(i));
          sel.push(b);
          grid.append(b);
        }
        const chip = h('span', { class: 'pl-chip', 'aria-live': 'polite' });
        const info = h('div', { class: 'pl-info' }, chip);
        const bantuBtn = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        const ulangiBtn = h('button', { type: 'button', class: 'ti-btn is-ghost' }, 'Ulangi');
        const lewatiBtn = h('button', { type: 'button', class: 'ti-btn is-ghost' }, 'Lewati');
        ctx.el.append(h('div', { class: 'pl-wrap' }, info, grid, h('div', { class: 'ti-toolbar' }, bantuBtn, ulangiBtn, lewatiBtn)));

        let ketukan = 0, selesai = false;
        kursor = (n * n) >> 1;
        const gambar = () => {
          for (let i = 0; i < sel.length; i++) {
            const nyala = (state >> i) & 1;
            sel[i].classList.toggle('nyala', !!nyala);
            sel[i].classList.toggle('kursor', i === kursor);
            sel[i].firstChild.className = nyala ? '' : 'redup';
            sel[i].setAttribute('aria-label', 'Lampu ' + (i + 1) + (nyala ? ' menyala' : ' padam'));
          }
          let sisa = 0;
          for (let i = 0; i < n * n; i++) sisa += (state >> i) & 1;
          chip.textContent = sisa === 0 ? 'Semua padam!' : sisa + ' lampu menyala, ' + ketukan + ' ketukan';
        };
        gambar();

        const ketuk = async (i) => {
          if (!ctx.alive || selesai) return;
          state ^= m[i];
          ketukan++;
          gambar();
          ctx.sfx('klik');
          if (state === 0) {
            selesai = true;
            ctx.sfx('pop');
            await ctx.correct(null, { say: 'Semua padam! Hebat!' });
          }
        };
        bantuBtn.addEventListener('click', () => {
          if (selesai || !ctx.alive) return;
          const i = langkahTerbaik(state, n, m);
          if (i < 0) return;
          ctx.mistakes++;
          ketuk(i);
          ctx.say('Coba ketuk lampu itu!');
        });
        ulangiBtn.addEventListener('click', () => {
          if (selesai || !ctx.alive) return;
          state = stateAwal;
          ketukan = 0;
          ctx.mistakes++;
          gambar();
          ctx.sfx('tap');
          ctx.say('Ulang lagi dari awal!');
        });
        lewatiBtn.addEventListener('click', async () => {
          if (selesai || !ctx.alive) return;
          selesai = true;
          ctx.mistakes += 2;
          await ctx.wrong(null, { say: 'Dilewati dulu, papan berikutnya!' });
        });
        tekanAktif = (key) => {
          if (selesai) return;
          const x = kursor % n, y = (kursor / n) | 0;
          if (key === 'ArrowUp' && y > 0) kursor -= n;
          else if (key === 'ArrowDown' && y < n - 1) kursor += n;
          else if (key === 'ArrowLeft' && x > 0) kursor -= 1;
          else if (key === 'ArrowRight' && x < n - 1) kursor += 1;
          else if (key === ' ' || key === 'Enter') { ketuk(kursor); return; }
          else return;
          gambar();
        };
        while (!selesai && ctx.alive) await ctx.wait(300);
      }
    },
  });
})();
