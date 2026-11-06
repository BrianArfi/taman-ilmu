/* 41 Siklus Air & Cuaca. Satu pemandangan SVG (laut, gunung, sungai, matahari, awan) yang hidup: uap naik, awan menggelap,
   hujan turun, sungai mengalir. SD: urutkan tahap siklus air (ctx.order), tiap tahap yang benar memutar animasinya, lalu 3 soal.
   TK: 6 soal cuaca bergambar, pemandangan ikut berubah (hujan, panas, petir, pelangi), di akhir siklus air diputar sambil dibacakan. */
(function () {
  const { h, svg, shuffle } = TI;

  const STAGES = [
    { name: 'Penguapan', icon: '♨️', text: 'Matahari memanaskan air laut menjadi uap air.', flags: { vapor: 1 } },
    { name: 'Pengembunan', icon: '☁️', text: 'Uap air naik dan berkumpul menjadi awan.', flags: { vapor: 1, cloud: 1 } },
    { name: 'Hujan', icon: '🌧️', text: 'Titik air di awan makin berat lalu jatuh.', flags: { vapor: 1, cloud: 1, dark: 1, rain: 1 } },
    { name: 'Aliran', icon: '🌊', text: 'Air hujan mengalir lewat sungai kembali ke laut.', flags: { vapor: 1, cloud: 1, dark: 1, rain: 1, river: 1 } },
  ];
  const sentence = (s) => s.name + ': ' + s.text.charAt(0).toLowerCase() + s.text.slice(1);

  const TK_Q = [
    { q: 'Hari hujan, kita bawa apa?', flags: { cloud: 1, dark: 1, rain: 1 }, opts: [['☂️', 'Payung', 1], ['🕶️', 'Kacamata hitam'], ['⚽', 'Bola']] },
    { q: 'Hari panas terik, kita pakai?', flags: { hot: 1 }, opts: [['🧢', 'Topi', 1], ['🧣', 'Syal'], ['🧤', 'Sarung tangan']] },
    { q: 'Hujan turun dari?', flags: { cloud: 1, dark: 1, rain: 1 }, opts: [['☁️', 'Awan', 1], ['☀️', 'Matahari'], ['🌳', 'Pohon']] },
    { q: 'Ada petir, kita sebaiknya?', flags: { cloud: 1, dark: 1, rain: 1, bolt: 1 }, opts: [['🏠', 'Masuk ke rumah', 1], ['🌳', 'Berteduh di bawah pohon'], ['⚽', 'Main bola di lapangan']] },
    { q: 'Setelah hujan kadang muncul?', flags: { rainbow: 1 }, opts: [['🌈', 'Pelangi', 1], ['❄️', 'Salju'], ['🔥', 'Api']] },
    { q: 'Panas matahari membuat air laut menjadi?', flags: { vapor: 1 }, opts: [['♨️', 'Uap air', 1], ['🧊', 'Es'], ['🪨', 'Batu']] },
  ];
  const SD_Q = [
    { q: 'Awan terbentuk dari?', opts: ['Uap air', 'Asap', 'Kapas'], answer: 'Uap air' },
    { q: 'Indonesia punya dua musim, yaitu?', opts: ['Musim hujan dan musim kemarau', 'Musim dingin dan musim panas', 'Musim salju dan musim semi'], answer: 'Musim hujan dan musim kemarau' },
    {
      q: "Doa ketika turun hujan: Allahumma shayyiban nafi'an. Artinya?",
      opts: ['Ya Allah, turunkanlah hujan yang bermanfaat', 'Ya Allah, hentikanlah hujan', 'Selamat pagi semuanya'],
      answer: 'Ya Allah, turunkanlah hujan yang bermanfaat',
      note: "Doa ketika turun hujan: Allahumma shayyiban nafi'an, artinya Ya Allah, turunkanlah hujan yang bermanfaat (HR. Bukhari).",
    },
  ];

  const CSS = `
.play[data-game="hujan"] .ti-scene { flex: none; width: min(100%, 520px); min-height: 0; aspect-ratio: 400 / 250; background: #bfe7ff; }
.play[data-game="hujan"] .hj-svg { display: block; width: 100%; height: 100%; }
.play[data-game="hujan"] .hj-fade { opacity: 0; transition: opacity 250ms var(--ease-out); }
.play[data-game="hujan"] .hj-fade.is-on { opacity: 1; }
.play[data-game="hujan"] .hj-rainbow.is-on { opacity: 0.85; }
.play[data-game="hujan"] .hj-dim { opacity: 0; transition: opacity 400ms var(--ease-out); } /* motion-ok: langit gelap pelan, bukan elemen antarmuka */
.play[data-game="hujan"] .hj-dim.is-on { opacity: 0.22; }
.play[data-game="hujan"] .hj-heat { opacity: 0; transition: opacity 400ms var(--ease-out); } /* motion-ok: langit menghangat pelan */
.play[data-game="hujan"] .hj-heat.is-on { opacity: 0.18; }
.play[data-game="hujan"] .hj-cloud { opacity: 0; transform: scale(0.95); transform-box: fill-box; transform-origin: 50% 100%; transition: opacity 300ms var(--ease-out), transform 300ms var(--ease-out); }
.play[data-game="hujan"] .hj-cloud.is-on { opacity: 1; transform: none; }
.play[data-game="hujan"] .hj-dark { opacity: 0; transition: opacity 400ms var(--ease-out); } /* motion-ok: awan menggelap pelan */
.play[data-game="hujan"] .hj-dark.is-on { opacity: 1; }
.play[data-game="hujan"] .hj-sun { transform-box: view-box; transform-origin: 58px 48px; transition: transform 250ms var(--ease-out); }
.play[data-game="hujan"] .hj-svg.is-hot .hj-sun { transform: scale(1.3); }
.play[data-game="hujan"] .hj-rays { transform-box: view-box; transform-origin: 58px 48px; animation: hj-spin 36s linear infinite; } /* motion-ok: sinar matahari berputar sangat pelan, hiasan */
@keyframes hj-spin { to { transform: rotate(360deg); } }
.play[data-game="hujan"] .hj-cap { margin: 0; width: min(100%, 520px); min-height: 3.2em; padding: 10px 14px; border-radius: 18px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.05rem; line-height: 1.3; text-align: center; }
.play[data-game="hujan"] .hj-cap b { color: var(--c); }
.play[data-game="hujan"] .hj-q { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.play[data-game="hujan"] .hj-btn { flex: 1 1 28%; min-width: 96px; max-width: 176px; min-height: 108px; padding: 8px 6px; }
.play[data-game="hujan"] .hj-opt { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.play[data-game="hujan"] .hj-em { font-size: 2.7rem; line-height: 1.1; }
.play[data-game="hujan"] .hj-opt small { font-size: 0.95rem; line-height: 1.1; font-weight: 800; }
.play[data-game="hujan"] .ti-piece { gap: 3px; }
.play[data-game="hujan"] .ti-piece .ti-lbl { order: 2; font-weight: 800; }
.play[data-game="hujan"] .ti-piece .hj-desc { order: 3; font-size: 0.82rem; font-weight: 700; line-height: 1.2; color: var(--muted); }
.play[data-game="hujan"] .ti-slot .hj-desc { display: none; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="hujan"] .hj-rays { animation: none; }
  .play[data-game="hujan"] .hj-cloud { transform: none; }
}
`;

  // ---------- pemandangan ----------
  function makeScene(ctx) {
    const reduced = TI.reduced();
    const arr = (n, f) => Array.from({ length: n }, (_, i) => f(i));
    const F = {};

    // awan: dua lapis (putih dan gelap) dengan bentuk sama
    const cloudShape = (fill) => svg('g', { fill },
      svg('circle', { cx: 6, cy: 24, r: 20 }), svg('circle', { cx: 34, cy: 12, r: 27 }), svg('circle', { cx: 64, cy: 18, r: 23 }),
      svg('circle', { cx: 88, cy: 28, r: 16 }), svg('rect', { x: -12, y: 26, width: 116, height: 18, rx: 9 }));
    const dark = svg('g', { class: 'hj-dark' }, cloudShape('#76839f'));
    const cloud = svg('g', { transform: 'translate(142 58)' }, svg('g', { class: 'hj-cloud' }, cloudShape('#ffffff'), dark));

    const tree = (x, y, s) => svg('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' },
      svg('rect', { x: -3, y: -14, width: 6, height: 14, fill: '#8b5a2b' }),
      svg('path', { d: 'M-16 -10 L0 -36 L16 -10 Z', fill: '#2f9e44' }),
      svg('path', { d: 'M-12 -26 L0 -50 L12 -26 Z', fill: '#37b24d' }));

    const riverD = 'M322 112 C316 130 300 140 296 158 C292 176 262 186 244 196 C226 206 204 200 184 206';
    const riverPath = svg('path', { d: riverD, fill: 'none', stroke: '#5bb8ff', 'stroke-width': 7, 'stroke-linecap': 'round' });
    let riverLen = 0;

    const sunRays = svg('g', { class: 'hj-rays' }, ...arr(12, (i) => {
      const a = (i * 30 * Math.PI) / 180;
      return svg('line', { x1: 58 + Math.cos(a) * 31, y1: 48 + Math.sin(a) * 31, x2: 58 + Math.cos(a) * 44, y2: 48 + Math.sin(a) * 44, stroke: '#ffc933', 'stroke-width': 4, 'stroke-linecap': 'round' });
    }));
    const sun = svg('g', { class: 'hj-sun' },
      svg('circle', { cx: 58, cy: 48, r: 38, fill: '#fff3a6', opacity: 0.45 }), sunRays,
      svg('circle', { cx: 58, cy: 48, r: 24, fill: 'url(#hjSun)', stroke: '#f3a400', 'stroke-width': 3 }));

    const rainbow = svg('g', { class: 'hj-fade hj-rainbow' }, ...['#ff595e', '#ff9f1c', '#ffd23f', '#52c41a', '#4aa3ff'].map((col, i) => {
      const r = 104 - i * 7;
      return svg('path', { d: 'M' + (130 - r) + ' 190 A' + r + ' ' + r + ' 0 0 1 ' + (130 + r) + ' 190', fill: 'none', stroke: col, 'stroke-width': 7 });
    }));

    const bolt = svg('path', { d: 'M212 100 L196 128 L208 128 L198 152 L224 120 L212 120 L222 100 Z', fill: '#ffe14d', stroke: '#f0b400', 'stroke-width': 2, 'stroke-linejoin': 'round', opacity: 0 });
    const waves = arr(3, (i) => svg('path', { d: 'M' + (10 + i * 22) + ' ' + (192 + i * 18) + ' q10 -7 20 0 t20 0 t20 0 t20 0', fill: 'none', stroke: '#e6f6ff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }));

    // partikel
    const vap = arr(9, (i) => ({ el: svg('circle', { r: 5 + (i % 3) * 1.6, fill: '#ffffff', opacity: 0 }), x0: 22 + i * 15, cx: 172 + (i % 5) * 16, ph: i * 0.8, sp: 0.13 + (i % 3) * 0.03, t: i / 9 }));
    const drops = arr(20, (i) => ({
      el: svg('line', { x1: 0, y1: 0, x2: -2, y2: 9, stroke: '#3b9cf5', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0 }),
      x: 150 + ((i * 47) % 88), y: 106 + ((i * 29) % 68), v: 150 + (i % 5) * 14, gy: 176 + (i % 4) * 4,
    }));
    const splash = arr(20, () => ({ el: svg('ellipse', { rx: 3, ry: 1.2, fill: 'none', stroke: '#eaf7ff', 'stroke-width': 1.6, opacity: 0 }), life: 0, x: 0, y: 0 }));
    const flow = arr(8, (i) => ({ el: svg('circle', { r: 2.6, fill: '#ffffff', opacity: 0 }), t: i / 8 }));

    const root = svg('svg', { class: 'hj-svg', viewBox: '0 0 400 250', role: 'img', 'aria-label': 'Pemandangan laut di kiri, gunung di kanan, sungai, matahari, dan langit' },
      svg('defs', null,
        svg('linearGradient', { id: 'hjSky', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('stop', { offset: 0, 'stop-color': '#7fcbff' }), svg('stop', { offset: 1, 'stop-color': '#e3f5ff' })),
        svg('linearGradient', { id: 'hjSea', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('stop', { offset: 0, 'stop-color': '#5fc0ff' }), svg('stop', { offset: 1, 'stop-color': '#2b7fe0' })),
        svg('linearGradient', { id: 'hjLand', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('stop', { offset: 0, 'stop-color': '#8ad46c' }), svg('stop', { offset: 1, 'stop-color': '#5eae4c' })),
        svg('radialGradient', { id: 'hjSun', cx: '40%', cy: '35%', r: '70%' }, svg('stop', { offset: 0, 'stop-color': '#fff6b0' }), svg('stop', { offset: 1, 'stop-color': '#ffd23f' }))),
      svg('rect', { width: 400, height: 250, fill: 'url(#hjSky)' }),
      rainbow, sun,
      // gunung
      svg('polygon', { points: '214,200 268,118 292,142 336,66 372,128 400,108 400,200', fill: '#8d99ae' }),
      svg('polygon', { points: '336,66 372,128 400,108 400,200 340,200', fill: '#7a869e' }),
      svg('polygon', { points: '336,66 321,94 331,90 338,100 346,90 355,97', fill: '#ffffff' }),
      // laut
      svg('path', { d: 'M0 174 H184 L196 250 H0 Z', fill: 'url(#hjSea)' }), ...waves,
      // daratan
      svg('path', { d: 'M176 186 Q188 184 202 180 L400 174 V250 H198 Q180 226 176 186 Z', fill: 'url(#hjLand)' }),
      riverPath, svg('path', { d: riverD, fill: 'none', stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.45 }),
      tree(362, 214, 1), tree(384, 204, 0.8), tree(262, 228, 0.9), tree(222, 240, 0.7),
      svg('text', { x: 14, y: 240, 'font-size': 14, 'font-weight': 800, fill: '#fff', stroke: '#2b6fc0', 'stroke-width': 3, 'paint-order': 'stroke', text: 'Laut' }),
      svg('text', { x: 346, y: 52, 'font-size': 14, 'font-weight': 800, fill: '#fff', stroke: '#5d6b86', 'stroke-width': 3, 'paint-order': 'stroke', 'text-anchor': 'middle', text: 'Gunung' }),
      svg('text', { x: 300, y: 224, 'font-size': 14, 'font-weight': 800, fill: '#fff', stroke: '#2b6fc0', 'stroke-width': 3, 'paint-order': 'stroke', 'text-anchor': 'middle', text: 'Sungai' }),
      svg('rect', { class: 'hj-dim', width: 400, height: 250, fill: '#1d2b4a' }),
      svg('rect', { class: 'hj-heat', width: 400, height: 250, fill: '#ff8a1f' }),
      ...flow.map((p) => p.el), ...vap.map((p) => p.el),
      cloud, bolt,
      ...splash.map((p) => p.el), ...drops.map((p) => p.el));

    const box = h('div', { class: 'ti-scene' }, root);
    const dim = root.querySelector('.hj-dim'), heat = root.querySelector('.hj-heat');
    const cloudEl = root.querySelector('.hj-cloud'), darkEl = root.querySelector('.hj-dark');

    function update(dt, now) {
      // uap naik dari laut menuju awan
      const lim = F.cloud ? 1 : 0.6;
      vap.forEach((p) => {
        if (!F.vapor) { p.el.setAttribute('opacity', 0); return; }
        p.t += dt * p.sp; if (p.t >= lim) p.t -= lim;
        const x = p.x0 + (p.cx - p.x0) * p.t + Math.sin(p.t * 7 + p.ph) * 5, y = 172 - 98 * p.t;
        p.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
        p.el.setAttribute('opacity', (Math.sin(Math.PI * Math.min(1, p.t / lim)) * 0.9).toFixed(2));
      });
      // hujan
      drops.forEach((d, i) => {
        const s = splash[i];
        if (F.rain) {
          d.y += d.v * dt;
          if (d.y >= d.gy) { s.life = 0.35; s.x = d.x; s.y = d.gy; d.y = 104 + Math.random() * 4; d.x = 150 + Math.random() * 88; }
          d.el.setAttribute('transform', 'translate(' + d.x.toFixed(1) + ' ' + d.y.toFixed(1) + ')');
          d.el.setAttribute('opacity', 0.9);
        } else d.el.setAttribute('opacity', 0);
        if (s.life > 0) {
          s.life = Math.max(0, s.life - dt);
          const k = 1 - s.life / 0.35;
          s.el.setAttribute('transform', 'translate(' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) + ')');
          s.el.setAttribute('rx', (2 + 6 * k).toFixed(1)); s.el.setAttribute('ry', (0.8 + 2 * k).toFixed(1));
          s.el.setAttribute('opacity', (0.8 * (1 - k)).toFixed(2));
        } else s.el.setAttribute('opacity', 0);
      });
      // sungai mengalir
      flow.forEach((p) => {
        if (!F.river) { p.el.setAttribute('opacity', 0); return; }
        p.t = (p.t + dt * 0.14) % 1;
        if (!riverLen) riverLen = riverPath.getTotalLength();
        const pt = riverPath.getPointAtLength(p.t * riverLen);
        p.el.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
        p.el.setAttribute('opacity', 0.95);
      });
      bolt.setAttribute('opacity', F.bolt ? (now % 1700 < 220 ? 1 : 0) : 0); // kilat pelan, kurang dari satu kali per detik
      waves.forEach((w, i) => w.setAttribute('transform', 'translate(' + (reduced ? 0 : Math.sin(now / 700 + i * 1.7) * 6).toFixed(1) + ' 0)'));
    }

    const scene = {
      box,
      set(flags) {
        Object.keys(F).forEach((k) => delete F[k]);
        Object.assign(F, flags);
        cloudEl.classList.toggle('is-on', !!F.cloud);
        darkEl.classList.toggle('is-on', !!F.dark);
        dim.classList.toggle('is-on', !!F.dark);
        heat.classList.toggle('is-on', !!F.hot);
        rainbow.classList.toggle('is-on', !!F.rainbow);
        root.classList.toggle('is-hot', !!F.hot);
        if (reduced) update(0, 0); // gerak dikurangi: tampilan diam
      },
    };
    update(0, 0);
    if (!reduced) ctx.loop((dt, now) => update(dt, now));
    return scene;
  }

  TI.register({
    id: 'hujan',
    title: 'Siklus Air & Cuaca',
    cat: 'sains',
    icon: '🌧️',
    desc: 'Lihat air naik jadi awan, turun jadi hujan, lalu kembali ke laut.',
    start(ctx) {
      TI.style('hujan', CSS);
      const scene = makeScene(ctx);
      const cap = h('p', { class: 'hj-cap', 'aria-live': 'polite' });
      const qbox = h('div', { class: 'hj-q' });
      ctx.el.append(scene.box, cap, qbox);

      const showStage = (i) => {
        const s = STAGES[i];
        scene.set(s.flags);
        cap.hidden = false;
        cap.replaceChildren(h('b', null, (i + 1) + '. ' + s.name + ': '), s.text);
      };

      return (async () => {
        if (ctx.isSD) {
          // ===== babak 1: urutkan tahap siklus air =====
          const total = STAGES.length + SD_Q.length;
          cap.textContent = 'Ketuk tahap siklus air dari yang pertama. Lihat apa yang terjadi di pemandangan!';
          ctx.ask('Urutkan tahap siklus air, mulai dari yang pertama.');
          await ctx.order({
            into: qbox,
            label: 'Tahap',
            guide: 'after-wrong',
            items: STAGES.map((s) => ({
              icon: s.icon, label: s.name, say: sentence(s),
              node: h('span', { class: 'hj-desc' }, s.text),
            })),
            onStep: (done) => { showStage(done - 1); ctx.sfx('pop'); ctx.progress(done, total); },
          });
          if (!ctx.alive) return;
          qbox.replaceChildren();
          cap.textContent = 'Air terus berputar: menguap, menjadi awan, turun sebagai hujan, lalu mengalir kembali ke laut.'; if (ctx.alive) ctx.correct(null, { say: 'Bagus! Lanjut ke babak soal!' });

          // ===== babak 2: soal =====
          for (let i = 0; i < SD_Q.length && ctx.alive; i++) {
            const q = SD_Q[i];
            ctx.progress(STAGES.length + i, total);
            qbox.replaceChildren();
            ctx.ask(q.q);
            const wrap = h('div', { class: 'ti-choices is-col' });
            qbox.append(wrap);
            await ctx.choose({ options: shuffle(q.opts), answer: q.answer, layout: 'is-col', into: wrap });
            if (q.note) {
              ctx.note(q.note, { title: 'Doa hujan', into: qbox });
              await ctx.next('Lanjut');
            }
          }
          if (!ctx.alive) return;
          ctx.progress(total, total);
          ctx.finish({ stars: ctx.mistakes <= 1 ? 3 : ctx.mistakes <= 4 ? 2 : 1, lesson: 'Air di bumi terus berputar: menguap, menjadi awan, turun sebagai hujan, lalu mengalir kembali ke laut.' });
          return;
        }

        // ===== TK: 6 soal cuaca bergambar =====
        const total = TK_Q.length + 1;
        for (let i = 0; i < TK_Q.length && ctx.alive; i++) {
          const q = TK_Q[i];
          ctx.progress(i, total);
          qbox.replaceChildren();
          scene.set(q.flags);
          cap.hidden = true;
          ctx.ask(q.q);
          const wrap = h('div', { class: 'ti-choices' });
          qbox.append(wrap);
          const options = shuffle(q.opts).map(([em, label, ok]) => ({
            node: h('span', { class: 'hj-opt' }, h('span', { class: 'hj-em', 'aria-hidden': 'true' }, em), h('small', null, label)),
            value: ok ? 'benar' : label, say: label, aria: label, cls: 'hj-btn',
          }));
          await ctx.choose({ options, answer: 'benar', into: wrap, speakLabel: true });
        }
        if (!ctx.alive) return;
        // penutup: siklus air diputar otomatis sambil dibacakan
        ctx.progress(TK_Q.length, total);
        qbox.replaceChildren();
        ctx.ask('Lihat, ini perjalanan air!', { speak: false });
        await ctx.sayWait('Lihat, ini perjalanan air!'); if (ctx.alive) ctx.correct(null, { say: 'Bagus! Sekarang lihat tahapnya satu-satu!' });
        for (let i = 0; i < STAGES.length && ctx.alive; i++) {
          showStage(i);
          await ctx.sayWait(sentence(STAGES[i]));
          await ctx.wait(500);
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({ stars: ctx.mistakes <= 1 ? 3 : ctx.mistakes <= 3 ? 2 : 1, lesson: 'Air di bumi terus berputar: menguap, menjadi awan, turun sebagai hujan, lalu mengalir kembali ke laut.' });
      })();
    },
  });
})();
