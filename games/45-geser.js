/* 45 Geser Angka. Puzzle geser: ubin bernomor dan satu tempat kosong. Ketuk ubin di sebelah tempat kosong untuk menggesernya.
   Papan diacak dengan jalan acak dari kondisi selesai (jadi pasti bisa diselesaikan). Tombol Bantu memakai BFS dari kondisi selesai
   (jarak ke tujuan untuk setiap keadaan), jadi petunjuknya selalu satu langkah dari jalan terpendek, walaupun anak sudah menyimpang. Tiga babak menanjak (acak makin jauh). */
(function () {
  const { h, pick } = TI;

  const CFG = {
    tk: { rows: 2, cols: 3, walks: [4, 6, 8], width: 360 },
    sd: { rows: 3, cols: 3, walks: [10, 16, 24], width: 400 },
  };
  const COLORS = ['#e5484d', '#f08a1c', '#d9a400', '#12a150', '#0e9fb5', '#2f6fed', '#7c4dff', '#d6409f'];

  // ---------- model: keadaan, tetangga, BFS ----------
  function makeModel(rows, cols) {
    const n = rows * cols;
    const adj = [];
    for (let p = 0; p < n; p++) {
      const r = (p / cols) | 0, c = p % cols, a = [];
      if (r > 0) a.push(p - cols);
      if (r < rows - 1) a.push(p + cols);
      if (c > 0) a.push(p - 1);
      if (c < cols - 1) a.push(p + 1);
      adj.push(a);
    }
    const goal = Array.from({ length: n }, (_, i) => (i + 1) % n); // 1, 2, ..., n-1, kosong (0)
    const enc = (a) => { let k = 0; for (let i = n - 1; i >= 0; i--) k = k * n + a[i]; return k; };
    const dec = (k, out) => { for (let i = 0; i < n; i++) { out[i] = k % n; k = (k - out[i]) / n; } return out; };
    let dist = null;
    function build() {
      dist = new Map();
      const g = enc(goal);
      const queue = [g];
      dist.set(g, 0);
      const cur = new Array(n);
      for (let qi = 0; qi < queue.length; qi++) {
        const key = queue[qi], d = dist.get(key);
        dec(key, cur);
        const b = cur.indexOf(0);
        for (const p of adj[b]) {
          cur[b] = cur[p]; cur[p] = 0;
          const nk = enc(cur);
          if (!dist.has(nk)) { dist.set(nk, d + 1); queue.push(nk); }
          cur[p] = cur[b]; cur[b] = 0;
        }
      }
    }
    const model = {
      n, rows, cols, adj, goal,
      ready() { if (!dist) build(); },
      dist(a) { model.ready(); const d = dist.get(enc(a)); return d == null ? 99 : d; },
      isGoal: (a) => a.every((v, i) => v === goal[i]),
      // posisi ubin yang harus digeser sekarang (satu langkah dari jalan terpendek)
      bestMove(a) {
        const b = a.indexOf(0), d = model.dist(a);
        let best = -1;
        for (const p of adj[b]) {
          const t = a.slice(); t[b] = t[p]; t[p] = 0;
          if (model.dist(t) === d - 1) { best = p; break; }
        }
        return best;
      },
      // jalan acak k langkah tanpa langsung membatalkan langkah sebelumnya
      scramble(k) {
        let last = null;
        for (let tries = 0; tries < 60; tries++) {
          const a = goal.slice();
          let b = n - 1, prev = -1;
          for (let i = 0; i < k; i++) {
            const p = pick(adj[b].filter((x) => x !== prev));
            a[b] = a[p]; a[p] = 0; prev = b; b = p;
          }
          last = a;
          if (!model.isGoal(a) && model.dist(a) >= Math.max(2, k - 2)) return a;
        }
        return last;
      },
    };
    return model;
  }

  const CSS = `
.play[data-game="geser"] .gs-info { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px; }
.play[data-game="geser"] .gs-count { display: inline-flex; align-items: baseline; gap: 8px; padding: 8px 18px; border-radius: 16px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.15rem; }
.play[data-game="geser"] .gs-count b { min-width: 1.5ch; font-size: 1.5rem; color: var(--c); text-align: right; }
.play[data-game="geser"] .gs-goal { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 16px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 0.95rem; color: var(--muted); }
.play[data-game="geser"] .gs-mini { display: grid; gap: 3px; }
.play[data-game="geser"] .gs-mini i { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; background: var(--tc); color: #fff; font-size: 0.8rem; font-style: normal; font-weight: 800; }
.play[data-game="geser"] .gs-mini i.is-blank { background: rgba(0, 0, 0, 0.08); }
.play[data-game="geser"] .gs-board { width: min(100%, var(--bw), max(250px, calc(100dvh - 430px))); padding: 8px; border-radius: 26px; background: #eadfc6; box-shadow: inset 0 4px 0 rgba(0, 0, 0, 0.08), 0 5px 0 var(--shadow); }
.play[data-game="geser"] .gs-field { position: relative; width: 100%; aspect-ratio: var(--cols) / var(--rows); touch-action: manipulation; }
.play[data-game="geser"] .gs-tile {
  position: absolute; left: 0; top: 0; width: calc(100% / var(--cols)); height: calc(100% / var(--rows));
  padding: 0; border: 0; background: none; cursor: pointer; will-change: transform;
  transition: transform 150ms var(--ease-in-out);
}
.play[data-game="geser"] .gs-in {
  position: absolute; inset: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  border-radius: 20px; background: var(--tc); color: #fff;
  box-shadow: 0 5px 0 color-mix(in srgb, var(--tc) 62%, #000);
  transition: transform var(--dur-press) var(--ease-out);
}
.play[data-game="geser"] .gs-tile:active .gs-in { transform: translateY(3px) scale(0.97); box-shadow: 0 2px 0 color-mix(in srgb, var(--tc) 62%, #000); }
.play[data-game="geser"] .gs-num { font-size: clamp(2.2rem, 11vw, 3.4rem); font-weight: 800; line-height: 1; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.18); }
.play[data-game="geser"] .gs-in .ti-dots { max-width: 8em; font-size: 0.85rem; }
.play[data-game="geser"] .gs-in .ti-dots i { background: rgba(255, 255, 255, 0.9); }
.play[data-game="geser"] .gs-ok {
  position: absolute; right: 7px; top: 6px; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%;
  background: #fff; color: var(--good); font-size: 0.95rem; font-style: normal; font-weight: 800; opacity: 0;
  transition: opacity var(--dur-ui) var(--ease-out);
}
.play[data-game="geser"] .gs-tile.is-right .gs-ok { opacity: 1; }
.play[data-game="geser"] .gs-tile.is-help .gs-in { outline: 5px solid var(--sun); outline-offset: 2px; }
.play[data-game="geser"] .gs-star {
  position: absolute; left: 0; top: 0; width: calc(100% / var(--cols)); height: calc(100% / var(--rows)); display: grid; place-items: center;
  font-size: 2.6rem; opacity: 0; pointer-events: none; transition: opacity 250ms var(--ease-out);
}
.play[data-game="geser"] .gs-board.is-win .gs-star { opacity: 1; }
.play[data-game="geser"] .gs-board.is-win .gs-in { animation: gs-yay 300ms var(--ease-pop) both; animation-delay: calc(var(--k, 0) * 45ms); }
@keyframes gs-yay { 50% { transform: scale(1.08); } }
.play[data-game="geser"] .gs-msg { margin: 0; min-height: 1.4em; text-align: center; font-weight: 800; color: var(--muted); }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="geser"] .gs-board.is-win .gs-in { animation: none; }
}
`;

  TI.register({
    id: 'geser',
    title: 'Geser Angka',
    cat: 'logika',
    icon: '🔀',
    desc: 'Geser ubin angka satu per satu sampai urut dari 1.',
    start(ctx) {
      TI.style('geser', CSS);
      const cfg = ctx.isTK ? CFG.tk : CFG.sd;
      const model = makeModel(cfg.rows, cfg.cols);
      const { n, rows, cols } = model;
      model.ready(); // BFS dari kondisi selesai, dipakai ulang oleh semua puzzle

      const total = cfg.walks.length;
      let totalMoves = 0, totalOpt = 0;

      async function playPuzzle(idx) {
        const state = model.scramble(cfg.walks[idx]);
        const opt = model.dist(state);
        totalOpt += opt;
        let moves = 0, helps = 0, busy = false, solved = false;

        ctx.ask(ctx.isTK
          ? 'Babak ' + (idx + 1) + '. Geser ubin sampai urut dari 1 sampai ' + (n - 1) + '!'
          : 'Babak ' + (idx + 1) + '. Geser ubin sampai urut dari 1 sampai ' + (n - 1) + '. Pikirkan beberapa langkah ke depan!');

        // ----- tampilan -----
        const counter = h('b', null, '0');
        const mini = h('div', { class: 'gs-mini', 'aria-hidden': 'true', style: 'grid-template-columns:repeat(' + cols + ',24px)' });
        for (let i = 0; i < n; i++) {
          const v = model.goal[i];
          mini.append(v ? h('i', { style: '--tc:' + COLORS[(v - 1) % 8] }, v) : h('i', { class: 'is-blank' }));
        }
        const info = h('div', { class: 'gs-info' },
          h('div', { class: 'gs-count', 'aria-live': 'off' }, 'Langkah', counter),
          h('div', { class: 'gs-goal' }, 'Tujuan', mini));
        const field = h('div', { class: 'gs-field' });
        const star = h('span', { class: 'gs-star', 'aria-hidden': 'true' }, '⭐');
        const lastPos = n - 1;
        star.style.transform = 'translate(' + (lastPos % cols) * 100 + '%,' + ((lastPos / cols) | 0) * 100 + '%)';
        field.append(star);
        const board = h('div', { class: 'gs-board', style: '--rows:' + rows + ';--cols:' + cols + ';--bw:' + cfg.width + 'px' }, field);
        const msg = h('p', { class: 'gs-msg', 'aria-live': 'polite' });
        const help = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        ctx.el.append(info, board, msg, h('div', { class: 'ti-toolbar' }, help));

        const tiles = {};
        const put = (btn, p) => { btn.style.transform = 'translate(' + (p % cols) * 100 + '%,' + ((p / cols) | 0) * 100 + '%)'; };
        function refresh() {
          for (let v = 1; v < n; v++) tiles[v].classList.toggle('is-right', state.indexOf(v) === v - 1);
        }
        for (let v = 1; v < n; v++) {
          const inner = h('span', { class: 'gs-in pop-in', style: '--i:' + (v - 1) },
            h('b', { class: 'gs-num' }, v), ctx.isTK ? TI.dots(v) : null, h('i', { class: 'gs-ok', 'aria-hidden': 'true' }, '✓'));
          const btn = h('button', { type: 'button', class: 'gs-tile', style: '--tc:' + COLORS[(v - 1) % 8], 'aria-label': 'Ubin ' + v }, inner);
          tiles[v] = btn;
          field.append(btn);
        }
        state.forEach((v, p) => { if (v) put(tiles[v], p); });
        refresh();

        // ----- gerak -----
        function slide(p) { // p = posisi ubin yang digeser ke tempat kosong
          const b = state.indexOf(0), v = state[p];
          state[b] = v; state[p] = 0;
          put(tiles[v], b);
          moves++; totalMoves++;
          counter.textContent = String(moves);
          ctx.sfx('klik');
          refresh();
          return v;
        }
        let winLock = null;
        const win = new Promise((res) => { winLock = res; });
        async function celebrate() {
          solved = true; busy = true;
          Object.values(tiles).forEach((t, k) => t.firstChild.style.setProperty('--k', String(k)));
          board.classList.add('is-win');
          msg.textContent = 'Hebat! Selesai dalam ' + moves + ' langkah.';
          await ctx.correct(null, { say: 'Hebat! Puzzle selesai.', min: 900 });
          winLock();
        }
        function checkWin() { if (model.isGoal(state)) { celebrate(); return true; } return false; }

        function tap(v) {
          if (busy || solved) return;
          const p = state.indexOf(v), b = state.indexOf(0);
          if (!model.adj[b].includes(p)) { ctx.sfx('tap'); msg.textContent = 'Ubin itu belum bisa digeser. Pilih yang di sebelah tempat kosong.'; return; }
          msg.textContent = '';
          slide(p);
          checkWin();
        }
        for (let v = 1; v < n; v++) tiles[v].addEventListener('click', () => tap(v));

        // ----- Bantu: ketuk 1 dan 2 = satu langkah terpendek, ketuk 3 = selesai otomatis -----
        async function autoSolve() {
          busy = true;
          msg.textContent = 'Lihat ya, ubinnya bergeser sendiri.';
          ctx.say('Lihat ya, ubinnya bergeser sendiri.');
          for (let guard = 0; guard < 80 && ctx.alive && !model.isGoal(state); guard++) {
            const p = model.bestMove(state);
            if (p < 0) break;
            slide(p);
            await ctx.wait(135);
          }
          if (!ctx.alive) return;
          await ctx.wait(160);
          busy = false;
          checkWin();
        }
        help.addEventListener('click', () => {
          if (busy || solved) return;
          helps++; ctx.mistakes++;
          if (helps >= 3) { autoSolve(); return; }
          const p = model.bestMove(state);
          if (p < 0) return;
          const v = state[p];
          tiles[v].classList.add('is-help');
          ctx.after(700, () => tiles[v].classList.remove('is-help'));
          msg.textContent = 'Geser ubin ' + v + '.';
          ctx.say('Geser ubin ' + v + '.');
          slide(p);
          checkWin();
        });

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
        const ratio = totalMoves / Math.max(1, totalOpt);
        const stars = ctx.mistakes === 0 && ratio <= 3 ? 3 : ctx.mistakes <= 3 && ratio <= 6 ? 2 : 1;
        ctx.finish({ stars, lesson: 'Puzzle melatih kita berpikir beberapa langkah ke depan.' });
      })();
    },
  });
})();
