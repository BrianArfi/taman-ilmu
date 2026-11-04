/* 91 Parkir Pintar. Rush hour junior: ketuk mobil untuk pilih, ketuk sel tujuan sebaris untuk geser. Keluarkan mobil bintang ke kanan. */
(function () {
  const { h, svg, rand } = TI;

  const CSS = `
.play[data-game="parkir"] .pk-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="parkir"] .pk-board { display: grid; gap: 5px; width: min(100%, 360px); padding: 10px; border-radius: 22px; background: #3d405b; box-shadow: 0 5px 0 var(--shadow); grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="parkir"] .pk-cell { position: relative; aspect-ratio: 1; min-height: 64px; min-width: 64px; padding: 0; border: 0; border-radius: 12px; background: #565a7a; cursor: pointer; overflow: hidden; transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease; }
.play[data-game="parkir"] .pk-cell:active { transform: scale(0.96); }
.play[data-game="parkir"] .pk-cell.is-exit { background: #6c70a0; }
.play[data-game="parkir"] .pk-cell svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.play[data-game="parkir"] .pk-cell.is-sel { background: #7c86b8; }
.play[data-game="parkir"] .pk-cell.is-sel .pk-body { stroke: #fff; stroke-width: 3; }
.play[data-game="parkir"] .pk-cell.is-win svg { animation: pk-out 280ms var(--ease-out) both; }
@keyframes pk-out { to { opacity: 0; transform: translateX(70%); } }
.play[data-game="parkir"] .pk-pop { animation: pk-pop var(--dur-ui) var(--ease-pop); }
@keyframes pk-pop { from { opacity: 0.4; transform: scale(0.95); } }
.play[data-game="parkir"] .pk-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.play[data-game="parkir"] .pk-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="parkir"] .pk-cell.is-win svg { animation: none; opacity: 0; }
  .play[data-game="parkir"] .pk-pop { animation: none; }
}
`;

  const WARNA = [
    { c: '#e5484d', nama: 'merah' }, { c: '#2f6fed', nama: 'biru' },
    { c: '#12a150', nama: 'hijau' }, { c: '#7c4dff', nama: 'ungu' },
  ];
  const BINTANG_C = '#f5b301';

  // cars: { len, horiz, r, c, star, color, nama }
  function awal(n, tk) {
    if (tk) return [
      { len: 2, horiz: true, r: 1, c: 2, star: true, color: BINTANG_C, nama: 'bintang' },
      { len: 2, horiz: false, r: 0, c: 0, star: false, color: WARNA[0].c, nama: WARNA[0].nama },
    ];
    return [
      { len: 2, horiz: true, r: 2, c: 3, star: true, color: BINTANG_C, nama: 'bintang' },
      { len: 2, horiz: false, r: 0, c: 0, star: false, color: WARNA[0].c, nama: WARNA[0].nama },
      { len: 2, horiz: true, r: 0, c: 2, star: false, color: WARNA[1].c, nama: WARNA[1].nama },
      { len: 2, horiz: false, r: 3, c: 4, star: false, color: WARNA[2].c, nama: WARNA[2].nama },
    ];
  }
  const exitR = (n) => (n === 4 ? 1 : 2);

  function cellsOf(car) {
    const out = [];
    for (let k = 0; k < car.len; k++) out.push(car.horiz ? [car.r, car.c + k] : [car.r + k, car.c]);
    return out;
  }
  function peta(n, cars, kecuali) {
    const g = Array.from({ length: n }, () => Array(n).fill(-1));
    cars.forEach((car, i) => {
      if (i === kecuali) return;
      cellsOf(car).forEach(([r, c]) => { g[r][c] = i; });
    });
    return g;
  }
  const kunci = (st) => st.map((p) => p[0] + ',' + p[1]).join('|');
  const menangSt = (n, cars, st) => {
    const s = cars.findIndex((c) => c.star);
    return st[s][1] + cars[s].len - 1 === n - 1;
  };

  // BFS: langkah tunggal tiap mobil. Kembalikan array {i, dr, dc} atau null.
  function pecahkan(n, cars, st0) {
    const seen = new Set([kunci(st0)]);
    const antri = [{ st: st0, jalan: [] }];
    for (let q = 0; q < antri.length && seen.size < 6000; q++) {
      const { st, jalan } = antri[q];
      for (let i = 0; i < cars.length; i++) {
        const car = cars[i];
        const arah = car.horiz ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
        for (const [dr, dc] of arah) {
          const nr = st[i][0] + dr, nc = st[i][1] + dc;
          const tmp = cars.map((c2, j) => ({ ...c2, r: st[j][0], c: st[j][1] }));
          tmp[i].r = nr; tmp[i].c = nc;
          if (cellsOf(tmp[i]).some(([r, c]) => r < 0 || c < 0 || r >= n || c >= n)) continue;
          const g = peta(n, tmp, i);
          void g;
          const tabrak = cellsOf(tmp[i]).some(([r, c]) => {
            const gg = peta(n, cars.map((c2, j) => ({ ...c2, r: st[j][0], c: st[j][1] })), i);
            return gg[r][c] >= 0;
          });
          if (tabrak) continue;
          const st2 = st.map((p, j) => (j === i ? [nr, nc] : p));
          const k = kunci(st2);
          if (seen.has(k)) continue;
          seen.add(k);
          const j2 = jalan.concat([{ i, dr, dc }]);
          if (menangSt(n, cars, st2)) return j2;
          antri.push({ st: st2, jalan: j2 });
        }
      }
    }
    return null;
  }

  function acak(n, cars, tk) {
    const K = tk ? 5 : 9;
    const minJ = tk ? 2 : 4;
    let jatuh = null;
    for (let t = 0; t < 80; t++) {
      const st = cars.map((c) => [c.r, c.c]);
      for (let k = 0; k < K; k++) {
        const g = peta(n, cars.map((c2, j) => ({ ...c2, r: st[j][0], c: st[j][1] })));
        const cand = [];
        cars.forEach((car, i) => {
          const [r, c] = st[i];
          if (car.horiz) {
            if (c + car.len < n && g[r][c + car.len] < 0) cand.push([i, 0, 1]);
            if (c > 0 && g[r][c - 1] < 0) cand.push([i, 0, -1]);
          } else {
            if (r + car.len < n && g[r + car.len][c] < 0) cand.push([i, 1, 0]);
            if (r > 0 && g[r - 1][c] < 0) cand.push([i, -1, 0]);
          }
        });
        if (!cand.length) break;
        const [i, dr, dc] = cand[rand(0, cand.length - 1)];
        st[i][0] += dr; st[i][1] += dc;
      }
      if (menangSt(n, cars, st)) continue;
      const sol = pecahkan(n, cars, st);
      if (!sol) continue;
      if (!jatuh) jatuh = st.map((p) => p.slice());
      if (sol.length >= minJ && sol.length <= 8) return st.map((p) => p.slice());
    }
    return jatuh || cars.map((c) => [c.r, c.c]);
  }

  function mobilSVG(car, idx) {
    const gelap = 'rgba(0,0,0,0.25)';
    const kaca = 'rgba(255,255,255,0.75)';
    const kids = [];
    if (car.horiz) {
      kids.push(svg('rect', { x: 1, y: 9, width: 38, height: 22, rx: 7, fill: car.color, class: 'pk-body' }));
      kids.push(svg('rect', { x: 9, y: 13, width: 12, height: 14, rx: 3, fill: kaca }));
      kids.push(svg('rect', { x: 1, y: 9, width: 38, height: 6, rx: 3, fill: gelap, opacity: 0.25 }));
    } else {
      kids.push(svg('rect', { x: 9, y: 1, width: 22, height: 38, rx: 7, fill: car.color, class: 'pk-body' }));
      kids.push(svg('rect', { x: 13, y: 9, width: 14, height: 12, rx: 3, fill: kaca }));
      kids.push(svg('rect', { x: 9, y: 1, width: 6, height: 38, rx: 3, fill: gelap, opacity: 0.25 }));
    }
    if (car.star && idx === 0) kids.push(svg('text', { x: 20, y: 27, 'text-anchor': 'middle', 'font-size': 17 }, '⭐'));
    return svg('svg', { viewBox: '0 0 40 40', 'aria-hidden': 'true', focusable: 'false' }, ...kids);
  }

  TI.register({
    id: 'parkir',
    title: 'Parkir Pintar',
    cat: 'logika',
    icon: '🚙',
    desc: 'Geser mobil agar mobil bintang keluar.',
    start(ctx) {
      TI.style('parkir', CSS);
      const tk = ctx.isTK;
      const n = tk ? 4 : 5;
      const total = 2;

      const main = async () => {
        for (let pi = 0; pi < total && ctx.alive; pi++) {
          ctx.progress(pi, total);
          ctx.clear();
          await satu(pi);
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({ lesson: 'Mobil yang menghalangi jalan harus digeser dulu. Rencanakan langkahmu sebelum bergerak.' });
      };

      function satu(pi) {
        return new Promise((resolve) => {
          const cars = awal(n, tk);
          const er = exitR(n);
          const posAwal = acak(n, cars, tk);
          let pos = posAwal.map((p) => p.slice());
          let sel = null, gagal = 0, ketukN = 0, selesai = false, sibuk = false;

          ctx.ask(pi === 0
            ? 'Keluarkan mobil bintang! Ketuk mobil untuk pilih, lalu ketuk jalan tujuannya.'
            : 'Parkir ' + (pi + 1) + '. Keluarkan mobil bintang ke panah kanan!');

          const papan = h('div', { class: 'pk-board', style: '--n:' + n, role: 'grid', 'aria-label': 'Tempat parkir' });
          const info = h('div', { class: 'pk-info' },
            h('span', { class: 'pk-chip' }, 'Parkir ' + (pi + 1) + ' dari ' + total),
            h('span', { class: 'pk-chip' }, '⭐ = mobil bintang'));
          const bReset = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '↺ Ulang');
          const bBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          bReset.addEventListener('click', () => {
            if (sibuk || selesai) return;
            pos = posAwal.map((p) => p.slice()); sel = null; gagal = 0;
            ctx.sfx('tap'); gambar();
            ctx.say('Diulang dari awal.');
          });
          bBantu.addEventListener('click', () => { if (!sibuk && !selesai) langkahBantu(true); });
          ctx.el.append(h('div', { class: 'pk-wrap' }, info, papan,
            h('div', { class: 'ti-toolbar' }, bReset, bBantu)));

          function selDi(r, c) {
            const g = peta(n, cars.map((car, j) => ({ ...car, r: pos[j][0], c: pos[j][1] })));
            return g[r][c];
          }

          function gambar(keluar) {
            papan.replaceChildren();
            const cur = cars.map((car, j) => ({ ...car, r: pos[j][0], c: pos[j][1] }));
            const g = peta(n, cur);
            for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
              const i = g[r][c];
              const isExit = r === er && c === n - 1;
              const b = h('button', {
                type: 'button',
                class: 'pk-cell' + (isExit && i < 0 ? ' is-exit' : '') + (i >= 0 && i === sel ? ' is-sel' : ''),
                'aria-label': i >= 0 ? 'Mobil ' + cur[i].nama : 'Kotak kosong baris ' + (r + 1) + ' kolom ' + (c + 1),
              });
              if (i >= 0) {
                const k = cellsOf(cur[i]).findIndex(([rr, cc]) => rr === r && cc === c);
                b.append(mobilSVG(cur[i], k));
                if (keluar && cur[i].star) b.classList.add('is-win');
                else b.firstChild && b.firstChild.classList.add('pk-pop');
              } else if (isExit) {
                b.append(svg('svg', { viewBox: '0 0 40 40', 'aria-hidden': 'true', focusable: 'false' },
                  svg('text', { x: 20, y: 28, 'text-anchor': 'middle', 'font-size': 20, opacity: 0.8 }, '➡️')));
              }
              b.addEventListener('click', () => ketuk(r, c));
              papan.append(b);
            }
          }

          function geserKe(i, tr, tc) {
            const car = cars[i];
            const [r, c] = pos[i];
            const g = peta(n, cars.map((car2, j) => ({ ...car2, r: pos[j][0], c: pos[j][1] })), i);
            if (car.horiz) {
              if (tr !== r) return false;
              if (tc > c + car.len - 1) {
                const nc = tc - car.len + 1;
                if (nc <= c) return false;
                for (let cc = c + car.len; cc <= tc; cc++) if (g[r][cc] >= 0) return false;
                pos[i][1] = nc; return true;
              }
              if (tc < c) {
                if (tc >= c) return false;
                for (let cc = tc; cc < c; cc++) if (g[r][cc] >= 0) return false;
                pos[i][1] = tc; return true;
              }
              return false;
            }
            if (tc !== c) return false;
            if (tr > r + car.len - 1) {
              const nr = tr - car.len + 1;
              if (nr <= r) return false;
              for (let rr = r + car.len; rr <= tr; rr++) if (g[rr][c] >= 0) return false;
              pos[i][0] = nr; return true;
            }
            if (tr < r) {
              for (let rr = tr; rr < r; rr++) if (g[rr][c] >= 0) return false;
              pos[i][0] = tr; return true;
            }
            return false;
          }

          async function ketuk(r, c) {
            if (sibuk || selesai) return;
            ketukN++;
            const i = selDi(r, c);
            if (i >= 0) {
              sel = i; gagal = 0;
              ctx.sfx('tap');
              ctx.say('Mobil ' + cars[i].nama + ' dipilih.');
              gambar();
              await jaga();
              return;
            }
            if (sel == null) { await noProgress('Pilih dulu mobilnya ya.'); return; }
            if (geserKe(sel, r, c)) {
              gagal = 0;
              ctx.sfx('whoosh');
              const si = cars.findIndex((x) => x.star);
              if (pos[si][1] + cars[si].len - 1 === n - 1) { await menang(); return; }
              gambar();
              await jaga();
            } else {
              await noProgress('Tidak bisa ke sana. Coba sel lain yang sebaris.');
            }
          }

          // tiap 8 ketukan tanpa menang, satu langkah solusi dimainkan otomatis
          async function jaga() {
            if (selesai || !ctx.alive) return;
            if (ketukN % 8 === 0) { gagal = 0; await langkahBantu(false); }
          }

          async function noProgress(teks) {
            gagal++;
            await ctx.wrong(null, { say: teks, min: 500 });
            if (!ctx.alive || selesai) return;
            if (gagal >= 2) { gagal = 0; await langkahBantu(false); }
            else await jaga();
          }

          async function langkahBantu(tombol) {
            if (tombol) ctx.mistakes++;
            const sol = pecahkan(n, cars, pos.map((p) => p.slice()));
            if (!sol || !sol.length) return;
            const { i, dr, dc } = sol[0];
            pos[i][0] += dr; pos[i][1] += dc;
            sel = i; gagal = 0;
            ctx.sfx('benar');
            ctx.say('Lihat, mobil ' + cars[i].nama + ' digeser ke sini.');
            const si = cars.findIndex((x) => x.star);
            if (pos[si][1] + cars[si].len - 1 === n - 1) { await menang(); return; }
            gambar();
          }

          async function menang() {
            selesai = true; sibuk = true;
            gambar(true);
            await ctx.correct(null, { say: 'Mobil bintang keluar! Hebat!', min: 1100 });
            if (!ctx.alive) return;
            ctx.progress(pi + 1, total);
            resolve();
          }

          gambar();
        });
      }

      return main();
    },
  });
})();
