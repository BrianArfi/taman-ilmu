/* 89 Labirin Es. Kotak meluncur sampai dinding; ketuk arah untuk meluncur ke bendera.
   TK: 4x4, 2 level. SD: 6x6, 3 level. Ada Reset, Bantu (1 langkah), batas longgar. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="labirin-es"] .le-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="labirin-es"] .le-board { position: relative; width: min(100%, 360px); aspect-ratio: 1; border-radius: 18px; overflow: hidden; background: #d8ecff; box-shadow: 0 4px 0 var(--shadow); touch-action: none; }
.play[data-game="labirin-es"] .le-grid { position: absolute; inset: 0; display: grid; }
.play[data-game="labirin-es"] .le-cell { border: 1px solid rgba(47,111,237,0.18); display: grid; place-items: center; font-size: 1.6rem; }
.play[data-game="labirin-es"] .le-cell.is-wall { background: #7fa8d9; }
.play[data-game="labirin-es"] .le-cell.is-start { background: #cdeffd; }
.play[data-game="labirin-es"] .le-cell.is-flag { background: #d3f5df; }
.play[data-game="labirin-es"] .le-token { position: absolute; left: 0; top: 0; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #bfe3ff, #2f8fe0 70%); box-shadow: 0 3px 0 rgba(0,0,0,0.2); transition: transform 200ms var(--ease-out); pointer-events: none; }
.play[data-game="labirin-es"] .le-pad { display: grid; grid-template-columns: repeat(3, 76px); grid-template-rows: repeat(2, 76px); gap: 8px; }
.play[data-game="labirin-es"] .le-key { width: 76px; height: 76px; min-height: 0; padding: 0; font-size: 2rem; border-radius: 20px; touch-action: manipulation; }
.play[data-game="labirin-es"] .le-key.is-hint { outline: 4px solid var(--sun); outline-offset: 3px; }
.play[data-game="labirin-es"] .le-u { grid-area: 1 / 2; } .play[data-game="labirin-es"] .le-l { grid-area: 2 / 1; }
.play[data-game="labirin-es"] .le-r { grid-area: 2 / 3; } .play[data-game="labirin-es"] .le-d { grid-area: 2 / 2; }
.play[data-game="labirin-es"] .le-tools { display: flex; gap: 10px; }
.play[data-game="labirin-es"] .le-tools .ti-btn { min-height: 64px; }
.play[data-game="labirin-es"] .le-msg { margin: 0; min-height: 1.6em; font-weight: 800; color: var(--muted); text-align: center; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="labirin-es"] .le-token { transition: none; }
}
`;

  const ARAH = { atas: [-1, 0], bawah: [1, 0], kiri: [0, -1], kanan: [0, 1] };
  const LV_TK = [
    ['S..#', '..#.', '....', '##.F'],
    ['.#S.', '.#.#', '....', '##.F'],
  ];
  const LV_SD = [
    ['S..#..', '##.#.#', '......', '.####.', '...#..', '..#..F'],
    ['S..#..', '#...#.', '#.##..', '#..##.', '...#..', '##...F'],
    ['...#S.', '.#.#..', '.#....', '.##.#.', '...#..', 'F#....'],
  ];

  function luncur(map, r, c, dr, dc) {
    const H = map.length, W = map[0].length;
    let nr = r, nc = c;
    for (;;) {
      const tr = nr + dr, tc = nc + dc;
      if (tr < 0 || tc < 0 || tr >= H || tc >= W || map[tr][tc] === '#') break;
      nr = tr; nc = tc;
    }
    return [nr, nc];
  }
  // Jalur tersingkat (BFS) dari posisi ke bendera. Dipakai tombol Bantu dan solusi otomatis.
  function jalur(map, sr, sc) {
    const H = map.length, W = map[0].length;
    const key = (r, c) => r + ',' + c;
    const prev = new Map([[key(sr, sc), null]]);
    const q = [[sr, sc]];
    while (q.length) {
      const [r, c] = q.shift();
      if (map[r][c] === 'F') {
        const path = [];
        let k = key(r, c);
        while (prev.get(k)) { path.unshift(prev.get(k).dir); k = prev.get(k).from; }
        return path;
      }
      for (const d of Object.keys(ARAH)) {
        const [nr, nc] = luncur(map, r, c, ARAH[d][0], ARAH[d][1]);
        const k = key(nr, nc);
        if ((nr !== r || nc !== c) && !prev.has(k)) { prev.set(k, { from: key(r, c), dir: d }); q.push([nr, nc]); }
      }
    }
    return [];
  }

  TI.register({
    id: 'labirin-es',
    title: 'Labirin Es',
    cat: 'logika',
    icon: '⛸️',
    desc: 'Licin! Sekali meluncur sampai dinding.',
    start(ctx) {
      TI.style('labirin-es', CSS);
      const lvs = ctx.isTK ? LV_TK : LV_SD;
      return (async () => {
        let auto = 0;
        for (let i = 0; i < lvs.length && ctx.alive; i++) {
          ctx.progress(i, lvs.length);
          const hasil = await level(lvs[i], i);
          if (hasil === 'auto') auto++;
        }
        if (!ctx.alive) return;
        ctx.progress(lvs.length, lvs.length);
        ctx.finish({
          stars: auto > 0 ? 1 : ctx.mistakes === 0 ? 3 : 2,
          lesson: 'Di atas es yang licin, kita meluncur lurus sampai dinding. Rencanakan langkahmu sebelum bergerak.',
        });
      })();

      function level(rows, idx) {
        return new Promise((selesai) => {
          const map = rows.map((s) => s.split(''));
          const H = map.length, W = map[0].length;
          let sr = 0, sc = 0;
          map.forEach((row, r) => row.forEach((ch, c) => { if (ch === 'S') { sr = r; sc = c; } }));
          ctx.clear();
          ctx.ask(idx === 0 ? 'Ketuk arah untuk meluncur. Sampai ke bendera.' : 'Labirin berikutnya. Sampai ke bendera.');
          const wrap = h('div', { class: 'le-wrap' });
          const board = h('div', { class: 'le-board' });
          const grid = h('div', { class: 'le-grid', style: 'grid-template-columns: repeat(' + W + ', 1fr);grid-template-rows: repeat(' + H + ', 1fr);' });
          map.forEach((row, r) => row.forEach((ch, c) => {
            const cls = ch === '#' ? ' is-wall' : ch === 'S' ? ' is-start' : ch === 'F' ? ' is-flag' : '';
            grid.append(h('div', { class: 'le-cell' + cls, 'aria-hidden': 'true' }, ch === 'F' ? '🏁' : ''));
            void r; void c;
          }));
          const token = h('div', { class: 'le-token', role: 'img', 'aria-label': 'Kamu' });
          board.append(grid, token);
          const msg = h('p', { class: 'le-msg', 'aria-live': 'polite' }, 'Langkah: 0');
          const pad = h('div', { class: 'le-pad' });
          const tools = h('div', { class: 'le-tools' });
          const bReset = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '🔄 Ulang');
          const bBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          tools.append(bReset, bBantu);
          wrap.append(board, msg, pad, tools);
          ctx.el.append(wrap);

          let r = sr, c = sc, langkah = 0, tutup = false, sibuk = false, ketuk = 0;
          const batas = 40;
          const keys = {};
          ['atas', 'bawah', 'kiri', 'kanan'].forEach((d) => {
            const b = h('button', {
              type: 'button', class: 'le-key ti-btn le-' + d[0],
              'aria-label': 'Meluncur ke ' + d,
            }, d === 'atas' ? '⬆️' : d === 'bawah' ? '⬇️' : d === 'kiri' ? '⬅️' : '➡️');
            b.addEventListener('click', () => gerak(d, false));
            keys[d] = b;
            pad.append(b);
          });
          const pasang = () => {
            const cw = board.clientWidth / W, chh = board.clientHeight / H;
            const s = Math.min(cw, chh) * 0.7;
            token.style.width = s + 'px'; token.style.height = s + 'px';
            const x = c * cw + (cw - s) / 2, y = r * chh + (chh - s) / 2;
            token.style.transform = 'translate(' + x + 'px,' + y + 'px)';
          };
          ctx.on(window, 'resize', pasang);
          ctx.after(60, pasang);

          async function gerak(d, dariBantu) {
            if (tutup || sibuk || !ctx.alive) return;
            ketuk++;
            if (ketuk >= 30) { await solusiOtomatis(); return; }
            const [nr, nc] = luncur(map, r, c, ARAH[d][0], ARAH[d][1]);
            if (nr === r && nc === c) {
              if (!dariBantu) { await ctx.wrong(keys[d], { say: 'Mentok! Pilih arah lain.' }); }
              return;
            }
            sibuk = true;
            r = nr; c = nc; langkah++;
            pasang();
            ctx.sfx('whoosh');
            msg.textContent = 'Langkah: ' + langkah;
            await ctx.wait(TI.reduced() ? 60 : 220);
            sibuk = false;
            if (map[r][c] === 'F') {
              tutup = true;
              await ctx.correct(null, { say: 'Sampai bendera! Hebat!' });
              selesai('ok');
            } else if (langkah >= batas) {
              await solusiOtomatis();
            }
          }
          async function solusiOtomatis() {
            tutup = true;
            msg.textContent = 'Lihat jalannya ya.';
            await ctx.sayWait('Langkahnya habis. Lihat jalan yang benar.');
            const path = jalur(map, r, c);
            for (const d of path) {
              if (!ctx.alive) break;
              const [nr, nc] = luncur(map, r, c, ARAH[d][0], ARAH[d][1]);
              r = nr; c = nc; pasang(); ctx.sfx('whoosh');
              await ctx.wait(TI.reduced() ? 80 : 300);
            }
            await ctx.wrong(null, { say: 'Seperti itu caranya sampai bendera.' });
            selesai('auto');
          }
          bReset.addEventListener('click', () => {
            if (tutup) return;
            ctx.sfx('tap');
            r = sr; c = sc; pasang();
            msg.textContent = 'Kembali ke awal. Langkah: ' + langkah;
          });
          bBantu.addEventListener('click', async () => {
            if (tutup || sibuk) return;
            ctx.sfx('tap');
            const path = jalur(map, r, c);
            if (!path.length) { await solusiOtomatis(); return; }
            const d = path[0];
            keys[d].classList.add('is-hint');
            ctx.after(900, () => keys[d] && keys[d].classList.remove('is-hint'));
            msg.textContent = 'Coba meluncur ke ' + d + '.';
            ctx.say('Coba meluncur ke ' + d + '.');
          });
        });
      }
    },
  });
})();
