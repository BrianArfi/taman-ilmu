/* 39 Lab Warna & Pelangi. Pot cat (merah, kuning, biru, dan putih untuk SD) dituang ke mangkuk campur.
   TK: kenali warna dasar, lalu campur sendiri dan namai hasilnya. SD: tebak lalu buktikan di lab, soal kebalikan,
   susun warna pelangi (pelangi tergambar bertahap), dan alasan pelangi muncul. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const HEX = { merah: '#e5303a', kuning: '#ffd43b', biru: '#2f6fed', putih: '#ffffff' };
  const NAME = { merah: 'merah', kuning: 'kuning', biru: 'biru', putih: 'putih' };
  const MAP = {
    merah: ['Merah', HEX.merah], kuning: ['Kuning', HEX.kuning], biru: ['Biru', HEX.biru],
    'kuning+merah': ['Jingga', '#ff8a1f'], 'biru+kuning': ['Hijau', '#2eae5b'], 'biru+merah': ['Ungu', '#8b4dde'],
    'biru+kuning+merah': ['Cokelat', '#8a5a34'],
  };
  function lighten(hex, k) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return '#' + c.map((v) => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0')).join('');
  }
  // Hasil campuran dari daftar warna pot (boleh berulang).
  function resultOf(list) {
    const set = [...new Set(list)];
    const base = set.filter((c) => c !== 'putih').sort();
    const white = set.includes('putih');
    if (!base.length) return { name: 'Putih', hex: '#ffffff' };
    const [name, hex] = MAP[base.join('+')];
    return white ? { name: name + ' muda', hex: lighten(hex, 0.55) } : { name, hex };
  }
  const keyOf = (list) => [...new Set(list)].sort().join('+');
  const joinNames = (list) => (list.length < 3 ? list.map((c) => NAME[c]).join(' dan ') : list.slice(0, -1).map((c) => NAME[c]).join(', ') + ', dan ' + NAME[list[list.length - 1]]);

  // ---------- gambar ----------
  function potSvg(c) {
    const col = HEX[c], edge = c === 'putih' ? '#c5cde0' : '#8d99ae';
    return svg('svg', { viewBox: '0 0 80 96', width: 84, height: 100, 'aria-hidden': 'true', class: 'wr-potsvg' },
      svg('path', { d: 'M10,34 Q40,-8 70,34', fill: 'none', stroke: edge, 'stroke-width': 3, 'stroke-linecap': 'round' }),
      svg('rect', { x: 8, y: 26, width: 64, height: 62, rx: 9, fill: '#e9edf5', stroke: edge, 'stroke-width': 3 }),
      svg('rect', { x: 8, y: 46, width: 64, height: 26, fill: col, stroke: c === 'putih' ? edge : 'none', 'stroke-width': 2 }),
      svg('ellipse', { cx: 40, cy: 26, rx: 32, ry: 9, fill: col, stroke: edge, 'stroke-width': 3 }),
      svg('path', { d: 'M54,31 q4,11 0,20', fill: 'none', stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round' }),
      svg('rect', { x: 14, y: 50, width: 6, height: 32, rx: 3, fill: '#fff', opacity: 0.55 }));
  }
  const potName = (c) => c.charAt(0).toUpperCase() + c.slice(1);

  function sparkle(host, x, y, cols) {
    if (TI.reduced()) return;
    const palette = cols || ['#ffd23f', '#e5303a', '#2f6fed', '#2eae5b', '#8b4dde'];
    for (let i = 0; i < 12; i++) {
      const s = h('i', { class: 'wr-spark', style: { left: x + 'px', top: y + 'px', background: palette[i % palette.length] } });
      host.append(s);
      const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4, d = 40 + Math.random() * 34;
      const an = s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d - 4) + 'px,' + (Math.sin(a) * d - 4) + 'px) scale(0.5)', opacity: 0 },
      ], { duration: 560, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }); // motion-ok: percikan perayaan singkat
      an.onfinish = () => s.remove();
    }
  }

  // ---------- lab: pot cat + mangkuk ----------
  function makeLab(ctx, withWhite) {
    const colors = withWhite ? ['merah', 'kuning', 'biru', 'putih'] : ['merah', 'kuning', 'biru'];
    const el = h('div', { class: 'wr-lab' });
    const potRow = h('div', { class: 'wr-pots' });
    const L = { el, list: [], onPour: null, busy: false };

    // mangkuk
    const layerA = svg('rect', { class: 'wr-liq', x: 10, y: 40, width: 200, height: 100, fill: '#fff' });
    const layerB = svg('rect', { class: 'wr-liq', x: 10, y: 40, width: 200, height: 100, fill: '#fff' });
    const bowlSvg = svg('svg', { class: 'wr-bowlsvg', viewBox: '0 0 220 150', role: 'img', 'aria-label': 'Mangkuk campur cat' },
      svg('defs', null, svg('clipPath', { id: 'wrClip' }, svg('path', { d: 'M14,50 Q14,128 110,137 Q206,128 206,50 Z' }))),
      svg('ellipse', { cx: 110, cy: 50, rx: 98, ry: 14, fill: '#d8deea' }),
      svg('g', { 'clip-path': 'url(#wrClip)' }, svg('rect', { x: 10, y: 40, width: 200, height: 100, fill: '#eef1f7' }), layerA, layerB),
      svg('path', { d: 'M10,50 Q10,132 110,141 Q210,132 210,50', fill: 'none', stroke: '#9fb0d6', 'stroke-width': 6, 'stroke-linecap': 'round' }),
      svg('ellipse', { cx: 110, cy: 50, rx: 100, ry: 15, fill: 'none', stroke: '#9fb0d6', 'stroke-width': 5 }),
      svg('path', { d: 'M28,70 Q32,108 58,124', fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.6 }));
    const bowl = h('div', { class: 'wr-bowl' }, bowlSvg);
    const nameEl = h('p', { class: 'wr-name', 'aria-live': 'polite' }, '');
    const clearBtn = h('button', { type: 'button', class: 'ti-btn is-ghost wr-clear' }, '🗑️ Kosongkan');
    const mix = h('div', { class: 'wr-mix' }, bowl, nameEl);
    el.append(potRow, mix, clearBtn);

    let cur = 0;
    const layers = [layerA, layerB];
    const levelOf = (n) => (n <= 0 ? 0.04 : Math.min(1, 0.32 + 0.24 * n));
    function paint() {
      const r = resultOf(L.list);
      const next = layers[1 - cur], prev = layers[cur];
      next.setAttribute('fill', r.hex);
      next.style.transform = 'scaleY(' + levelOf(L.list.length) + ')';
      prev.style.transform = 'scaleY(' + levelOf(L.list.length) + ')';
      next.style.opacity = L.list.length ? '1' : '0';
      prev.style.opacity = '0';
      cur = 1 - cur;
      return r;
    }
    layers.forEach((l) => { l.style.opacity = '0'; l.style.transform = 'scaleY(0.04)'; });

    // Setelah campuran jadi, pot dan tombol dikunci supaya warna di mangkuk tidak berubah saat anak menjawab.
    L.lock = () => {
      L.busy = true;
      Object.values(L.pots).forEach((p) => { p.btn.disabled = true; });
      clearBtn.hidden = true;
    };
    L.result = () => resultOf(L.list);
    L.pours = () => L.list.length;
    L.clear = () => {
      L.list = [];
      layers.forEach((l) => { l.style.opacity = '0'; l.style.transform = 'scaleY(0.04)'; });
      nameEl.textContent = '';
      nameEl.classList.remove('is-on');
    };
    L.shout = (r) => {
      nameEl.textContent = r.name + '!';
      nameEl.classList.add('is-on');
    };
    L.pop = () => {
      if (!TI.reduced()) bowl.animate([{ transform: 'scale(0.96)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }); // motion-ok: mangkuk memantul saat campuran jadi
      sparkle(el, el.clientWidth / 2, bowl.offsetTop + bowl.offsetHeight * 0.4, [resultOf(L.list).hex, '#ffd23f', '#fff']);
    };

    // satu tuangan: pot miring, tetes cat terbang ke mangkuk, lalu warna mangkuk berubah
    L.pour = async (c) => {
      const pot = L.pots[c];
      pot.btn.classList.add('is-pouring');
      ctx.sfx('splash');
      if (!TI.reduced()) {
        const a = el.getBoundingClientRect(), p = pot.btn.getBoundingClientRect(), b = bowl.getBoundingClientRect();
        const sx = p.left - a.left + p.width / 2, sy = p.top - a.top + p.height * 0.3;
        const ex = b.left - a.left + b.width / 2, ey = b.top - a.top + b.height * 0.42;
        const drop = h('i', { class: 'wr-drop', style: { background: HEX[c] } });
        el.append(drop);
        const an = drop.animate([
          { transform: 'translate(' + sx + 'px,' + sy + 'px) translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: 'translate(' + (sx + (ex - sx) * 0.5) + 'px,' + (Math.min(sy, ey) - 26) + 'px) translate(-50%,-50%) scale(1.1)', opacity: 1, offset: 0.45 },
          { transform: 'translate(' + ex + 'px,' + ey + 'px) translate(-50%,-50%) scale(0.8)', opacity: 0.95 },
        ], { duration: 380, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }); // motion-ok: tetes cat terbang ke mangkuk, gerak benda
        pot.btn.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(0deg)' }], { duration: 420, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }); // motion-ok: pot miring saat menuang
        await ctx.wait(330);
        an.onfinish = () => drop.remove();
        ctx.after(120, () => drop.remove());
      } else await ctx.wait(120);
      pot.btn.classList.remove('is-pouring');
      L.list.push(c);
      const r = paint();
      nameEl.classList.remove('is-on');
      nameEl.textContent = r.name;
      nameEl.classList.add('is-on');
    };

    L.pots = {};
    colors.forEach((c, i) => {
      const btn = h('button', { type: 'button', class: 'wr-pot pop-in', style: '--i:' + i, 'aria-label': 'Cat ' + c }, potSvg(c), h('span', { class: 'wr-potname' }, potName(c)));
      L.pots[c] = { btn };
      btn.addEventListener('click', async () => {
        if (L.busy) return;
        L.busy = true;
        ctx.say(potName(c));
        await L.pour(c);
        if (L.onPour) await L.onPour();
        L.busy = false;
      });
      potRow.append(btn);
    });
    clearBtn.addEventListener('click', () => { if (L.busy) return; ctx.sfx('tap'); L.clear(); });
    return L;
  }

  // Campur sampai sama dengan `need`. Salah (jumlah tuangan penuh tapi beda) = kosongkan; 3 kali salah = diisi otomatis.
  function mixUntil(ctx, lab, need) {
    const needKey = keyOf(need), needText = joinNames(need);
    return new Promise((resolve) => {
      let wrongs = 0;
      lab.onPour = async () => {
        if (keyOf(lab.list) === needKey) {
          lab.onPour = null;
          const r = lab.result();
          lab.shout(r); lab.pop(); ctx.sfx('benar');
          await ctx.sayWait(r.name + '!');
          await ctx.wait(500);
          resolve(false);
          return;
        }
        if (lab.pours() >= need.length) {
          wrongs++;
          if (wrongs >= 3) {
            lab.onPour = null;
            await ctx.wrong(null, { say: 'Ayo kita bantu. Lihat, kita campur ' + needText + '.' });
            lab.clear();
            for (const c of need) { await lab.pour(c); await ctx.wait(150); }
            const r = lab.result();
            lab.shout(r); lab.pop(); ctx.sfx('benar');
            await ctx.sayWait(r.name + '!');
            await ctx.wait(500);
            resolve(true);
            return;
          }
          await ctx.wrong(null, { say: 'Belum tepat. Kita perlu ' + needText + '. Kosongkan dulu, lalu coba lagi.' });
          lab.clear();
        }
      };
    });
  }

  // ---------- TK ----------
  const COLORQ = {
    merah: { good: [['🍎', 'Apel'], ['🍓', 'Stroberi']] },
    kuning: { good: [['🍌', 'Pisang'], ['🍋', 'Lemon']] },
    biru: { good: [['💧', 'Tetes air'], ['🫐', 'Buah blueberi']] },
  };
  const OTHERS = [['🥦', 'Brokoli'], ['🥕', 'Wortel'], ['🍇', 'Anggur']];
  async function runColorQ(ctx, c) {
    ctx.ask('Mana yang warnanya ' + c + '?');
    const good = TI.pick(COLORQ[c].good);
    const pool = [...Object.entries(COLORQ).filter(([k]) => k !== c).flatMap(([, v]) => v.good), ...OTHERS];
    const wrongs = sample(pool, 2);
    const sw = h('div', { class: 'wr-swatchbar', 'aria-hidden': 'true' }, h('i', { style: { background: HEX[c] } }));
    ctx.el.append(sw);
    await ctx.choose({
      options: shuffle([good, ...wrongs]).map(([e, n]) => ({ value: n, node: h('span', { class: 'wr-emo' }, e), say: n, aria: n, cls: 'is-big' })),
      answer: good[1], speakLabel: true,
    });
  }

  const swatchOpt = (name, hex) => ({
    value: name, say: name, aria: name, cls: 'wr-swopt',
    node: h('span', { class: 'wr-sw' }, h('i', { style: { background: hex } }), h('b', null, name)),
  });
  const TK_MIX = [
    { need: ['merah', 'kuning'], name: 'Jingga' }, { need: ['kuning', 'biru'], name: 'Hijau' }, { need: ['merah', 'biru'], name: 'Ungu' },
    { need: ['merah', 'kuning', 'biru'], name: 'Cokelat' },
  ];
  async function runMixTK(ctx, t) {
    const lab = makeLab(ctx, false);
    ctx.el.append(lab.el);
    ctx.ask('Campur ' + joinNames(t.need) + '! Ketuk pot catnya.');
    await mixUntil(ctx, lab, t.need);
    lab.lock();
    ctx.ask('Jadi warna apa?');
    const names = ['Jingga', 'Hijau', 'Ungu', 'Cokelat'];
    const opts = sample(names.filter((n) => n !== t.name), 2).concat(t.name);
    const box = h('div', { class: 'ti-choices' });
    ctx.el.append(box);
    await ctx.choose({ options: shuffle(opts).map((n) => swatchOpt(n, MAP[Object.keys(MAP).find((k) => MAP[k][0] === n)][1])), answer: t.name, into: box, speakLabel: true });
  }

  // ---------- SD ----------
  const PREDICT = [
    { q: 'Kuning + biru = ?', need: ['kuning', 'biru'], ans: 'Hijau', opts: ['Hijau', 'Ungu', 'Jingga', 'Cokelat'] },
    { q: 'Merah + biru = ?', need: ['merah', 'biru'], ans: 'Ungu', opts: ['Ungu', 'Hijau', 'Jingga', 'Cokelat'] },
    { q: 'Merah + kuning = ?', need: ['merah', 'kuning'], ans: 'Jingga', opts: ['Jingga', 'Hijau', 'Ungu', 'Cokelat'] },
    { q: 'Merah + kuning + biru = ?', need: ['merah', 'kuning', 'biru'], ans: 'Cokelat', opts: ['Cokelat', 'Hitam', 'Putih', 'Hijau'] },
    { q: 'Biru + putih = ?', need: ['biru', 'putih'], ans: 'Biru muda', opts: ['Biru muda', 'Biru tua', 'Ungu', 'Hijau'] },
  ];
  async function runPredict(ctx, t) {
    ctx.ask(t.q, { say: t.q.replace(/\+/g, 'ditambah').replace('=', 'sama dengan') + ' Tebak dulu!' });
    const box = h('div', { class: 'ti-choices is-grid2' });
    ctx.el.append(box);
    const guess = await new Promise((resolve) => {
      const btns = shuffle(t.opts).map((o, i) => {
        const b = h('button', { type: 'button', class: 'choice pop-in', style: '--i:' + i }, o);
        b.addEventListener('click', () => {
          if (btns.some((x) => x.disabled)) return;
          btns.forEach((x) => { x.disabled = true; });
          TI.sfx('tap'); ctx.say(o);
          resolve(o);
        });
        box.append(b);
        return b;
      });
    });
    box.remove();
    const tip = h('p', { class: 'wr-tip' }, 'Tebakanmu: ', h('b', null, guess));
    const lab = makeLab(ctx, true);
    ctx.el.append(tip, lab.el);
    ctx.ask('Buktikan! Campur ' + joinNames(t.need) + '.');
    await mixUntil(ctx, lab, t.need);
    lab.lock();
    if (guess === t.ans) await ctx.correct(null, { say: 'Tebakanmu benar!' });
    else await ctx.wrong(null, { say: 'Hasilnya ' + t.ans.toLowerCase() + '. Ayo ingat ya.' });
    await ctx.wait(400);
  }

  async function runReverse(ctx) {
    ctx.ask('Untuk membuat ungu, campur?');
    await ctx.choose({
      options: shuffle(['Merah dan biru', 'Kuning dan biru', 'Merah dan kuning']).map((v) => ({ value: v, label: v })),
      answer: 'Merah dan biru', layout: 'is-col',
    });
  }

  const RAINBOW = [
    ['Merah', '#e5303a'], ['Jingga', '#ff8a1f'], ['Kuning', '#ffd43b'], ['Hijau', '#2eae5b'], ['Biru', '#2f6fed'], ['Nila', '#3b2fa0'], ['Ungu', '#8b4dde'],
  ];
  function rainbowSvg() {
    const root = svg('svg', { class: 'wr-rainbow', viewBox: '0 0 300 160', role: 'img', 'aria-label': 'Pelangi' });
    const bands = RAINBOW.map(([, col], i) => {
      const r = 132 - i * 13;
      const p = svg('path', { class: 'wr-band', d: 'M' + (150 - r) + ',150 A' + r + ',' + r + ' 0 0 1 ' + (150 + r) + ',150', fill: 'none', stroke: col, 'stroke-width': 13, 'stroke-linecap': 'butt' });
      root.append(p);
      return p;
    });
    root.append(
      svg('path', { d: 'M8,150 a14,14 0 0 1 14,-14 a16,16 0 0 1 30,-2 a12,12 0 0 1 14,16 Z', fill: '#fff' }),
      svg('path', { d: 'M224,150 a12,12 0 0 1 14,-16 a16,16 0 0 1 30,2 a14,14 0 0 1 14,14 Z', fill: '#fff' }));
    return { root, bands };
  }
  async function runRainbow(ctx) {
    ctx.ask('Susun warna pelangi dari atas!', { say: 'Susun warna pelangi, mulai dari lapisan paling atas!' });
    const box = h('div', { class: 'wr-rbbox' });
    const rb = rainbowSvg();
    box.append(rb.root);
    ctx.el.append(box);
    const items = RAINBOW.map(([n, col]) => ({ label: n, say: n, node: h('span', { class: 'wr-chip', style: { background: col } }) }));
    await ctx.order({
      items, into: box, guide: 'after-wrong', label: 'Warna',
      onStep: (n) => { rb.bands[n - 1].classList.add('is-on'); if (n === items.length) ctx.sfx('menang'); },
    });
    ctx.note('Cara mudah mengingat warna pelangi: me-ji-ku-hi-bi-ni-u.', { title: 'Tahukah kamu?', into: box });
    await new Promise((resolve) => {
      const b = h('button', { type: 'button', class: 'ti-btn pop-in' }, 'Lanjut ➜');
      b.addEventListener('click', () => { TI.sfx('tap'); b.disabled = true; resolve(); });
      box.append(b);
    });
  }
  async function runWhy(ctx) {
    ctx.ask('Pelangi muncul karena?');
    await ctx.choose({
      options: shuffle(['Cahaya matahari dibiaskan titik-titik air hujan', 'Awan dicat', 'Angin bertiup kencang']).map((v) => ({ value: v, label: v })),
      answer: 'Cahaya matahari dibiaskan titik-titik air hujan', layout: 'is-col',
    });
  }

  TI.register({
    id: 'warna',
    title: 'Lab Warna & Pelangi',
    cat: 'sains',
    icon: '🎨',
    desc: 'Campur cat jadi warna baru dan susun warna pelangi.',
    start(ctx) {
      TI.style('warna', `
.play[data-game="warna"] .wr-lab { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; max-width: 640px; }
.play[data-game="warna"] .wr-pots { display: flex; justify-content: center; gap: 8px; width: 100%; }
.play[data-game="warna"] .wr-pot { flex: 0 1 112px; display: flex; flex-direction: column; align-items: center; gap: 0; min-width: 72px; padding: 6px 4px 8px; border: 3px solid var(--line); border-radius: 20px; background: var(--card); box-shadow: 0 4px 0 var(--shadow); cursor: pointer; transition: transform var(--dur-press) var(--ease-out), border-color var(--dur-ui) ease; }
.play[data-game="warna"] .wr-pot:active { transform: scale(0.96); }
.play[data-game="warna"] .wr-pot.is-pouring { border-color: var(--c); }
.play[data-game="warna"] .wr-potsvg { display: block; width: 100%; max-width: 84px; height: auto; }
.play[data-game="warna"] .wr-potname { font-weight: 800; font-size: 0.95rem; }
.play[data-game="warna"] .wr-mix { display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; }
.play[data-game="warna"] .wr-bowl { width: min(62%, 230px); transform-origin: 50% 80%; }
.play[data-game="warna"] .wr-bowlsvg { display: block; width: 100%; height: auto; }
.play[data-game="warna"] .wr-liq { transform-box: fill-box; transform-origin: 50% 100%; transition: transform var(--dur-ui-max) var(--ease-out), opacity var(--dur-ui) var(--ease-out); }
.play[data-game="warna"] .wr-name { margin: 0; min-height: 1.5em; font-size: 1.35rem; font-weight: 800; opacity: 0; transition: opacity var(--dur-ui) var(--ease-out); }
.play[data-game="warna"] .wr-name.is-on { opacity: 1; }
.play[data-game="warna"] .wr-clear { min-height: 52px; padding: 6px 20px; font-size: 1.05rem; }
.play[data-game="warna"] .wr-drop { position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.85); pointer-events: none; z-index: 6; }
.play[data-game="warna"] .wr-spark { position: absolute; width: 9px; height: 9px; border-radius: 50%; pointer-events: none; z-index: 7; }
.play[data-game="warna"] .wr-swatchbar { display: grid; place-items: center; }
.play[data-game="warna"] .wr-swatchbar i { display: block; width: 120px; height: 28px; border-radius: 999px; box-shadow: 0 3px 0 var(--shadow); }
.play[data-game="warna"] .wr-emo { font-size: 3.2rem; line-height: 1; }
.play[data-game="warna"] .wr-sw { display: flex; align-items: center; gap: 10px; }
.play[data-game="warna"] .wr-sw i { display: block; width: 38px; height: 38px; border-radius: 50%; border: 3px solid rgba(0, 0, 0, 0.12); flex: none; }
.play[data-game="warna"] .wr-sw b { font-size: 1.2rem; }
.play[data-game="warna"] .choice.wr-swopt { min-width: 150px; }
.play[data-game="warna"] .wr-tip { margin: 0; font-weight: 800; color: var(--muted); }
.play[data-game="warna"] .wr-tip b { color: var(--ink); }
.play[data-game="warna"] .wr-rbbox { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; max-width: 760px; }
.play[data-game="warna"] .wr-rainbow { display: block; width: min(100%, 300px); height: auto; }
.play[data-game="warna"] .wr-band { opacity: 0.12; transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="warna"] .wr-band.is-on { opacity: 1; }
.play[data-game="warna"] .wr-chip { display: block; width: 44px; height: 44px; border-radius: 12px; border: 3px solid rgba(0, 0, 0, 0.12); }
.play[data-game="warna"] .ti-order { max-width: 760px; }
`);
      let tasks;
      if (ctx.isTK) {
        tasks = [...shuffle(['merah', 'kuning', 'biru']).map((c) => ({ t: 'color', c })), ...shuffle(TK_MIX.slice(0, 3)).map((m) => ({ t: 'mix', m })), { t: 'mix', m: TK_MIX[3] }];
        ctx.series(tasks, (q) => (q.t === 'color' ? runColorQ(ctx, q.c) : runMixTK(ctx, q.m)), {
          lesson: 'Warna dasar merah, kuning, dan biru bisa dicampur menjadi warna-warna baru.',
        });
      } else {
        const first = shuffle(PREDICT.slice(0, 3));
        tasks = [...first.map((p) => ({ t: 'pred', p })), { t: 'pred', p: PREDICT[3] }, { t: 'pred', p: PREDICT[4] }, { t: 'rev' }, { t: 'rainbow' }, { t: 'why' }];
        ctx.series(tasks, (q) => (q.t === 'pred' ? runPredict(ctx, q.p) : q.t === 'rev' ? runReverse(ctx) : q.t === 'rainbow' ? runRainbow(ctx) : runWhy(ctx)), {
          lesson: 'Warna dasar merah, kuning, dan biru bisa dicampur menjadi warna-warna baru.',
        });
      }
    },
  });
})();
