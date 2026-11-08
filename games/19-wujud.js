/* 19 Es, Air, Uap. Bagian 1: lab panas dingin (kompor, gelas, termometer) dengan tugas mencair, menguap,
   mengembun, membeku. Bagian 2: memilah benda padat, cair, dan gas dengan ctx.sort. Dua babak: lab lalu pilah. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Di bawah atau sama dengan 0 derajat es, 1 sampai 99 air, 100 ke atas uap.
  const stateOf = (T) => (T <= 0 ? 'es' : T < 100 ? 'air' : 'uap');
  const LABEL = { es: 'Es', air: 'Air', uap: 'Uap' };
  const INK = '#2b2d42';

  const TK_TASKS = [
    { text: 'Buat es mencair!', say: 'Buat es mencair! Ketuk tombol panaskan.', start: -25, goal: 'air', fix: 25, note: 'Es yang kena panas mencair menjadi air.' },
    { text: 'Buat air menguap!', say: 'Buat air menguap! Panaskan sampai jadi uap.', start: 25, goal: 'uap', fix: 100, note: 'Air yang sangat panas menguap menjadi uap.' },
    { text: 'Buat air membeku!', say: 'Buat air membeku! Dinginkan airnya.', start: 50, goal: 'es', fix: -25, note: 'Air yang sangat dingin membeku menjadi es.' },
  ];
  const SD_TASKS = [
    { text: 'Buat es mencair!', start: -10, goal: 'air', fix: 40, note: 'Mencair: es berubah menjadi air saat dipanaskan. Es mulai mencair pada suhu 0°C.' },
    { text: 'Buat air menguap!', start: 40, goal: 'uap', fix: 110, note: 'Menguap: air berubah menjadi uap (gas) saat dipanaskan sampai 100°C.' },
    { text: 'Uap jadi air lagi! (mengembun)', start: 110, goal: 'air', fix: 50, note: 'Mengembun: uap air berubah menjadi air saat didinginkan.' },
    { text: 'Buat air membeku!', start: 30, goal: 'es', fix: -10, note: 'Membeku: air berubah menjadi es saat didinginkan sampai 0°C.' },
  ];

  function hintSD(goal, st) {
    if (goal === 'air') return st === 'es' ? 'Masih es. Naikkan suhunya sampai di atas 0 derajat.' : 'Sudah jadi uap. Turunkan suhunya sampai di bawah 100 derajat.';
    if (goal === 'uap') return 'Belum jadi uap. Naikkan suhunya sampai 100 derajat atau lebih.';
    return 'Belum membeku. Turunkan suhunya sampai 0 derajat atau kurang.';
  }

  const THINGS = {
    padat: [{ icon: '🪨', label: 'Batu' }, { icon: '🧊', label: 'Es batu' }, { icon: '🪵', label: 'Kayu' }, { icon: '📕', label: 'Buku' }],
    cair: [{ icon: '🥛', label: 'Susu' }, { icon: '🍯', label: 'Madu' }, { icon: '🧃', label: 'Jus' }, { icon: '💧', label: 'Air' }],
    gas: [{ icon: '🎈', label: 'Udara di dalam balon' }, { icon: '♨️', label: 'Uap air panas' }, { icon: '💨', label: 'Asap' }],
  };
  const WHY = { padat: 'Benda padat bentuknya tetap.', cair: 'Benda cair mengikuti bentuk wadahnya.', gas: 'Gas mengisi seluruh ruang.' };

  // ---------- lab: SVG gelas di atas kompor + termometer ----------
  function makeLab(ctx) {
    const reduced = TI.reduced();
    const grp = (cls, ...kids) => svg('g', { class: 'wj-grp ' + cls }, ...kids);
    const cube = (x, y) => svg('g', null,
      svg('rect', { x, y, width: 46, height: 46, rx: 9, fill: '#c9ecff', stroke: '#8fd0f5', 'stroke-width': 3 }),
      svg('path', { d: 'M' + (x + 9) + ',' + (y + 15) + ' L' + (x + 22) + ',' + (y + 9), stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    const ice = grp('is-ice', cube(120, 146), cube(172, 146), cube(146, 100));
    const waterBody = svg('path', { fill: 'url(#wjWater)' });
    const water = grp('is-water', waterBody,
      svg('circle', { cx: 140, cy: 160, r: 4, fill: '#fff', opacity: 0.55 }), svg('circle', { cx: 190, cy: 172, r: 5, fill: '#fff', opacity: 0.45 }),
      svg('circle', { cx: 168, cy: 146, r: 3, fill: '#fff', opacity: 0.5 }));
    const wavePath = (ph, amp) => {
      let d = 'M116,' + (112 + amp * Math.sin(ph)).toFixed(1);
      for (let x = 122; x <= 224; x += 6) d += ' L' + x + ',' + (112 + amp * Math.sin(ph + (x - 116) * 0.12)).toFixed(1);
      return d + ' L224,192 L116,192 Z';
    };
    waterBody.setAttribute('d', wavePath(0, reduced ? 1.5 : 2.6));

    const puffs = Array.from({ length: 14 }, (_, i) => ({
      x: 122 + ((i * 37) % 96), y: 64 - ((i * 23) % 70), r: 5 + (i % 3) * 2.5, sp: 20 + (i % 4) * 7, ph: i,
      el: svg('circle', { cx: 0, cy: 0, r: 5 + (i % 3) * 2.5, fill: '#fff', stroke: '#8fbbdc', 'stroke-width': 2 }),
    }));
    const steam = grp('is-steam', ...puffs.map((p) => p.el));
    const putPuff = (p, t) => {
      const op = clamp((70 - p.y) / 16, 0, 1) * clamp((p.y + 6) / 46, 0, 1);
      p.el.setAttribute('transform', 'translate(' + (p.x + 7 * Math.sin(t * 1.3 + p.ph)).toFixed(1) + ' ' + p.y.toFixed(1) + ')');
      p.el.setAttribute('opacity', (0.15 + 0.85 * op).toFixed(2));
    };
    puffs.forEach((p) => putPuff(p, 0));

    const flame = (x, s) => svg('path', { d: 'M' + x + ',226 C' + (x - 14 * s) + ',214 ' + (x - 6 * s) + ',206 ' + x + ',196 C' + (x + 6 * s) + ',206 ' + (x + 14 * s) + ',214 ' + x + ',226 Z', fill: '#ff8a1f' });
    const flames = grp('is-flame', flame(140, 1), flame(170, 1.25), flame(200, 1),
      svg('path', { d: 'M170,226 C163,219 166,214 170,208 C174,214 177,219 170,226 Z', fill: '#ffd23f' }));
    const frost = grp('is-frost',
      svg('text', { x: 134, y: 222, 'font-size': 22, 'text-anchor': 'middle', text: '❄️' }),
      svg('text', { x: 170, y: 222, 'font-size': 22, 'text-anchor': 'middle', text: '❄️' }),
      svg('text', { x: 206, y: 222, 'font-size': 22, 'text-anchor': 'middle', text: '❄️' }));

    const fill = svg('rect', { x: 336, y: 54, width: 8, height: 190, fill: '#e5484d' });
    fill.style.transformOrigin = '340px 244px'; fill.style.transformBox = 'view-box';
    const bulb = svg('circle', { cx: 340, cy: 254, r: 16, fill: '#e5484d' });
    const tick = (T, txt) => {
      const y = 244 - ((T + 30) / 160) * 190;
      return [svg('line', { x1: 322, y1: y, x2: 331, y2: y, stroke: '#5d6b82', 'stroke-width': 3, 'stroke-linecap': 'round' }),
        svg('text', { x: 316, y, 'text-anchor': 'end', 'dominant-baseline': 'central', 'font-size': 14, 'font-weight': 800, fill: '#5d6b82', text: txt })];
    };
    const readout = svg('text', { x: 340, y: 34, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: INK, text: '' });
    const label = svg('text', { x: 170, y: 314, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: INK, text: '' });

    const root = svg('svg', { class: 'wj-svg', viewBox: '0 0 420 330', preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Gelas di atas kompor dan termometer' },
      svg('defs', null,
        svg('linearGradient', { id: 'wjWater', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('stop', { offset: 0, 'stop-color': '#6cc3ff' }), svg('stop', { offset: 1, 'stop-color': '#2f86e8' })),
        svg('clipPath', { id: 'wjClip' }, svg('rect', { x: 116, y: 60, width: 108, height: 132, rx: 8 }))),
      // kompor
      svg('rect', { x: 92, y: 238, width: 156, height: 44, rx: 12, fill: '#5d6b82' }),
      svg('rect', { x: 104, y: 226, width: 132, height: 14, rx: 5, fill: '#3d485c' }),
      svg('circle', { cx: 126, cy: 262, r: 8, fill: '#e5484d' }), svg('circle', { cx: 214, cy: 262, r: 8, fill: '#ffc93c' }),
      flames, frost,
      // isi gelas
      svg('g', { 'clip-path': 'url(#wjClip)' }, ice, water),
      steam,
      // kaca gelas
      svg('path', { d: 'M112,56 V184 Q112,196 124,196 H216 Q228,196 228,184 V56', fill: 'rgba(255,255,255,0.18)', stroke: '#8aa0c0', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      svg('path', { d: 'M122,70 V150', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }),
      // termometer
      svg('rect', { x: 330, y: 50, width: 20, height: 200, rx: 10, fill: '#fff', stroke: '#8aa0c0', 'stroke-width': 4 }),
      fill, bulb, ...tick(0, '0°'), ...tick(50, '50°'), ...tick(100, '100°'),
      readout, label);

    const box = h('div', { class: 'ti-scene wj-scene' }, root);
    let st = 'air', t = 0, ph = 0;
    const show = (g, on) => { g.style.opacity = on ? '1' : '0'; };
    const lab = {
      box, T: 25,
      set(T, dir) {
        lab.T = T; st = stateOf(T);
        show(ice, st === 'es'); show(water, st === 'air'); show(steam, st === 'uap');
        fill.style.transform = 'scaleY(' + clamp((T + 30) / 160, 0.03, 1).toFixed(3) + ')';
        const col = st === 'es' ? '#3d8bff' : st === 'air' ? '#e5484d' : '#ff7a1a';
        fill.setAttribute('fill', col); bulb.setAttribute('fill', col);
        readout.textContent = Math.round(T) + '°C';
        label.textContent = 'Wujud: ' + LABEL[st];
        label.setAttribute('fill', st === 'es' ? '#2272c8' : st === 'air' ? '#1f6fd1' : '#6b7a92');
        if (dir !== undefined) lab.fx(dir);
      },
      fx(dir) { show(flames, dir > 0); show(frost, dir < 0); },
      stop: null,
    };
    if (!reduced) {
      lab.stop = ctx.loop((dt) => {
        dt = Math.max(0, dt); t += dt; ph += dt * 3;
        if (st === 'air') waterBody.setAttribute('d', wavePath(ph, 2.6));
        if (st === 'uap') puffs.forEach((p) => { p.y -= p.sp * dt; if (p.y < -12) p.y = 66; putPuff(p, t); });
      });
    }
    return lab;
  }

  // Satu kotak "lanjut" di bawah lab: catatan istilah + tombol.
  async function afterNote(ctx, text, title) {
    const box = h('div', { class: 'wj-after' });
    ctx.el.append(box);
    ctx.note(text, { title, into: box });
    const go = h('button', { type: 'button', class: 'ti-btn pop-in' }, 'Lanjut ➜');
    box.append(go);
    await new Promise((res) => go.addEventListener('click', () => { TI.sfx('tap'); go.disabled = true; res(); }, { once: true }));
    box.remove();
  }

  TI.register({
    id: 'wujud',
    title: 'Es, Air, Uap',
    cat: 'sains',
    icon: '🧊',
    desc: 'Panaskan dan dinginkan air, lalu pilah benda padat, cair, dan gas.',
    start(ctx) {
      TI.style('wujud', `
.play[data-game="wujud"] .ti-scene { flex: none; width: min(100%, 480px); min-height: 0; aspect-ratio: 420 / 330; background: linear-gradient(#b7d9f1, #e4f2fb); }
.play[data-game="wujud"] .wj-svg { display: block; width: 100%; height: 100%; }
.play[data-game="wujud"] .wj-grp { transition: opacity 180ms var(--ease-out); }
.play[data-game="wujud"] .wj-ctl { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; width: 100%; max-width: 560px; }
.play[data-game="wujud"] .wj-ctl .ti-btn { flex: 1 1 200px; min-height: 76px; font-size: 1.55rem; }
.play[data-game="wujud"] .wj-ctl .ti-btn.is-hint { animation: wj-hint 900ms var(--ease-in-out) 3; } /* motion-ok: petunjuk berkedip lembut 3 kali, jarang muncul */
@keyframes wj-hint { 50% { transform: scale(1.06); } }
.play[data-game="wujud"] .wj-slide { display: grid; gap: 2px; width: 100%; max-width: 520px; }
.play[data-game="wujud"] .wj-slide .ti-slider { width: 100%; }
.play[data-game="wujud"] .wj-msg { margin: 0; min-height: 1.5em; width: 100%; max-width: 560px; text-align: center; font-weight: 800; color: var(--muted); }
.play[data-game="wujud"] .wj-after { display: grid; justify-items: center; gap: 14px; width: 100%; max-width: 760px; }
@media (prefers-reduced-motion: reduce) { .play[data-game="wujud"] .wj-ctl .ti-btn.is-hint { animation: none; outline: 4px solid var(--sun); } }
`);
      const tasks = ctx.isTK ? TK_TASKS : SD_TASKS;

      // bahan sortir
      const bins = [{ id: 'padat', label: 'Padat', icon: '🧱' }, { id: 'cair', label: 'Cair', icon: '💧' }];
      let things;
      if (ctx.isTK) things = shuffle([...sample(THINGS.padat, 2).map((x) => ({ ...x, bin: 'padat' })), ...sample(THINGS.cair, 2).map((x) => ({ ...x, bin: 'cair' }))]);
      else {
        bins.push({ id: 'gas', label: 'Gas', icon: '💨' });
        things = shuffle([...sample(THINGS.padat, 2).map((x) => ({ ...x, bin: 'padat' })), ...sample(THINGS.cair, 2).map((x) => ({ ...x, bin: 'cair' })), ...sample(THINGS.gas, 2).map((x) => ({ ...x, bin: 'gas' }))]);
      }
      const total = tasks.length + things.length;

      return (async () => {
        // ===== bagian 1: lab =====
        const lab = makeLab(ctx);
        const msg = h('p', { class: 'wj-msg', 'aria-live': 'polite' });
        const ctl = h('div', { class: 'wj-ctl' });
        ctx.el.append(lab.box, msg, ctl);

        // kontrol TK: dua tombol besar
        const heat = h('button', { type: 'button', class: 'ti-btn', style: '--c:#ef6a2e' }, '🔥 Panaskan');
        const cool = h('button', { type: 'button', class: 'ti-btn', style: '--c:#2f9bed' }, '❄️ Dinginkan');
        // kontrol SD: slider suhu
        const tempVal = h('b', null, '25');
        const slider = h('input', { type: 'range', class: 'ti-slider', min: -20, max: 120, step: 1, value: 25, 'aria-label': 'Suhu dalam derajat Celsius' });
        if (ctx.isTK) ctl.append(heat, cool);
        else ctl.append(h('label', { class: 'wj-slide' }, h('span', { class: 'ti-label' }, '🌡️ Suhu: ', tempVal, ' °C'), slider));

        let fxTimer = 0;
        const fxPulse = (dir) => { lab.fx(dir); fxTimer++; const my = fxTimer; ctx.after(900, () => { if (my === fxTimer) lab.fx(0); }); };

        // TK: ketuk tombol, tiap ketuk 25 derajat. Setelah 4 ketukan yang salah arah, diisi otomatis.
        function solveTK(task) {
          return new Promise((resolve) => {
            let T = task.start, wrong = 0, done = false;
            const want = () => (task.goal === 'es' ? -1 : task.goal === 'uap' ? 1 : stateOf(T) === 'es' ? 1 : -1);
            const tap = async (dir) => {
              if (done) return;
              const w = want(), nT = clamp(T + dir * 25, -25, 125);
              ctx.sfx(dir > 0 ? 'whoosh' : 'tap');
              const good = dir === w && nT !== T;
              T = nT; lab.set(T); fxPulse(dir);
              if (stateOf(T) === task.goal) { done = true; resolve(false); return; }
              if (good) return;
              wrong++;
              if (wrong === 2) {
                (want() > 0 ? heat : cool).classList.add('is-hint');
                ctx.say(want() > 0 ? 'Coba ketuk tombol panaskan.' : 'Coba ketuk tombol dinginkan.');
              }
              if (wrong >= 4) {
                done = true; ctx.mistakes++;
                heat.classList.remove('is-hint'); cool.classList.remove('is-hint');
                T = task.fix; lab.set(T, 0);
                ctx.sfx('benar');
                await ctx.sayWait('Ayo kita bantu. Lihat, sekarang jadi ' + LABEL[task.goal].toLowerCase() + '.');
                resolve(true);
              }
            };
            ctx.on(heat, 'click', () => tap(1));
            ctx.on(cool, 'click', () => tap(-1));
          });
        }

        // SD: geser slider, dicek saat dilepas (change). Setelah 4 cek yang salah, suhu diisi otomatis.
        function solveSD(task) {
          return new Promise((resolve) => {
            let checks = 0, done = false, prev = task.start;
            const apply = (T) => { tempVal.textContent = String(T); lab.set(T); };
            const onInput = () => {
              if (done) return;
              const T = +slider.value; fxPulse(Math.sign(T - prev)); prev = T; apply(T);
            };
            const onChange = async () => {
              if (done) return;
              const T = +slider.value; apply(T);
              if (stateOf(T) === task.goal) { done = true; resolve(false); return; }
              checks++;
              const m = hintSD(task.goal, stateOf(T));
              msg.textContent = m;
              if (checks >= 4) {
                done = true; ctx.mistakes++;
                slider.value = String(task.fix); apply(task.fix); lab.fx(0);
                ctx.sfx('benar');
                msg.textContent = 'Suhu yang tepat sekitar ' + task.fix + ' derajat.';
                await ctx.sayWait('Ayo kita bantu. Suhu yang tepat sekitar ' + task.fix + ' derajat.');
                resolve(true);
                return;
              }
              await ctx.wrong(null, { say: m });
            };
            ctx.on(slider, 'input', onInput);
            ctx.on(slider, 'change', onChange);
          });
        }

        for (let i = 0; i < tasks.length && ctx.alive; i++) {
          const task = tasks[i];
          ctx.progress(i, total);
          msg.textContent = '';
          ctl.hidden = false; msg.hidden = false;
          lab.set(task.start, 0);
          heat.classList.remove('is-hint'); cool.classList.remove('is-hint');
          if (ctx.isSD) { slider.value = String(task.start); tempVal.textContent = String(task.start); }
          ctx.ask(task.text, task.say ? { say: task.say } : undefined);
          const auto = await (ctx.isTK ? solveTK(task) : solveSD(task));
          ctl.hidden = true; msg.hidden = true;
          if (!auto) await ctx.correct(null, { say: 'Hebat!' });
          await afterNote(ctx, task.note, ctx.isSD ? 'Istilah baru' : 'Hore!');
        }
        if (!ctx.alive) return;
        if (lab.stop) lab.stop(); if (ctx.alive) ctx.correct(null, { say: 'Bagus! Terus naik ke babak pilah!' });

        // ===== jembatan ingatan: 1 pertanyaan kilat sebelum pilah =====
        ctx.clear();
        {
          const JEMBATAN = [
            { t: 'Es dipanaskan jadi apa?', j: 'air' },
            { t: 'Air dipanaskan terus sampai 100 derajat jadi apa?', j: 'uap' },
            { t: 'Air didinginkan terus jadi apa?', j: 'es' },
          ];
          const jb = JEMBATAN[Math.floor(Math.random() * JEMBATAN.length)];
          ctx.ask('Ingat-ingat! ' + jb.t);
          await ctx.choose({
            options: shuffle(['es', 'air', 'uap'].map((w) => ({ label: LABEL[w], value: w, say: LABEL[w] }))),
            answer: jb.j,
            speakLabel: true,
          });
          if (!ctx.alive) return;
        }
        // ===== bagian 2: sortir padat, cair, gas =====
        ctx.clear();
        ctx.ask(ctx.isTK ? 'Babak pilah: sekarang pilah benda ini, padat atau cair?' : 'Babak pilah: sekarang pilah benda ini, padat, cair, atau gas?');
        await ctx.sort({
          items: things.map((x) => ({
            icon: x.icon, label: x.label, bin: x.bin, why: WHY[x.bin],
            hint: ctx.isTK ? 'Coba lagi. Benda ini keras atau bisa dituang?' : 'Coba lagi. Apakah bentuknya tetap, mengikuti wadah, atau mengisi seluruh ruang?',
          })),
          bins,
          onStep: (done) => ctx.progress(tasks.length + done, total),
        });
        if (!ctx.alive) return;
        ctx.clear(); // keranjang lama dibuang supaya tidak ada ketukan nyasar setelah soal terakhir
        ctx.progress(total, total);
        ctx.finish({
          stars: ctx.mistakes <= 2 ? 3 : ctx.mistakes <= 6 ? 2 : 1,
          lesson: 'Air bisa berwujud padat (es), cair (air), dan gas (uap). Panas dan dingin yang mengubahnya.',
        });
      })();
    },
  });
})();
