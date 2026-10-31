/* 43 Cermin Ajaib. Puzzle grid: senter menembakkan sinar lurus, cermin diagonal berputar saat diketuk, batu menghalangi,
   bintang menyala kalau kena sinar. Sinar dihitung ulang setiap perubahan. Level ditulis tangan di bawah dan sudah dicek ada solusinya
   (posisi awal cermin = solusi, lalu sebagian diputar). Bintang bersifat tembus: sinar yang mengenainya tetap lanjut,
   jadi dua bintang bisa dinyalakan berurutan dengan satu sinar. */
(function () {
  const { h, svg } = TI;

  // ---------- LEVEL (ditulis tangan) ----------
  // Karakter sel: '.' kosong, '#' batu, 'T' bintang, '/' dan 'b' (cermin miring balik, seperti garis \ ) adalah cermin (posisi SOLUSI).
  // src: sisi senter + nomor baris/kolom: L = dari kiri (menuju kanan), R = dari kanan, T = dari atas, B = dari bawah.
  // flips: cermin yang diputar dulu di awal (baris,kolom).
  // LEVELS-BEGIN
  const LV_TK = [
    { src: 'L3', flips: [[3, 2]], rows: ['..T.', '....', '....', '../.'] },
    { src: 'T0', flips: [[2, 0]], rows: ['....', '.#..', 'b..T', '....'] },
    { src: 'L0', flips: [[2, 2]], rows: ['..b.', '....', 'T./.', '...#'] },
    { src: 'L3', flips: [[3, 1], [1, 1]], rows: ['....', './.T', '..#.', './..'] },
  ];
  const LV_SD = [
    { src: 'L4', flips: [[1, 2]], rows: ['......', '../.T.', '.#....', '......', '../...', '....#.'] },
    { src: 'T0', flips: [[2, 0], [4, 3]], rows: ['......', '..#...', 'b..b..', '......', '...b.T', '.#....'] },
    { src: 'R0', flips: [[0, 3], [3, 1]], rows: ['.../..', '.T....', '....#.', '.b./..', '..#...', '....#.'] },
    { src: 'T2', flips: [[1, 2], [4, 1], [1, 4]], rows: ['#.....', '..b.b.', '.T#...', '...#..', '.b../.', '...#..'] },
    { src: 'L1', flips: [[4, 4], [1, 4]], rows: ['....#.', '.T..b.', '..T..#', '#.....', '..b./.', '...#..'] },
    { src: 'R5', flips: [[5, 1], [3, 4], [1, 4]], rows: ['...#..', '..T.b.', '..#...', './../.', '...#..', '#b.T..'] },
  ];
  // LEVELS-END

  const DIRS = { L: [0, 1], R: [0, -1], T: [1, 0], B: [-1, 0] };
  function entryOf(N, src) {
    const side = src[0], i = +src.slice(1);
    if (side === 'L') return { r: i, c: 0, d: DIRS.L };
    if (side === 'R') return { r: i, c: N - 1, d: DIRS.R };
    if (side === 'T') return { r: 0, c: i, d: DIRS.T };
    return { r: N - 1, c: i, d: DIRS.B };
  }
  // Hitung jalur sinar. cells[r][c] = '.', '#', 'T', '/', '\\'. Titik dalam satuan sel (pusat sel = c + 0.5).
  function trace(N, cells, src) {
    const e = entryOf(N, src);
    let { r, c } = e, [dr, dc] = e.d;
    const pts = [[c + 0.5 - dc * 0.68, r + 0.5 - dr * 0.68]];
    const hits = new Set();
    const seen = new Set();
    let blocked = false, last = [c + 0.5, r + 0.5];
    while (r >= 0 && r < N && c >= 0 && c < N) {
      const key = r + ',' + c + ',' + dr + ',' + dc;
      if (seen.has(key)) break;
      seen.add(key);
      const k = cells[r][c];
      last = [c + 0.5, r + 0.5];
      if (k === '#') { pts.push([c + 0.5 - dc * 0.36, r + 0.5 - dr * 0.36]); blocked = true; break; }
      if (k === 'T') hits.add(r * N + c);
      if (k === '/') { pts.push([c + 0.5, r + 0.5]); [dr, dc] = [-dc, -dr]; }
      else if (k === '\\') { pts.push([c + 0.5, r + 0.5]); [dr, dc] = [dc, dr]; }
      r += dr; c += dc;
    }
    if (!blocked) pts.push([last[0] + dc * 0.68, last[1] + dr * 0.68]);
    return { pts, hits, blocked };
  }

  // ---------- gambar ----------
  const STAR_D = 'M50 12 L61 38 L89 40 L68 59 L75 87 L50 72 L25 87 L32 59 L11 40 L39 38 Z';
  function drawMirror() {
    return svg('svg', { viewBox: '0 0 100 100', class: 'ls-svg', 'aria-hidden': 'true', focusable: 'false' },
      svg('circle', { cx: 50, cy: 50, r: 30, fill: 'rgba(120,200,255,0.12)', stroke: 'rgba(160,220,255,0.35)', 'stroke-width': 2, 'stroke-dasharray': '4 5' }),
      svg('g', { class: 'ls-mir' },
        svg('rect', { x: 43, y: 9, width: 14, height: 82, rx: 7, fill: '#9ad7ff', stroke: '#e8f7ff', 'stroke-width': 3 }),
        svg('rect', { x: 47, y: 14, width: 4, height: 70, rx: 2, fill: '#ffffff', opacity: 0.8 })),
      svg('circle', { cx: 50, cy: 50, r: 7, fill: '#3b4a6b', stroke: '#c6d4f0', 'stroke-width': 2 }));
  }
  function drawRock() {
    return svg('svg', { viewBox: '0 0 100 100', class: 'ls-svg', 'aria-hidden': 'true', focusable: 'false' },
      svg('path', { d: 'M18 72 L24 44 L44 26 L70 30 L84 52 L80 74 L56 82 Z', fill: '#8a93a6', stroke: '#5c6578', 'stroke-width': 4, 'stroke-linejoin': 'round' }),
      svg('path', { d: 'M30 46 L46 34 L62 36', fill: 'none', stroke: '#c3cada', 'stroke-width': 5, 'stroke-linecap': 'round' }),
      svg('path', { d: 'M52 66 L70 60', fill: 'none', stroke: '#6b7487', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  }
  function drawStar() {
    return svg('svg', { viewBox: '0 0 100 100', class: 'ls-svg', 'aria-hidden': 'true', focusable: 'false' },
      svg('circle', { class: 'ls-glow', cx: 50, cy: 52, r: 44, fill: 'rgba(255,225,90,0.45)' }),
      svg('path', { class: 'ls-star', d: STAR_D, fill: '#59637d', stroke: '#8b95b0', 'stroke-width': 4, 'stroke-linejoin': 'round' }));
  }
  // senter: ujung sinar (moncong) di titik 0,0, menghadap ke kanan
  function drawTorch() {
    return svg('g', null,
      svg('rect', { x: -38, y: -11, width: 22, height: 22, rx: 7, fill: '#f4a300', stroke: '#b97800', 'stroke-width': 3 }),
      svg('path', { d: 'M-17 -16 L-2 -26 L-2 26 L-17 16 Z', fill: '#ffd54f', stroke: '#b97800', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      svg('rect', { x: -33, y: -4.5, width: 10, height: 9, rx: 3, fill: '#fff3b0' }));
  }

  const CSS = `
.play[data-game="laser"] .ls-box { position: relative; width: min(100%, var(--bw)); aspect-ratio: 1; border-radius: 26px; background: radial-gradient(circle at 50% 40%, #243457, #131c33 75%); box-shadow: 0 5px 0 #0b1226; touch-action: manipulation; }
.play[data-game="laser"] .ls-grid { position: absolute; left: var(--gx); top: var(--gx); width: var(--gw); height: var(--gw); display: grid; grid-template-columns: repeat(var(--n), 1fr); grid-template-rows: repeat(var(--n), 1fr); border-radius: 10px; }
.play[data-game="laser"] .ls-cell { position: relative; display: block; min-width: 0; min-height: 0; padding: 0; border: 1px solid rgba(140, 170, 230, 0.22); background: rgba(255, 255, 255, 0.04); font: inherit; color: inherit; }
.play[data-game="laser"] button.ls-cell { cursor: pointer; background: rgba(120, 180, 255, 0.1); transition: background-color var(--dur-ui) ease; }
.play[data-game="laser"] button.ls-cell:active { background: rgba(120, 180, 255, 0.3); }
.play[data-game="laser"] .ls-cell.is-help { outline: 4px solid var(--sun); outline-offset: -4px; }
.play[data-game="laser"] .ls-svg { position: absolute; inset: 4%; width: 92%; height: 92%; display: block; pointer-events: none; }
.play[data-game="laser"] .ls-mir { transform-box: view-box; transform-origin: 50px 50px; transition: transform 150ms var(--ease-in-out); }
.play[data-game="laser"] .ls-star { transition: fill var(--dur-ui) ease; }
.play[data-game="laser"] .ls-glow { opacity: 0; transition: opacity 250ms var(--ease-out); }
.play[data-game="laser"] .ls-cell.is-lit .ls-glow { opacity: 1; }
.play[data-game="laser"] .ls-cell.is-lit .ls-svg { animation: ls-pop 300ms var(--ease-pop); }
@keyframes ls-pop { 50% { transform: scale(1.18); } }
.play[data-game="laser"] .ls-beam { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.play[data-game="laser"] .ls-beam .glow { filter: drop-shadow(0 0 6px #ffd54f); }
.play[data-game="laser"] .ls-ctl { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.play[data-game="laser"] .ls-msg { margin: 0; min-height: 1.4em; text-align: center; font-weight: 800; color: var(--muted); max-width: 440px; }
.play[data-game="laser"] .ls-box.is-win { box-shadow: 0 5px 0 #0b1226, 0 0 0 6px rgba(255, 213, 79, 0.55); }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="laser"] .ls-cell.is-lit .ls-svg { animation: none; }
}
`;

  TI.register({
    id: 'laser',
    title: 'Cermin Ajaib',
    cat: 'sains',
    icon: '🪞',
    desc: 'Putar cermin supaya sinar senter mengenai bintang.',
    start(ctx) {
      TI.style('laser', CSS);
      const levels = ctx.isTK ? LV_TK : LV_SD;
      const total = levels.length;

      async function playLevel(lv, idx) {
        const N = lv.rows.length;
        const sol = lv.rows.map((row) => row.split('').map((k) => (k === 'b' ? '\\' : k)));
        const cur = sol.map((row) => row.slice());
        const mirrors = [];
        sol.forEach((row, r) => row.forEach((k, c) => { if (k === '/' || k === '\\') mirrors.push({ r, c }); }));
        const flipKey = new Set(lv.flips.map(([r, c]) => r + ',' + c));
        const targets = [];
        sol.forEach((row, r) => row.forEach((k, c) => { if (k === 'T') targets.push(r * N + c); }));
        // posisi awal: solusi, lalu cermin pilihan diputar
        lv.flips.forEach(([r, c]) => { cur[r][c] = cur[r][c] === '/' ? '\\' : '/'; });

        ctx.ask(targets.length > 1
          ? 'Level ' + (idx + 1) + '. Nyalakan kedua bintang dengan satu sinar!'
          : 'Level ' + (idx + 1) + '. Ketuk cermin supaya sinar mengenai bintang!');

        // ----- papan -----
        const M = ctx.isTK ? 62 : 58;               // margin untuk senter, dalam satuan 1/100 sel
        const view = N * 100 + 2 * M;
        const gx = (M / view) * 100, gw = ((N * 100) / view) * 100;
        const box = h('div', { class: 'ls-box', style: '--n:' + N + ';--bw:' + (ctx.isTK ? 420 : 440) + 'px;--gx:' + gx.toFixed(3) + '%;--gw:' + gw.toFixed(3) + '%', role: 'group', 'aria-label': 'Papan cermin' });
        const grid = h('div', { class: 'ls-grid' });
        const cellEl = [];
        const angle = {};
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const k = sol[r][c];
          let el;
          if (k === '/' || k === '\\') {
            el = h('button', { type: 'button', class: 'ls-cell', 'aria-label': 'Cermin, ketuk untuk memutar' }, drawMirror());
            const a = cur[r][c] === '/' ? 45 : 135;
            angle[r * N + c] = a;
            el.querySelector('.ls-mir').style.transform = 'rotate(' + a + 'deg)';
            el.addEventListener('click', () => { if (!busy && !solved) rotate(r, c, true); });
          } else if (k === '#') el = h('div', { class: 'ls-cell', 'aria-hidden': 'true' }, drawRock());
          else if (k === 'T') el = h('div', { class: 'ls-cell', 'aria-label': 'Bintang' }, drawStar());
          else el = h('div', { class: 'ls-cell', 'aria-hidden': 'true' });
          cellEl[r * N + c] = el;
          grid.append(el);
        }
        // sinar dan senter digambar di atas papan, dalam satuan 1/100 sel
        const u = (v) => (v * 100).toFixed(1);
        const beamLine = svg('polyline', { points: '', fill: 'none', stroke: 'rgba(255,225,120,0.4)', 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        const beamCore = svg('polyline', { points: '', fill: 'none', stroke: '#fffbe0', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        const spark = svg('circle', { r: 9, fill: '#fff', opacity: 0 });
        const sparks = svg('g', null);
        const e = entryOf(N, lv.src);
        const torchPos = [e.c + 0.5 - e.d[1] * 0.68, e.r + 0.5 - e.d[0] * 0.68];
        const torchAng = Math.atan2(e.d[0], e.d[1]) * 180 / Math.PI;
        const torch = svg('g', { transform: 'translate(' + u(torchPos[0]) + ' ' + u(torchPos[1]) + ') rotate(' + torchAng + ')' }, drawTorch());
        const beamSvg = svg('svg', { class: 'ls-beam', viewBox: -M + ' ' + -M + ' ' + view + ' ' + view, 'aria-hidden': 'true', preserveAspectRatio: 'none' },
          torch, svg('g', { class: 'glow' }, beamLine, beamCore), sparks, spark);
        // lapisan sinar di atas sel, tapi tidak menangkap sentuhan; kotak sinar dipasang di dalam .ls-box
        box.append(grid, beamSvg);
        const msg = h('p', { class: 'ls-msg', 'aria-live': 'polite' });
        const help = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        ctx.el.append(box, h('div', { class: 'ls-ctl' }, msg, help));

        let busy = false, solved = false, helps = 0;
        let path = [], pathLen = [], totalLen = 0;

        function redraw(playSfx) {
          const t = trace(N, cur, lv.src);
          const pts = t.pts.map((p) => u(p[0]) + ',' + u(p[1])).join(' ');
          beamLine.setAttribute('points', pts); beamCore.setAttribute('points', pts);
          path = t.pts; pathLen = [0]; totalLen = 0;
          for (let i = 1; i < path.length; i++) { totalLen += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); pathLen.push(totalLen); }
          // percikan kecil di setiap pantulan
          sparks.replaceChildren(...t.pts.slice(1, -1).map((p) => svg('circle', { cx: u(p[0]), cy: u(p[1]), r: 12, fill: '#fff6bf', opacity: 0.85 })));
          let nowLit = 0;
          targets.forEach((k) => {
            const on = t.hits.has(k);
            const was = cellEl[k].classList.contains('is-lit');
            cellEl[k].classList.toggle('is-lit', on);
            cellEl[k].querySelector('.ls-star').setAttribute('fill', on ? '#ffd54f' : '#59637d');
            cellEl[k].querySelector('.ls-star').setAttribute('stroke', on ? '#fff3b0' : '#8b95b0');
            if (on) nowLit++;
            if (on && !was && playSfx) ctx.sfx('pop');
          });
          return { lit: nowLit, blocked: t.blocked };
        }
        function evaluate(playSfx) {
          const res = redraw(playSfx);
          msg.textContent = res.lit === targets.length ? '' : res.blocked ? 'Sinarnya tertahan batu. Coba putar cermin lain.' : '';
          if (res.lit === targets.length) win();
          else if (targets.length > 1 && res.lit === 1) msg.textContent = 'Satu bintang menyala. Nyalakan yang satu lagi!';
        }
        function rotate(r, c, user) {
          const k = r * N + c;
          angle[k] += 90;
          cellEl[k].querySelector('.ls-mir').style.transform = 'rotate(' + angle[k] + 'deg)';
          cur[r][c] = cur[r][c] === '/' ? '\\' : '/';
          ctx.sfx('klik');
          evaluate(user);
        }

        let winLock = null;
        const done = new Promise((res) => { winLock = res; });
        async function win() {
          if (solved) return;
          solved = true; busy = true;
          box.classList.add('is-win');
          msg.textContent = 'Bintang menyala!';
          await ctx.correct(null, { say: targets.length > 1 ? 'Hebat! Kedua bintang menyala.' : 'Hebat! Bintangnya menyala.', sfx: 'menang', min: 900 });
          winLock();
        }

        // ----- Bantu: ketuk 1 dan 2 = putar satu cermin yang belum benar, ketuk 3 = semua cermin benar -----
        const wrongOnes = () => mirrors.filter((m) => cur[m.r][m.c] !== sol[m.r][m.c]);
        help.addEventListener('click', async () => {
          if (busy || solved) return;
          helps++; ctx.mistakes++;
          const list = wrongOnes();
          if (!list.length) { msg.textContent = 'Cermin sudah benar. Lihat sinarnya!'; return; }
          if (helps >= 3) {
            busy = true;
            msg.textContent = 'Lihat ya, cerminnya berputar sendiri.';
            ctx.say('Lihat ya, cerminnya berputar sendiri.');
            for (const m of list) {
              if (!ctx.alive) return;
              rotate(m.r, m.c, false);
              await ctx.wait(260);
            }
            busy = false;
            evaluate(true);
            return;
          }
          const m = list[0];
          cellEl[m.r * N + m.c].classList.add('is-help');
          ctx.after(900, () => cellEl[m.r * N + m.c].classList.remove('is-help'));
          msg.textContent = 'Putar cermin yang menyala.';
          ctx.say('Putar cermin yang menyala.');
          rotate(m.r, m.c, true);
        });

        // titik cahaya kecil yang meluncur sepanjang sinar (hiasan, dimatikan kalau gerak dikurangi)
        let stopLoop = null;
        if (!TI.reduced()) {
          let tt = 0;
          stopLoop = ctx.loop((dt) => {
            if (solved || totalLen <= 0) { spark.setAttribute('opacity', 0); return; }
            tt = (tt + dt * 3.2 / Math.max(1, totalLen)) % 1; // kecepatan tetap: sekitar 3 sel per detik
            const d = tt * totalLen;
            let i = 1;
            while (i < pathLen.length - 1 && pathLen[i] < d) i++;
            const seg = pathLen[i] - pathLen[i - 1] || 1, f = Math.max(0, Math.min(1, (d - pathLen[i - 1]) / seg));
            const x = path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, y = path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f;
            spark.setAttribute('transform', 'translate(' + u(x) + ' ' + u(y) + ')');
            spark.setAttribute('opacity', 0.9);
          });
        }

        evaluate(false);
        await done;
        if (stopLoop) stopLoop();
        if (!ctx.alive) return;
        if (idx === 0) {
          ctx.note('Cermin memantulkan cahaya. Sudut datang sama dengan sudut pantul.', { title: 'Tahukah kamu?' });
          await ctx.next('Lanjut');
        }
      }

      return (async () => {
        for (let i = 0; i < total && ctx.alive; i++) {
          ctx.progress(i, total);
          ctx.clear();
          await playLevel(levels[i], i);
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({
          stars: ctx.mistakes <= 1 ? 3 : ctx.mistakes <= 4 ? 2 : 1,
          lesson: 'Cahaya merambat lurus dan bisa dipantulkan oleh cermin.',
        });
      })();
    },
  });
})();
