/* 33 Angka Rahasia. Peti harta terkunci menyimpan angka rahasia. Anak menebak lewat papan angka,
   petunjuk "terlalu besar / terlalu kecil" mencoret angka yang tidak mungkin. Peti terbuka, koin memantul. */
(function () {
  const { h, svg, rand } = TI;

    // warna peti per babak: [badan, tutup, pita]
  const PETI = [['#b9722f', '#cf8638', '#f2c14e'], ['#3f78c9', '#5b92e0', '#ffd23f'], ['#8a56c9', '#a874de', '#ffd23f']];

  const CSS = `
.play[data-game="rahasia"] .rs-panel {
  flex: none; position: relative; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 14px;
  padding: 10px 16px; text-align: left; overflow: visible;
}
.play[data-game="rahasia"] .rs-chest { width: clamp(104px, 28vw, 150px); }
.play[data-game="rahasia"] .rs-chest svg { display: block; width: 100%; height: auto; overflow: visible; }
.play[data-game="rahasia"] .rs-lid { transform-origin: 14px 54px; transition: transform var(--dur-ui-max) var(--ease-out); }
.play[data-game="rahasia"] .rs-chest.is-open .rs-lid { transform: rotate(-34deg); }
.play[data-game="rahasia"] .rs-glow { opacity: 0; transition: opacity var(--dur-ui-max) var(--ease-out); }
.play[data-game="rahasia"] .rs-chest.is-open .rs-glow { opacity: 1; }
.play[data-game="rahasia"] .rs-shackle { transition: transform var(--dur-ui) var(--ease-out), opacity var(--dur-ui) var(--ease-out); }
.play[data-game="rahasia"] .rs-chest.is-open .rs-shackle { opacity: 0; transform: translateY(-8px); }
.play[data-game="rahasia"] .rs-chest.is-shake svg { animation: rs-shake var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="rahasia"] .rs-side { display: grid; gap: 6px; min-width: 0; }
.play[data-game="rahasia"] .rs-count { justify-self: start; padding: 2px 12px; border-radius: 999px; background: var(--c); color: #fff; font-size: 0.95rem; font-weight: 800; }
.play[data-game="rahasia"] .rs-hint { display: flex; align-items: center; gap: 10px; min-height: 64px; }
.play[data-game="rahasia"] .rs-hint svg { flex: none; width: 44px; height: 52px; }
.play[data-game="rahasia"] .rs-hint-t { display: grid; gap: 1px; line-height: 1.15; min-width: 0; }
.play[data-game="rahasia"] .rs-hint-t b { font-size: 1.25rem; }
.play[data-game="rahasia"] .rs-hint-t span { font-size: 1rem; color: var(--muted); font-weight: 700; }
.play[data-game="rahasia"] .rs-gd { display: flex; align-items: center; gap: 8px; }
.play[data-game="rahasia"] .rs-gd b { font-size: 1.15rem; min-width: 1.4em; color: var(--c); }
.play[data-game="rahasia"] .rs-gd .ti-dots { font-size: 0.7rem; max-width: 9em; justify-content: flex-start; }
.play[data-game="rahasia"] .rs-coins { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.play[data-game="rahasia"] .rs-coin {
  position: absolute; left: 0; top: 0; width: 24px; height: 24px; margin: -12px 0 0 -12px; display: grid; place-items: center;
  border-radius: 50%; font-size: 0.8rem; font-weight: 800; color: #b9650a; line-height: 1; will-change: transform;
  background: radial-gradient(circle at 35% 30%, #fff3a8 0, #ffd23f 55%, #f0a800 100%); box-shadow: inset 0 0 0 2px #e49a00;
}
.play[data-game="rahasia"] .rs-board { display: grid; gap: 8px; width: 100%; max-width: 560px; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); }
.play[data-game="rahasia"] .rs-num { min-width: 0; min-height: 70px; padding: 4px; font-size: 1.9rem; }
.play[data-game="rahasia"] .rs-board.is-dense { gap: 2px; }
.play[data-game="rahasia"] .rs-board.is-dense .rs-num { min-height: 0; aspect-ratio: 1; padding: 0; font-size: 0.98rem; border-width: 2px; border-radius: 9px; box-shadow: 0 2px 0 var(--shadow); }
.play[data-game="rahasia"] .rs-num.is-out { background: #ece8df; color: #9a9588; border-color: transparent; box-shadow: none; opacity: 1; }
.play[data-game="rahasia"] .rs-num.is-win { background: var(--good-bg); border-color: var(--good); opacity: 1; }
.play[data-game="rahasia"] .rs-hint-in { animation: ti-pop var(--dur-ui) var(--ease-out) both; }
@keyframes rs-shake { 20% { transform: translateX(-5px) rotate(-1.5deg); } 40% { transform: translateX(4px) rotate(1deg); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
@media (max-width: 560px) {
  .play[data-game="rahasia"] .rs-panel { padding: 8px 12px; gap: 10px; }
  .play[data-game="rahasia"] .rs-hint-t b { font-size: 1.1rem; }
  .play[data-game="rahasia"] .rs-hint-t span { font-size: 0.92rem; }
  .play[data-game="rahasia"] .rs-num { min-height: 64px; font-size: 1.7rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="rahasia"] .rs-chest.is-shake svg { animation: none !important; }
  .play[data-game="rahasia"] .rs-lid, .play[data-game="rahasia"] .rs-shackle { transition-property: opacity !important; }
  .play[data-game="rahasia"] .rs-hint-in { animation-name: ti-fade !important; }
}`;

  // Peti harta SVG (tanpa wajah). Pelat emas di depan menampilkan "?" lalu angkanya saat terbuka.
  function petiSvg([badan, tutup, pita]) {
    const plat = svg('text', { x: 70, y: 66, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#7a4a00', class: 'rs-plate' }, '?');
    const node = svg('svg', { viewBox: '0 0 140 112', 'aria-hidden': 'true' },
      svg('ellipse', { cx: 70, cy: 106, rx: 62, ry: 5, fill: 'rgba(0,0,0,0.15)' }),
      svg('rect', { x: 14, y: 54, width: 112, height: 50, rx: 8, fill: badan }),
      svg('rect', { x: 14, y: 54, width: 112, height: 8, fill: 'rgba(0,0,0,0.18)' }),
      svg('rect', { x: 20, y: 64, width: 100, height: 3, fill: 'rgba(0,0,0,0.14)' }),
      svg('rect', { x: 20, y: 80, width: 100, height: 3, fill: 'rgba(0,0,0,0.14)' }),
      svg('rect', { x: 32, y: 54, width: 10, height: 50, fill: pita }),
      svg('rect', { x: 98, y: 54, width: 10, height: 50, fill: pita }),
      svg('ellipse', { class: 'rs-glow', cx: 70, cy: 52, rx: 52, ry: 12, fill: '#ffe680' }),
      svg('g', { class: 'rs-lid' },
        svg('path', { d: 'M14 56 Q14 16 70 16 Q126 16 126 56 Z', fill: tutup }),
        svg('path', { d: 'M14 56 Q14 16 70 16 Q126 16 126 56 Z', fill: 'none', stroke: 'rgba(0,0,0,0.12)', 'stroke-width': 3 }),
        svg('rect', { x: 32, y: 21, width: 10, height: 35, fill: pita }),
        svg('rect', { x: 98, y: 21, width: 10, height: 35, fill: pita })),
      svg('g', { class: 'rs-shackle' }, svg('path', { d: 'M60 52 L60 44 Q60 34 70 34 Q80 34 80 44 L80 52', fill: 'none', stroke: '#c98a00', 'stroke-width': 5, 'stroke-linecap': 'round' })),
      svg('rect', { x: 52, y: 48, width: 36, height: 30, rx: 7, fill: '#ffd23f', stroke: '#c98a00', 'stroke-width': 3 }),
      plat);
    return { node, plat };
  }

  function panah(naik) {
    const w = svg('svg', { viewBox: '0 0 44 52', 'aria-hidden': 'true' },
      svg('path', { d: 'M22 4 L40 24 L28 24 L28 48 L16 48 L16 24 L4 24 Z', fill: naik ? '#e8590c' : '#2f6fed', stroke: 'rgba(0,0,0,0.15)', 'stroke-width': 2, 'stroke-linejoin': 'round', transform: naik ? '' : 'rotate(180 22 26)' }));
    return w;
  }

  TI.register({
    id: 'rahasia',
    title: 'Angka Rahasia',
    cat: 'mat',
    icon: '❓',
    desc: 'Tebak angka rahasia di dalam peti harta. Ada petunjuk lebih besar atau lebih kecil!',
    async start(ctx) {
      TI.style('rahasia', CSS);
      const reduced = TI.reduced();
      const BABAK = ctx.isTK ? [10, 10, 10] : [20, 50, 100];
      let semuaTebakan = 0, rahasiaLama = 0;

      if (ctx.isSD) {
        ctx.ask('Siap mencari harta karun?');
        ctx.note('Tips jagoan: tebak angka tengah dulu, supaya sisa pilihan tinggal separuh.', { title: false });
        await ctx.next('Mulai');
      }

      for (let r = 0; r < BABAK.length; r++) {
        ctx.clear();
        ctx.progress(r, BABAK.length);
        await babak(BABAK[r], r);
      }
      ctx.progress(BABAK.length, BABAK.length);
      const t = semuaTebakan;
      const stars = ctx.isTK ? (t <= 9 ? 3 : t <= 15 ? 2 : 1) : (t <= 18 ? 3 : t <= 27 ? 2 : 1);
      ctx.finish({
        stars, total: BABAK.length,
        message: 'Kamu membuka ' + BABAK.length + ' peti dengan ' + t + ' tebakan!',
        lesson: 'Petunjuk lebih besar dan lebih kecil membantu kita mencari jawaban dengan cerdas.',
      });

      function babak(max, r) {
        return new Promise((resolve) => {
          let rahasia;
          do { rahasia = rand(1, max); } while (rahasia === rahasiaLama && max > 1);
          rahasiaLama = rahasia;
          let lo = 1, hi = max, tebak = 0, selesai = false;

          const { node: petiNode, plat } = petiSvg(PETI[r % PETI.length]);
          const chest = h('div', { class: 'rs-chest' }, petiNode);
          const count = h('span', { class: 'rs-count' }, 'Tebakan ke-1');
          const hint = h('div', { class: 'rs-hint' });
          const coins = h('div', { class: 'rs-coins', 'aria-hidden': 'true' });
          const panel = h('div', { class: 'ti-panel rs-panel' }, chest, h('div', { class: 'rs-side' }, count, hint), coins);
          const dense = max > 20;
          const cols = dense ? 10 : 5;
          const board = h('div', { class: 'rs-board' + (dense ? ' is-dense' : ''), style: '--cols:' + cols });
          const tombol = [];
          for (let n = 1; n <= max; n++) {
            const b = h('button', { type: 'button', class: 'choice rs-num', 'aria-label': String(n) }, String(n));
            b.addEventListener('click', () => tebakAngka(n, b));
            tombol.push(b);
            board.append(b);
          }
          ctx.el.append(panel, board);

          const awal = ctx.isTK ? 'Tebak angka dari 1 sampai 10!' : 'Tebak angka dari 1 sampai ' + max + '!';
          setHint(null, 0, 'Peti terkunci!', awal);
          ctx.ask('Angka rahasia ada di antara 1 dan ' + max + '. Ayo tebak!', { say: 'Peti terkunci! Tebak angka rahasia antara 1 dan ' + max });

          function setHint(naik, n, judul, isi) {
            const kids = [];
            if (naik !== null) kids.push(panah(naik));
            kids.push(h('div', { class: 'rs-hint-t' }, h('b', null, judul), h('span', null, isi),
              ctx.isTK && n ? h('span', { class: 'rs-gd' }, h('b', null, n), TI.dots(n)) : null));
            hint.replaceChildren(h('div', { class: 'rs-hint-in', style: { display: 'flex', alignItems: 'center', gap: '10px' } }, kids));
          }

          function perbarui() {
            tombol.forEach((b, i) => {
              const n = i + 1;
              const keluar = n < lo || n > hi;
              b.disabled = keluar;
              b.classList.toggle('is-out', keluar);
            });
          }

          function tebakAngka(n, b) {
            if (selesai || b.disabled) return;
            tebak++; semuaTebakan++;
            if (n === rahasia) { menang(n, b); return; }
            const terlaluBesar = n > rahasia;
            if (terlaluBesar) hi = n - 1; else lo = n + 1;
            perbarui();
            ctx.sfx('tap');
            chest.classList.remove('is-shake'); void chest.offsetWidth; chest.classList.add('is-shake');
            count.textContent = 'Tebakan ke-' + (tebak + 1);
            if (terlaluBesar) {
              setHint(false, n, 'Terlalu besar!', 'Angkanya lebih kecil.');
              ctx.say(n + '. Terlalu besar! Angkanya lebih kecil.');
            } else {
              setHint(true, n, 'Terlalu kecil!', 'Angkanya lebih besar.');
              ctx.say(n + '. Terlalu kecil! Angkanya lebih besar.');
            }
          }

          function menang(n, b) {
            selesai = true;
            tombol.forEach((x) => { x.disabled = true; });
            b.classList.add('is-win');
            chest.classList.add('is-open');
            plat.textContent = String(n);
            ctx.sfx('benar');
            ctx.say('Benar! Angkanya ' + n + '. Kamu menemukannya di tebakan ke-' + tebak + '!');
            count.textContent = 'Ketemu di tebakan ke-' + tebak;
            hint.replaceChildren(h('div', { class: 'rs-hint-in rs-hint-t' }, h('b', null, 'Peti terbuka!'), h('span', null, 'Angkanya ' + n + '.')));
            ctx.progress(r + 1, BABAK.length);
            lemparKoin(coins, chest, panel);
            ctx.after(r === BABAK.length - 1 ? 1700 : 1900, resolve);
          }
        });
      }

      // Koin bintang memantul keluar dari peti (fisika sederhana di ctx.loop, transform saja).
      function lemparKoin(layer, chest, panel) {
        if (reduced) return;
        const pr = panel.getBoundingClientRect(), cr = chest.getBoundingClientRect();
        const cx = cr.left - pr.left + cr.width / 2, cy = cr.top - pr.top + cr.height * 0.45;
        const lantai = pr.height - 10;
        const daftar = [];
        for (let k = 0; k < 14; k++) {
          const el = h('span', { class: 'rs-coin' }, '★');
          layer.append(el);
          daftar.push({ el, x: cx, y: cy, vx: rand(-110, 120), vy: -rand(320, 520), mantul: 0, op: 1, tunda: k * 0.035 });
        }
        ctx.loop((dt) => {
          let hidup = 0;
          for (const c of daftar) {
            if (c.op <= 0) continue;
            hidup++;
            if (c.tunda > 0) { c.tunda -= dt; c.el.style.opacity = '0'; continue; }
            c.el.style.opacity = c.op.toFixed(2);
            c.vy += 1500 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
            if (c.y > lantai) { c.y = lantai; c.vy = -c.vy * 0.5; c.vx *= 0.7; c.mantul++; }
            if (c.mantul >= 1) { c.op -= dt * 1.5; if (c.op <= 0) c.el.remove(); }
            c.el.style.transform = 'translate3d(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px,0)';
          }
          if (!hidup) return false;
        });
      }
    },
  });
})();
