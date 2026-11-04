/* 63 Balap Kali-kali. Balapan SVG: tiap jawaban perkalian benar membuat mobilmu melesat.
   Mobil komputer berjalan konstan dan LAMBAT sehingga pemain selalu bisa menang.
   TK: kali 1, 2, 5 (6 soal, 3 opsi). SD: kali 3 sampai 9 (10 soal, 4 opsi). */
(function () {
  const { h, svg, rand, pick, shuffle } = TI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const CSS = `
.play[data-game="balap-kali"] .bk-scene { flex: none; min-height: 0; height: clamp(210px, 32vh, 300px); cursor: default; background: linear-gradient(180deg, #8fd3ff 0, #d4f0ff 42%, #7fd36b 42%, #5fa855 100%); }
.play[data-game="balap-kali"] .bk-lane { position: absolute; left: 0; right: 0; height: var(--lh); background: #596075; box-shadow: inset 0 4px 0 rgba(255,255,255,0.85), inset 0 -4px 0 rgba(255,255,255,0.85); }
.play[data-game="balap-kali"] .bk-tag { position: absolute; left: 8px; top: 7px; z-index: 1; padding: 0 8px; border-radius: 999px; font-size: 0.78rem; font-weight: 800; line-height: 1.5; color: #fff; background: var(--tc); }
.play[data-game="balap-kali"] .bk-finish { position: absolute; top: 0; width: 20px; background: conic-gradient(#222 25%, #fff 0 50%, #222 0 75%, #fff 0) 0 0 / 10px 10px; box-shadow: 0 0 0 2px #fff; z-index: 1; }
.play[data-game="balap-kali"] .bk-car { position: absolute; left: 0; top: 0; width: var(--cw); z-index: 3; will-change: transform; }
.play[data-game="balap-kali"] .bk-car svg { display: block; width: 100%; height: auto; overflow: visible; }
.play[data-game="balap-kali"] .bk-card { flex: none; display: grid; place-items: center; min-height: 110px; padding: 8px; }
.play[data-game="balap-kali"] .bk-sum { font-size: clamp(2.4rem, 11vw, 3.6rem); font-weight: 800; line-height: 1; white-space: nowrap; }
.play[data-game="balap-kali"] .bk-sum b { color: var(--c); }
.play[data-game="balap-kali"] .bk-opts { display: grid; gap: 10px; width: 100%; max-width: 560px; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="balap-kali"] .bk-opts .choice { min-width: 0; min-height: 84px; padding: 8px 4px; font-size: 1.9rem; }
.play[data-game="balap-kali"] .bk-banner { position: absolute; left: 50%; top: 50%; z-index: 7; padding: 10px 22px; border-radius: 999px; white-space: nowrap; font-size: 1.7rem; font-weight: 800; color: #fff; background: var(--good); transform: translate(-50%, -50%); }
@media (max-width: 560px) {
  .play[data-game="balap-kali"] .bk-opts .choice { font-size: 1.6rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="balap-kali"] .bk-car { transition: none !important; }
}`;

  function mobil(badan) {
    const roda = (cx) => svg('g', null,
      svg('circle', { cx, cy: 46, r: 11, fill: '#2b2d42' }),
      svg('circle', { cx, cy: 46, r: 5, fill: '#cfd4e6' }));
    return svg('svg', { viewBox: '0 0 120 60', 'aria-hidden': 'true' },
      svg('rect', { x: 3, y: 28, width: 114, height: 20, rx: 9, fill: badan }),
      svg('path', { d: 'M30 28 L44 12 L76 12 L90 28 Z', fill: '#d9f0ff' }),
      svg('rect', { x: 111, y: 31, width: 6, height: 5, rx: 2, fill: '#ffe066' }),
      roda(30), roda(90));
  }

  function buatSoal(TK) {
    const out = [];
    const n = TK ? 6 : 10;
    for (let i = 0; i < n; i++) {
      const a = TK ? pick([1, 2, 5]) : rand(3, 9);
      const b = TK ? rand(1, 5) : rand(3, 9);
      const jawab = a * b;
      const set = new Set([jawab]);
      shuffle([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, jawab + 2, jawab - 2, jawab + 10, a + b])
        .forEach((v) => { if (set.size < (TK ? 3 : 4) && v > 0 && v !== jawab) set.add(v); });
      for (let g = jawab + 1; set.size < (TK ? 3 : 4); g++) set.add(g);
      out.push({ a, b, jawab, opsi: [...set].sort((x, y) => x - y) });
    }
    return out;
  }

  TI.register({
    id: 'balap-kali',
    title: 'Balap Kali-kali',
    cat: 'mat',
    icon: '🏁',
    desc: 'Jawab perkalian cepat, mobilmu melesat.',
    async start(ctx) {
      TI.style('balap-kali', CSS);
      const TK = ctx.isTK;
      const soal = buatSoal(TK);
      const TOTAL = soal.length;
      const WAKTU_LAWAN = TK ? 75 : 120; // detik: lawan sangat lambat, pemain selalu bisa menang

      const lane1 = h('div', { class: 'bk-lane', style: '--tc:#2f6fed' }, h('span', { class: 'bk-tag' }, 'Lawan'));
      const lane2 = h('div', { class: 'bk-lane', style: '--tc:#e5484d' }, h('span', { class: 'bk-tag' }, 'Kamu'));
      const finish = h('div', { class: 'bk-finish', 'aria-hidden': 'true' });
      const lawan = h('div', { class: 'bk-car', 'aria-hidden': 'true' }, mobil('#2f6fed'));
      const kamu = h('div', { class: 'bk-car', 'aria-hidden': 'true' }, mobil('#e5484d'));
      const scene = h('div', { class: 'ti-scene bk-scene' }, lane1, lane2, finish, lawan, kamu);
      const card = h('div', { class: 'ti-panel bk-card' });
      const opts = h('div', { class: 'bk-opts', style: '--n:' + (TK ? 3 : 4) });
      ctx.el.append(scene, card, opts);

      let W = 0, x0 = 8, xEnd = 200, cw = 90, carY1 = 0, carY2 = 0;
      function ukur() {
        const w = scene.clientWidth || 360, hh = scene.clientHeight || 230;
        if (w === W) return;
        W = w;
        cw = Math.round(clamp(W * 0.28, 80, 150));
        const carH = cw * 0.5;
        const lh = Math.round(clamp(carH + 34, 60, 120));
        scene.style.setProperty('--cw', cw + 'px');
        scene.style.setProperty('--lh', lh + 'px');
        const y1 = Math.round(hh * 0.08), y2 = y1 + lh + 8;
        lane1.style.transform = 'translate3d(0,' + y1 + 'px,0)';
        lane2.style.transform = 'translate3d(0,' + y2 + 'px,0)';
        lane1.style.top = lane2.style.top = '0';
        x0 = 8; xEnd = W - cw - 24;
        finish.style.left = (W - 28) + 'px';
        finish.style.height = (y2 + lh - y1 + 10) + 'px';
        finish.style.transform = 'translate3d(0,' + (y1 - 5) + 'px,0)';
        carY1 = y1 + lh - carH - 7; carY2 = y2 + lh - carH - 7;
      }
      const pos = (f) => x0 + (xEnd - x0) * f;
      let lawanF = 0, kamuF = 0, tween = null, over = false;
      function gambar() {
        lawan.style.transform = 'translate3d(' + pos(lawanF).toFixed(1) + 'px,' + carY1.toFixed(1) + 'px,0)';
        kamu.style.transform = 'translate3d(' + pos(kamuF).toFixed(1) + 'px,' + carY2.toFixed(1) + 'px,0)';
      }
      ukur(); gambar();
      ctx.on(window, 'resize', () => { ukur(); gambar(); });
      let tLawan = 0, lastNow = 0;
      ctx.loop((dt, now) => {
        if (!ctx.alive || over) return false;
        const real = lastNow ? clamp((now - lastNow) / 1000, 0, 0.5) : 0;
        lastNow = now;
        tLawan += real;
        lawanF = Math.min(1, tLawan / WAKTU_LAWAN);
        if (tween) {
          tween.t += real;
          const p = clamp(tween.t / tween.dur, 0, 1);
          kamuF = tween.dari + (tween.ke - tween.dari) * ease(p);
          if (p >= 1) tween = null;
        }
        gambar();
        if (lawanF >= 1) { over = true; return false; }
      });

      ctx.ask('Jawab perkalian dengan cepat! Mobilmu melesat tiap jawaban benar.');
      ctx.progress(0, TOTAL);
      for (let i = 0; i < TOTAL; i++) {
        if (!ctx.alive || over) break;
        const q = soal[i];
        card.replaceChildren(h('div', { class: 'bk-sum pop-in' }, q.a + ' × ' + q.b + ' = ', h('b', null, '?')));
        opts.replaceChildren();
        ctx.ask('Berapa ' + q.a + ' kali ' + q.b + '?', { speak: i === 0 });
        const hasil = await new Promise((res) => {
          q.opsi.forEach((v) => {
            const b = h('button', { type: 'button', class: 'choice', 'aria-label': String(v) }, String(v));
            b.addEventListener('click', async () => {
              if (b.disabled) return;
              if (v === q.jawab) {
                opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
                await ctx.correct(b);
                res(true);
              } else {
                b.disabled = true;
                await ctx.wrong(b);
              }
            });
            opts.append(b);
          });
        });
        if (!ctx.alive || over || !hasil) break;
        ctx.progress(i + 1, TOTAL);
        ctx.sfx('whoosh');
        tween = { dari: kamuF, ke: (i + 1) / TOTAL, t: 0, dur: 0.6 };
        await ctx.wait(450);
      }
      over = true;
      opts.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const menang = lawanF < 1;
      const spanduk = h('div', { class: 'bk-banner pop-in' }, menang ? 'Kamu menang!' : 'Lawan duluan!');
      scene.append(spanduk);
      ctx.ask(menang ? 'Kamu menang! Hebat sekali!' : 'Lawan duluan. Ayo coba lagi!', { speak: false });
      await ctx.wait(1200);
      if (!ctx.alive) return;
      ctx.finish({
        stars: menang ? (ctx.mistakes <= 1 ? 3 : 2) : 1,
        total: TOTAL,
        message: menang ? undefined : 'Ayo coba lagi, kamu pasti bisa lebih cepat!',
        lesson: 'Perkalian adalah penjumlahan berulang. Makin sering latihan, makin cepat.',
      });
    },
  });
})();
