/* 44 Sudoku Mini. TK: kotak 3x3 dengan 3 bentuk. SD: kotak 4x4 dengan angka 1-4 dan empat kotak kecil 2x2. Tiga babak, tiap babak naik isinya.
   Puzzle dibuat dari solusi dasar yang diacak (tukar simbol, baris, kolom), lalu sel dikosongkan acak, dicek supaya hanya punya satu jawaban.
   Menang = semua terisi dan tidak ada yang bentrok (cek aturan), bukan dicocokkan dengan satu kunci jawaban. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  // ---------- simbol ----------
  const SHAPES = [
    { name: 'Lingkaran', draw: () => svg('circle', { cx: 50, cy: 50, r: 35, fill: '#e5484d', stroke: '#a8232a', 'stroke-width': 5 }) },
    { name: 'Segitiga', draw: () => svg('path', { d: 'M50 14 L90 82 H10 Z', fill: '#ffc93c', stroke: '#c99200', 'stroke-width': 5, 'stroke-linejoin': 'round' }) },
    { name: 'Persegi', draw: () => svg('rect', { x: 16, y: 16, width: 68, height: 68, rx: 10, fill: '#2f6fed', stroke: '#1b46b0', 'stroke-width': 5 }) },
  ];
  const NUM_COLORS = ['#e5484d', '#2f6fed', '#12a150', '#e8590c'];

  function symbol(isTK, v) {
    if (isTK) return svg('svg', { viewBox: '0 0 100 100', class: 'sd-shape', 'aria-hidden': 'true', focusable: 'false' }, SHAPES[v].draw());
    return h('span', { class: 'sd-n', style: 'color:' + NUM_COLORS[v], 'aria-hidden': 'true' }, String(v + 1));
  }
  const nameOf = (isTK, v) => (isTK ? SHAPES[v].name : String(v + 1));

  // ---------- puzzle ----------
  function baseGrid(N) {
    return N === 3
      ? [[0, 1, 2], [1, 2, 0], [2, 0, 1]]
      : [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  }
  function randomSolution(N) {
    const sym = shuffle([...Array(N).keys()]);
    let g = baseGrid(N).map((r) => r.map((v) => sym[v]));
    let rowOrder, colOrder;
    if (N === 3) { rowOrder = shuffle([0, 1, 2]); colOrder = shuffle([0, 1, 2]); }
    else {
      const band = () => shuffle([0, 1]).flatMap((b) => shuffle([0, 1]).map((i) => b * 2 + i));
      rowOrder = band(); colOrder = band();
    }
    g = rowOrder.map((r) => colOrder.map((c) => g[r][c]));
    return g;
  }
  const boxOf = (N, r, c) => (N === 4 ? (r >> 1) * 2 + (c >> 1) : -1);
  function peers(N, r, c) {
    const out = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      if (i === r && j === c) continue;
      if (i === r || j === c || (N === 4 && boxOf(N, i, j) === boxOf(N, r, c))) out.push([i, j]);
    }
    return out;
  }
  // sel yang bentrok: nilainya sama dengan sel lain di baris, kolom, atau kotak yang sama
  function conflicts(N, g) {
    const bad = new Set();
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (g[r][c] < 0) continue;
      for (const [i, j] of peers(N, r, c)) if (g[i][j] === g[r][c]) { bad.add(r * N + c); break; }
    }
    return bad;
  }
  function countSolutions(N, g, cap) {
    let count = 0;
    const walk = () => {
      let br = -1, bc = -1, bopts = null;
      for (let r = 0; r < N && bopts !== 0; r++) for (let c = 0; c < N; c++) {
        if (g[r][c] >= 0) continue;
        const used = new Set(peers(N, r, c).map(([i, j]) => g[i][j]));
        const opts = [];
        for (let v = 0; v < N; v++) if (!used.has(v)) opts.push(v);
        if (bopts === null || opts.length < bopts.length) { bopts = opts; br = r; bc = c; }
        if (opts.length === 0) break;
      }
      if (br < 0) { count++; return; }
      for (const v of bopts) {
        g[br][bc] = v; walk(); g[br][bc] = -1;
        if (count >= cap) return;
      }
    };
    walk();
    return count;
  }
  function makePuzzle(N, empties) {
    const sol = randomSolution(N);
    let best = null;
    for (let t = 0; t < 250; t++) {
      const cells = sample([...Array(N * N).keys()], empties);
      const g = sol.map((r) => r.slice());
      cells.forEach((k) => { g[(k / N) | 0][k % N] = -1; });
      best = g;
      if (countSolutions(N, g.map((r) => r.slice()), 2) === 1) break;
    }
    return { sol, grid: best };
  }

  const CSS = `
.play[data-game="sudoku"] .sd-board { display: grid; gap: 6px; width: min(100%, var(--bw), max(240px, calc(100dvh - 450px))); padding: 10px; border-radius: 26px; background: #eadfc6; box-shadow: inset 0 4px 0 rgba(0, 0, 0, 0.08), 0 5px 0 var(--shadow); grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="sudoku"] .sd-cell {
  position: relative; display: grid; place-items: center; aspect-ratio: 1; min-width: 0; padding: 0; border: 3px solid transparent; border-radius: 16px;
  background: #fff; color: var(--ink); font: inherit; overflow: hidden;
  box-shadow: 0 3px 0 var(--shadow);
  transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, border-color var(--dur-ui) ease;
}
.play[data-game="sudoku"] .sd-cell.is-alt { background: #f4ecda; }
.play[data-game="sudoku"] .sd-cell.is-given { background: #dde7f7; box-shadow: none; }
.play[data-game="sudoku"] .sd-cell.is-given.is-alt { background: #cfdcf2; }
.play[data-game="sudoku"] button.sd-cell { cursor: pointer; }
.play[data-game="sudoku"] button.sd-cell:active { transform: scale(0.96); }
.play[data-game="sudoku"] .sd-cell.is-sel { border-color: var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); }
.play[data-game="sudoku"] .sd-cell.is-bad { background: var(--bad-bg); border-color: var(--bad); }
.play[data-game="sudoku"] .sd-cell.is-help { border-color: var(--sun); background: #fff4cc; }
.play[data-game="sudoku"] .sd-cell.is-demo { border-color: var(--sun); background: #fff4cc; }
.play[data-game="sudoku"] .sd-cell.is-wrong { animation: sd-shake var(--dur-ui-max) var(--ease-in-out); }
@keyframes sd-shake { 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
.play[data-game="sudoku"] .sd-shape { width: 72%; height: 72%; display: block; }
.play[data-game="sudoku"] .sd-n { font-size: clamp(2rem, 11vw, 3rem); font-weight: 800; line-height: 1; }
.play[data-game="sudoku"] .sd-pop { animation: sd-pop var(--dur-ui) var(--ease-pop); }
@keyframes sd-pop { from { opacity: 0.4; transform: scale(0.95); } }
.play[data-game="sudoku"] .sd-board.is-win .sd-cell { animation: sd-yay 300ms var(--ease-pop) both; animation-delay: calc(var(--k, 0) * 40ms); }
@keyframes sd-yay { 50% { transform: scale(1.08); } }
.play[data-game="sudoku"] .sd-pal { display: flex; gap: 10px; width: min(100%, 440px); justify-content: center; }
.play[data-game="sudoku"] .sd-p { flex: 1 1 0; min-width: 0; min-height: 76px; padding: 6px; }
.play[data-game="sudoku"] .sd-p.is-erase { flex: 0 0 72px; font-size: 1.6rem; }
.play[data-game="sudoku"] .sd-p .sd-shape { width: 62px; height: 62px; }
.play[data-game="sudoku"] .sd-p .sd-n { font-size: 2.4rem; }
.play[data-game="sudoku"] .sd-rule { margin: 0; max-width: 440px; text-align: center; font-weight: 800; color: var(--muted); font-size: 1rem; line-height: 1.3; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="sudoku"] .sd-board.is-win .sd-cell { animation: none; }
  .play[data-game="sudoku"] .sd-cell.is-wrong { animation: none; background: var(--bad-bg); }
}
`;

  TI.register({
    id: 'sudoku',
    title: 'Sudoku Mini',
    cat: 'logika',
    icon: '🔲',
    desc: 'Isi kotak kosong. Tidak boleh ada yang sama di baris dan kolom.',
    start(ctx) {
      TI.style('sudoku', CSS);
      const isTK = ctx.isTK;
      const N = isTK ? 3 : 4;
      const empties = isTK ? [2, 3, 4] : [5, 7, 9];
      const total = empties.length;
      const RULE = isTK
        ? 'Di setiap baris dan kolom, tiga bentuk tidak boleh ada yang sama.'
        : 'Di setiap baris, kolom, dan kotak kecil, angka 1 sampai 4 tidak boleh ada yang sama.';

      async function playPuzzle(idx) {
        const { sol, grid } = makePuzzle(N, empties[idx]);
        const given = grid.map((r) => r.map((v) => v >= 0));
        const filledAtStart = given.flat().filter(Boolean).length;
        let sel = null, bantuan = 0, busy = false, solved = false;
        const cellEl = [];

        ctx.ask(idx === 0
          ? 'Isi kotak yang kosong! ' + RULE
          : (isTK ? 'Babak ' + (idx + 1) + '. Isi semua kotak. Jangan ada bentuk yang sama di satu baris atau kolom.' : 'Babak ' + (idx + 1) + '. Isi semua kotak dengan angka 1 sampai 4.'));

        // ----- papan -----
        const board = h('div', { class: 'sd-board', style: '--n:' + N + ';--bw:' + (isTK ? 330 : 380) + 'px', 'aria-label': 'Papan sudoku' });
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const alt = N === 4 && ((r >> 1) + (c >> 1)) % 2 === 1;
          let el;
          if (given[r][c]) {
            el = h('div', { class: 'sd-cell is-given' + (alt ? ' is-alt' : ''), 'aria-label': 'Sudah terisi ' + nameOf(isTK, grid[r][c]) }, symbol(isTK, grid[r][c]));
          } else {
            el = h('button', { type: 'button', class: 'sd-cell' + (alt ? ' is-alt' : ''), 'aria-label': 'Kotak kosong baris ' + (r + 1) + ' kolom ' + (c + 1) });
            el.addEventListener('click', () => { if (!busy && !solved) select(r, c, true); });
          }
          cellEl[r * N + c] = el;
          board.append(el);
        }
        const rule = h('p', { class: 'sd-rule' }, RULE);
        const pal = h('div', { class: 'sd-pal' });
        for (let v = 0; v < N; v++) {
          const b = h('button', { type: 'button', class: 'choice sd-p', 'aria-label': (isTK ? 'Bentuk ' : 'Angka ') + nameOf(isTK, v) }, symbol(isTK, v));
          b.addEventListener('click', () => { if (!busy && !solved) fill(v); });
          pal.append(b);
        }
        const erase = h('button', { type: 'button', class: 'choice sd-p is-erase', 'aria-label': 'Hapus isian kotak' }, '⌫');
        erase.addEventListener('click', () => { if (!busy && !solved) clearSel(); });
        pal.append(erase);
        const help = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        ctx.el.append(board, pal, ...(idx === 0 ? [] : [rule]), h('div', { class: 'ti-toolbar' }, help));

        // ----- logika -----
        const cr = (k) => [(k / N) | 0, k % N];
        function paint() {
          const bad = conflicts(N, grid);
          for (let k = 0; k < N * N; k++) {
            const [r, c] = cr(k);
            if (given[r][c]) continue;
            cellEl[k].classList.toggle('is-bad', bad.has(k));
          }
          const filled = grid.flat().filter((v) => v >= 0).length;
          ctx.progress(idx + (filled - filledAtStart) / (N * N - filledAtStart) * 0.95, total);
          return bad;
        }
        function select(r, c, speak) {
          if (given[r][c]) return;
          if (sel != null) cellEl[sel].classList.remove('is-sel');
          sel = r * N + c;
          cellEl[sel].classList.add('is-sel');
          ctx.sfx('tap');
          if (speak && grid[r][c] < 0) ctx.say(isTK ? 'Pilih bentuknya.' : 'Pilih angkanya.');
        }
        function nextEmpty(from) {
          for (let i = 1; i <= N * N; i++) {
            const k = (from + i) % (N * N), [r, c] = cr(k);
            if (!given[r][c] && grid[r][c] < 0) return k;
          }
          return -1;
        }
        function setCell(r, c, v) {
          grid[r][c] = v;
          const el = cellEl[r * N + c];
          el.replaceChildren(...(v >= 0 ? [symbol(isTK, v)] : []));
          el.firstChild && el.firstChild.classList.add('sd-pop');
        }
        function fill(v) {
          if (sel == null) { const k = nextEmpty(-1); if (k < 0) return; const [r, c] = cr(k); select(r, c, false); }
          const [r, c] = cr(sel);
          setCell(r, c, v);
          const bad = paint();
          if (bad.has(sel)) {
            ctx.wrong(cellEl[sel], { say: isTK ? 'Ups, bentuk itu sudah ada di baris atau kolomnya. Ganti ya.' : 'Ups, angka itu sudah ada di baris, kolom, atau kotaknya. Ganti ya.' });
            return;
          }
          ctx.sfx('pop');
          if (checkWin()) return;
          const k = nextEmpty(sel);
          if (k >= 0) { const [nr, nc] = cr(k); select(nr, nc, false); }
        }
        function clearSel() {
          if (sel == null) return;
          const [r, c] = cr(sel);
          if (grid[r][c] < 0) return;
          setCell(r, c, -1); paint(); ctx.sfx('tap');
        }

        let winLock = null;
        const win = new Promise((res) => { winLock = res; });
        async function celebrate() {
          solved = true; busy = true;
          if (sel != null) cellEl[sel].classList.remove('is-sel');
          cellEl.forEach((el, k) => el.style.setProperty('--k', String(k)));
          board.classList.add('is-win');
          ctx.progress(idx + 1, total);
          await ctx.correct(null, { say: 'Hebat! Semua kotak terisi dengan benar.', min: 900 });
          winLock();
        }
        // menang = semua terisi dan tidak ada yang bentrok (cek aturan)
        function checkWin() {
          if (grid.some((r) => r.some((v) => v < 0))) return false;
          if (conflicts(N, grid).size) return false;
          celebrate();
          return true;
        }

        // ----- Bantu: ketuk 1 dan 2 = isi satu kotak dengan benar, ketuk 3 = semua terisi -----
        function fixOne() {
          const wrongCells = [], empty = [];
          for (let k = 0; k < N * N; k++) {
            const [r, c] = cr(k);
            if (given[r][c]) continue;
            if (grid[r][c] < 0) empty.push(k); else if (grid[r][c] !== sol[r][c]) wrongCells.push(k);
          }
          const list = wrongCells.length ? wrongCells : empty;
          if (!list.length) return -1;
          const k = shuffle(list)[0], [r, c] = cr(k);
          setCell(r, c, sol[r][c]);
          cellEl[k].classList.add('is-help');
          return k;
        }
        async function autoFill() {
          busy = true;
          ctx.say('Lihat ya, kotaknya diisi sendiri.');
          for (let k = 0; k < N * N && ctx.alive; k++) {
            const [r, c] = cr(k);
            if (given[r][c] || grid[r][c] === sol[r][c]) continue;
            setCell(r, c, sol[r][c]); cellEl[k].classList.add('is-help');
            ctx.sfx('pop'); paint();
            await ctx.wait(150);
          }
          if (!ctx.alive) return;
          busy = false;
          if (!checkWin()) { busy = false; }
        }
        help.addEventListener('click', () => {
          if (busy || solved) return;
          bantuan++; ctx.mistakes++;
          if (bantuan >= 3) { autoFill(); return; }
          const k = fixOne();
          if (k < 0) return;
          const [r, c] = cr(k);
          ctx.sfx('benar'); paint();
          ctx.say('Lihat, kotak yang menyala diisi ' + (isTK ? 'bentuk ' : 'angka ') + nameOf(isTK, sol[r][c]) + '.');
          ctx.after(900, () => cellEl[k].classList.remove('is-help'));
          checkWin();
        });

        // awal: pilih kotak kosong pertama; puzzle pertama menunjukkan aturan dengan satu baris dan satu kolom yang menyala
        const first = nextEmpty(-1);
        if (first >= 0) { const [r, c] = cr(first); select(r, c, false); }
        paint();
        if (idx === 0) {
          const glow = (cells, on) => cells.forEach((k) => cellEl[k].classList.toggle('is-demo', on));
          const row = [...Array(N).keys()].map((c) => c);
          const col = [...Array(N).keys()].map((r) => r * N);
          const box = N === 4 ? [0, 1, 4, 5] : null;
          ctx.after(500, () => glow(row, true));
          ctx.after(3300, () => { glow(row, false); glow(col, true); });
          ctx.after(5600, () => { glow(col, false); if (box) glow(box, true); });
          ctx.after(7900, () => glow(box || [], false));
        }
        await win;
      }

      return (async () => {
        for (let i = 0; i < total && ctx.alive; i++) {
          ctx.progress(i, total);
          ctx.clear();
          await playPuzzle(i); if (i < total - 1 && ctx.alive) ctx.correct(null, { say: 'Bagus! Terus naik ke babak ' + (i + 2) + '!' });
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({
          stars: ctx.mistakes <= 2 ? 3 : ctx.mistakes <= 6 ? 2 : 1,
          lesson: 'Berpikir teliti: di setiap baris dan kolom tidak boleh ada yang sama.',
        });
      })();
    },
  });
})();
