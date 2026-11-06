/* 17 Ajaib Magnet. Tebak benda menempel atau tidak, lalu magnet SVG mendekat dan buktikan.
   SD: ditambah 2 soal kutub (tolak-menolak dan tarik-menarik) dengan dua magnet batang. Contoh menempel dulu, lalu yang sulit dan kutub. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  // Koordinat adegan (viewBox), diskalakan otomatis oleh SVG.
  const VW = 600, VH = 340;
  const IX = 170, IY = 200, HALF = 46; // posisi benda diam, setengah lebar benda
  const TIP_START = 488;               // ujung magnet saat mulai (badan magnet ke kanan)
  const TIP_NEAR = IX + HALF + 70;     // berhenti jarak 70 sebelum benda yang menempel
  const TIP_TOUCH = IX + HALF + 4;     // sampai menyentuh benda yang tidak menempel

  const RED = '#e5484d', BLUE = '#2f6fed', SILVER = '#dfe5ee', INK = '#2b2d42';

  const canAluminium = () => svg('g', { transform: 'translate(-30 -44)' },
    svg('rect', { x: 8, y: 10, width: 44, height: 72, rx: 8, fill: '#cfd6e0', stroke: '#8a94a6', 'stroke-width': 3 }),
    svg('rect', { x: 8, y: 34, width: 44, height: 24, fill: '#4aa3ff' }),
    svg('ellipse', { cx: 30, cy: 12, rx: 20, ry: 5, fill: '#eef1f6', stroke: '#8a94a6', 'stroke-width': 3 }),
    svg('rect', { x: 14, y: 16, width: 5, height: 58, rx: 2.5, fill: '#fff', opacity: 0.6 }));

  // Klip kertas digambar sendiri: emoji klip kertas di Windows 11 berbentuk tokoh bermata.
  const paperclip = () => svg('g', { transform: 'translate(-30 -45)' },
    svg('path', { d: 'M19,68 V26 A12,12 0 0 1 43,26 V66 A8,8 0 0 1 27,66 V34', fill: 'none', stroke: '#8a94a6', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    svg('path', { d: 'M19,68 V26 A12,12 0 0 1 43,26', fill: 'none', stroke: '#c3cad6', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));

  const ITEMS = [
    { id: 'paku', icon: '🔩', name: 'Paku besi', stick: true, why: 'Paku terbuat dari besi, jadi ditarik magnet.' },
    { id: 'peniti', icon: '🧷', name: 'Peniti', stick: true, why: 'Peniti terbuat dari baja, jadi ditarik magnet.' },
    { id: 'klip', draw: paperclip, name: 'Klip kertas', stick: true, why: 'Klip kertas terbuat dari besi, jadi ditarik magnet.' },
    { id: 'gunting', icon: '✂️', name: 'Bagian besi gunting', stick: true, why: 'Bagian besi gunting ditarik magnet.' },
    { id: 'kalengsusu', icon: '🥫', name: 'Kaleng susu', stick: true, why: 'Kaleng susu terbuat dari besi, jadi ditarik magnet.' },
    { id: 'kayu', icon: '🪵', name: 'Kayu', stick: false, why: 'Kayu bukan besi, jadi tidak ditarik magnet.' },
    { id: 'kertas', icon: '📄', name: 'Kertas', stick: false, why: 'Kertas bukan besi, jadi tidak ditarik magnet.' },
    { id: 'spons', icon: '🧽', name: 'Spons', stick: false, why: 'Spons bukan besi, jadi tidak ditarik magnet.' },
    { id: 'pensil', icon: '✏️', name: 'Pensil kayu', stick: false, why: 'Pensil terbuat dari kayu, jadi tidak ditarik magnet.' },
    { id: 'baju', icon: '👕', name: 'Baju kain', stick: false, why: 'Kain bukan besi, jadi tidak ditarik magnet.' },
    { id: 'gelas', icon: '🥛', name: 'Gelas kaca', stick: false, why: 'Kaca bukan besi, jadi tidak ditarik magnet.' },
    { id: 'sedotan', icon: '🥤', name: 'Sedotan plastik', stick: false, why: 'Plastik bukan besi, jadi tidak ditarik magnet.' },
    { id: 'emas', icon: '💍', name: 'Cincin emas', stick: false, sd: true, why: 'Emas bukan logam yang ditarik magnet.' },
    { id: 'alu', draw: canAluminium, name: 'Kaleng minuman aluminium', stick: false, sd: true, why: 'Aluminium adalah logam, tetapi tidak ditarik magnet.' },
  ];

  // ---------- gerak: tween berbasis ctx.loop, hanya mengubah atribut transform SVG ----------
  const ease = {
    out: (p) => 1 - Math.pow(1 - p, 4),
    io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  };
  function tween(ctx, ms, fn, kind) {
    const f = ease[kind || 'io'];
    return new Promise((res) => {
      let t = 0;
      ctx.loop((dt) => {
        t += Math.max(0, dt) * 1000; // dt pertama bisa sedikit negatif
        const p = Math.min(1, t / Math.max(1, ms));
        fn(f(p));
        if (p >= 1) { res(); return false; }
      });
    });
  }
  const T = (ms) => (TI.reduced() ? ms * 0.5 : ms); // gerak permainan tetap ada, hanya lebih singkat
  const place = (g, x, y, a) => {
    g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    if (a != null) g.setAttribute('opacity', a.toFixed(2));
  };

  // ---------- gambar ----------
  // Magnet U: lengan merah (U) di atas, biru (S) di bawah, ujung perak. Titik (0,0) = ujung, terbuka ke kiri.
  function magnetU() {
    const letter = (y, t) => svg('text', { x: 34, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 18, 'font-weight': 800, fill: '#fff', text: t });
    return svg('g', null,
      svg('path', { d: 'M64,-40 A40,40 0 0 1 104,0 L80,0 A16,16 0 0 0 64,-16 Z', fill: RED }),
      svg('path', { d: 'M104,0 A40,40 0 0 1 64,40 L64,16 A16,16 0 0 0 80,0 Z', fill: BLUE }),
      svg('rect', { x: 0, y: -40, width: 64, height: 24, fill: RED }),
      svg('rect', { x: 0, y: 16, width: 64, height: 24, fill: BLUE }),
      svg('rect', { x: 0, y: -40, width: 16, height: 24, fill: SILVER }),
      svg('rect', { x: 0, y: 16, width: 16, height: 24, fill: SILVER }),
      svg('rect', { x: 20, y: -37, width: 40, height: 5, rx: 2.5, fill: '#fff', opacity: 0.28 }),
      letter(-28, 'U'), letter(28, 'S'));
  }

  // Magnet batang 140 x 44. Titik (0,0) = pojok kiri tengah.
  function barMagnet(left, right) {
    const col = (p) => (p === 'U' ? RED : BLUE);
    const half = (x0, p, d) => svg('path', { d, fill: col(p) });
    const lt = (x, p) => svg('text', { x, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 26, 'font-weight': 800, fill: '#fff', text: p });
    return svg('g', null,
      half(0, left, 'M70,-22 H8 A8,8 0 0 0 0,-14 V14 A8,8 0 0 0 8,22 H70 Z'),
      half(70, right, 'M70,-22 H132 A8,8 0 0 1 140,-14 V14 A8,8 0 0 1 132,22 H70 Z'),
      svg('rect', { x: 8, y: -19, width: 124, height: 5, rx: 2.5, fill: '#fff', opacity: 0.25 }),
      lt(35, left), lt(105, right));
  }

  function sceneBase(label) {
    const root = svg('svg', { class: 'mg-svg', viewBox: '0 0 ' + VW + ' ' + VH, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': label },
      svg('defs', null,
        svg('linearGradient', { id: 'mgSky', x1: 0, y1: 0, x2: 0, y2: 1 },
          svg('stop', { offset: 0, 'stop-color': '#d6eeff' }), svg('stop', { offset: 1, 'stop-color': '#fff6e6' }))),
      svg('rect', { width: VW, height: VH, fill: 'url(#mgSky)' }),
      svg('rect', { x: 0, y: 250, width: VW, height: 90, fill: '#f0d3a0' }),
      svg('rect', { x: 0, y: 250, width: VW, height: 9, fill: '#d9a863' }),
      svg('path', { d: 'M0,296 H600 M0,326 H600', stroke: '#e2bd84', 'stroke-width': 3, fill: 'none' }));
    return root;
  }

  function buildItemScene(it) {
    const itemG = svg('g');
    itemG.append(it.draw ? it.draw() : svg('text', { x: 0, y: 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 88, text: it.icon }));
    const mag = magnetU();
    const root = sceneBase('Meja dengan ' + it.name + ' dan sebuah magnet');
    root.append(
      svg('text', { x: IX, y: 298, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 25, 'font-weight': 800, fill: INK, text: it.name }),
      itemG, mag);
    place(itemG, IX, IY, 0);
    place(mag, TIP_START, IY);
    return { box: h('div', { class: 'ti-scene mg-scene' }, root), itemG, mag };
  }

  // ---------- tombol tebakan ----------
  function askButtons(row, defs) {
    return new Promise((resolve) => {
      const btns = defs.map((d, i) => {
        const b = h('button', { type: 'button', class: 'choice pop-in', style: '--i:' + i, 'aria-label': d.label },
          h('span', { class: 'mg-ic', 'aria-hidden': 'true' }, d.icon), h('span', null, d.label));
        b.addEventListener('click', () => {
          if (btns.some((x) => x.disabled)) return;
          btns.forEach((x) => { x.disabled = true; });
          resolve({ def: d, btn: b, btns });
        });
        row.append(b);
        return b;
      });
    });
  }

  // Umpan balik tebakan: benar = pujian, salah = hitung salah tapi hasil tetap ditunjukkan.
  async function judge(ctx, pick, defs, correctValue) {
    const ok = pick.def.value === correctValue;
    const good = pick.btns[defs.findIndex((d) => d.value === correctValue)];
    if (ok) await ctx.correct(pick.btn, { prefix: ctx.isTK ? pick.def.label : '' });
    else {
      good.disabled = false; good.setAttribute('aria-disabled', 'true'); good.classList.add('is-correct');
      await ctx.wrong(pick.btn, { say: 'Belum tepat. Lihat apa yang terjadi ya.' });
    }
    return ok;
  }

  // ---------- satu benda ----------
  async function runItem(ctx, it) {
    ctx.ask('Apakah ' + it.name.toLowerCase() + ' menempel di magnet?');
    const sc = buildItemScene(it);
    ctx.el.append(sc.box);
    await tween(ctx, T(240), (e) => place(sc.itemG, IX, IY - (TI.reduced() ? 0 : (1 - e) * 26), e), 'out');

    const row = h('div', { class: 'mg-row' });
    ctx.el.append(row);
    const defs = [
      { value: true, icon: '🧲', label: 'Menempel' },
      { value: false, icon: '🚫', label: 'Tidak menempel' },
    ];
    const pick = await askButtons(row, defs);
    await judge(ctx, pick, defs, it.stick);

    // magnet mendekat
    const target = it.stick ? TIP_NEAR : TIP_TOUCH;
    await tween(ctx, T(850), (e) => place(sc.mag, TIP_START + (target - TIP_START) * e, IY));
    if (it.stick) {
      ctx.sfx('klik');
      const to = target - 40;
      await tween(ctx, T(300), (e) => place(sc.itemG, IX + (to - IX) * e, IY - (TI.reduced() ? 0 : Math.sin(Math.PI * e) * 36), 1));
      await ctx.wait(220);
      await tween(ctx, T(550), (e) => { const t = target + 62 * e; place(sc.mag, t, IY); place(sc.itemG, t - 40, IY, 1); });
    } else {
      await ctx.wait(520);
      await tween(ctx, T(550), (e) => place(sc.mag, target + (TIP_START - target) * e, IY));
    }

    row.remove();
    ctx.note(it.why, { title: it.stick ? 'Menempel!' : 'Tidak menempel.' });
    await ctx.next('Lanjut');
  }

  // ---------- soal kutub (SD) ----------
  const POLES = [
    { text: 'Kutub U didekatkan ke kutub U, apa yang terjadi?', bLeft: 'U', answer: 'tolak', why: 'Kutub yang sama tolak-menolak. U bertemu U, jadi magnet saling menjauh.' },
    { text: 'Kutub U didekatkan ke kutub S, apa yang terjadi?', bLeft: 'S', answer: 'tarik', why: 'Kutub yang berbeda tarik-menarik. U bertemu S, jadi magnet saling menempel.' },
  ];

  async function runPole(ctx, q) {
    ctx.ask(q.text);
    const A = barMagnet('S', 'U'), B = barMagnet(q.bLeft, q.bLeft === 'U' ? 'S' : 'U');
    const root = sceneBase('Dua magnet batang yang saling didekatkan');
    const cap = svg('text', { x: 300, y: 84, 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 800, fill: INK, opacity: 0, text: '' });
    root.append(
      svg('text', { x: 300, y: 296, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 22, 'font-weight': 800, fill: INK, text: 'Merah = kutub U, biru = kutub S' }),
      cap, A, B);
    const A0 = 70, B0 = 390, Y = 214;
    place(A, A0, Y); place(B, B0, Y);
    ctx.el.append(h('div', { class: 'ti-scene mg-scene' }, root));

    const row = h('div', { class: 'mg-row' });
    ctx.el.append(row);
    const defs = [
      { value: 'tolak', icon: '↔️', label: 'Tolak-menolak' },
      { value: 'tarik', icon: '🧲', label: 'Tarik-menarik' },
      { value: 'diam', icon: '➖', label: 'Tidak terjadi apa-apa' },
    ];
    const pick = await askButtons(row, defs);
    await judge(ctx, pick, defs, q.answer);

    // dua magnet saling mendekat
    const gap = q.answer === 'tolak' ? 76 : 60;
    await tween(ctx, T(600), (e) => { place(A, A0 + gap * e, Y); place(B, B0 - gap * e, Y); });
    if (q.answer === 'tarik') {
      ctx.sfx('klik');
      await tween(ctx, T(240), (e) => { place(A, A0 + gap + 30 * e, Y); place(B, B0 - gap - 30 * e, Y); });
    } else {
      ctx.sfx('pop');
      await tween(ctx, T(560), (e) => { place(A, A0 + gap * (1 - e), Y); place(B, B0 - gap * (1 - e), Y); });
    }
    cap.textContent = q.answer === 'tolak' ? 'Tolak-menolak!' : 'Tarik-menarik!';
    cap.setAttribute('fill', q.answer === 'tolak' ? RED : BLUE);
    cap.setAttribute('opacity', 1);

    row.remove();
    ctx.note(q.why, { title: 'Ternyata' });
    await ctx.next('Lanjut');
  }

  TI.register({
    id: 'magnet',
    title: 'Ajaib Magnet',
    cat: 'sains',
    icon: '🧲',
    desc: 'Tebak benda apa yang menempel di magnet, lalu buktikan.',
    start(ctx) {
      TI.style('magnet', `
.play[data-game="magnet"] .ti-scene { flex: none; width: min(100%, 600px); min-height: 0; aspect-ratio: 600 / 340; background: #eaf6ff; }
.play[data-game="magnet"] .mg-svg { display: block; width: 100%; height: 100%; }
.play[data-game="magnet"] .mg-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; width: 100%; max-width: 640px; }
.play[data-game="magnet"] .mg-row .choice { flex: 1 1 140px; max-width: 280px; flex-direction: column; gap: 4px; }
.play[data-game="magnet"] .mg-ic { font-size: 2.2rem; line-height: 1; }
`);
      let list;
      if (ctx.isTK) {
        // 3 menempel + 3 tidak, tanpa emas dan aluminium
        list = shuffle([
          ...sample(ITEMS.filter((i) => i.stick), 3),
          ...sample(ITEMS.filter((i) => !i.stick && !i.sd), 3),
        ]).map((it) => ({ kind: 'item', it, sulit: it.stick ? 0 : 1 })).sort((a, b) => a.sulit - b.sulit); // contoh menempel dulu
      } else {
        // 8 benda: 4 menempel, emas dan aluminium, 2 benda biasa yang tidak menempel
        const stick = sample(ITEMS.filter((i) => i.stick), 4);
        const tricky = ITEMS.filter((i) => i.sd);
        const plain = sample(ITEMS.filter((i) => !i.stick && !i.sd), 2);
        list = [...stick, ...plain, ...tricky].map((it) => ({ kind: 'item', it, sulit: it.sd ? 1 : 0 })).sort((a, b) => a.sulit - b.sulit); // gampang dulu
        list.push(...shuffle(POLES).map((q) => ({ kind: 'pole', q })));
      }
      let ke = 0; ctx.series(list, (task) => { ke++; if (ke === Math.ceil(list.length / 2)) ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' }); return task.kind === 'item' ? runItem(ctx, task.it) : runPole(ctx, task.q); }, {
        lesson: 'Magnet menarik benda dari besi dan baja. Kutub yang sama tolak-menolak, kutub berbeda tarik-menarik.',
      });
    },
  });
})();
