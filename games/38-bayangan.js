/* 38 Cahaya & Bayangan.
   TK: cocokkan benda dengan siluet bayangannya (lampu menyala dan bayangan muncul setelah benar), lalu coba matikan lampu.
   SD: lab tiang bendera. Matahari digeser dengan slider dari pagi (timur, kiri) lewat siang sampai sore (barat, kanan);
   bayangan dihitung dari tinggi matahari: panjang = tinggi tiang / tan(sudut matahari). */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const SIL = '#1f2433';
  const mm = (n) => Number(n.toFixed(1));

  // ---------- benda untuk TK (viewBox 0 0 120 120), sil = siluet hitam polos ----------
  function star() {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 22 : 52;
      pts.push(mm(60 + Math.cos(a) * r) + ',' + mm(64 + Math.sin(a) * r));
    }
    return pts.join(' ');
  }
  const SHAPES = {
    payung: { name: 'Payung', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', null,
      svg('path', { d: 'M8,64 A52,52 0 0 1 112,64 Q99,53 86,64 Q73,53 60,64 Q47,53 34,64 Q21,53 8,64 Z', fill: f('#e5484d') }),
      sil ? null : svg('path', { d: 'M60,12 Q42,36 34,64 M60,12 Q78,36 86,64', fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.55 }),
      svg('circle', { cx: 60, cy: 11, r: 4.5, fill: f('#7a4f2a') }),
      svg('path', { d: 'M60,62 V100 A10,10 0 0 1 40,100', fill: 'none', stroke: f('#7a4f2a'), 'stroke-width': 6.5, 'stroke-linecap': 'round' })); } },
    cangkir: { name: 'Cangkir', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', null,
      svg('path', { d: 'M86,56 H98 A13,13 0 0 1 98,82 H84', fill: 'none', stroke: f('#2f6fed'), 'stroke-width': 8, 'stroke-linecap': 'round' }),
      svg('path', { d: 'M22,46 H88 L82,92 Q81,102 71,102 H39 Q29,102 28,92 Z', fill: f('#4aa3ff') }),
      sil ? null : svg('rect', { x: 28, y: 62, width: 56, height: 12, fill: '#fff', opacity: 0.8 }),
      svg('ellipse', { cx: 55, cy: 106, rx: 44, ry: 7, fill: f('#d5dce6') })); } },
    kunci: { name: 'Kunci', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', { transform: 'rotate(-25 60 60)' },
      svg('circle', { cx: 32, cy: 60, r: 19, fill: 'none', stroke: f('#d9a21b'), 'stroke-width': 10 }),
      svg('rect', { x: 48, y: 55, width: 62, height: 10, rx: 3, fill: f('#d9a21b') }),
      svg('rect', { x: 88, y: 63, width: 9, height: 17, fill: f('#d9a21b') }),
      svg('rect', { x: 101, y: 63, width: 9, height: 12, fill: f('#d9a21b') })); } },
    pohon: { name: 'Pohon', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', null,
      svg('rect', { x: 52, y: 64, width: 16, height: 48, rx: 3, fill: f('#8a5a34') }),
      svg('circle', { cx: 60, cy: 38, r: 30, fill: f('#3fb950') }),
      svg('circle', { cx: 34, cy: 58, r: 21, fill: f('#35a547') }),
      svg('circle', { cx: 86, cy: 58, r: 21, fill: f('#35a547') })); } },
    rumah: { name: 'Rumah', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', null,
      svg('rect', { x: 84, y: 20, width: 13, height: 28, fill: f('#b9532f') }),
      svg('rect', { x: 22, y: 56, width: 76, height: 54, fill: f('#ffd8a8') }),
      svg('path', { d: 'M10,62 L60,16 L110,62 Z', fill: f('#e5484d') }),
      sil ? null : svg('rect', { x: 52, y: 78, width: 18, height: 32, rx: 3, fill: '#8a5a34' }),
      sil ? null : svg('rect', { x: 29, y: 68, width: 17, height: 17, rx: 2, fill: '#bfe6fb' })); } },
    bintang: { name: 'Bintang', draw: (sil) => svg('g', null,
      svg('polygon', { points: star(), fill: sil ? SIL : '#ffc93c', stroke: sil ? SIL : '#e8a000', 'stroke-width': 3, 'stroke-linejoin': 'round' })) },
    kursi: { name: 'Kursi', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', null,
      svg('rect', { x: 30, y: 12, width: 60, height: 40, rx: 6, fill: f('#b9733a') }),
      sil ? null : svg('rect', { x: 38, y: 20, width: 44, height: 7, rx: 3, fill: '#d99a5e' }),
      sil ? null : svg('rect', { x: 38, y: 33, width: 44, height: 7, rx: 3, fill: '#d99a5e' }),
      svg('rect', { x: 24, y: 54, width: 72, height: 13, rx: 4, fill: f('#d99a5e') }),
      svg('rect', { x: 28, y: 66, width: 11, height: 46, rx: 3, fill: f('#b9733a') }),
      svg('rect', { x: 81, y: 66, width: 11, height: 46, rx: 3, fill: f('#b9733a') })); } },
    kubah: { name: 'Kubah masjid', draw: (sil) => { const f = (c) => (sil ? SIL : c); return svg('g', null,
      svg('rect', { x: 58, y: 8, width: 4, height: 14, fill: f('#d9a21b') }),
      svg('circle', { cx: 60, cy: 8, r: 5, fill: f('#d9a21b') }),
      svg('path', { d: 'M20,80 A40,40 0 0 1 100,80 Z', fill: f('#1fa36a') }),
      svg('path', { d: 'M2,84 A14,14 0 0 1 30,84 Z', fill: f('#1fa36a') }),
      svg('path', { d: 'M90,84 A14,14 0 0 1 118,84 Z', fill: f('#1fa36a') }),
      svg('rect', { x: 8, y: 80, width: 104, height: 30, fill: f('#f4e6c8') }),
      sil ? null : svg('path', { d: 'M30,110 V96 A9,9 0 0 1 48,96 V110 M72,110 V96 A9,9 0 0 1 90,96 V110', fill: '#2f6f5a' })); } },
  };
  const shapeSvg = (kind, sil, w) => svg('svg', { viewBox: '0 0 120 120', width: w, height: w, 'aria-hidden': 'true', class: 'by-shape' }, SHAPES[kind].draw(sil));

  function sparkle(host, x, y) {
    if (TI.reduced()) return;
    const cols = ['#ffd23f', '#ff9f1c', '#fff3b0', '#2f6fed', '#0e9f6e'];
    for (let i = 0; i < 12; i++) {
      const s = h('i', { class: 'by-spark', style: { left: x + 'px', top: y + 'px', background: cols[i % cols.length] } });
      host.append(s);
      const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4, d = 38 + Math.random() * 34;
      const an = s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d - 4) + 'px,' + (Math.sin(a) * d - 4) + 'px) scale(0.5)', opacity: 0 },
      ], { duration: 560, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }); // motion-ok: percikan perayaan singkat
      an.onfinish = () => s.remove();
    }
  }
  const tween = (ctx, ms, fn) => new Promise((res) => {
    let t = 0;
    ctx.loop((dt) => {
      t += Math.max(0, dt) * 1000;
      const p = Math.min(1, t / Math.max(1, ms));
      fn(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2); // ease-in-out untuk benda berpindah
      if (p >= 1) { res(); return false; }
    });
  });
  const T = (ms) => (TI.reduced() ? ms * 0.5 : ms);
  function nextBtn(parent, label) {
    return new Promise((resolve) => {
      const b = h('button', { type: 'button', class: 'ti-btn pop-in' }, label || 'Lanjut', ' ➜');
      b.addEventListener('click', () => { TI.sfx('tap'); b.disabled = true; resolve(); });
      parent.append(b);
    });
  }

  // ---------- TK: adegan lampu, benda, bayangan ----------
  function lampScene(kind, lit) {
    const root = svg('svg', { class: 'by-svg', viewBox: '0 0 400 230', role: 'img', 'aria-label': 'Lampu di kiri dan ' + SHAPES[kind].name.toLowerCase() + ' di tengah' });
    const defs = svg('defs', null,
      svg('linearGradient', { id: 'byCone', x1: 0, y1: 0, x2: 1, y2: 0 }, svg('stop', { offset: 0, 'stop-color': '#fff3b0', 'stop-opacity': 0.75 }), svg('stop', { offset: 1, 'stop-color': '#fff3b0', 'stop-opacity': 0.05 })),
      svg('radialGradient', { id: 'byBulb' }, svg('stop', { offset: 0, 'stop-color': '#fffbe0', 'stop-opacity': 1 }), svg('stop', { offset: 1, 'stop-color': '#ffd23f', 'stop-opacity': 0 })));
    const wall = svg('rect', { width: 400, height: 172, fill: '#cfe4fb' });
    const dark = svg('rect', { class: 'by-dark', width: 400, height: 172, fill: '#2a3556' });
    const floor = svg('rect', { y: 172, width: 400, height: 58, fill: '#e8c98f' });
    const floorLine = svg('rect', { y: 172, width: 400, height: 6, fill: '#d2ae6c' });
    const cone = svg('path', { class: 'by-cone', d: 'M64,74 L400,10 L400,190 L64,84 Z', fill: 'url(#byCone)' });
    const lamp = svg('g', null,
      svg('ellipse', { cx: 52, cy: 175, rx: 24, ry: 6, fill: '#7a869c' }),
      svg('rect', { x: 49, y: 92, width: 6, height: 84, fill: '#9aa5b8' }),
      svg('circle', { class: 'by-bulbglow', cx: 62, cy: 80, r: 34, fill: 'url(#byBulb)' }),
      svg('circle', { cx: 60, cy: 80, r: 10, fill: '#d5dce6', stroke: '#9aa5b8', 'stroke-width': 2 }),
      svg('circle', { class: 'by-bulbon', cx: 60, cy: 80, r: 10, fill: '#ffe066' }),
      svg('path', { d: 'M28,76 L40,44 L80,44 L92,76 Z', fill: '#ff8a1f', stroke: '#d96a00', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
    const obj = svg('g', { transform: 'translate(160 48)' }, SHAPES[kind].draw(false));
    const shadow = svg('g', { class: 'by-shadow', transform: 'translate(236 50) scale(1.05)' }, SHAPES[kind].draw(true));
    const objShadowFloor = svg('ellipse', { class: 'by-shadow', cx: 222, cy: 176, rx: 56, ry: 7, fill: SIL });
    root.append(defs, wall, dark, floor, floorLine, cone, shadow, objShadowFloor, lamp, obj);
    const box = h('div', { class: 'ti-scene by-scene' + (lit ? ' is-lit' : '') }, root);
    return { box, root, set(on) { box.classList.toggle('is-lit', on); } };
  }

  async function runMatch(ctx, kind) {
    ctx.ask('Mana bayangan ' + SHAPES[kind].name.toLowerCase() + '?');
    const sc = lampScene(kind, false);
    ctx.el.append(sc.box);
    const others = sample(Object.keys(SHAPES).filter((k) => k !== kind), 2);
    const opts = shuffle([kind, ...others]);
    const box = h('div', { class: 'ti-choices by-opts' });
    ctx.el.append(box);
    ctx.on(box, 'click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (opts[[...box.children].indexOf(b)] === kind) {
        sc.set(true); TI.sfx('klik');
        sparkle(sc.box, sc.box.clientWidth * 0.16, sc.box.clientHeight * 0.35);
      }
    });
    await ctx.choose({
      options: opts.map((k) => ({ value: k, node: shapeSvg(k, true, 80), say: SHAPES[k].name, aria: 'Bayangan ' + SHAPES[k].name.toLowerCase(), cls: 'is-big' })),
      answer: kind, into: box, speakLabel: false,
    });
    await ctx.wait(500);
  }

  async function runLampOff(ctx) {
    const kind = 'pohon';
    ctx.ask('Kalau lampu dimatikan, bayangannya?', { say: 'Kalau lampu dimatikan, bayangannya? Ketuk lampunya untuk mencoba.' });
    const sc = lampScene(kind, true);
    const lampBtn = h('button', { type: 'button', class: 'by-lampbtn', 'aria-label': 'Lampu. Ketuk untuk menyalakan atau mematikan' });
    let on = true;
    lampBtn.addEventListener('click', () => { on = !on; sc.set(on); TI.sfx(on ? 'klik' : 'tap'); });
    sc.box.append(lampBtn);
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(sc.box, box);
    await ctx.choose({
      options: shuffle(['Hilang', 'Makin besar', 'Berwarna']).map((v) => ({ value: v, label: v })),
      answer: 'Hilang', into: box,
    });
    sc.set(false);
    await ctx.sayWait('Tanpa cahaya, tidak ada bayangan.');
  }

  // ---------- SD: lab tiang bendera ----------
  const HP = 96, CX = 300, GY = 252, SR = 200, TH0 = 20;
  const theta = (v) => ((TH0 + (180 - 2 * TH0) * v / 100) * Math.PI) / 180;
  const lerpC = (a, b, k) => '#' + [0, 1, 2].map((i) => Math.round(parseInt(a.slice(1 + 2 * i, 3 + 2 * i), 16) * (1 - k) + parseInt(b.slice(1 + 2 * i, 3 + 2 * i), 16) * k).toString(16).padStart(2, '0')).join('');

  function makeLab(ctx) {
    const reduced = TI.reduced();
    const root = svg('svg', { class: 'by-svg', viewBox: '0 0 600 300', role: 'img', 'aria-label': 'Tiang bendera di tanah lapang dengan matahari di langit dan bayangan di tanah' });
    const sky = svg('rect', { width: 600, height: 222, fill: '#9bd6ff' });
    const hill = svg('path', { d: 'M0,222 Q120,196 240,214 T480,208 T600,216 V222 H0 Z', fill: '#7ccf7a' });
    const ground = svg('rect', { y: 218, width: 600, height: 82, fill: '#8bd47c' });
    const ground2 = svg('rect', { y: 218, width: 600, height: 8, fill: '#6fbf6a' });
    const clouds = [[90, 54, 1], [430, 90, 0.8]].map(([x, y, s]) => svg('g', { class: 'by-cloud', transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' },
      svg('path', { d: 'M0,16 a14,14 0 0 1 14,-14 a18,18 0 0 1 34,-4 a14,14 0 0 1 22,12 a10,10 0 0 1 -2,16 H8 a8,8 0 0 1 -8,-10 Z', fill: '#fff', opacity: 0.85 })));
    const sunG = svg('g', null,
      svg('circle', { r: 36, fill: '#ffe27a', opacity: 0.35 }),
      svg('circle', { r: 22, fill: '#ffc93c' }),
      svg('circle', { r: 22, fill: 'none', stroke: '#ffe27a', 'stroke-width': 3 }));
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      sunG.append(svg('line', { x1: mm(Math.cos(a) * 28), y1: mm(Math.sin(a) * 28), x2: mm(Math.cos(a) * 36), y2: mm(Math.sin(a) * 36), stroke: '#ffc93c', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
    }
    const shadowBase = svg('ellipse', { cx: CX, cy: GY, rx: 11, ry: 4.5, fill: '#1f2a1c', opacity: 0.4 });
    const shadow = svg('path', { d: '', fill: 'none', stroke: '#1f2a1c', 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.5 });
    const shadowTip = svg('path', { d: '', fill: 'none', stroke: '#1f2a1c', 'stroke-width': 17, 'stroke-linecap': 'round', opacity: 0.5 });
    const ray = svg('line', { stroke: '#ff9f1c', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round', opacity: 0.8 });
    const pole = svg('g', null,
      svg('ellipse', { cx: CX, cy: GY, rx: 13, ry: 5, fill: '#9aa5b8' }),
      svg('rect', { x: CX - 3, y: GY - HP, width: 6, height: HP, fill: '#d5dce6', stroke: '#9aa5b8', 'stroke-width': 1.5 }),
      svg('circle', { cx: CX, cy: GY - HP - 3, r: 5, fill: '#ffc93c' }),
      svg('path', { d: 'M' + (CX + 3) + ',' + (GY - HP + 2) + ' L' + (CX + 38) + ',' + (GY - HP + 10) + ' L' + (CX + 3) + ',' + (GY - HP + 26) + ' Z', fill: '#e5484d' }));
    const labelL = svg('text', { x: 18, y: 286, 'font-size': 18, 'font-weight': 800, fill: '#2d6a35', text: 'Timur' });
    const labelR = svg('text', { x: 582, y: 286, 'text-anchor': 'end', 'font-size': 18, 'font-weight': 800, fill: '#2d6a35', text: 'Barat' });
    const arcDots = svg('g', { opacity: 0.5 });
    for (let v = 0; v <= 100; v += 6.25) { const t = theta(v); arcDots.append(svg('circle', { cx: mm(CX - SR * Math.cos(t)), cy: mm(GY - SR * Math.sin(t)), r: 2.4, fill: '#fff' })); }
    root.append(sky, ...clouds, arcDots, hill, ground, ground2, sunG, shadowBase, shadow, shadowTip, ray, pole, labelL, labelR);
    const box = h('div', { class: 'ti-scene by-scene by-lab' }, root);
    const lab = {
      box, v: 15,
      shadowDx: (v) => HP / Math.tan(theta(v)),
      set(v) {
        lab.v = v;
        const t = theta(v), sx = CX - SR * Math.cos(t), sy = GY - SR * Math.sin(t), dx = HP / Math.tan(t);
        sunG.setAttribute('transform', 'translate(' + mm(sx) + ' ' + mm(sy) + ')');
        const x2 = CX + dx;
        shadow.setAttribute('d', 'M' + CX + ',' + GY + ' L' + mm(x2) + ',' + GY);
        const sg = dx >= 0 ? 1 : -1, tipLen = Math.min(30, Math.abs(dx));
        shadowTip.setAttribute('d', 'M' + mm(x2 - sg * tipLen) + ',' + GY + ' L' + mm(x2) + ',' + GY);
        const top = [CX, GY - HP], len = Math.hypot(dx, HP);
        ray.setAttribute('x1', mm(x2)); ray.setAttribute('y1', GY);
        ray.setAttribute('x2', mm(top[0] - (dx / len) * 70)); ray.setAttribute('y2', mm(top[1] - (HP / len) * 70));
        const el = Math.min(t, Math.PI - t), k = Math.max(0, Math.min(1, (el - (TH0 * Math.PI) / 180) / ((72 * Math.PI) / 180)));
        sky.setAttribute('fill', k < 0.4 ? lerpC('#ffc48a', '#b8e0ff', k / 0.4) : lerpC('#b8e0ff', '#6fc3ff', (k - 0.4) / 0.6));
        hill.setAttribute('fill', lerpC('#86bd66', '#7ccf7a', k));
      },
      hours(v) { return 6 + (12 * v) / 100; },
      period(v) { const hh = 6 + (12 * v) / 100; return hh < 10.5 ? 'pagi' : hh <= 14.5 ? 'siang' : 'sore'; },
      clock(v) {
        const hh = 6 + (12 * v) / 100, m = Math.round((hh % 1) * 60), H = Math.floor(hh) + (m === 60 ? 1 : 0);
        return 'Jam ' + String(H).padStart(2, '0') + '.' + String(m % 60).padStart(2, '0');
      },
    };
    if (!reduced) {
      let t = 0;
      ctx.loop((dt) => {
        t += dt;
        clouds.forEach((c, i) => { const base = i ? 430 : 90, y = i ? 90 : 54, s = i ? 0.8 : 1; c.setAttribute('transform', 'translate(' + mm(base + Math.sin(t * 0.25 + i * 2) * 26) + ' ' + y + ') scale(' + s + ')'); });
      });
    }
    lab.set(15);
    return lab;
  }

  const MORE = [
    { text: 'Geser matahari sampai bayangan paling pendek!', say: 'Geser matahari sampai bayangan paling pendek!', start: 14, fix: 50, ok: (v) => Math.abs(v - 50) <= 6,
      hint: 'Bayangan paling pendek saat matahari tepat di atas. Geser matahari ke tengah.', note: 'Siang hari matahari tepat di atas tiang, jadi bayangan paling pendek.' },
    { text: 'Buat bayangan mengarah ke kanan!', say: 'Buat bayangan mengarah ke kanan! Ini seperti hari masih pagi.', start: 76, fix: 16, ok: (v) => v <= 40,
      hint: 'Bayangan mengarah ke kanan kalau matahari ada di kiri. Geser matahari ke kiri.', note: 'Pagi hari matahari di timur, di sebelah kiri. Bayangan jatuh ke arah barat, di sebelah kanan.' },
    { text: 'Buat bayangan mengarah ke kiri!', say: 'Buat bayangan mengarah ke kiri! Ini seperti hari sudah sore.', start: 24, fix: 84, ok: (v) => v >= 60,
      hint: 'Bayangan mengarah ke kiri kalau matahari ada di kanan. Geser matahari ke kanan.', note: 'Sore hari matahari di barat, di sebelah kanan. Bayangan jatuh ke arah timur, di sebelah kiri.' },
  ];

  TI.register({
    id: 'bayangan',
    title: 'Cahaya & Bayangan',
    cat: 'sains',
    icon: '🔦',
    desc: 'Cocokkan bayangan benda dan geser matahari untuk mengubah bayangan.',
    start(ctx) {
      TI.style('bayangan', `
.play[data-game="bayangan"] .ti-scene { flex: none; width: min(100%, 560px, max(300px, calc((100dvh - 470px) * 1.9))); min-height: 0; background: #cfe4fb; }
.play[data-game="bayangan"] .by-scene.by-lab { aspect-ratio: 600 / 300; }
.play[data-game="bayangan"] .by-scene:not(.by-lab) { aspect-ratio: 400 / 230; }
.play[data-game="bayangan"] .by-svg { display: block; width: 100%; height: 100%; }
.play[data-game="bayangan"] .by-dark { opacity: 0.55; transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="bayangan"] .by-cone, .play[data-game="bayangan"] .by-bulbglow, .play[data-game="bayangan"] .by-bulbon, .play[data-game="bayangan"] .by-shadow { opacity: 0; transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="bayangan"] .is-lit .by-dark { opacity: 0; }
.play[data-game="bayangan"] .is-lit .by-cone { opacity: 0.8; }
.play[data-game="bayangan"] .is-lit .by-bulbglow, .play[data-game="bayangan"] .is-lit .by-bulbon { opacity: 1; }
.play[data-game="bayangan"] .is-lit .by-shadow { opacity: 0.55; }
.play[data-game="bayangan"] .by-opts { gap: 12px; }
.play[data-game="bayangan"] .by-opts .choice.is-big { padding: 8px; }
.play[data-game="bayangan"] .by-shape { display: block; max-width: 100%; height: auto; }
.play[data-game="bayangan"] .by-lampbtn { position: absolute; left: 3%; top: 12%; width: 24%; height: 70%; padding: 0; border: 3px dashed rgba(43, 45, 66, 0.35); border-radius: 18px; background: rgba(255, 255, 255, 0.1); cursor: pointer; }
.play[data-game="bayangan"] .by-lampbtn:active { background: rgba(255, 255, 255, 0.35); }
.play[data-game="bayangan"] .by-slide { display: grid; gap: 2px; width: 100%; max-width: 520px; }
.play[data-game="bayangan"] .by-slide .ti-slider { width: 100%; }
.play[data-game="bayangan"] .by-read { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; }
.play[data-game="bayangan"] .by-read b { color: var(--ink); }
.play[data-game="bayangan"] .by-msg { margin: 0; width: 100%; max-width: 560px; min-height: 1.4em; text-align: center; font-weight: 800; color: var(--muted); }
.play[data-game="bayangan"] .by-box { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 640px; }
.play[data-game="bayangan"] .by-spark { position: absolute; width: 9px; height: 9px; border-radius: 50%; pointer-events: none; z-index: 5; }
`);
      if (ctx.isTK) {
        const kinds = sample(Object.keys(SHAPES), 7);
        const tasks = [...kinds.map((k) => ({ t: 'match', k })), { t: 'lamp' }];
        ctx.series(tasks, (q) => (q.t === 'match' ? runMatch(ctx, q.k) : runLampOff(ctx)), {
          lesson: 'Bayangan terjadi saat cahaya terhalang benda. Kalau lampu mati, bayangan hilang.',
        });
        return;
      }

      // ===== SD =====
      return (async () => {
        const total = MORE.length + 3;
        let step = 0;
        const lab = makeLab(ctx);
        const readT = h('b', null, ''), readP = h('b', null, '');
        const slider = h('input', { type: 'range', class: 'ti-slider', min: 0, max: 100, step: 1, value: lab.v, 'aria-label': 'Geser matahari dari pagi sampai sore' });
        const ctl = h('label', { class: 'by-slide' }, h('span', { class: 'ti-label by-read' }, h('span', null, '☀️ Geser matahari'), h('span', null, readT, ' (', readP, ')')), slider);
        const msg = h('p', { class: 'by-msg', 'aria-live': 'polite' });
        const area = h('div', { class: 'by-box' });
        ctx.el.append(lab.box, ctl, msg, area);
        const show = (v) => { lab.set(v); readT.textContent = lab.clock(v); readP.textContent = lab.period(v); };
        const setV = (v) => { slider.value = String(Math.round(v)); show(v); };
        show(lab.v);
        ctx.on(slider, 'input', () => show(+slider.value));
        ctx.progress(0, total);

        // ----- tugas geser matahari -----
        for (const task of MORE) {
          if (!ctx.alive) return;
          ctx.ask(task.text, { say: task.say });
          msg.textContent = 'Geser slider, lepaskan, lalu lihat bayangan di tanah.';
          slider.disabled = false; ctl.hidden = false;
          await tween(ctx, T(350), (e) => setV(lab.v + (task.start - lab.v) * e));
          setV(task.start);
          await new Promise((resolve) => {
            let checks = 0, done = false;
            const onChange = async () => {
              if (done || slider.disabled) return;
              const v = +slider.value; show(v);
              if (task.ok(v)) { done = true; resolve(); return; }
              checks++;
              if (checks >= 4) {
                done = true; slider.disabled = true;
                await ctx.wrong(null, { say: 'Ayo kita bantu. Lihat, matahari bergeser ke tempat yang tepat.' });
                const v0 = +slider.value;
                await tween(ctx, T(700), (e) => setV(v0 + (task.fix - v0) * e));
                resolve();
                return;
              }
              msg.textContent = task.hint;
              await ctx.wrong(null, { say: task.hint });
            };
            ctx.on(slider, 'change', onChange);
          });
          msg.textContent = '';
          slider.disabled = true;
          sparkle(lab.box, lab.box.clientWidth * 0.5, lab.box.clientHeight * 0.45);
          await ctx.correct(null, { say: 'Hebat! Bayangannya sudah sesuai.' });
          ctx.note(task.note, { title: 'Ternyata', into: area });
          await nextBtn(area, 'Lanjut');
          area.replaceChildren();
          step++; ctx.progress(step, total);
        }

        // ----- tiga soal -----
        const questions = [
          { text: 'Pagi hari matahari di timur, bayangan mengarah ke?', opts: ['Barat', 'Timur', 'Atas'], ans: 'Barat', v: 14 },
          { text: 'Kapan bayangan paling pendek?', opts: ['Tengah hari', 'Pagi', 'Sore'], ans: 'Tengah hari', v: 30 },
          { text: 'Bayangan terjadi karena cahaya?', opts: ['Terhalang benda', 'Dipantulkan cermin', 'Berwarna-warni'], ans: 'Terhalang benda', v: 70 },
        ];
        for (const q of questions) {
          if (!ctx.alive) return;
          ctx.ask(q.text);
          slider.disabled = false;
          const v0 = +slider.value;
          await tween(ctx, T(400), (e) => setV(v0 + (q.v - v0) * e));
          const box = h('div', { class: 'ti-choices' + (q.opts.some((o) => o.length > 14) ? ' is-col' : '') });
          area.append(box);
          await ctx.choose({ options: shuffle(q.opts).map((o) => ({ value: o, label: o })), answer: q.ans, into: box });
          area.replaceChildren();
          step++; ctx.progress(step, total);
        }
        if (!ctx.alive) return;
        ctx.clear();
        ctx.progress(total, total);
        ctx.finish({ lesson: 'Bayangan terjadi saat cahaya terhalang benda. Bayangan selalu berlawanan arah dengan sumber cahaya.' });
      })();
    },
  });
})();
