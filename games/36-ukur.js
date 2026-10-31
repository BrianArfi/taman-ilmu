/* 36 Ayo Mengukur. Benda digambar sendiri (SVG) dengan panjang bulat dalam cm.
   TK: bandingkan panjang, urutkan, hitung dengan klip (satuan tak baku).
   SD: baca penggaris dari angka 0, benda yang tidak mulai dari 0, geser penggaris sampai angka 0 pas, meter dan cm. */
(function () {
  const { h, svg, rand, pick, shuffle, sample, numChoices } = TI;

  // ---------- ukuran gambar (satuan viewBox) ----------
  const VW = 600;
  const X0 = 30;        // posisi angka 0 pada penggaris
  const U = 36;         // 1 cm = 36 satuan
  const CLIP = 88;      // lebar satu klip (satuan tak baku TK)
  const INK = '#2b2d42';

  // ---------- gambar benda: ujung kiri di x = 0, ujung kanan di x = W, pusat tegak di y = 0 ----------
  const f = (n) => Number(n.toFixed(1));
  const body = {
    pensil(W) {
      return svg('g', null,
        svg('rect', { x: 0, y: -11, width: 17, height: 22, rx: 6, fill: '#ff8fab' }),
        svg('rect', { x: 16, y: -11, width: 9, height: 22, fill: '#c3cad6' }),
        svg('rect', { x: 25, y: -11, width: f(W - 25 - 21), height: 22, fill: '#ffc93c' }),
        svg('rect', { x: 25, y: -9, width: f(W - 25 - 21), height: 4, fill: '#fff', opacity: 0.45 }),
        svg('path', { d: 'M' + f(W - 22) + ',-11 L' + W + ',0 L' + f(W - 22) + ',11 Z', fill: '#f1d3a5' }),
        svg('path', { d: 'M' + f(W - 8) + ',-3 L' + W + ',0 L' + f(W - 8) + ',3 Z', fill: INK }));
    },
    krayon(W, col) {
      const c = col || '#e5484d';
      return svg('g', null,
        svg('rect', { x: 0, y: -10, width: f(W - 11), height: 20, rx: 4, fill: c }),
        svg('rect', { x: 8, y: -10, width: 8, height: 20, fill: '#fff', opacity: 0.35 }),
        svg('rect', { x: f(W - 34), y: -10, width: 8, height: 20, fill: '#fff', opacity: 0.35 }),
        svg('path', { d: 'M' + f(W - 12) + ',-10 L' + W + ',0 L' + f(W - 12) + ',10 Z', fill: c }),
        svg('path', { d: 'M' + f(W - 12) + ',-10 L' + W + ',0 L' + f(W - 12) + ',10 Z', fill: '#000', opacity: 0.15 }));
    },
    penghapus(W) {
      return svg('g', null,
        svg('rect', { x: 0, y: -14, width: W, height: 28, rx: 8, fill: '#fff4f4', stroke: '#e3b6b6', 'stroke-width': 2 }),
        svg('rect', { x: 0, y: -14, width: f(W * 0.62), height: 28, rx: 8, fill: '#4aa3ff' }),
        svg('rect', { x: f(W * 0.62 - 10), y: -14, width: 10, height: 28, fill: '#4aa3ff' }));
    },
    kunci(W) {
      const g = svg('g', null,
        svg('circle', { cx: 14, cy: 0, r: 10.5, fill: 'none', stroke: '#d9a21b', 'stroke-width': 7 }),
        svg('rect', { x: 22, y: -3.5, width: f(W - 22), height: 7, rx: 3, fill: '#d9a21b' }));
      [W - 8, W - 20].forEach((x) => g.append(svg('rect', { x: f(x - 4), y: 3, width: 5, height: 9, fill: '#d9a21b' })));
      return g;
    },
    sendok(W) {
      return svg('g', null,
        svg('rect', { x: 0, y: -3.5, width: f(W - 28), height: 7, rx: 3.5, fill: '#b8c2d0' }),
        svg('ellipse', { cx: f(W - 18), cy: 0, rx: 18, ry: 12, fill: '#d5dce6', stroke: '#9aa6b8', 'stroke-width': 2.5 }),
        svg('ellipse', { cx: f(W - 21), cy: -3, rx: 9, ry: 4, fill: '#fff', opacity: 0.6 }));
    },
    sikat(W) {
      const g = svg('g', null,
        svg('rect', { x: 0, y: -7, width: f(W - 38), height: 14, rx: 7, fill: '#35c4a5' }),
        svg('rect', { x: f(W - 40), y: -4, width: 12, height: 8, fill: '#35c4a5' }),
        svg('rect', { x: f(W - 30), y: -6, width: 30, height: 12, rx: 4, fill: '#eef2f7', stroke: '#c3cad6', 'stroke-width': 2 }));
      for (let i = 0; i < 6; i++) g.append(svg('rect', { x: f(W - 28 + i * 4.6), y: -15, width: 3, height: 9, rx: 1.5, fill: '#4aa3ff' }));
      for (let i = 0; i < 4; i++) g.append(svg('circle', { cx: 14 + i * 10, cy: 0, r: 2, fill: '#fff', opacity: 0.6 }));
      return g;
    },
    daun(W) {
      return svg('g', null,
        svg('path', { d: 'M0,2 L12,0', stroke: '#7a5a2c', 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
        svg('path', { d: 'M10,0 C' + f(W * 0.3) + ',-22 ' + f(W * 0.7) + ',-22 ' + W + ',0 C' + f(W * 0.7) + ',22 ' + f(W * 0.3) + ',22 10,0 Z', fill: '#3fb950' }),
        svg('path', { d: 'M10,0 L' + f(W - 3) + ',0', stroke: '#1f8a3a', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    },
  };
  // Klip kertas digambar sendiri (emoji klip kertas dilarang). Lebar W, ujung kiri di 0.
  function paperclip(W, col) {
    const c = col || '#8a94a6';
    return svg('g', { transform: 'scale(' + f(W / 85) + ') translate(4.5 -2)' },
      svg('path', {
        d: 'M14,-5 L70,-5 A9,9 0 0 1 70,13 L8,13 A11,11 0 0 1 8,-9 L60,-9 A5,5 0 0 1 60,1 L28,1',
        fill: 'none', stroke: c, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }));
  }

  // nama, rentang panjang wajar (cm)
  const KINDS = {
    pensil: { name: 'pensil', range: [8, 15] },
    krayon: { name: 'krayon', range: [5, 9] },
    penghapus: { name: 'penghapus', range: [3, 5] },
    kunci: { name: 'kunci', range: [4, 8] },
    sendok: { name: 'sendok', range: [10, 14] },
    sikat: { name: 'sikat gigi', range: [11, 15] },
    daun: { name: 'daun', range: [5, 11] },
  };
  const CRAYON_COLORS = ['#e5484d', '#2f6fed', '#0e9f6e', '#9b4dde', '#ff8a1f'];
  // Gambar dibesarkan seragam (s) supaya tidak tipis di HP; panjang total tetap tepat W.
  const drawKind = (kind, W, col, s = 1) => svg('g', { transform: s === 1 ? null : 'scale(' + s + ')' }, body[kind](f(W / s), col));
  const lenIn = (kind) => rand(KINDS[kind].range[0], KINDS[kind].range[1]);

  // ---------- penggaris ----------
  // Badan penggaris kuning kayu; angka 0 berwarna hijau karena pengukuran selalu mulai dari 0.
  function ruler(top) {
    const g = svg('g', null,
      svg('rect', { x: X0 - 14, y: top, width: 15 * U + 28, height: 58, rx: 7, fill: '#ffd86b', stroke: '#c99a2e', 'stroke-width': 3 }),
      svg('rect', { x: X0 - 8, y: top + 4, width: 15 * U + 16, height: 5, rx: 2.5, fill: '#fff', opacity: 0.35 }));
    for (let i = 0; i <= 15; i++) {
      const x = X0 + i * U;
      g.append(svg('line', { x1: x, y1: top + 3, x2: x, y2: top + 23, stroke: '#7a5a00', 'stroke-width': i === 0 ? 3.5 : 2.4, 'stroke-linecap': 'round' }));
      if (i < 15) g.append(svg('line', { x1: x + U / 2, y1: top + 3, x2: x + U / 2, y2: top + 13, stroke: '#7a5a00', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
      g.append(svg('text', { x, y: top + 50, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: i === 0 ? '#0a7a52' : '#5c4300', text: String(i) }));
    }
    g.append(svg('text', { x: X0 + 15 * U + 10, y: top + 18, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 800, fill: '#7a5a00', text: 'cm' }));
    return g;
  }

  // ---------- bantu ----------
  function sparkle(host, x, y) {
    if (TI.reduced()) return;
    const cols = ['#ffd23f', '#ff6b6b', '#2f6fed', '#0e9f6e', '#9b4dde'];
    for (let i = 0; i < 10; i++) {
      const s = h('i', { class: 'uk-spark', style: { left: x + 'px', top: y + 'px', background: cols[i % cols.length] } });
      host.append(s);
      const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5, d = 34 + Math.random() * 30;
      const an = s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d - 4) + 'px,' + (Math.sin(a) * d - 4) + 'px) scale(0.6)', opacity: 0 },
      ], { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }); // motion-ok: percikan perayaan singkat
      an.onfinish = () => s.remove();
    }
  }
  const centerIn = (host, el) => {
    const a = host.getBoundingClientRect(), b = el.getBoundingClientRect();
    return [b.left - a.left + b.width / 2, b.top - a.top + b.height / 2];
  };
  const tween = (ctx, ms, fn) => new Promise((res) => {
    let t = 0;
    ctx.loop((dt) => {
      t += Math.max(0, dt) * 1000;
      const p = Math.min(1, t / Math.max(1, ms));
      fn(1 - Math.pow(1 - p, 3)); // ease-out
      if (p >= 1) { res(); return false; }
    });
  });
  const T = (ms) => (TI.reduced() ? ms * 0.5 : ms);
  const ucfirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Satu baris benda untuk tombol pilihan (TK): benda rata kiri pada garis awal, garis akhir muncul setelah benar.
  function rowNode(kind, cm, guideCm, col, maxCm) {
    const W = cm * 34, vw = 60 + maxCm * 34;
    const root = svg('svg', { viewBox: '0 0 ' + vw + ' 64', preserveAspectRatio: 'xMinYMid meet', 'aria-hidden': 'true', class: 'uk-rowsvg' });
    root.append(
      svg('line', { x1: 30, y1: 4, x2: 30, y2: 60, stroke: '#b9c3d6', 'stroke-width': 3, 'stroke-dasharray': '4 5' }),
      svg('line', { class: 'uk-guide', x1: 30 + guideCm * 34, y1: 2, x2: 30 + guideCm * 34, y2: 62, stroke: '#e5484d', 'stroke-width': 3.5, 'stroke-dasharray': '6 5' }));
    const g = svg('g', { transform: 'translate(30 32)' }, drawKind(kind, W, col, 1.5));
    root.append(g);
    return root;
  }

  // Pilih benda dari 2-3 benda yang berbeda panjang (selisih cukup jelas).
  function pickObjects(n, minGap) {
    for (let tries = 0; tries < 300; tries++) {
      const kinds = sample(Object.keys(KINDS), n);
      const lens = kinds.map(lenIn);
      const sorted = lens.slice().sort((a, b) => a - b);
      let ok = true;
      for (let i = 1; i < n; i++) if (sorted[i] - sorted[i - 1] < minGap) ok = false;
      if (ok) return kinds.map((k, i) => ({ kind: k, cm: lens[i], col: pick(CRAYON_COLORS) }));
    }
    const kinds = sample(Object.keys(KINDS), n);
    return kinds.map((k, i) => ({ kind: k, cm: 4 + i * (minGap + 2), col: pick(CRAYON_COLORS) }));
  }

  // ---------- TK: bandingkan ----------
  async function runCompare(ctx, t) {
    const objs = pickObjects(t.n, t.n === 2 ? 4 : 3);
    const isLong = t.mode === 'long';
    const goal = objs.reduce((a, b) => ((isLong ? b.cm > a.cm : b.cm < a.cm) ? b : a));
    const word = t.n === 2 ? (isLong ? 'lebih panjang' : 'lebih pendek') : (isLong ? 'paling panjang' : 'paling pendek');
    ctx.ask('Mana yang ' + word + '?');
    const maxCm = Math.max(...objs.map((o) => o.cm));
    const box = h('div', { class: 'ti-choices is-col uk-rows' });
    ctx.el.append(box);
    const options = objs.map((o, i) => ({
      value: i, say: KINDS[o.kind].name, aria: ucfirst(KINDS[o.kind].name), cls: 'uk-row',
      node: rowNode(o.kind, o.cm, goal.cm, o.col, maxCm),
    }));
    ctx.on(box, 'click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      const idx = [...box.children].indexOf(b);
      if (objs[idx] === goal) { box.classList.add('is-reveal'); const [x, y] = centerIn(box, b); sparkle(box, x, y); }
    });
    await ctx.choose({ options, answer: objs.indexOf(goal), into: box, speakLabel: true });
  }

  // ---------- TK: urutkan ----------
  async function runOrder(ctx) {
    const objs = pickObjects(3, 3).sort((a, b) => a.cm - b.cm);
    ctx.ask('Urutkan dari yang paling pendek!');
    const items = objs.map((o) => {
      const W = o.cm * 9;
      const node = svg('svg', { viewBox: '0 -20 ' + W + ' 40', width: W, height: 40, 'aria-hidden': 'true', class: 'uk-mini' }, drawKind(o.kind, W, o.col, 1.4));
      return { label: ucfirst(KINDS[o.kind].name), say: KINDS[o.kind].name, node };
    });
    await ctx.order({ items, guide: 'after-wrong', label: 'Urutan' });
  }

  // ---------- TK: hitung klip ----------
  async function runClips(ctx, n) {
    const o = { kind: pick(['pensil', 'krayon', 'sendok', 'sikat', 'kunci', 'daun']), col: pick(CRAYON_COLORS) };
    const W = n * CLIP;
    ctx.ask('Berapa klip panjang ' + KINDS[o.kind].name + ' ini?', { say: 'Berapa klip panjang ' + KINDS[o.kind].name + ' ini? Ketuk klipnya untuk menghitung.' });
    const VH = 190, vw = 2 * X0 + n * CLIP;
    const root = svg('svg', { class: 'uk-svg', viewBox: '0 0 ' + vw + ' ' + VH, role: 'img', 'aria-label': ucfirst(KINDS[o.kind].name) + ' dan klip kertas berjajar di bawahnya' },
      svg('rect', { width: vw, height: VH, fill: '#fffaf0' }),
      svg('line', { x1: X0, y1: 12, x2: X0, y2: 170, stroke: '#b9c3d6', 'stroke-width': 3, 'stroke-dasharray': '4 5' }),
      svg('line', { x1: X0 + W, y1: 12, x2: X0 + W, y2: 170, stroke: '#b9c3d6', 'stroke-width': 3, 'stroke-dasharray': '4 5' }),
      svg('g', { transform: 'translate(' + X0 + ' 52)' }, drawKind(o.kind, W, o.col, 1.6)));
    const nums = [], clips = [];
    for (let i = 0; i < n; i++) {
      const cg = svg('g', { transform: 'translate(' + (X0 + i * CLIP + 3) + ' 132)', class: 'uk-clipg' }, paperclip(CLIP - 6, '#8a94a6'));
      clips.push(cg);
      root.append(cg);
      const num = svg('text', { class: 'uk-num', x: X0 + i * CLIP + CLIP / 2, y: 98, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: '#e5484d', text: String(i + 1) });
      nums.push(num);
      root.append(num);
    }
    const scene = h('div', { class: 'ti-scene uk-scene' }, root);
    let counted = 0;
    for (let i = 0; i < n; i++) {
      const btn = h('button', {
        type: 'button', class: 'uk-clipbtn', 'aria-label': 'Klip ' + (i + 1), style: { left: ((X0 + i * CLIP) / vw * 100) + '%', width: (CLIP / vw * 100) + '%' },
      });
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        btn.disabled = true; counted++;
        nums[i].textContent = String(counted);
        nums[i].classList.add('is-on'); clips[i].classList.add('is-on');
        TI.sfx('pop'); ctx.say(String(counted));
      });
      scene.append(btn);
    }
    ctx.el.append(scene);
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(box);
    const r = await ctx.choose({
      options: numChoices(n, 3, 2, 7).map((v) => ({ value: v, node: h('span', null, String(v)), say: String(v), aria: v + ' klip', cls: 'is-big' })),
      answer: n, into: box, speakLabel: true,
    });
    scene.querySelectorAll('.uk-clipbtn').forEach((b) => { b.disabled = true; });
    nums.forEach((t, i) => { t.textContent = String(i + 1); t.classList.add('is-on'); });
    clips.forEach((c) => c.classList.add('is-on'));
    sparkle(scene, scene.clientWidth / 2, scene.clientHeight * 0.7);
    await ctx.sayWait(n + ' klip. Panjang ' + KINDS[o.kind].name + ' itu ' + n + ' klip.');
    return r;
  }

  // ---------- SD: bangun adegan penggaris ----------
  // obj: { kind, cm, col }, start: posisi ujung kiri benda (cm pada penggaris tetap)
  function measureScene(obj, startCm, opt = {}) {
    const VH = 176, objY = 38, rulerTop = 82;
    const root = svg('svg', { class: 'uk-svg', viewBox: '0 0 ' + VW + ' ' + VH, role: 'img', 'aria-label': ucfirst(KINDS[obj.kind].name) + ' di atas penggaris' },
      svg('rect', { width: VW, height: VH, fill: '#fffaf0' }));
    const W = obj.cm * U;
    const xL = X0 + startCm * U, xR = xL + W;
    const rulerG = svg('g', { class: 'uk-rulerg' }, ruler(rulerTop));
    const objG = svg('g', { transform: 'translate(' + xL + ' ' + objY + ')' }, drawKind(obj.kind, W, obj.col, 1.3));
    const guideL = svg('line', { x1: xL, y1: objY + 18, x2: xL, y2: rulerTop + 24, stroke: '#e5484d', 'stroke-width': 3, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' });
    const guideR = svg('line', { x1: xR, y1: objY + 18, x2: xR, y2: rulerTop + 24, stroke: '#e5484d', 'stroke-width': 3, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' });
    const ring = svg('circle', { class: 'uk-ring', cx: xR, cy: rulerTop + 45, r: 17, fill: 'none', stroke: '#e5484d', 'stroke-width': 4 });
    root.append(rulerG, objG, guideR, ring);
    if (opt.guideLeft) root.append(guideL);
    const scene = h('div', { class: 'ti-scene uk-scene' }, root);
    return {
      scene, root, rulerG, guideL, guideR, ring, xL, xR, rulerTop,
      shift(cm) { rulerG.setAttribute('transform', 'translate(' + f(cm * U) + ' 0)'); },
      reveal() { ring.classList.add('is-on'); },
    };
  }
  const readOptions = (ans) => numChoices(ans, 4, 1, 15).map((v) => ({ value: v, label: v + ' cm', say: v + ' sentimeter' }));

  async function runRead(ctx, t) {
    const obj = { kind: t.kind, cm: t.cm, col: pick(CRAYON_COLORS) };
    ctx.ask('Berapa cm panjang ' + KINDS[obj.kind].name + ' ini?', { say: 'Berapa sentimeter panjang ' + KINDS[obj.kind].name + ' ini?' });
    const sc = measureScene(obj, 0);
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(sc.scene, box);
    const r = await ctx.choose({ options: readOptions(obj.cm), answer: obj.cm, into: box });
    sc.reveal(); sparkle(sc.scene, (sc.xR / VW) * sc.scene.clientWidth, sc.scene.clientHeight * 0.75);
    await ctx.sayWait('Panjangnya ' + obj.cm + ' sentimeter. Ingat, mulai dari angka nol.');
    return r;
  }

  async function runOffset(ctx, t) {
    const obj = { kind: t.kind, cm: t.cm, col: pick(CRAYON_COLORS) };
    ctx.ask(ucfirst(KINDS[obj.kind].name) + ' ini tidak mulai dari angka 0. Berapa cm panjangnya?', {
      say: ucfirst(KINDS[obj.kind].name) + ' ini tidak mulai dari angka nol. Berapa sentimeter panjangnya?',
    });
    const sc = measureScene(obj, t.a, { guideLeft: true });
    const box = h('div', { class: 'ti-choices' });
    const tip = h('p', { class: 'uk-tip', 'aria-live': 'polite' }, 'Lihat angka di ujung kiri dan ujung kanan.');
    ctx.el.append(sc.scene, tip, box);
    const b = t.a + t.cm;
    const opts = [...new Set([t.cm, b, t.a, b + 1, Math.max(1, t.cm - 1), t.cm + 1])].filter((v) => v >= 1 && v <= 15);
    const choices = [t.cm, ...shuffle(opts.filter((v) => v !== t.cm)).slice(0, 3)];
    if (!choices.includes(b)) choices[1] = b;
    let wrongs = 0;
    const r = await ctx.choose({
      options: shuffle(choices).map((v) => ({ value: v, label: v + ' cm', say: v + ' sentimeter' })),
      answer: (v) => {
        const ok = v === t.cm;
        if (!ok && ++wrongs >= 1) tip.textContent = 'Kurangi angka di ujung kanan dengan angka di ujung kiri: ' + b + ' dikurangi ' + t.a + '.';
        return ok;
      },
      into: box,
    });
    sc.reveal(); sparkle(sc.scene, (sc.xR / VW) * sc.scene.clientWidth, sc.scene.clientHeight * 0.75);
    await ctx.sayWait(b + ' dikurangi ' + t.a + ' sama dengan ' + t.cm + '. Panjangnya ' + t.cm + ' sentimeter.');
    return r;
  }

  // Geser penggaris dengan slider sampai angka 0 tepat di ujung kiri benda.
  async function runSlide(ctx, t) {
    const obj = { kind: t.kind, cm: t.cm, col: pick(CRAYON_COLORS) };
    ctx.ask('Geser penggaris sampai angka 0 tepat di ujung kiri ' + KINDS[obj.kind].name + '!', {
      say: 'Geser penggaris sampai angka nol tepat di ujung kiri ' + KINDS[obj.kind].name + '!',
    });
    const sc = measureScene(obj, t.s, { guideLeft: true });
    let d = t.d0;
    sc.shift(d);
    const msg = h('p', { class: 'uk-tip', 'aria-live': 'polite' }, 'Geser slider ke kiri atau ke kanan.');
    const slider = h('input', { type: 'range', class: 'ti-slider', min: 0, max: 6, step: 1, value: d, 'aria-label': 'Geser penggaris' });
    const ctl = h('label', { class: 'uk-slide' }, h('span', { class: 'ti-label' }, '↔️ Geser penggaris'), slider);
    ctx.el.append(sc.scene, msg, ctl);

    await new Promise((resolve) => {
      let checks = 0, done = false;
      const finish = () => { done = true; slider.disabled = true; resolve(); };
      ctx.on(slider, 'input', () => { if (done) return; d = +slider.value; sc.shift(d); TI.sfx('klik'); });
      ctx.on(slider, 'change', async () => {
        if (done) return;
        d = +slider.value; sc.shift(d);
        if (d === t.s) { finish(); return; }
        checks++;
        const m = d < t.s ? 'Angka 0 masih di kiri ujung benda. Geser penggaris ke kanan.' : 'Angka 0 sudah lewat ujung benda. Geser penggaris ke kiri.';
        msg.textContent = m;
        if (checks >= 3) {
          done = true; slider.disabled = true;
          await ctx.wrong(null, { say: 'Ayo kita bantu. Lihat, angka nol sekarang pas di ujung benda.' });
          await tween(ctx, T(450), (e) => { const v = d + (t.s - d) * e; sc.shift(v); });
          d = t.s; slider.value = String(d);
          resolve();
          return;
        }
        await ctx.wrong(null, { say: m });
      });
    });
    msg.textContent = 'Angka 0 pas di ujung kiri. Sekarang baca angka di ujung kanan.';
    TI.sfx('benar');
    ctl.hidden = true;
    ctx.ask('Berapa cm panjang ' + KINDS[obj.kind].name + ' ini?', { say: 'Sekarang, berapa sentimeter panjang ' + KINDS[obj.kind].name + ' ini?' });
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(box);
    const r = await ctx.choose({ options: readOptions(obj.cm), answer: obj.cm, into: box });
    sc.reveal(); sparkle(sc.scene, (sc.xR / VW) * sc.scene.clientWidth, sc.scene.clientHeight * 0.75);
    await ctx.sayWait('Panjangnya ' + obj.cm + ' sentimeter.');
    return r;
  }

  // ---------- SD: meter dan cm ----------
  async function runMeter(ctx) {
    ctx.ask('1 meter sama dengan berapa cm?', { say: 'Satu meter sama dengan berapa sentimeter?' });
    const root = svg('svg', { class: 'uk-svg', viewBox: '0 0 ' + VW + ' 110', role: 'img', 'aria-label': 'Pita ukur sepanjang 1 meter' },
      svg('rect', { width: VW, height: 110, fill: '#fffaf0' }),
      svg('rect', { x: 20, y: 30, width: 560, height: 40, rx: 8, fill: '#ffd86b', stroke: '#c99a2e', 'stroke-width': 3 }));
    for (let i = 0; i <= 20; i++) {
      const x = 20 + i * 28;
      root.append(svg('line', { x1: x, y1: 30, x2: x, y2: i % 5 === 0 ? 56 : 44, stroke: '#7a5a00', 'stroke-width': i % 5 === 0 ? 3 : 2 }));
    }
    root.append(svg('text', { x: 300, y: 96, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: INK, text: '1 meter' }));
    const scene = h('div', { class: 'ti-scene uk-scene' }, root);
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(scene, box);
    const r = await ctx.choose({
      options: shuffle([{ value: 100, label: '100 cm', say: '100 sentimeter' }, { value: 10, label: '10 cm', say: '10 sentimeter' }, { value: 1000, label: '1.000 cm', say: '1000 sentimeter' }]),
      answer: 100, into: box,
    });
    ctx.note('1 meter sama dengan 100 cm. Penggaris kita 15 cm, jadi 1 meter hampir sama dengan 7 penggaris.', { title: 'Ingat' });
    await ctx.next('Lanjut');
    return r;
  }

  async function runCompareUnit(ctx) {
    ctx.ask('Mana yang lebih panjang: 1 meter atau 50 cm?', { say: 'Mana yang lebih panjang: satu meter atau lima puluh sentimeter?' });
    const bar = (w, col, label) => svg('g', null,
      svg('rect', { x: 20, y: 0, width: w, height: 34, rx: 9, fill: col }),
      svg('text', { x: 32, y: 18, 'dominant-baseline': 'central', 'font-size': 20, 'font-weight': 800, fill: '#fff', text: label }));
    const root = svg('svg', { class: 'uk-svg', viewBox: '0 0 ' + VW + ' 120', role: 'img', 'aria-label': 'Dua pita: satu panjangnya 1 meter, satu lagi 50 cm' },
      svg('rect', { width: VW, height: 120, fill: '#fffaf0' }));
    const g1 = svg('g', { transform: 'translate(0 22)', class: 'uk-bar' }, bar(560, '#2f6fed', '1 meter'));
    const g2 = svg('g', { transform: 'translate(0 70)', class: 'uk-bar' }, bar(280, '#e8590c', '50 cm'));
    g1.style.opacity = '0'; g2.style.opacity = '0';
    root.append(g1, g2);
    const scene = h('div', { class: 'ti-scene uk-scene' }, root);
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(box);
    const r = await ctx.choose({
      options: [{ value: 'm', label: '1 meter', say: 'satu meter' }, { value: 'cm', label: '50 cm', say: 'lima puluh sentimeter' }, { value: 'sama', label: 'Sama panjang', say: 'Sama panjang' }],
      answer: 'm', into: box,
    });
    ctx.el.insertBefore(scene, box);
    g1.style.opacity = '1'; g2.style.opacity = '1';
    await ctx.sayWait('1 meter sama dengan 100 sentimeter, jadi lebih panjang dari 50 sentimeter.');
    return r;
  }

  TI.register({
    id: 'ukur',
    title: 'Ayo Mengukur',
    cat: 'mat',
    icon: '📏',
    desc: 'Bandingkan panjang benda dan ukur dengan penggaris.',
    start(ctx) {
      TI.style('ukur', `
.play[data-game="ukur"] .ti-scene { flex: none; width: min(100%, 640px); min-height: 0; background: #fffaf0; }
.play[data-game="ukur"] .uk-svg { display: block; width: 100%; height: auto; }
.play[data-game="ukur"] .uk-rows { max-width: 640px; gap: 10px; position: relative; }
.play[data-game="ukur"] .choice.uk-row { min-height: 0; padding: 6px 10px; border-radius: 18px; }
.play[data-game="ukur"] .uk-rowsvg { display: block; width: 100%; height: auto; }
.play[data-game="ukur"] .uk-guide { opacity: 0; transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="ukur"] .uk-rows.is-reveal .uk-guide { opacity: 1; }
.play[data-game="ukur"] .uk-mini { display: block; max-width: 100%; height: auto; }
.play[data-game="ukur"] .uk-num { opacity: 0; transition: opacity var(--dur-ui) var(--ease-out); }
.play[data-game="ukur"] .uk-num.is-on { opacity: 1; }
.play[data-game="ukur"] .uk-clipg.is-on path { stroke: #2f6fed; }
.play[data-game="ukur"] .uk-clipbtn { position: absolute; bottom: 0; height: 52%; padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: 12px; }
.play[data-game="ukur"] .uk-clipbtn:disabled { cursor: default; }
.play[data-game="ukur"] .uk-clipbtn:active:not(:disabled) { background: rgba(47, 111, 237, 0.12); }
.play[data-game="ukur"] .uk-ring { opacity: 0; transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="ukur"] .uk-ring.is-on { opacity: 1; }
.play[data-game="ukur"] .uk-bar { transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="ukur"] .uk-tip { margin: 0; width: 100%; max-width: 640px; min-height: 1.4em; text-align: center; font-weight: 800; color: var(--muted); }
.play[data-game="ukur"] .uk-slide { display: grid; gap: 2px; width: 100%; max-width: 520px; }
.play[data-game="ukur"] .uk-slide .ti-slider { width: 100%; }
.play[data-game="ukur"] .uk-spark { position: absolute; width: 8px; height: 8px; border-radius: 50%; pointer-events: none; z-index: 5; }
.play[data-game="ukur"] .ti-order { max-width: 640px; }
`);

      let tasks;
      if (ctx.isTK) {
        tasks = [
          { t: 'cmp', n: 2, mode: 'long' }, { t: 'cmp', n: 2, mode: 'short' }, { t: 'cmp', n: 3, mode: 'short' },
          { t: 'cmp', n: 3, mode: 'long' }, { t: 'order' },
          { t: 'clip', n: rand(3, 4) }, { t: 'clip', n: rand(4, 5) }, { t: 'clip', n: rand(5, 6) },
        ];
      } else {
        const small = ['krayon', 'kunci', 'daun', 'penghapus'];
        const reads = sample(Object.keys(KINDS), 2).map((k) => ({ t: 'read', kind: k, cm: lenIn(k) }));
        const longKind = pick(['pensil', 'sendok', 'sikat']);
        const mkOffset = () => {
          const kind = pick(['krayon', 'kunci', 'daun']);
          const cm = lenIn(kind), a = rand(1, 3);
          return { t: 'off', kind, cm, a };
        };
        const sk = pick(small), s = rand(2, 4);
        let d0 = rand(0, 6); if (d0 === s) d0 = (s + 3) % 7;
        tasks = [
          reads[0], reads[1],
          { t: 'slide', kind: sk, cm: Math.min(lenIn(sk), 9), s, d0 },
          mkOffset(), mkOffset(),
          { t: 'read', kind: longKind, cm: lenIn(longKind) },
          { t: 'meter' }, { t: 'cmpunit' },
        ];
      }
      ctx.series(tasks, (task) => {
        if (task.t === 'cmp') return runCompare(ctx, task);
        if (task.t === 'order') return runOrder(ctx);
        if (task.t === 'clip') return runClips(ctx, task.n);
        if (task.t === 'read') return runRead(ctx, task);
        if (task.t === 'off') return runOffset(ctx, task);
        if (task.t === 'slide') return runSlide(ctx, task);
        if (task.t === 'meter') return runMeter(ctx);
        return runCompareUnit(ctx);
      }, { lesson: 'Saat mengukur, mulai dari angka 0 pada penggaris.' });
    },
  });
})();
