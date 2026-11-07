/* 24 Puzzle Masjid. Jigsaw dengan ctx.place (ketuk kepingan lalu ketuk tempat, atau seret). Tiga gambar masjid digambar
   sendiri dalam SVG: Masjidil Haram, Masjid Nabawi, Masjid Istiqlal. TK 2x2, SD 3x3.
   Tombol Bantu: ketuk 1 dan 2 memasang satu keping benar, ketuk ke-3 memasang semua sisanya. */
(function () {
  const { h, svg, shuffle } = TI;
  const P = '.play[data-game="puzzle"]';

  const GAMBAR = [
    {
      id: 'haram', nama: 'Masjidil Haram',
      fakta: "Masjidil Haram ada di kota Makkah. Di tengahnya ada Ka'bah, kiblat umat Islam saat shalat.",
    },
    {
      id: 'nabawi', nama: 'Masjid Nabawi',
      fakta: "Masjid Nabawi ada di kota Madinah. Masjid ini dibangun oleh Nabi Muhammad Shallallahu 'alaihi wa sallam.",
    },
    {
      id: 'istiqlal', nama: 'Masjid Istiqlal',
      fakta: 'Masjid Istiqlal ada di Jakarta. Inilah masjid terbesar di Asia Tenggara.',
    },
  ];
  const LESSON = 'Tiga masjid terkenal: Masjidil Haram di Makkah, Masjid Nabawi di Madinah, dan Masjid Istiqlal di Jakarta.';

  const CSS = `
${P} { --pc: 64px; --bs: max(250px, min(100%, 352px, calc(100dvh - 500px))); }
${P} .pz-tray { gap: 8px; }
${P}.lvl-tk { --pc: 80px; --bs: max(250px, min(100%, 380px, calc(100dvh - 410px))); }
${P}.lvl-tk .pz-tray { gap: 10px; }
@media (min-width: 700px) {
  ${P} { --pc: 84px; --bs: min(100%, 420px, calc(100dvh - 430px)); }
  ${P} .pz-tray { gap: 10px; }
  ${P}.lvl-tk { --pc: 100px; --bs: min(100%, 400px, calc(100dvh - 440px)); }
}
${P} .pz-title { margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--c); flex: none; }
${P} .pz-board {
  position: relative; flex: none; width: var(--bs); aspect-ratio: 1; border-radius: 18px; overflow: hidden;
  background: #fff; box-shadow: 0 5px 0 var(--shadow); border: 3px solid #fff; outline: 3px solid var(--line);
}
${P} .pz-hint { position: absolute; inset: 0; pointer-events: none; }
${P} .pz-hint svg, ${P} .pz-fill svg, ${P} .pz-tray .ti-chip svg { display: block; width: 100%; height: 100%; }
${P} .pz-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(var(--n), 1fr); grid-template-rows: repeat(var(--n), 1fr); }
${P} .pz-slot { position: relative; background: transparent; cursor: pointer; }
${P} .pz-slot.is-filled { cursor: default; }
${P} .pz-slot.is-wrong { animation: pz-shake var(--dur-ui-max) var(--ease-in-out); box-shadow: inset 0 0 0 4px var(--bad); background: rgba(229, 72, 77, 0.12); }
${P} .pz-slot:focus-visible { z-index: 6; }
${P} .pz-fill { position: absolute; inset: -0.6px; z-index: 4; will-change: transform; }
${P} .pz-fill.is-fade { animation: pz-in var(--dur-ui) var(--ease-out) both; }
${P} .pz-seams { position: absolute; inset: 0; z-index: 5; pointer-events: none; transition: opacity var(--dur-ui-max) var(--ease-out); }
${P} .pz-seams.is-off { opacity: 0; }
${P} .pz-seams svg { display: block; width: 100%; height: 100%; }
${P} .pz-board.is-done { animation: pz-ta 300ms var(--ease-out); }
${P} .pz-tray { width: 100%; max-width: 860px; }
${P} .pz-tray .ti-chip {
  width: var(--pc); height: var(--pc); min-width: 0; min-height: 0; padding: 0; overflow: hidden; border-radius: 14px;
  border-width: 3px; font-size: 1rem;
}
${P} .pz-tray .ti-chip.is-selected { transform: translateY(-4px) scale(1.04); }
${P} .pz-tray .ti-chip:disabled { opacity: 1; }
${P}.lvl-tk .pz-tray .ti-chip { min-width: 0; min-height: 0; }
${P} .pz-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
${P} .pz-wrap.is-auto .pz-tray, ${P} .pz-wrap.is-auto .pz-board { pointer-events: none; }
${P} .pz-help[disabled] { opacity: 0.5; }
@keyframes pz-shake { 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
@keyframes pz-in { from { opacity: 0; transform: scale(0.95); } }
@keyframes pz-ta { 50% { transform: scale(1.025); } }
@media (prefers-reduced-motion: reduce) {
  ${P} .pz-board.is-done { animation: none; }
  ${P} .pz-slot.is-wrong { animation: none; }
}`;

  // ---------- gambar (viewBox 0 0 300 300) ----------
  function awan(s, x, y, k) {
    return s('g', { opacity: 0.88 },
      s('ellipse', { cx: x, cy: y, rx: 26 * k, ry: 8 * k, fill: '#fff' }),
      s('ellipse', { cx: x - 12 * k, cy: y - 5 * k, rx: 14 * k, ry: 8 * k, fill: '#fff' }),
      s('ellipse', { cx: x + 10 * k, cy: y - 7 * k, rx: 15 * k, ry: 9 * k, fill: '#fff' }));
  }
  function langitBawah(s, uid, atas, bawah) {
    return s('defs', null,
      s('linearGradient', { id: uid + 's', x1: 0, y1: 0, x2: 0, y2: 1 },
        s('stop', { offset: '0%', 'stop-color': atas }), s('stop', { offset: '100%', 'stop-color': bawah })),
      s('radialGradient', { id: uid + 'k', cx: '38%', cy: '30%', r: '80%' },
        s('stop', { offset: '0%', 'stop-color': '#5fd39a' }), s('stop', { offset: '100%', 'stop-color': '#1e8656' })),
      s('radialGradient', { id: uid + 'p', cx: '38%', cy: '30%', r: '80%' },
        s('stop', { offset: '0%', 'stop-color': '#ffffff' }), s('stop', { offset: '100%', 'stop-color': '#cdd8e2' })));
  }
  // menara: x tengah, top ujung atas badan, base dasar
  function menara(s, x, top, base, w, cap) {
    const hw = w / 2, t = top + 22;
    return s('g', null,
      s('rect', { x: x - hw, y: t, width: w, height: base - t, fill: '#f6f2e6', stroke: '#b9b29c', 'stroke-width': 1 }),
      s('rect', { x, y: t, width: hw, height: base - t, fill: 'rgba(0,0,0,0.07)' }),
      [0.22, 0.5].map((f) => s('rect', { x: x - hw - 3, y: t + (base - t) * f, width: w + 6, height: 5, rx: 1.5, fill: '#dcd4bc', stroke: '#b9b29c', 'stroke-width': 0.8 })),
      s('path', { d: 'M' + (x - hw - 1.5) + ' ' + (t + 1) + ' Q' + (x - hw - 1.5) + ' ' + (top + 8) + ' ' + x + ' ' + top + ' Q' + (x + hw + 1.5) + ' ' + (top + 8) + ' ' + (x + hw + 1.5) + ' ' + (t + 1) + ' Z', fill: cap, stroke: 'rgba(0,0,0,0.15)', 'stroke-width': 0.8 }),
      s('line', { x1: x, y1: top, x2: x, y2: top - 9, stroke: '#e0a800', 'stroke-width': 1.7, 'stroke-linecap': 'round' }),
      s('circle', { cx: x, cy: top - 10, r: 2.3, fill: '#ffc93c' }));
  }

  function artHaram(s, uid) {
    const g = s('g');
    g.append(langitBawah(s, uid, '#79c6f4', '#eaf7ff'),
      s('rect', { width: 300, height: 300, fill: 'url(#' + uid + 's)' }),
      awan(s, 62, 52, 1), awan(s, 236, 78, 0.8), awan(s, 150, 30, 0.6),
      menara(s, 38, 30, 206, 14, '#4f8f78'), menara(s, 262, 30, 206, 14, '#4f8f78'),
      menara(s, 92, 74, 206, 12, '#4f8f78'), menara(s, 208, 74, 206, 12, '#4f8f78'));
    // bangunan berlengkung di belakang
    g.append(
      s('rect', { x: 6, y: 168, width: 288, height: 66, fill: '#f8f3e5', stroke: '#cfc8b0', 'stroke-width': 1.5 }),
      s('rect', { x: 6, y: 161, width: 288, height: 9, fill: '#e7dfc8' }));
    for (let i = 0; i < 12; i++) {
      const x = 16 + i * 23;
      g.append(s('path', { d: 'M' + x + ' 234 L' + x + ' 200 Q' + (x + 8) + ' 186 ' + (x + 16) + ' 200 L' + (x + 16) + ' 234 Z', fill: '#c8bfa4' }));
    }
    g.append(
      s('rect', { x: 0, y: 232, width: 300, height: 68, fill: '#efe6cf' }),
      s('ellipse', { cx: 150, cy: 262, rx: 170, ry: 50, fill: '#fffdf6', stroke: '#e2d9bf', 'stroke-width': 2 }),
      s('ellipse', { cx: 150, cy: 264, rx: 128, ry: 36, fill: 'none', stroke: '#e8dfc6', 'stroke-width': 2 }),
      s('ellipse', { cx: 150, cy: 266, rx: 88, ry: 24, fill: 'none', stroke: '#e8dfc6', 'stroke-width': 2 }),
      // Ka'bah
      s('ellipse', { cx: 158, cy: 254, rx: 74, ry: 10, fill: 'rgba(60, 50, 20, 0.22)' }),
      s('polygon', { points: '112,148 190,148 214,134 136,134', fill: '#3d3d45' }),
      s('rect', { x: 112, y: 148, width: 78, height: 104, fill: '#1a1a1e' }),
      s('polygon', { points: '190,148 214,134 214,238 190,252', fill: '#0f0f12' }),
      s('rect', { x: 112, y: 166, width: 78, height: 13, fill: '#f2c94c' }),
      s('rect', { x: 112, y: 178, width: 78, height: 2.5, fill: '#c9962a' }),
      s('polygon', { points: '190,166 214,152 214,165 190,179', fill: '#d9a92b' }),
      s('rect', { x: 125, y: 188, width: 2, height: 60, fill: 'rgba(255,255,255,0.06)' }),
      s('rect', { x: 150, y: 188, width: 2, height: 60, fill: 'rgba(255,255,255,0.06)' }),
      s('path', { d: 'M158 252 L158 218 Q170 202 182 218 L182 252 Z', fill: '#e8bd45', stroke: '#b5851f', 'stroke-width': 2 }),
      s('path', { d: 'M163 252 L163 224 Q170 214 177 224 L177 252 Z', fill: '#f6d878' }));
    return g;
  }

  function payung(s, x, y, k) {
    // tiang dan kanopi putih besar
    return s('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + k + ')' },
      s('rect', { x: -2.2, y: -48, width: 4.4, height: 48, rx: 1.5, fill: '#b7b2a4' }),
      s('path', { d: 'M-28 -48 Q-28 -70 0 -74 Q28 -70 28 -48 Q14 -42 0 -48 Q-14 -42 -28 -48 Z', fill: '#fffaf0', stroke: '#cdbd93', 'stroke-width': 1.5 }),
      s('path', { d: 'M0 -74 L0 -48 M-14 -66 L-9 -46 M14 -66 L9 -46', stroke: '#e4d9b9', 'stroke-width': 1.2, fill: 'none' }));
  }
  function artNabawi(s, uid) {
    const g = s('g');
    g.append(langitBawah(s, uid, '#80c9f3', '#fff1d4'),
      s('rect', { width: 300, height: 300, fill: 'url(#' + uid + 's)' }),
      awan(s, 70, 50, 0.9), awan(s, 232, 40, 0.7),
      menara(s, 30, 28, 210, 14, '#2f9e6f'), menara(s, 270, 28, 210, 14, '#2f9e6f'),
      menara(s, 74, 82, 210, 12, '#2f9e6f'), menara(s, 226, 82, 210, 12, '#2f9e6f'));
    // bangunan utama
    g.append(
      s('rect', { x: 44, y: 150, width: 212, height: 86, fill: '#f2e7c9', stroke: '#cdbd93', 'stroke-width': 1.5 }),
      s('rect', { x: 44, y: 143, width: 212, height: 9, fill: '#e4d6ae' }));
    for (let i = 0; i < 8; i++) {
      const x = 56 + i * 24;
      g.append(s('path', { d: 'M' + x + ' 236 L' + x + ' 190 Q' + (x + 8) + ' 176 ' + (x + 16) + ' 190 L' + (x + 16) + ' 236 Z', fill: '#c9b98d' }));
    }
    // kubah kecil kiri dan kanan
    for (const x of [78, 222]) {
      g.append(s('rect', { x: x - 16, y: 134, width: 32, height: 12, fill: '#ece0bf', stroke: '#cdbd93', 'stroke-width': 1 }),
        s('path', { d: 'M' + (x - 16) + ' 136 Q' + (x - 16) + ' 112 ' + x + ' 112 Q' + (x + 16) + ' 112 ' + (x + 16) + ' 136 Z', fill: '#2f9e6f', stroke: '#1d7a52', 'stroke-width': 1 }),
        s('circle', { cx: x, cy: 109, r: 2.4, fill: '#ffc93c' }));
    }
    // kubah hijau besar
    g.append(
      s('rect', { x: 110, y: 116, width: 80, height: 36, fill: '#efe3c0', stroke: '#cdbd93', 'stroke-width': 1.5 }),
      s('path', { d: 'M102 120 Q102 56 150 56 Q198 56 198 120 Z', fill: 'url(#' + uid + 'k)', stroke: '#1b7a50', 'stroke-width': 2 }),
      s('path', { d: 'M118 96 Q122 72 146 64', fill: 'none', stroke: 'rgba(255,255,255,0.55)', 'stroke-width': 4, 'stroke-linecap': 'round' }),
      s('line', { x1: 150, y1: 56, x2: 150, y2: 38, stroke: '#e0a800', 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
      s('circle', { cx: 150, cy: 35, r: 4.2, fill: '#ffc93c', stroke: '#c9962a', 'stroke-width': 1 }));
    // halaman dan payung putih
    g.append(
      s('rect', { x: 0, y: 234, width: 300, height: 66, fill: '#f3e8cb' }),
      s('path', { d: 'M0 262 L300 262 M0 284 L300 284', stroke: '#e6d8b2', 'stroke-width': 1.5 }));
    g.append(payung(s, 40, 266, 0.8), payung(s, 112, 266, 0.8), payung(s, 188, 266, 0.8), payung(s, 260, 266, 0.8),
      payung(s, 76, 304, 1.05), payung(s, 150, 304, 1.05), payung(s, 224, 304, 1.05));
    return g;
  }

  function artIstiqlal(s, uid) {
    const g = s('g');
    g.append(langitBawah(s, uid, '#7fc8f4', '#eaf7ff'),
      s('rect', { width: 300, height: 300, fill: 'url(#' + uid + 's)' }),
      awan(s, 54, 56, 1), awan(s, 190, 36, 0.7));
    // menara tunggal tinggi dan ramping
    const mx = 262;
    g.append(
      s('rect', { x: mx - 9, y: 62, width: 18, height: 200, fill: '#fafcfd', stroke: '#c0c9d2', 'stroke-width': 1.2 }),
      s('rect', { x: mx, y: 62, width: 9, height: 200, fill: 'rgba(0,0,0,0.06)' }),
      [0, 1, 2, 3].map((i) => s('rect', { x: mx - 15, y: 72 + i * 42, width: 30, height: 7, rx: 2, fill: '#dfe6ec', stroke: '#b9c3cd', 'stroke-width': 0.9 })),
      s('path', { d: 'M' + (mx - 10) + ' 63 Q' + mx + ' 52 ' + (mx + 10) + ' 63 L' + mx + ' 24 Z', fill: '#cfd9e2', stroke: '#aab6c1', 'stroke-width': 1 }),
      s('line', { x1: mx, y1: 26, x2: mx, y2: 12, stroke: '#e0a800', 'stroke-width': 1.8, 'stroke-linecap': 'round' }),
      s('circle', { cx: mx, cy: 11, r: 2.6, fill: '#ffc93c' }));
    // bangunan putih bertingkat
    g.append(
      s('rect', { x: 78, y: 146, width: 134, height: 30, fill: '#f7f9fb', stroke: '#c0c9d2', 'stroke-width': 1.5 }),
      s('rect', { x: 52, y: 174, width: 186, height: 34, fill: '#f9fafc', stroke: '#c0c9d2', 'stroke-width': 1.5 }),
      s('rect', { x: 24, y: 206, width: 242, height: 58, fill: '#fcfdfe', stroke: '#c0c9d2', 'stroke-width': 1.5 }),
      s('rect', { x: 20, y: 203, width: 250, height: 6, fill: '#e3e9ee' }),
      s('rect', { x: 48, y: 171, width: 194, height: 5, fill: '#e3e9ee' }),
      s('rect', { x: 74, y: 143, width: 142, height: 5, fill: '#e3e9ee' }));
    for (let i = 0; i < 10; i++) {
      const x = 34 + i * 23.4;
      g.append(s('path', { d: 'M' + x + ' 260 L' + x + ' 226 Q' + (x + 6) + ' 216 ' + (x + 12) + ' 226 L' + (x + 12) + ' 260 Z', fill: '#a8c3d8', stroke: '#8aa7bd', 'stroke-width': 0.8 }));
    }
    for (let i = 0; i < 8; i++) {
      const x = 62 + i * 21.6;
      g.append(s('rect', { x, y: 184, width: 11, height: 16, rx: 3, fill: '#a8c3d8', stroke: '#8aa7bd', 'stroke-width': 0.8 }));
    }
    for (let i = 0; i < 6; i++) {
      g.append(s('rect', { x: 90 + i * 20, y: 154, width: 9, height: 12, rx: 2.5, fill: '#a8c3d8', stroke: '#8aa7bd', 'stroke-width': 0.8 }));
    }
    // kubah putih besar
    g.append(
      s('rect', { x: 98, y: 112, width: 104, height: 36, fill: '#ffffff', stroke: '#c0c9d2', 'stroke-width': 1.5 }),
      s('path', { d: 'M90 116 Q90 50 150 50 Q210 50 210 116 Z', fill: 'url(#' + uid + 'p)', stroke: '#a9b6c2', 'stroke-width': 2 }),
      s('path', { d: 'M108 92 Q112 68 142 58', fill: 'none', stroke: 'rgba(255,255,255,0.95)', 'stroke-width': 5, 'stroke-linecap': 'round' }),
      s('line', { x1: 150, y1: 50, x2: 150, y2: 32, stroke: '#e0a800', 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
      s('circle', { cx: 150, cy: 29, r: 4, fill: '#ffc93c', stroke: '#c9962a', 'stroke-width': 1 }));
    // taman
    g.append(
      s('rect', { x: 0, y: 262, width: 300, height: 38, fill: '#6fc77f' }),
      s('path', { d: 'M110 264 L190 264 L220 300 L80 300 Z', fill: '#f1ece0' }),
      s('path', { d: 'M104 276 L196 276 M96 288 L204 288', stroke: '#ddd5c0', 'stroke-width': 1.5 }),
      [[28, 268, 14], [56, 274, 11], [244, 272, 13], [276, 276, 10]].map(([x, y, r]) => s('circle', { cx: x, cy: y, r, fill: '#3fa65a', stroke: '#2f8a47', 'stroke-width': 1 })));
    return g;
  }
  const ART = { haram: artHaram, nabawi: artNabawi, istiqlal: artIstiqlal };

  // satu SVG yang menampilkan bagian vb dari gambar (viewBox dipotong)
  let seq = 0;
  function gambarSvg(id, vb) {
    const uid = 'pz' + (seq++) + '_';
    return svg('svg', { viewBox: vb, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' }, ART[id](svg, uid));
  }

  TI.register({
    id: 'puzzle',
    title: 'Puzzle Masjid',
    cat: 'islam',
    icon: '🖼️',
    desc: 'Susun kepingan menjadi gambar masjid yang terkenal.',
    start(ctx) {
      TI.style('puzzle', CSS);
      const reduced = TI.reduced();
      const N = ctx.isTK ? 2 : 3;
      const SEL = 300 / N;
      const daftar = shuffle(GAMBAR);

      async function level(g, no) {
        ctx.clear();
        ctx.ask('Level ' + (no + 1) + ' dari ' + daftar.length + ': susun gambar ' + g.nama + '!', { say: 'Susun gambar ' + g.nama + '! Ketuk kepingan, lalu ketuk tempatnya. Atau seret.' });
        ctx.sfx('pop'); // level baru dibuka

        const slots = [], slotEls = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const el = h('div', { class: 'pz-slot' });
          slotEls.push(el);
          slots.push({ id: r + '-' + c, el, label: 'Tempat keping baris ' + (r + 1) + ' kolom ' + (c + 1), r, c });
        }
        const hint = h('div', { class: 'pz-hint', 'aria-hidden': 'true' }, gambarSvg(g.id, '0 0 300 300'));
        hint.style.opacity = ctx.isTK ? '0.2' : '0.09';
        const grid = h('div', { class: 'pz-grid' }, slotEls);
        // garis sambungan antar keping (hilang saat gambar lengkap)
        const garis = svg('svg', { viewBox: '0 0 300 300', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
        for (let i = 1; i < N; i++) {
          garis.append(
            svg('line', { x1: i * SEL, y1: 0, x2: i * SEL, y2: 300, stroke: 'rgba(255,255,255,0.9)', 'stroke-width': 2.5 }),
            svg('line', { x1: 0, y1: i * SEL, x2: 300, y2: i * SEL, stroke: 'rgba(255,255,255,0.9)', 'stroke-width': 2.5 }),
            svg('line', { x1: i * SEL, y1: 0, x2: i * SEL, y2: 300, stroke: 'rgba(40,40,60,0.28)', 'stroke-width': 0.8 }),
            svg('line', { x1: 0, y1: i * SEL, x2: 300, y2: i * SEL, stroke: 'rgba(40,40,60,0.28)', 'stroke-width': 0.8 }));
        }
        const seams = h('div', { class: 'pz-seams', 'aria-hidden': 'true' }, garis);
        const board = h('div', { class: 'pz-board', style: '--n:' + N }, hint, grid, seams);
        const tray = h('div', { class: 'ti-tray pz-tray' });
        const help = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help pz-help' }, '💡 Bantu');
        const wrap = h('div', { class: 'pz-wrap' }, h('p', { class: 'pz-title' }, g.nama), board, tray, help);
        ctx.el.append(wrap);

        const pieces = slots.map((s, i) => ({
          id: 'p' + i, target: s.id, hideLabel: true, aria: 'Keping gambar nomor ' + (i + 1),
          node: h('span', { class: 'pz-chip-art', style: 'display:block;width:100%;height:100%' }, gambarSvg(g.id, (s.c * SEL) + ' ' + (s.r * SEL) + ' ' + SEL + ' ' + SEL)),
        }));

        let salah = 0, bantuan = 0, otomatis = false, tutup = false;
        tray.style.minHeight = Math.round(tray.getBoundingClientRect().height) + 'px'; // tinggi tray tetap supaya papan tidak bergeser

        // hitung kesalahan pasang: setelah 3 kali, satu keping dipasang otomatis
        const wrongAsli = ctx.wrong;
        ctx.wrong = function (...args) {
          if (!tutup && !otomatis) {
            salah++;
            if (salah >= 3) {
              salah = 0;
              ctx.after(950, () => { if (!tutup && !otomatis && pasangSatu(true)) ctx.say('Aku bantu satu keping ya.'); });
            }
          }
          return wrongAsli.apply(ctx, args);
        };

        function pasangSatu(tanpaPilih) {
          const sisa = pieces.filter((p) => !p.placed);
          if (!sisa.length) return false;
          let p = null;
          if (!tanpaPilih) p = sisa.find((x) => x.btn.classList.contains('is-selected')) || null;
          if (!p) p = sisa[Math.floor(Math.random() * sisa.length)];
          const s = slots.find((x) => x.id === p.target);
          if (!p.btn.classList.contains('is-selected')) p.btn.click();
          s.el.click();
          return true;
        }
        async function selesaikanSemua() {
          otomatis = true;
          wrap.classList.add('is-auto');
          ctx.say('Kita susun bersama ya.');
          for (const p of pieces.filter((x) => !x.placed)) {
            if (!ctx.alive) return;
            pasangSatu(true);
            await ctx.wait(230);
          }
        }
        help.addEventListener('click', () => {
          if (otomatis || tutup) return;
          bantuan++;
          ctx.mistakes++;
          ctx.sfx('tap');
          if (bantuan >= 3) selesaikanSemua();
          else { pasangSatu(false); ctx.say('Keping ini tempatnya di sini.'); }
        });

        try {
          await ctx.place({
            pieces, slots, tray, move: false, sayLabel: false,
            onPlace: (p, s) => {
              const e = 0.5; // sedikit tumpang tindih supaya tidak ada garis tipis antar keping
              const fill = h('div', { class: 'pz-fill' }, gambarSvg(g.id, (s.c * SEL - e) + ' ' + (s.r * SEL - e) + ' ' + (SEL + 2 * e) + ' ' + (SEL + 2 * e)));
              s.el.removeAttribute('data-tap');
              s.el.setAttribute('tabindex', '-1');
              s.el.setAttribute('role', 'img');
              s.el.setAttribute('aria-label', 'Keping terpasang');
              if (reduced) fill.classList.add('is-fade');
              s.el.append(fill);
              if (!reduced) {
                const r1 = p.btn.getBoundingClientRect(), r2 = s.el.getBoundingClientRect();
                fill.style.transformOrigin = '0 0';
                fill.style.transition = 'none';
                fill.style.transform = 'translate(' + (r1.left - r2.left).toFixed(1) + 'px,' + (r1.top - r2.top).toFixed(1) + 'px) scale(' + (r1.width / r2.width).toFixed(3) + ',' + (r1.height / r2.height).toFixed(3) + ')';
                void fill.offsetWidth;
                fill.style.transition = 'transform 260ms var(--ease-in-out)';
                fill.style.transform = '';
              }
              p.btn.style.display = 'none'; // kepingan yang sudah terpasang keluar dari tray, sisanya merapat
              const sisa = pieces.filter((x) => !x.placed).length;
              ctx.progress(no + (N * N - sisa) / (N * N), daftar.length);
            },
          });
        } finally {
          ctx.wrong = wrongAsli;
        }
        tutup = true;
        if (!ctx.alive) return;

        // gambar lengkap: garis sambungan memudar, perayaan kecil, fakta
        seams.classList.add('is-off');
        hint.remove();
        if (!reduced) { board.classList.add('is-done'); }
        tray.remove(); help.remove();
        ctx.progress(no + 1, daftar.length);
        await ctx.correct(null, { say: 'Gambar ' + g.nama + ' lengkap!', min: 700 });
        ctx.note(g.fakta, { title: 'Tahukah kamu?' });
        await ctx.next(no === daftar.length - 1 ? 'Selesai' : 'Lanjut');
      }

      async function alur() {
        ctx.progress(0, daftar.length);
        for (let i = 0; i < daftar.length; i++) {
          if (!ctx.alive) return;
          await level(daftar[i], i);
        }
        if (!ctx.alive) return;
        ctx.progress(daftar.length, daftar.length);
        const m = ctx.mistakes;
        ctx.finish({ stars: m <= 3 ? 3 : m <= 8 ? 2 : 1, lesson: LESSON });
      }
      return alur();
    },
  });
})();
