/* 37 Rangkaian Listrik. Papan rangkaian SVG: baterai, kabel, lampu, saklar, dan satu celah.
   Tebak dulu apakah lampu menyala, lalu pasang benda ke celah (ctx.place, ketuk atau seret) dan lihat arus mengalir.
   TK: saklar dulu, lalu 4 benda. SD: 6 benda, lalu 2 soal istilah. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const VW = 600, VH = 340;
  const WIRE = '#b8c2d6', AMBER = '#ffb703', BOARD = '#2c3e6b', INK = '#2b2d42';
  // Jalur arus (dari kutub + baterai, searah jarum jam). Titik: [x, y].
  const PATH = [[80, 130], [80, 90], [520, 90], [520, 270], [80, 270], [80, 230], [80, 130]];
  const SEG = [];
  let TOTAL = 0;
  for (let i = 1; i < PATH.length; i++) {
    const len = Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]);
    SEG.push({ a: PATH[i - 1], b: PATH[i], from: TOTAL, len });
    TOTAL += len;
  }
  const S_GAP = 820; // jarak dari kutub + sampai kontak kanan celah (360, 270)
  function posAt(s) {
    s = ((s % TOTAL) + TOTAL) % TOTAL;
    for (const g of SEG) if (s <= g.from + g.len) { const t = (s - g.from) / g.len; return [g.a[0] + (g.b[0] - g.a[0]) * t, g.a[1] + (g.b[1] - g.a[1]) * t]; }
    return PATH[0];
  }

  // ---------- gambar benda: pusat (0,0), ujung kiri x = -60, ujung kanan x = 60 ----------
  const mm = (n) => Number(n.toFixed(1));
  const METAL = '#9aa5b8', METAL_D = '#6f7b90', HI = '#ffffff';
  const draw = {
    paku: () => svg('g', null,
      svg('rect', { x: -48, y: -4.5, width: 100, height: 9, fill: METAL }),
      svg('path', { d: 'M52,-4.5 L60,0 L52,4.5 Z', fill: METAL }),
      svg('rect', { x: -60, y: -12, width: 13, height: 24, rx: 4, fill: METAL_D }),
      svg('rect', { x: -44, y: -3, width: 90, height: 2.5, fill: HI, opacity: 0.5 })),
    sendok: () => svg('g', null,
      svg('rect', { x: -60, y: -4, width: 80, height: 8, rx: 4, fill: '#b8c2d0' }),
      svg('ellipse', { cx: 38, cy: 0, rx: 22, ry: 14, fill: '#d5dce6', stroke: METAL_D, 'stroke-width': 3 }),
      svg('ellipse', { cx: 33, cy: -4, rx: 11, ry: 4.5, fill: HI, opacity: 0.65 })),
    kawat: () => {
      let d = 'M-60,0';
      for (let i = 1; i <= 48; i++) { const x = -60 + i * 2.5; d += ' L' + x + ',' + mm(Math.sin(i * 0.72) * 11); }
      return svg('g', null,
        svg('path', { d, fill: 'none', stroke: '#c75d1c', 'stroke-width': 6.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        svg('path', { d, fill: 'none', stroke: '#f2a259', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(0 -1.4)' }));
    },
    klip: () => svg('g', { transform: 'translate(-60 -1) scale(1.41)' },
      svg('path', {
        d: 'M18.5,-5 L74.5,-5 A9,9 0 0 1 74.5,13 L12.5,13 A11,11 0 0 1 12.5,-9 L64.5,-9 A5,5 0 0 1 64.5,1 L32.5,1',
        fill: 'none', stroke: METAL, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(-4.5 0)',
      })),
    kunci: () => {
      const g = svg('g', null,
        svg('circle', { cx: -46, cy: 0, r: 11, fill: 'none', stroke: METAL, 'stroke-width': 6 }),
        svg('rect', { x: -34, y: -3.5, width: 94, height: 7, rx: 3, fill: METAL }));
      [44, 54].forEach((x) => g.append(svg('rect', { x: x - 2.5, y: 3, width: 5, height: 9, fill: METAL })));
      return g;
    },
    penghapus: () => svg('g', null,
      svg('rect', { x: -60, y: -17, width: 120, height: 34, rx: 10, fill: '#ffb3c1', stroke: '#e58a9d', 'stroke-width': 2.5 }),
      svg('rect', { x: -60, y: -17, width: 58, height: 34, rx: 10, fill: '#fff' }),
      svg('rect', { x: -14, y: -17, width: 12, height: 34, fill: '#fff' }),
      svg('rect', { x: -48, y: -7, width: 34, height: 5, rx: 2.5, fill: '#4aa3ff' }),
      svg('rect', { x: -48, y: 3, width: 22, height: 5, rx: 2.5, fill: '#4aa3ff' })),
    pensil: () => svg('g', null,
      svg('rect', { x: -60, y: -12, width: 18, height: 24, rx: 6, fill: '#ff8fab' }),
      svg('rect', { x: -43, y: -12, width: 9, height: 24, fill: '#c3cad6' }),
      svg('rect', { x: -34, y: -12, width: 80, height: 24, fill: '#ffc93c' }),
      svg('rect', { x: -34, y: -9, width: 80, height: 4, fill: HI, opacity: 0.45 }),
      svg('path', { d: 'M46,-12 L60,-6 L60,6 L46,12 Z', fill: '#f1d3a5' })),
    sedotan: () => {
      const g = svg('g', null, svg('rect', { x: -60, y: -8, width: 120, height: 16, rx: 8, fill: '#fff', stroke: '#e5484d', 'stroke-width': 2 }));
      for (let x = -52; x < 50; x += 20) g.append(svg('path', { d: 'M' + x + ',-8 L' + (x + 10) + ',-8 L' + (x + 4) + ',8 L' + (x - 6) + ',8 Z', fill: '#e5484d' }));
      return g;
    },
    kertas: () => svg('g', null,
      svg('path', { d: 'M-60,-17 H44 L60,-1 V17 H-60 Z', fill: '#fff', stroke: '#c3cad6', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
      svg('path', { d: 'M44,-17 V-1 H60 Z', fill: '#e6ebf3', stroke: '#c3cad6', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      svg('rect', { x: -50, y: -8, width: 70, height: 4, rx: 2, fill: '#c3cad6' }),
      svg('rect', { x: -50, y: 2, width: 90, height: 4, rx: 2, fill: '#c3cad6' }),
      svg('rect', { x: -50, y: 10, width: 50, height: 4, rx: 2, fill: '#c3cad6' })),
    gelas: () => svg('g', null,
      svg('rect', { x: -60, y: -16, width: 108, height: 32, rx: 6, fill: '#bfe6fb', stroke: '#7cc4ea', 'stroke-width': 3, opacity: 0.95 }),
      svg('ellipse', { cx: 48, cy: 0, rx: 9, ry: 16, fill: '#d8f1fd', stroke: '#7cc4ea', 'stroke-width': 3 }),
      svg('rect', { x: -52, y: -11, width: 86, height: 5, rx: 2.5, fill: HI, opacity: 0.75 }),
      svg('rect', { x: -60, y: 8, width: 12, height: 8, fill: '#7cc4ea', opacity: 0.5 }),
      svg('rect', { x: 50, y: -3, width: 10, height: 6, fill: '#7cc4ea', opacity: 0.0 })),
    kain: () => {
      const g = svg('g', null,
        svg('rect', { x: -56, y: -16, width: 112, height: 32, rx: 5, fill: '#ff8fa3' }),
        svg('rect', { x: -56, y: -4, width: 112, height: 8, fill: '#ffd1da' }));
      for (let x = -46; x < 56; x += 18) g.append(svg('rect', { x, y: -16, width: 6, height: 32, fill: '#ff6b87', opacity: 0.55 }));
      for (let y = -12; y <= 12; y += 6) {
        g.append(svg('line', { x1: -60, y1: y, x2: -56, y2: y, stroke: '#ff8fa3', 'stroke-width': 2, 'stroke-linecap': 'round' }));
        g.append(svg('line', { x1: 56, y1: y, x2: 60, y2: y, stroke: '#ff8fa3', 'stroke-width': 2, 'stroke-linecap': 'round' }));
      }
      return g;
    },
    kabel: () => svg('g', null, svg('line', { x1: -60, y1: 0, x2: 60, y2: 0, stroke: '#d9722f', 'stroke-width': 8, 'stroke-linecap': 'round' })),
  };

  const CONDUCT = [
    { id: 'paku', name: 'Paku besi', ok: true, why: 'Paku terbuat dari besi. Besi adalah logam, jadi listrik bisa mengalir.' },
    { id: 'sendok', name: 'Sendok logam', ok: true, why: 'Sendok logam menghantarkan listrik, jadi lampu menyala.' },
    { id: 'kawat', name: 'Kawat tembaga', ok: true, why: 'Tembaga adalah logam yang menghantarkan listrik dengan sangat baik. Kabel dibuat dari tembaga.' },
    { id: 'klip', name: 'Klip kertas besi', ok: true, why: 'Klip kertas terbuat dari besi, jadi listrik bisa mengalir.' },
    { id: 'kunci', name: 'Kunci besi', ok: true, why: 'Kunci besi menghantarkan listrik, jadi lampu menyala.' },
  ];
  const INSUL = [
    { id: 'penghapus', name: 'Penghapus karet', ok: false, why: 'Karet tidak menghantarkan listrik. Karena itu kabel dibungkus karet atau plastik.' },
    { id: 'pensil', name: 'Pensil kayu', ok: false, why: 'Pensil dibungkus kayu. Kayu tidak menghantarkan listrik.' },
    { id: 'sedotan', name: 'Sedotan plastik', ok: false, why: 'Plastik tidak menghantarkan listrik, jadi lampu tetap mati.' },
    { id: 'kertas', name: 'Kertas', ok: false, why: 'Kertas tidak menghantarkan listrik, jadi lampu tetap mati.' },
    { id: 'gelas', name: 'Gelas kaca', ok: false, why: 'Kaca tidak menghantarkan listrik, jadi lampu tetap mati.' },
    { id: 'kain', name: 'Kain', ok: false, why: 'Kain tidak menghantarkan listrik, jadi lampu tetap mati.' },
  ];
  const itemSvg = (it, w) => svg('svg', { viewBox: '-66 -22 132 44', width: w, height: mm(w * 44 / 132), 'aria-hidden': 'true', class: 'ls-itemsvg' }, draw[it.id]());

  function sparkle(host, x, y) {
    if (TI.reduced()) return;
    const cols = ['#ffd23f', '#ffb703', '#fff3b0', '#ff8a1f'];
    for (let i = 0; i < 12; i++) {
      const s = h('i', { class: 'ls-spark', style: { left: x + 'px', top: y + 'px', background: cols[i % cols.length] } });
      host.append(s);
      const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4, d = 40 + Math.random() * 34;
      const an = s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d - 4) + 'px,' + (Math.sin(a) * d - 4) + 'px) scale(0.5)', opacity: 0 },
      ], { duration: 560, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }); // motion-ok: percikan perayaan singkat
      an.onfinish = () => s.remove();
    }
  }

  // ---------- papan rangkaian ----------
  function makeBoard(ctx) {
    const reduced = TI.reduced();
    const st = { closed: true, item: null };
    const root = svg('svg', { class: 'ls-svg', viewBox: '0 0 ' + VW + ' ' + VH, role: 'img', 'aria-label': 'Papan rangkaian listrik: baterai, lampu, saklar, dan satu celah' });
    const defs = svg('defs', null,
      svg('radialGradient', { id: 'lsGlow' }, svg('stop', { offset: 0, 'stop-color': '#fff3b0', 'stop-opacity': 0.95 }), svg('stop', { offset: 1, 'stop-color': '#ffd23f', 'stop-opacity': 0 })),
      svg('radialGradient', { id: 'lsBulb', cx: '40%', cy: '35%', r: '70%' }, svg('stop', { offset: 0, 'stop-color': '#fffbe0' }), svg('stop', { offset: 1, 'stop-color': '#ffcf33' })),
      svg('pattern', { id: 'lsGrid', width: 30, height: 30, patternUnits: 'userSpaceOnUse' }, svg('path', { d: 'M30,0 H0 V30', fill: 'none', stroke: '#364a80', 'stroke-width': 1.5 })));
    const wireD = 'M80,130 V90 H278 M322,90 H520 V130 M520,230 V270 H360 M240,270 H80 V230';
    const wireBase = svg('path', { d: wireD, fill: 'none', stroke: WIRE, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const wireLive = svg('path', { class: 'ls-live', d: wireD, fill: 'none', stroke: AMBER, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

    // baterai
    const battery = svg('g', null,
      svg('rect', { x: 66, y: 120, width: 28, height: 16, rx: 4, fill: '#d7dde8' }),
      svg('rect', { x: 52, y: 134, width: 56, height: 94, rx: 10, fill: '#2fae6a', stroke: '#1d8450', 'stroke-width': 3 }),
      svg('rect', { x: 52, y: 134, width: 56, height: 26, rx: 10, fill: '#ffb703' }),
      svg('rect', { x: 52, y: 148, width: 56, height: 12, fill: '#ffb703' }),
      svg('rect', { x: 60, y: 168, width: 8, height: 44, rx: 4, fill: '#fff', opacity: 0.3 }),
      svg('path', { d: 'M80,139 V157 M71,148 H89', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }),
      svg('path', { d: 'M71,210 H89', stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round' }));

    // saklar
    const lever = svg('g', { class: 'ls-lever' },
      svg('line', { x1: 520, y1: 230, x2: 520, y2: 138, stroke: WIRE, 'stroke-width': 9, 'stroke-linecap': 'round' }),
      svg('line', { class: 'ls-live', x1: 520, y1: 230, x2: 520, y2: 138, stroke: AMBER, 'stroke-width': 9, 'stroke-linecap': 'round' }),
      svg('circle', { cx: 520, cy: 138, r: 8, fill: '#e5484d', stroke: '#fff', 'stroke-width': 2.5 }));
    const sw = svg('g', null,
      svg('circle', { cx: 520, cy: 130, r: 10, fill: '#5d6b82', stroke: WIRE, 'stroke-width': 3 }),
      svg('circle', { cx: 520, cy: 230, r: 10, fill: '#5d6b82', stroke: WIRE, 'stroke-width': 3 }),
      lever,
      svg('text', { x: 504, y: 186, 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: '#9fb0d6', text: 'saklar' }));

    // lampu
    const filament = 'M292,80 V60 L296,54 L300,60 L304,54 L308,60 V80';
    const rays = svg('g', { class: 'ls-rays' });
    for (let i = 0; i < 9; i++) {
      const a = (-170 + i * 20) * Math.PI / 180;
      rays.append(svg('line', { x1: mm(300 + Math.cos(a) * 44), y1: mm(48 + Math.sin(a) * 44), x2: mm(300 + Math.cos(a) * 58), y2: mm(48 + Math.sin(a) * 58), stroke: '#ffe27a', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    }
    const lamp = svg('g', null,
      svg('circle', { class: 'ls-glow', cx: 300, cy: 52, r: 100, fill: 'url(#lsGlow)' }),
      rays,
      svg('circle', { cx: 300, cy: 48, r: 33, fill: '#e8eef8', stroke: '#9fb0d6', 'stroke-width': 3, opacity: 0.9 }),
      svg('circle', { class: 'ls-on', cx: 300, cy: 48, r: 32, fill: 'url(#lsBulb)' }),
      svg('path', { d: 'M278,66 Q300,84 322,66 L318,80 H282 Z', fill: '#e8eef8', stroke: '#9fb0d6', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      svg('path', { d: filament, fill: 'none', stroke: '#5d6b82', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      svg('path', { class: 'ls-on', d: filament, fill: 'none', stroke: '#ff8a1f', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      svg('rect', { x: 278, y: 78, width: 44, height: 26, rx: 6, fill: '#7a869c', stroke: '#5d6b82', 'stroke-width': 3 }),
      svg('path', { d: 'M282,88 H318 M282,96 H318', stroke: '#5d6b82', 'stroke-width': 2.5 }),
      svg('ellipse', { cx: 289, cy: 38, rx: 7, ry: 12, fill: '#fff', opacity: 0.55, transform: 'rotate(25 289 38)' }));

    // titik arus
    const dotG = svg('g', { class: 'ls-dots' });
    const dots = Array.from({ length: 16 }, (_, i) => {
      const el = svg('circle', { r: 5.5, fill: '#fff6c9', stroke: '#ffb703', 'stroke-width': 2 });
      dotG.append(el);
      return { el, s: (i * TOTAL) / 16 };
    });

    // celah
    const contacts = svg('g', null,
      svg('circle', { cx: 240, cy: 270, r: 11, fill: '#5d6b82', stroke: WIRE, 'stroke-width': 3.5 }),
      svg('circle', { cx: 360, cy: 270, r: 11, fill: '#5d6b82', stroke: WIRE, 'stroke-width': 3.5 }));
    const gapG = svg('g', { transform: 'translate(300 270)' });
    const stopMark = svg('g', { class: 'ls-stopmark', transform: 'translate(300 236)' },
      svg('circle', { r: 16, fill: '#e5484d', stroke: '#fff', 'stroke-width': 3 }),
      svg('path', { d: 'M-6,-6 L6,6 M6,-6 L-6,6', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    const labels = [
      svg('text', { x: 118, y: 186, 'font-size': 15, 'font-weight': 800, fill: '#9fb0d6', text: 'baterai' }),
      svg('text', { x: 346, y: 56, 'font-size': 15, 'font-weight': 800, fill: '#9fb0d6', text: 'lampu' }),
    ];
    root.append(defs, svg('rect', { width: VW, height: VH, fill: BOARD }), svg('rect', { width: VW, height: VH, fill: 'url(#lsGrid)' }),
      wireBase, wireLive, dotG, battery, sw, lamp, contacts, gapG, stopMark, ...labels);

    const scene = h('div', { class: 'ti-scene ls-scene' }, root);
    const swBtn = h('button', { type: 'button', class: 'ls-sw', 'aria-label': 'Saklar' });
    swBtn.hidden = true;
    scene.append(swBtn);
    let gapEl = null;
    const B = {
      el: scene, swBtn,
      // celah baru tiap benda supaya pendengar klik lama tidak menumpuk
      newGap() {
        if (gapEl) gapEl.remove();
        gapEl = h('div', { class: 'ls-gap', 'aria-label': 'Celah rangkaian' });
        scene.append(gapEl);
        return gapEl;
      },
      set(opts) { Object.assign(st, opts); B.update(); },
      fill(it) { // gambar benda di celah; it null = celah kosong
        st.item = it;
        gapG.replaceChildren();
        if (it) gapG.append(draw[it.id]());
        B.update();
      },
      update() {
        const cond = !!(st.item && st.item.ok);
        const flow = st.closed && cond;
        const stop = st.closed && !cond;
        const lit = flow;
        scene.classList.toggle('is-lit', lit);
        scene.classList.toggle('is-flow', flow);
        scene.classList.toggle('is-stop', stop);
        scene.classList.toggle('is-open', !st.closed);
        scene.classList.toggle('is-blocked', stop && !!st.item);
        B.mode = flow ? 'flow' : stop ? 'stop' : 'off';
        if (lit && !B.wasLit) { sparkle(scene, scene.clientWidth * (300 / VW), scene.clientHeight * (50 / VH)); TI.sfx('klik'); }
        B.wasLit = lit;
      },
      mode: 'off', wasLit: false,
    };
    root.querySelector('.ls-lever').style.transformBox = 'view-box';
    root.querySelector('.ls-lever').style.transformOrigin = '520px 230px';

    ctx.loop((dt) => {
      if (B.mode === 'off') return;
      const sp = reduced ? 90 : 170;
      dots.forEach((d) => {
        d.s += sp * dt;
        if (B.mode === 'flow') {
          const p = posAt(d.s);
          d.el.setAttribute('transform', 'translate(' + mm(p[0]) + ' ' + mm(p[1]) + ')');
          d.el.setAttribute('opacity', 1);
        } else {
          if (d.s > S_GAP) d.s -= S_GAP;
          const p = posAt(d.s);
          d.el.setAttribute('transform', 'translate(' + mm(p[0]) + ' ' + mm(p[1]) + ')');
          d.el.setAttribute('opacity', mm(Math.max(0, Math.min(1, (S_GAP - d.s) / 70))));
        }
      });
    });
    return B;
  }

  function itemCard(it) {
    return h('div', { class: 'ti-card ls-card pop-in' }, itemSvg(it, 150), h('b', null, it.name));
  }

  // Tebakan: dua tombol besar. Hasil dinilai setelah benda dipasang.
  function askGuess(ctx, parent) {
    return new Promise((resolve) => {
      const row = h('div', { class: 'ls-guess' });
      const defs = [{ value: true, icon: '💡', label: 'Menyala' }, { value: false, icon: '🚫', label: 'Tidak menyala' }];
      const btns = defs.map((d, i) => {
        const b = h('button', { type: 'button', class: 'choice pop-in', style: '--i:' + i, 'aria-label': d.label },
          h('span', { class: 'ls-ic', 'aria-hidden': 'true' }, d.icon), h('span', null, d.label));
        b.addEventListener('click', () => {
          if (btns.some((x) => x.disabled)) return;
          btns.forEach((x) => { x.disabled = true; });
          TI.sfx('tap'); ctx.say(d.label);
          row.remove();
          resolve(d.value);
        });
        row.append(b);
        return b;
      });
      parent.append(row);
    });
  }

  function nextBtn(ctx, parent, label) {
    return new Promise((resolve) => {
      const b = h('button', { type: 'button', class: 'ti-btn pop-in' }, label || 'Lanjut', ' ➜');
      b.addEventListener('click', () => { TI.sfx('tap'); b.disabled = true; resolve(); });
      parent.append(b);
    });
  }

  // Lanjut otomatis: catatan dibacakan (sayWait) lalu jalan sendiri; tombol Lanjut cuma pemercepat.
  function lanjutOtomatis(ctx, parent, teks) {
    return new Promise((resolve) => {
      let done = false;
      const go = () => { if (!done) { done = true; resolve(); } };
      const b = h('button', { type: 'button', class: 'ti-btn is-ghost pop-in' }, 'Lanjut', ' ➜');
      b.addEventListener('click', () => { TI.sfx('tap'); b.disabled = true; go(); });
      parent.append(b);
      ctx.onExit(go);
      ctx.sayWait(teks).then(go);
    });
  }

  TI.register({
    id: 'listrik',
    title: 'Rangkaian Listrik',
    cat: 'sains',
    icon: '💡',
    desc: 'Pasang benda di rangkaian dan lihat lampu menyala atau tidak.',
    start(ctx) {
      TI.style('listrik', `
.play[data-game="listrik"] .ti-scene { flex: none; width: min(100%, 620px, max(320px, calc((100dvh - 500px) * 1.765))); min-height: 0; aspect-ratio: 600 / 340; background: #2c3e6b; }
.play[data-game="listrik"] .ls-svg { display: block; width: 100%; height: 100%; }
.play[data-game="listrik"] .ls-live, .play[data-game="listrik"] .ls-on, .play[data-game="listrik"] .ls-glow, .play[data-game="listrik"] .ls-rays,
.play[data-game="listrik"] .ls-dots, .play[data-game="listrik"] .ls-stopmark { opacity: 0; transition: opacity var(--dur-ui) var(--ease-out); }
.play[data-game="listrik"] .is-flow .ls-live, .play[data-game="listrik"] .is-lit .ls-on, .play[data-game="listrik"] .is-lit .ls-glow,
.play[data-game="listrik"] .is-lit .ls-rays, .play[data-game="listrik"] .is-flow .ls-dots, .play[data-game="listrik"] .is-stop .ls-dots,
.play[data-game="listrik"] .is-blocked .ls-stopmark { opacity: 1; }
.play[data-game="listrik"] .ls-lever { transition: transform var(--dur-ui) var(--ease-out); }
.play[data-game="listrik"] .is-open .ls-lever { transform: rotate(42deg); }
.play[data-game="listrik"] .ls-sw { position: absolute; left: 77%; top: 34%; width: 22%; height: 38%; padding: 0; border: 3px dashed rgba(255, 255, 255, 0.55); border-radius: 18px; background: rgba(255, 255, 255, 0.08); cursor: pointer; }
.play[data-game="listrik"] .ls-sw:active { background: rgba(255, 255, 255, 0.22); }
.play[data-game="listrik"] .ls-sw.is-hint { animation: ls-pulse 1100ms var(--ease-in-out) infinite; }
@keyframes ls-pulse { 50% { transform: scale(1.06); background: rgba(255, 255, 255, 0.2); } }
.play[data-game="listrik"] .ls-gap { position: absolute; left: 37%; top: 64%; width: 26%; height: 30%; border: 3px dashed rgba(255, 255, 255, 0.6); border-radius: 16px; background: rgba(255, 255, 255, 0.06); cursor: pointer; }
.play[data-game="listrik"] .ls-gap.is-filled { border-color: transparent; background: transparent; }
.play[data-game="listrik"] .ls-gap:active { background: rgba(255, 255, 255, 0.2); }
.play[data-game="listrik"] .ls-box { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 640px; }
.play[data-game="listrik"] .ls-card { display: grid; justify-items: center; gap: 2px; padding: 6px 16px; width: auto; }
.play[data-game="listrik"] .ls-guess { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; width: 100%; }
.play[data-game="listrik"] .ls-guess .choice { flex: 1 1 150px; max-width: 260px; min-height: 72px; flex-direction: column; gap: 0; padding: 6px 12px; }
.play[data-game="listrik"] .ls-ic { font-size: 2rem; line-height: 1; }
.play[data-game="listrik"] .ls-itemsvg { display: block; max-width: 100%; height: auto; }
.play[data-game="listrik"] .ls-tally { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.play[data-game="listrik"] .ls-pill { padding: 4px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 0.95rem; }
.play[data-game="listrik"] .ls-pill b { color: var(--c); }
.play[data-game="listrik"] .ls-spark { position: absolute; width: 9px; height: 9px; border-radius: 50%; pointer-events: none; z-index: 5; }
.play[data-game="listrik"] .ls-tray { min-height: 0; }
@media (prefers-reduced-motion: reduce) { .play[data-game="listrik"] .ls-sw.is-hint { animation: none; border-style: solid; border-color: #ffd23f; } }
`);

      const tk = ctx.isTK;
      const conductors = sample(CONDUCT, tk ? 2 : 3), insulators = sample(INSUL, tk ? 2 : 3);
      const items = shuffle([...conductors, ...insulators]); items.sort((a, b) => (a.ok ? 0 : 1) - (b.ok ? 0 : 1)); // contoh menyala dulu
      const total = tk ? 2 + items.length : items.length + 2;
      let step = 0;
      const lc = tk ? ['Menyala', 'Tidak menyala'] : ['Konduktor', 'Isolator'];
      const cnt = [0, 0];

      return (async () => {
        // ===== peringatan keselamatan (sekali-pernah, bukan tiap main) =====
        let sudahAman = false;
        try { sudahAman = localStorage.getItem('tamanIlmu.listrik.aman') === '1'; } catch (e) { /* mode privat */ }
        if (!sudahAman) {
          ctx.ask('Hati-hati dengan listrik!');
          const warn = h('div', { class: 'ls-box' });
          ctx.el.append(warn);
          ctx.note('Ingat ya, jangan pernah memasukkan benda ke stop kontak di rumah. Listrik rumah berbahaya! Di sini kita hanya memakai baterai kecil.', { title: 'Hati-hati!', into: warn });
          await nextBtn(ctx, warn, 'Mengerti');
          try { localStorage.setItem('tamanIlmu.listrik.aman', '1'); } catch (e) { /* abaikan */ }
          warn.remove();
          if (!ctx.alive) return;
        }

        const board = makeBoard(ctx);
        const tally = h('div', { class: 'ls-tally' },
          h('span', { class: 'ls-pill' }, lc[0] + ': ', h('b', null, '0')), h('span', { class: 'ls-pill' }, lc[1] + ': ', h('b', null, '0')));
        const pills = [...tally.querySelectorAll('b')];
        ctx.el.append(board.el, tally);
        const bump = (i) => { cnt[i]++; pills[i].textContent = String(cnt[i]); };
        const progress = () => ctx.progress(step, total);
        progress();

        // ===== TK: saklar =====
        if (tk) {
          board.set({ closed: false });
          board.fill({ id: 'kabel', ok: true });
          board.swBtn.hidden = false; board.swBtn.classList.add('is-hint');
          const toggle = (want) => new Promise((res) => {
            const on = () => {
              board.swBtn.removeEventListener('click', on);
              board.set({ closed: want }); TI.sfx(want ? 'klik' : 'tap');
              res();
            };
            board.swBtn.addEventListener('click', on);
          });
          ctx.ask('Nyalakan lampunya! Tekan saklarnya.');
          await toggle(true);
          board.swBtn.classList.remove('is-hint');
          await ctx.correct(null, { say: 'Hore, lampunya menyala!' });
          step++; progress();
          ctx.ask('Sekarang matikan lampunya! Tekan saklarnya lagi.');
          board.swBtn.classList.add('is-hint');
          await toggle(false);
          board.swBtn.classList.remove('is-hint');
          await ctx.correct(null, { say: 'Lampunya mati.' });
          const box = h('div', { class: 'ls-box' });
          ctx.el.append(box);
          ctx.note('Lampu menyala kalau jalan listriknya tersambung. Kalau saklar dimatikan, jalannya terputus.', { title: 'Tahukah kamu?', into: box, speak: false });
          await lanjutOtomatis(ctx, box, 'Lampu menyala kalau jalan listriknya tersambung. Kalau saklar dimatikan, jalannya terputus.');
          box.remove();
          step++; progress();
          board.swBtn.hidden = true;
          board.set({ closed: true });
        }

        // ===== benda satu per satu =====
        let ke = 0; for (const it of items) { ke++; if (ke === Math.ceil(items.length / 2)) ctx.correct(null, { say: tk ? 'Bagus! Setengah jalan!' : 'Bagus! Terus naik ke yang sulit.' });
          if (!ctx.alive) return;
          board.fill(null); board.set({ closed: true });
          const box = h('div', { class: 'ls-box' });
          ctx.el.append(box);
          ctx.ask('Kalau ' + it.name.toLowerCase() + ' dipasang di celah, lampu menyala?');
          const card = itemCard(it);
          box.append(card);
          const guess = await askGuess(ctx, box);
          if (!ctx.alive) return;
          card.remove();

          ctx.ask('Pasang ' + it.name.toLowerCase() + ' ke celah! Ketuk bendanya, lalu ketuk celah.', { say: 'Pasang ' + it.name.toLowerCase() + ' ke celah. Ketuk bendanya, lalu ketuk celah. Boleh juga diseret.' });
          const tray = h('div', { class: 'ti-tray ls-tray' });
          box.append(tray);
          const gapEl = board.newGap();
          await ctx.place({
            pieces: [{ id: it.id, label: it.name, node: itemSvg(it, 112), target: 'gap', say: it.name }],
            slots: [{ id: 'gap', el: gapEl, label: 'Celah rangkaian' }],
            tray, move: false,
            onPlace: async () => { board.fill(it); await ctx.wait(1300); },
          });
          if (!ctx.alive) return;
          tray.remove();

          const right = guess === it.ok;
          if (right) await ctx.correct(null, { say: it.ok ? 'Betul! Lampunya menyala.' : 'Betul! Lampunya tidak menyala.' });
          else await ctx.wrong(null, { say: it.ok ? 'Belum tepat. Lampunya menyala.' : 'Belum tepat. Lampunya tidak menyala.' });
          bump(it.ok ? 0 : 1);

          const tail = tk ? '' : (it.ok ? ' Benda yang menghantarkan listrik disebut konduktor.' : ' Benda yang tidak menghantarkan listrik disebut isolator.');
          ctx.note(it.why + tail, { title: it.ok ? 'Menyala!' : 'Tidak menyala.', into: box, speak: false });
          await lanjutOtomatis(ctx, box, it.why + tail);
          box.remove();
          step++; progress();
        }

        // ===== SD: dua soal istilah =====
        if (!tk) {
          board.fill(null); board.set({ closed: true });
          board.newGap();
          tally.remove();
          ctx.ask('Lampu menyala jika rangkaiannya?');
          const box1 = h('div', { class: 'ti-choices' });
          ctx.el.append(box1);
          await ctx.choose({ options: shuffle(['Tertutup', 'Terbuka']), answer: 'Tertutup', into: box1 });
          box1.remove();
          board.fill({ id: 'kabel', ok: true });
          await ctx.wait(1100);
          step++; progress();

          ctx.ask('Benda yang bisa dialiri listrik disebut?');
          const box2 = h('div', { class: 'ti-choices' });
          ctx.el.append(box2);
          await ctx.choose({ options: shuffle(['Konduktor', 'Isolator']), answer: 'Konduktor', into: box2 });
          step++; progress();
          await ctx.wait(500);
        }

        if (!ctx.alive) return;
        ctx.clear();
        ctx.progress(total, total);
        ctx.finish({ lesson: 'Listrik mengalir lewat logam (konduktor), dan tidak mengalir lewat karet, kayu, dan plastik (isolator).' });
      })();
    },
  });
})();
