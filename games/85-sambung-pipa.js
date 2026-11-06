/* 85 Sambung Pipa. Grid SVG: ketuk potongan untuk memutar sampai air mengalir
   dari keran ke ember. TK: 3x3, 2 puzzle. SD: 4x4, 3 puzzle.
   Tombol Bantu + solusi otomatis setelah 12 ketuk yang belum menyambung. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="sambung-pipa"] .pp-top { display: flex; gap: 10px; align-items: center; justify-content: center; width: 100%; }
.play[data-game="sambung-pipa"] .pp-grid { display: grid; gap: 6px; width: min(100%, 360px); }
.play[data-game="sambung-pipa"] .pp-cell { position: relative; aspect-ratio: 1; min-height: 64px; padding: 0; border: 3px solid var(--line, #e3d9c2); border-radius: 14px; background: #fff; cursor: pointer; touch-action: manipulation; }
.play[data-game="sambung-pipa"] .pp-cell svg { display: block; width: 100%; height: 100%; }
.play[data-game="sambung-pipa"] .pp-rot { transform: rotate(var(--rot, 0deg)); transform-box: view-box; transform-origin: 32px 32px; transition: transform 180ms var(--ease-out); }
.play[data-game="sambung-pipa"] .pp-pipe { stroke: #9aa3b5; transition: stroke 180ms var(--ease-out); }
.play[data-game="sambung-pipa"] .pp-cell.is-wet .pp-pipe { stroke: #2f8fe0; }
.play[data-game="sambung-pipa"] .pp-cell.is-wet { border-color: #2f8fe0; }
.play[data-game="sambung-pipa"] .pp-badge { position: absolute; right: 2px; top: 2px; font-size: 1.2rem; line-height: 1; pointer-events: none; }
.play[data-game="sambung-pipa"] .pp-msg { margin: 0; min-height: 1.6em; font-weight: 800; color: var(--muted); text-align: center; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="sambung-pipa"] .pp-rot, .play[data-game="sambung-pipa"] .pp-pipe { transition: none; }
}
`;

  const DIRS = { n: [-1, 0], e: [0, 1], s: [1, 0], w: [0, -1] };
  const OPP = { n: 's', s: 'n', e: 'w', w: 'e' };
  function putar(mask, k) {
    const order = ['n', 'e', 's', 'w'];
    const out = {};
    for (const d of order) if (mask[d]) {
      out[order[(order.indexOf(d) + k) % 4]] = true;
    }
    return out;
  }
  const sama = (a, b) => ['n', 'e', 's', 'w'].every((d) => !!a[d] === !!b[d]);

  // Jalur ular menutupi semua sel, dari kiri atas sampai sel terakhir.
  function jalurUlar(n) {
    const path = [];
    for (let r = 0; r < n; r++) {
      if (r % 2 === 0) for (let c = 0; c < n; c++) path.push([r, c]);
      else for (let c = n - 1; c >= 0; c--) path.push([r, c]);
    }
    return path;
  }

  function selPipa(mask) {
    const ks = Object.keys(mask);
    if (ks.length === 1) return '<line class="pp-pipe" x1="32" y1="32" x2="64" y2="32" stroke-width="16" stroke-linecap="round"/><circle class="pp-pipe" cx="32" cy="32" r="10" fill="none" stroke-width="8"/>';
    if (mask.e && mask.w) return '<line class="pp-pipe" x1="0" y1="32" x2="64" y2="32" stroke-width="16"/><circle class="pp-pipe" cx="32" cy="32" r="10" fill="none" stroke-width="8"/>';
    if (mask.n && mask.s) return '<line class="pp-pipe" x1="32" y1="0" x2="32" y2="64" stroke-width="16"/>';
    // siku kanonik: utara-timur
    return '<path class="pp-pipe" d="M32 0 V32 H64" fill="none" stroke-width="16"/><circle class="pp-pipe" cx="32" cy="32" r="10" fill="none" stroke-width="8"/>';
  }

  TI.register({
    id: 'sambung-pipa',
    title: 'Sambung Pipa',
    cat: 'sains',
    icon: '🚰',
    desc: 'Putar pipa agar air sampai ember.',
    start(ctx) {
      TI.style('sambung-pipa', CSS);
      const n = ctx.isTK ? 3 : 4;
      const ronde = ctx.isTK ? 2 : 3;
      return (async () => {
        let bintang = 3, pakaiBantu = false;
        for (let p = 0; p < ronde && ctx.alive; p++) {
          ctx.progress(p, ronde);
          const hasil = await puzzle(p); if (p < ronde - 1 && ctx.alive) ctx.correct(null, { say: 'Bagus! Terus naik ke pipa ' + (p + 2) + '!' });
          if (hasil === 'auto') bintang = 1;
          else if (hasil === 'bantu' && bintang > 2) { bintang = 2; pakaiBantu = true; }
          void pakaiBantu;
        }
        if (!ctx.alive) return;
        ctx.progress(ronde, ronde);
        ctx.finish({ stars: bintang, lesson: 'Air mengalir dari keran ke ember lewat pipa yang tersambung rapat.' });
      })();

      async function puzzle(p) {
        return new Promise((selesai) => {
          ctx.clear();
          ctx.ask(p === 0 ? 'Ketuk pipa untuk memutar. Sambungkan keran ke ember.' : 'Pipa berikutnya, sambungkan lagi.');
          const top = h('div', { class: 'pp-top' });
          const msg = h('p', { class: 'pp-msg', 'aria-live': 'polite' }, 'Air belum mengalir.');
          const bantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          top.append(bantu);
          const grid = h('div', { class: 'pp-grid pop-in', style: 'grid-template-columns: repeat(' + n + ', 1fr);' });
          ctx.el.append(top, grid, msg);

          // Susun sel dari jalur ular.
          const path = jalurUlar(n);
          const butuh = {};
          path.forEach(([r, c], i) => {
            const m = {};
            if (i > 0) {
              const [pr, pc] = path[i - 1];
              m[r === pr ? (c > pc ? 'w' : 'e') : (r > pr ? 'n' : 's')] = true;
            }
            if (i < path.length - 1) {
              const [nr, nc] = path[i + 1];
              m[r === nr ? (c > nc ? 'w' : 'e') : (r > nr ? 'n' : 's')] = true;
            }
            butuh[r + ',' + c] = m;
          });
          const sel = [];
          const awal = (p * 7 + n) % 4;
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
            const need = butuh[r + ',' + c];
            const ks = Object.keys(need);
            let base;
            if (ks.length === 1) base = { e: true };
            else if (need.e && need.w) base = { e: true, w: true };
            else if (need.n && need.s) base = { n: true, s: true };
            else base = { n: true, e: true };
            let benar = 0;
            for (let k = 0; k < 4; k++) if (sama(putar(base, k), need)) { benar = k; break; }
            const rot = (benar + 1 + ((r * 3 + c + awal) % 3)) % 4;
            sel.push({ r, c, base, benar, rot, el: null });
          }

          const NS = 'http://www.w3.org/2000/svg';
          sel.forEach((s, i) => {
            const btn = h('button', { type: 'button', class: 'pp-cell', 'aria-label': 'Pipa baris ' + (s.r + 1) + ' kolom ' + (s.c + 1) });
            const svgEl = document.createElementNS(NS, 'svg');
            svgEl.setAttribute('viewBox', '0 0 64 64');
            svgEl.setAttribute('aria-hidden', 'true');
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('class', 'pp-rot');
            g.innerHTML = selPipa(s.base);
            svgEl.append(g);
            btn.append(svgEl);
            if (i === 0) btn.append(h('span', { class: 'pp-badge', 'aria-hidden': 'true' }, '🚰'));
            if (i === sel.length - 1) btn.append(h('span', { class: 'pp-badge', 'aria-hidden': 'true' }, '🪣'));
            s.el = btn; s.g = g;
            grid.append(btn);
          });
          const gambar = () => sel.forEach((s) => s.g.style.setProperty('--rot', (s.rot * 90) + 'deg'));

          const maskSkr = (s) => putar(s.base, s.rot);
          function basah() {
            // BFS dari sel awal mengikuti sambungan yang cocok.
            const lihat = new Set(['0,0']);
            const antri = [[0, 0]];
            while (antri.length) {
              const [r, c] = antri.pop();
              const m = maskSkr(sel[r * n + c]);
              for (const d of Object.keys(m)) {
                const [dr, dc] = DIRS[d];
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
                if (!maskSkr(sel[nr * n + nc])[OPP[d]]) continue;
                const k = nr + ',' + nc;
                if (!lihat.has(k)) { lihat.add(k); antri.push([nr, nc]); }
              }
            }
            return lihat;
          }
          let ketuk = 0, sudahBantu = false, tutup = false;
          function cek() {
            const w = basah();
            sel.forEach((s) => s.el.classList.toggle('is-wet', w.has(s.r + ',' + s.c)));
            const akhir = sel[sel.length - 1];
            if (w.has(akhir.r + ',' + akhir.c)) {
              tutup = true;
              msg.textContent = 'Air mengalir! Hebat!';
              ctx.sfx('splash');
              ctx.correct(null, { say: 'Air mengalir sampai ember! Hebat!' }).then(() => selesai(sudahBantu ? 'bantu' : 'ok'));
              return true;
            }
            msg.textContent = 'Air belum sampai ember.';
            return false;
          }
          sel.forEach((s) => s.el.addEventListener('click', () => {
            if (tutup || !ctx.alive) return;
            s.rot = (s.rot + 1) % 4;
            gambar();
            ctx.sfx('klik');
            ketuk++;
            if (!cek() && ketuk >= 12) {
              // Tunjukkan solusi: putar semua ke posisi benar.
              tutup = true;
              sel.forEach((x) => { x.rot = x.benar; });
              gambar();
              const w = basah();
              sel.forEach((x) => x.el.classList.toggle('is-wet', w.has(x.r + ',' + x.c)));
              msg.textContent = 'Ini jawabannya, perhatikan alurnya.';
              ctx.sayWait('Ini jawabannya. Perhatikan, semua pipa tersambung dari keran ke ember.').then(() => selesai('auto'));
            }
          }));
          bantu.addEventListener('click', () => {
            if (tutup || !ctx.alive) return;
            ctx.sfx('tap');
            const salah = sel.find((s) => !sama(maskSkr(s), butuh[s.r + ',' + s.c]));
            if (salah) { salah.rot = salah.benar; gambar(); sudahBantu = true; cek(); }
            else cek();
          });
          gambar();
          cek();
        });
      }
    },
  });
})();
