/* 22 Labirin ke Masjid. Labirin acak (recursive backtracker, pasti ada jalan). Bola (tanpa wajah) dari pojok kiri atas
   ke masjid di pojok kanan bawah, ambil air wudhu 💧 dulu. Gerak: tombol panah, geser jari di labirin, atau papan ketik.
   Tombol Bantu: langkah sepanjang jalur terpendek (BFS), ketukan ke-3 jalan otomatis sampai masjid. */
(function () {
  const { h, svg, rand, pick, shuffle } = TI;

  const ADAB = [
    'Sebelum ke masjid, kita berwudhu dan memakai pakaian yang bersih.',
    'Masuk masjid dengan kaki kanan dan berdoa.',
    'Di masjid kita tidak berlari dan tidak berteriak.',
  ];

  const U = 10; // satu sel = 10 satuan SVG
  const ARAH = {
    u: { dx: 0, dy: -1, lawan: 'd', nama: 'atas' },
    d: { dx: 0, dy: 1, lawan: 'u', nama: 'bawah' },
    l: { dx: -1, dy: 0, lawan: 'r', nama: 'kiri' },
    r: { dx: 1, dy: 0, lawan: 'l', nama: 'kanan' },
  };
  const P = '.play[data-game="labirin"]';

  const CSS = `
${P} .lb-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; flex: none; }
${P} .lb-chip {
  display: inline-flex; align-items: center; gap: 6px; min-height: 46px; padding: 4px 14px; border-radius: 999px;
  background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; white-space: nowrap;
}
${P} .lb-chip .lb-ci { font-size: 1.5rem; line-height: 1; }
${P} .lb-chip.is-ok { background: var(--good-bg); color: #0b6b4a; }
${P} .lb-chip.is-pop { animation: lb-pop var(--dur-ui-max) var(--ease-pop); }
${P} .lb-main { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px 28px; width: 100%; }
${P} .lb-board {
  position: relative; flex: none; width: min(100%, 380px); aspect-ratio: 1; border-radius: 22px; overflow: hidden;
  background: #fff7e0; box-shadow: 0 5px 0 var(--shadow); touch-action: none; user-select: none; -webkit-user-select: none;
}
${P} .lb-board svg { display: block; width: 100%; height: 100%; }
${P} .lb-ball-pos { transition: transform 120ms var(--ease-in-out); }
${P} .lb-ball-in.is-bump { animation: lb-bump 160ms var(--ease-in-out); }
${P} .lb-ball-in.is-hop { animation: lb-hop 200ms var(--ease-out); }
${P} .lb-water, ${P} .lb-star { transform-box: fill-box; transform-origin: center; }
${P} .lb-water-g.is-nudge .lb-water { animation: lb-nudge 620ms var(--ease-in-out) 3; } /* motion-ok: petunjuk berkedip 3 kali, jarang muncul */
${P} .lb-water-g.is-got { opacity: 0; transition: opacity var(--dur-ui) var(--ease-out); }
${P} .lb-star-g.is-got { opacity: 0; transition: opacity var(--dur-ui) var(--ease-out); }
${P} .lb-ring { transform-box: fill-box; transform-origin: center; animation: lb-ring 1.6s var(--ease-in-out) infinite; }
${P} .lb-water-g.is-got .lb-ring { animation: none; }
${P} .lb-lock { transition: opacity var(--dur-ui) var(--ease-out); }
${P} .lb-mosque { opacity: 0.62; transition: opacity var(--dur-ui) var(--ease-out); }
${P} .lb-mosque.is-open { opacity: 1; }
${P} .lb-mosque.is-open .lb-lock { opacity: 0; }
${P} .lb-glow { opacity: 0; transform-box: fill-box; transform-origin: center; }
${P} .lb-mosque.is-open .lb-glow { opacity: 1; animation: lb-glow 1.4s var(--ease-in-out) infinite; }
${P} .lb-mosque.is-open .lb-door { fill: #ffd23f; }
${P} .lb-mosque.is-shake { animation: lb-wobble 300ms var(--ease-in-out); transform-box: fill-box; transform-origin: center; }
${P} .lb-spark { transform-box: fill-box; transform-origin: center; animation: lb-spark 300ms var(--ease-out) both; }
${P} .lb-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 18px; }
${P} .lb-dpad { display: grid; grid-template-columns: repeat(3, 66px); grid-template-rows: repeat(2, 66px); gap: 6px; }
${P} .lb-key { width: 66px; height: 66px; min-height: 0; padding: 0; border-radius: 18px; font-size: 1.8rem; touch-action: manipulation; }
${P} .lb-key.is-hint { animation: lb-nudge 620ms var(--ease-in-out) 2; } /* motion-ok: petunjuk arah, hanya setelah Bantu */
${P} .lb-u { grid-area: 1 / 2; }
${P} .lb-l { grid-area: 2 / 1; }
${P} .lb-r { grid-area: 2 / 3; }
${P} .lb-d { grid-area: 2 / 2; }
${P} .lb-side { display: flex; flex-direction: column; align-items: center; gap: 8px; }
${P} .lb-done { display: flex; flex-direction: column; align-items: center; gap: 12px; }
${P} .lb-done-ic { line-height: 0; animation: lb-pop 300ms var(--ease-pop) both; }
@keyframes lb-bump { 40% { transform: translateX(var(--bx, 0)) translateY(var(--by, 0)); } }
@keyframes lb-hop { 40% { transform: translateY(-1.4px); } }
@keyframes lb-nudge { 50% { transform: scale(1.25); } }
@keyframes lb-ring { 0%, 100% { opacity: 0.25; transform: scale(0.9); } 50% { opacity: 0.7; transform: scale(1.1); } }
@keyframes lb-glow { 0%, 100% { opacity: 0.35; transform: scale(0.95); } 50% { opacity: 0.9; transform: scale(1.05); } }
@keyframes lb-wobble { 25% { transform: translateX(-0.5px); } 50% { transform: translateX(0.5px); } 75% { transform: translateX(-0.3px); } }
@keyframes lb-pop { from { opacity: 0; transform: scale(0.95); } 60% { transform: scale(1.08); } }
@keyframes lb-spark { from { opacity: 1; } to { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.5); } }
@media (max-width: 560px) {
  ${P} .lb-controls { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  ${P} .lb-ring, ${P} .lb-mosque.is-open .lb-glow { animation: none; }
  ${P} .lb-ball-in.is-bump, ${P} .lb-ball-in.is-hop { animation: none; }
  ${P} .lb-spark { display: none; }
}`;

  // ---------- labirin ----------
  function buatLabirin(n, tambahan) {
    const sel = Array.from({ length: n * n }, () => ({ u: true, d: true, l: true, r: true })); // true = ada dinding
    const lihat = new Array(n * n).fill(false);
    const tumpuk = [0];
    lihat[0] = true;
    while (tumpuk.length) {
      const cur = tumpuk[tumpuk.length - 1];
      const x = cur % n, y = Math.floor(cur / n);
      const tetangga = [];
      for (const [a, d] of Object.entries(ARAH)) {
        const nx = x + d.dx, ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const idx = ny * n + nx;
        if (!lihat[idx]) tetangga.push([idx, a]);
      }
      if (!tetangga.length) { tumpuk.pop(); continue; }
      const [idx, a] = pick(tetangga);
      sel[cur][a] = false; sel[idx][ARAH[a].lawan] = false;
      lihat[idx] = true; tumpuk.push(idx);
    }
    // TK: bobol beberapa dinding supaya ada jalan pintas (tetap labirin)
    for (let k = 0; k < tambahan; k++) {
      const x = rand(0, n - 2), y = rand(0, n - 2);
      const a = Math.random() < 0.5 ? 'r' : 'd';
      const idx = y * n + x, tj = idx + (a === 'r' ? 1 : n);
      sel[idx][a] = false; sel[tj][ARAH[a].lawan] = false;
    }
    return sel;
  }
  function bfs(sel, n, dari, ke) {
    const induk = new Array(n * n).fill(-1);
    const antre = [dari];
    induk[dari] = dari;
    for (let i = 0; i < antre.length; i++) {
      const cur = antre[i];
      if (cur === ke) break;
      const x = cur % n, y = Math.floor(cur / n);
      for (const [a, d] of Object.entries(ARAH)) {
        if (sel[cur][a]) continue;
        const idx = (y + d.dy) * n + (x + d.dx);
        if (induk[idx] === -1) { induk[idx] = cur; antre.push(idx); }
      }
    }
    const jalur = [];
    for (let c = ke; c !== dari; c = induk[c]) jalur.unshift(c);
    jalur.unshift(dari);
    return jalur;
  }
  function jarakDari(sel, n, dari) {
    const jarak = new Array(n * n).fill(-1);
    jarak[dari] = 0;
    const antre = [dari];
    for (let i = 0; i < antre.length; i++) {
      const cur = antre[i];
      const x = cur % n, y = Math.floor(cur / n);
      for (const [a, d] of Object.entries(ARAH)) {
        if (sel[cur][a]) continue;
        const idx = (y + d.dy) * n + (x + d.dx);
        if (jarak[idx] === -1) { jarak[idx] = jarak[cur] + 1; antre.push(idx); }
      }
    }
    return jarak;
  }

  // ---------- gambar ----------
  function gambarMasjid(uid) {
    const s = svg;
    const g = s('g', { class: 'lb-mosque' });
    g.append(
      s('circle', { class: 'lb-glow', cx: 5, cy: 5, r: 4.9, fill: '#ffe27a', opacity: 0 }),
      // menara kiri dan kanan
      s('rect', { x: 0.7, y: 2.8, width: 1.1, height: 6.4, rx: 0.3, fill: '#f4f1ea', stroke: '#9aa5ad', 'stroke-width': 0.18 }),
      s('path', { d: 'M0.55 2.9 L1.25 1.3 L1.95 2.9 Z', fill: '#2f9e6f' }),
      s('rect', { x: 8.2, y: 2.8, width: 1.1, height: 6.4, rx: 0.3, fill: '#f4f1ea', stroke: '#9aa5ad', 'stroke-width': 0.18 }),
      s('path', { d: 'M8.05 2.9 L8.75 1.3 L9.45 2.9 Z', fill: '#2f9e6f' }),
      // bangunan dan kubah
      s('rect', { x: 2.1, y: 5.4, width: 5.8, height: 3.8, rx: 0.3, fill: '#fffdf6', stroke: '#9aa5ad', 'stroke-width': 0.2 }),
      s('path', { d: 'M2.9 5.45 Q2.9 1.9 5 1.9 Q7.1 1.9 7.1 5.45 Z', fill: '#2f9e6f', stroke: '#1d7a52', 'stroke-width': 0.2 }),
      s('path', { d: 'M3.7 3.7 Q4.2 2.7 5 2.6', fill: 'none', stroke: 'rgba(255,255,255,0.65)', 'stroke-width': 0.35, 'stroke-linecap': 'round' }),
      s('line', { x1: 5, y1: 1.9, x2: 5, y2: 0.9, stroke: '#e0a800', 'stroke-width': 0.28, 'stroke-linecap': 'round' }),
      s('circle', { cx: 5, cy: 0.85, r: 0.42, fill: '#ffc93c' }),
      // pintu
      s('path', { class: 'lb-door', d: 'M4.1 9.2 L4.1 7.4 Q5 6.2 5.9 7.4 L5.9 9.2 Z', fill: '#8a5522' }),
      s('rect', { x: 2.7, y: 6.2, width: 0.9, height: 1.2, rx: 0.4, fill: '#bcdff5' }),
      s('rect', { x: 6.4, y: 6.2, width: 0.9, height: 1.2, rx: 0.4, fill: '#bcdff5' }),
      s('text', { class: 'lb-lock', x: 7.9, y: 4.6, 'font-size': 3.1, 'text-anchor': 'middle', text: '🔒' }));
    return g;
  }

  function gambarPapan(n, sel, awal, masjid, air, bintang, uid) {
    const S = n * U;
    const el = svg('svg', { viewBox: '-1 -1 ' + (S + 2) + ' ' + (S + 2), role: 'img', 'aria-label': 'Labirin ' + n + ' kali ' + n + '. Bantu bola ke masjid.' });
    el.append(svg('defs', null,
      svg('radialGradient', { id: uid + 'b', cx: '38%', cy: '32%', r: '75%' },
        svg('stop', { offset: '0%', 'stop-color': '#fffbe0' }),
        svg('stop', { offset: '55%', 'stop-color': '#ffc93c' }),
        svg('stop', { offset: '100%', 'stop-color': '#f08c00' }))));
    // lantai
    const lantai = svg('g');
    for (let i = 0; i < n * n; i++) {
      const x = i % n, y = Math.floor(i / n);
      lantai.append(svg('rect', { x: x * U, y: y * U, width: U, height: U, fill: (x + y) % 2 ? '#ffeec2' : '#fff8e1' }));
    }
    lantai.append(svg('rect', { x: (awal % n) * U, y: Math.floor(awal / n) * U, width: U, height: U, fill: '#d6f5df' }));
    el.append(lantai);
    // dinding: tiap garis digambar sekali
    let d = '';
    for (let i = 0; i < n * n; i++) {
      const x = i % n, y = Math.floor(i / n), c = sel[i];
      const x0 = x * U, y0 = y * U;
      if (c.r) d += 'M' + (x0 + U) + ' ' + y0 + 'L' + (x0 + U) + ' ' + (y0 + U);
      if (c.d) d += 'M' + x0 + ' ' + (y0 + U) + 'L' + (x0 + U) + ' ' + (y0 + U);
      if (y === 0 && c.u) d += 'M' + x0 + ' ' + y0 + 'L' + (x0 + U) + ' ' + y0;
      if (x === 0 && c.l) d += 'M' + x0 + ' ' + y0 + 'L' + x0 + ' ' + (y0 + U);
    }
    el.append(
      svg('path', { d, transform: 'translate(0.3 0.4)', fill: 'none', stroke: 'rgba(0,0,0,0.14)', 'stroke-width': 1.3, 'stroke-linecap': 'round' }),
      svg('path', { d, fill: 'none', stroke: '#2b8a6e', 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
    // masjid
    const gm = svg('g', { transform: 'translate(' + (masjid % n) * U + ' ' + Math.floor(masjid / n) * U + ')' });
    const mosque = gambarMasjid(uid);
    gm.append(mosque);
    el.append(gm);
    // air wudhu
    const ax = (air % n) * U, ay = Math.floor(air / n) * U;
    const waterG = svg('g', { class: 'lb-water-g' },
      svg('circle', { class: 'lb-ring', cx: ax + 5, cy: ay + 5, r: 3.9, fill: '#8ed4ff' }),
      svg('text', { class: 'lb-water', x: ax + 5, y: ay + 7.3, 'font-size': 6.6, 'text-anchor': 'middle', text: '💧' }));
    el.append(waterG);
    // bintang bonus
    const bintangG = bintang.map((idx) => {
      const g = svg('g', { class: 'lb-star-g' },
        svg('text', { class: 'lb-star', x: (idx % n) * U + 5, y: Math.floor(idx / n) * U + 7, 'font-size': 5.6, 'text-anchor': 'middle', text: '⭐' }));
      el.append(g);
      return g;
    });
    // bola pemain: lingkaran bercahaya, tanpa wajah
    const bump = svg('g', { class: 'lb-ball-in' },
      svg('circle', { cx: 5, cy: 5, r: 4, fill: '#ffd966', opacity: 0.35 }),
      svg('circle', { cx: 5, cy: 5, r: 2.9, fill: 'url(#' + uid + 'b)', stroke: '#e67700', 'stroke-width': 0.35 }),
      svg('ellipse', { cx: 4.1, cy: 3.9, rx: 0.95, ry: 0.6, fill: 'rgba(255,255,255,0.85)', transform: 'rotate(-30 4.1 3.9)' }));
    const ball = svg('g', { class: 'lb-ball-pos' }, bump);
    el.append(ball);
    return { el, ball, bump, mosque, waterG, bintangG };
  }

  TI.register({
    id: 'labirin',
    title: 'Labirin ke Masjid',
    cat: 'islam',
    icon: '🗺️',
    desc: 'Bantu bola mencari jalan ke masjid. Jangan lupa ambil air wudhu!',
    start(ctx) {
      TI.style('labirin', CSS);
      const reduced = TI.reduced();
      const ukuran = ctx.isTK ? [5, 5, 5] : [6, 7, 8];

      ctx.progress(0, ukuran.length);
      ctx.series(ukuran, async (n, no) => {
        const uid = 'lb' + no + Math.random().toString(36).slice(2, 6);
        const sel = buatLabirin(n, ctx.isTK ? 2 : 0);
        const awal = 0, masjid = n * n - 1;
        // air wudhu: sel yang jauh dari awal
        const jarak = jarakDari(sel, n, awal);
        const maks = Math.max(...jarak);
        const calonAir = jarak.map((j, i) => [j, i]).filter(([j, i]) => i !== masjid && i !== awal && j >= Math.max(3, Math.floor(maks * 0.5))).map(([, i]) => i);
        const air = calonAir.length ? pick(calonAir) : Math.floor(n * n / 2);
        const banyakBintang = ctx.isSD ? rand(2, 3) : 0;
        const bebas = shuffle([...Array(n * n).keys()].filter((i) => i !== awal && i !== masjid && i !== air));
        const bintangSel = bebas.slice(0, banyakBintang);

        const papan = gambarPapan(n, sel, awal, masjid, air, bintangSel, uid);
        const boardEl = h('div', { class: 'lb-board' }, papan.el);

        // panel status
        const chipAir = h('span', { class: 'lb-chip' }, h('span', { class: 'lb-ci', 'aria-hidden': 'true' }, '💧'), h('span', null, 'Wudhu: belum'));
        const chipBintang = ctx.isSD ? h('span', { class: 'lb-chip' }, h('span', { class: 'lb-ci', 'aria-hidden': 'true' }, '⭐'), h('span', null, 'Bonus: 0 / ' + banyakBintang)) : null;
        const chips = h('div', { class: 'lb-chips' }, chipAir, chipBintang);

        // kontrol
        const tombol = {};
        for (const [a, ikon, kls, nama] of [['u', '⬆️', 'lb-u', 'Naik'], ['l', '⬅️', 'lb-l', 'Ke kiri'], ['r', '➡️', 'lb-r', 'Ke kanan'], ['d', '⬇️', 'lb-d', 'Turun']]) {
          tombol[a] = h('button', { type: 'button', class: 'ti-btn lb-key ' + kls, 'aria-label': nama }, ikon);
        }
        const dpad = h('div', { class: 'lb-dpad' }, tombol.u, tombol.l, tombol.r, tombol.d);
        const btnBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        const side = h('div', { class: 'lb-side' }, btnBantu);
        const controls = h('div', { class: 'lb-controls' }, dpad, side);
        const main = h('div', { class: 'lb-main' }, boardEl, controls);
        ctx.el.append(chips, main);

        ctx.ask(ctx.isTK ? 'Ambil air wudhu dulu, lalu ke masjid!' : 'Ambil air wudhu dan bintang, lalu ke masjid!',
          { say: ctx.isTK ? 'Ambil air wudhu dulu, lalu antar bola ke masjid!' : 'Ambil air wudhu dan bintang, lalu antar bola ke masjid!' });

        // ---------- keadaan ----------
        let pos = awal, adaAir = false, bonus = 0, bantu = 0, selesai = false, otomatis = false, terakhir = 0;
        const ambilBintang = new Set();
        const letakkan = () => {
          papan.ball.style.transform = 'translate(' + (pos % n) * U + 'px,' + Math.floor(pos / n) * U + 'px)';
        };
        letakkan();

        function percikan(sel0, warna) {
          if (reduced) return;
          const cx = (sel0 % n) * U + 5, cy = Math.floor(sel0 / n) * U + 5;
          for (let k = 0; k < 7; k++) {
            const sdt = (k / 7) * Math.PI * 2 + Math.random() * 0.5, jr = 3 + Math.random() * 2;
            const sp = svg('circle', { class: 'lb-spark', cx, cy, r: 0.55, fill: warna });
            sp.style.setProperty('--dx', (Math.cos(sdt) * jr).toFixed(2) + 'px');
            sp.style.setProperty('--dy', (Math.sin(sdt) * jr).toFixed(2) + 'px');
            papan.el.append(sp);
            ctx.after(360, () => sp.remove());
          }
        }
        function ulang(elm, kelas, ms) {
          elm.classList.remove(kelas); void elm.getBoundingClientRect(); elm.classList.add(kelas);
          ctx.after(ms, () => elm.classList.remove(kelas));
        }
        function tabrak(a) {
          if (reduced) return;
          const d = ARAH[a];
          papan.bump.style.setProperty('--bx', (d.dx * 1.1) + 'px');
          papan.bump.style.setProperty('--by', (d.dy * 1.1) + 'px');
          ulang(papan.bump, 'is-bump', 180);
        }

        function langkah(a, paksa) {
          if (selesai) return false;
          if (otomatis && !paksa) return false;
          const now = performance.now();
          if (!paksa && now - terakhir < 80) return false;
          terakhir = now;
          if (sel[pos][a]) { tabrak(a); ctx.sfx('klik'); return false; }
          const d = ARAH[a];
          pos = pos + d.dy * n + d.dx;
          letakkan();
          ctx.sfx('tap');
          if (!reduced) ulang(papan.bump, 'is-hop', 220);

          if (pos === air && !adaAir) {
            adaAir = true;
            ctx.sfx('splash');
            percikan(pos, '#4dabf7');
            papan.waterG.classList.add('is-got');
            chipAir.classList.add('is-ok', 'is-pop');
            chipAir.lastChild.textContent = 'Wudhu: sudah';
            papan.mosque.classList.add('is-open');
            if (!otomatis) ctx.say('Air wudhu sudah didapat. Sekarang ke masjid!');
          }
          const bi = bintangSel.indexOf(pos);
          if (bi >= 0 && !ambilBintang.has(pos)) {
            ambilBintang.add(pos); bonus++;
            ctx.sfx('benar');
            percikan(pos, '#ffc93c');
            papan.bintangG[bi].classList.add('is-got');
            chipBintang.lastChild.textContent = 'Bonus: ' + bonus + ' / ' + banyakBintang;
            ulang(chipBintang, 'is-pop', 320);
          }
          if (pos === masjid) {
            if (adaAir) sampai();
            else if (!otomatis) {
              ctx.sfx('salah');
              ulang(papan.mosque, 'is-shake', 320);
              papan.waterG.classList.add('is-nudge');
              ctx.after(2000, () => papan.waterG.classList.remove('is-nudge'));
              ctx.say('Wudhu dulu ya!');
            }
          }
          return true;
        }

        // ---------- kontrol ----------
        let tahan = null, tunda = 0;
        const hentikan = () => { if (tunda) { clearTimeout(tunda); tunda = 0; } if (tahan) { tahan(); tahan = null; } };
        for (const a of ['u', 'd', 'l', 'r']) {
          const b = tombol[a];
          b.addEventListener('pointerdown', () => {
            hentikan();
            langkah(a);
            tunda = ctx.after(320, () => { tahan = ctx.every(130, () => langkah(a)); });
          });
          for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, hentikan);
          b.addEventListener('click', (e) => { if (e.detail === 0) langkah(a); }); // papan ketik dan pembaca layar
        }
        ctx.onExit(hentikan);
        ctx.on(document, 'keydown', (e) => {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          const peta = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r' };
          const a = peta[e.key];
          if (!a) return;
          e.preventDefault();
          langkah(a);
        });
        // geser jari: tiap geseran satu sel lebih, satu langkah
        let jari = null;
        boardEl.addEventListener('pointerdown', (e) => {
          jari = { x: e.clientX, y: e.clientY };
          try { boardEl.setPointerCapture(e.pointerId); } catch (_) { /* tidak didukung */ }
        });
        boardEl.addEventListener('pointermove', (e) => {
          if (!jari) return;
          const sel0 = boardEl.clientWidth / n;
          const dx = e.clientX - jari.x, dy = e.clientY - jari.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < Math.max(22, sel0 * 0.45)) return;
          const a = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
          jari = { x: e.clientX, y: e.clientY };
          langkah(a);
        });
        const lepasJari = () => { jari = null; };
        boardEl.addEventListener('pointerup', lepasJari);
        boardEl.addEventListener('pointercancel', lepasJari);

        // ---------- Bantu ----------
        function arahKe(dari, ke) {
          const sel1 = ke - dari;
          if (sel1 === 1) return 'r';
          if (sel1 === -1) return 'l';
          return sel1 > 0 ? 'd' : 'u';
        }
        function langkahBerikut() {
          const tujuan = adaAir ? masjid : air;
          const jalur = bfs(sel, n, pos, tujuan);
          return jalur.length > 1 ? arahKe(jalur[0], jalur[1]) : null;
        }
        async function jalanOtomatis() {
          otomatis = true;
          ctx.say('Ikuti aku ya, kita jalan bersama ke masjid.');
          for (let g = 0; g < n * n * 4 && !selesai && ctx.alive; g++) {
            const a = langkahBerikut();
            if (!a) break;
            langkah(a, true);
            await ctx.wait(160);
          }
        }
        btnBantu.addEventListener('click', () => {
          if (selesai || otomatis) return;
          bantu++;
          ctx.mistakes++;
          ctx.sfx('tap');
          if (bantu >= 3) { jalanOtomatis(); return; }
          const a = langkahBerikut();
          if (!a) return;
          const b = tombol[a];
          b.classList.remove('is-hint'); void b.offsetWidth; b.classList.add('is-hint');
          ctx.after(1300, () => b.classList.remove('is-hint'));
          ctx.say((adaAir ? 'Ke masjid, ' : 'Ambil air wudhu, ') + 'ke arah ' + ARAH[a].nama + '.');
          langkah(a, true);
        });

        // ---------- sampai di masjid ----------
        let kirim;
        const tunggu = new Promise((res) => { kirim = res; });
        function sampai() {
          selesai = true;
          hentikan();
          ctx.sfx('menang');
          papan.mosque.classList.add('is-open');
          percikan(masjid, '#ffd23f');
          const bonusTeks = bonus ? ' Kamu dapat ' + bonus + ' bintang bonus!' : '';
          ctx.say('Alhamdulillah, sampai di masjid!' + bonusTeks);
          ctx.after(1500, kirim);
        }
        await tunggu;

        // ---------- adab ke masjid ----------
        ctx.clear();
        ctx.progress(no + 1, ukuran.length);
        ctx.ask('Alhamdulillah, sampai di masjid!', { speak: false });
        const masjidBesar = gambarMasjid(uid);
        masjidBesar.classList.add('is-open');
        ctx.el.append(h('div', { class: 'lb-done' },
          h('div', { class: 'lb-done-ic', 'aria-hidden': 'true' }, svg('svg', { viewBox: '0 0 10 10', width: 150, height: 150 }, masjidBesar)),
          bonus ? h('p', { class: 'ti-label' }, '⭐ x' + bonus + ' bintang bonus') : null));
        ctx.note(ADAB[no], { title: 'Adab ke masjid:' });
        await ctx.next(no === ukuran.length - 1 ? 'Selesai' : 'Lanjut');
      }, {
        get stars() { return ctx.mistakes === 0 ? 3 : ctx.mistakes <= 4 ? 2 : 1; },
        lesson: 'Masjid adalah rumah Allah. Kita datang dalam keadaan bersih dan sopan.',
      });
    },
  });
})();
