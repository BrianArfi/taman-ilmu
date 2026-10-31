/* 32 Balapan Hitung. Dua mobil (SVG, tanpa wajah) di dua lintasan. Lawan maju terus dengan kecepatan tetap,
   mobil kamu melesat satu petak setiap jawaban benar. Finis = 8 jawaban benar. Gerak lewat ctx.loop + translate3d. */
(function () {
  const { h, svg, rand, shuffle } = TI;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TOTAL = 8;
  const DADU = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  const CSS = `
.play[data-game="balapan"] .bl-scene {
  flex: none; min-height: 0; height: clamp(230px, 34vh, 320px); cursor: default;
  background: linear-gradient(180deg, #8fd3ff 0, #d4f0ff 40%, #7fd36b 40%, #62b855 100%);
}
.play[data-game="balapan"] .bl-lane {
  position: absolute; left: 0; right: 0; height: var(--lh); background: #596075;
  box-shadow: inset 0 4px 0 rgba(255, 255, 255, 0.85), inset 0 -4px 0 rgba(255, 255, 255, 0.85);
}
.play[data-game="balapan"] .bl-tick { position: absolute; top: auto; bottom: 7px; width: 3px; height: 9px; border-radius: 2px; background: rgba(255, 255, 255, 0.55); }
.play[data-game="balapan"] .bl-tag {
  position: absolute; left: 8px; top: 7px; padding: 0 8px; border-radius: 999px; font-size: 0.78rem; font-weight: 800; line-height: 1.5;
  color: #fff; background: var(--tc); z-index: 1;
}
.play[data-game="balapan"] .bl-finish {
  position: absolute; top: 0; width: 20px; background: conic-gradient(#222 25%, #fff 0 50%, #222 0 75%, #fff 0) 0 0 / 10px 10px; z-index: 1;
  box-shadow: 0 0 0 2px #fff;
}
.play[data-game="balapan"] .bl-flag { position: absolute; top: 0; font-size: 1.5rem; line-height: 1; z-index: 2; pointer-events: none; }
.play[data-game="balapan"] .bl-car { position: absolute; left: 0; top: 0; width: var(--cw); z-index: 3; will-change: transform; }
.play[data-game="balapan"] .bl-car svg { display: block; width: 100%; height: auto; overflow: visible; }
.play[data-game="balapan"] .bl-car .bl-wheel { transform-box: fill-box; transform-origin: center; }
.play[data-game="balapan"] .bl-car.is-go .bl-wheel { animation: bl-spin 360ms linear infinite; }
.play[data-game="balapan"] .bl-car.is-stall svg { animation: bl-stall var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="balapan"] .bl-streak {
  position: absolute; left: 0; top: 0; width: 28px; height: 3px; border-radius: 2px; background: rgba(255, 255, 255, 0.9); z-index: 2; pointer-events: none;
  transform: translate3d(var(--sx), var(--sy), 0); animation: bl-streak 420ms var(--ease-out) both; /* motion-ok: garis kecepatan */
}
.play[data-game="balapan"] .bl-count {
  position: absolute; inset: 0; z-index: 6; display: grid; place-items: center; pointer-events: none;
  font-size: 5.2rem; font-weight: 800; line-height: 1; color: #fff; text-shadow: 0 5px 0 rgba(0, 0, 0, 0.28);
}
.play[data-game="balapan"] .bl-banner {
  position: absolute; left: 50%; top: 50%; z-index: 7; padding: 10px 22px; border-radius: 999px; white-space: nowrap;
  font-size: 1.7rem; font-weight: 800; color: #fff; background: var(--good); box-shadow: 0 5px 0 rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
}
.play[data-game="balapan"] .bl-banner.is-lose { background: #f08c00; }
.play[data-game="balapan"] .bl-card { flex: none; display: grid; place-items: center; min-height: 136px; padding: 10px; }
.play[data-game="balapan"] .bl-sum { font-size: clamp(2.7rem, 12vw, 4rem); font-weight: 800; line-height: 1; color: var(--ink); white-space: nowrap; }
.play[data-game="balapan"] .bl-sum b { color: var(--c); }
.play[data-game="balapan"] .bl-die {
  display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr); width: 122px; height: 122px; padding: 14px; gap: 2px;
  border-radius: 24px; background: #fffdf5; border: 4px solid #2b2d42; box-shadow: 0 5px 0 var(--shadow);
}
.play[data-game="balapan"] .bl-die i { display: block; width: 78%; aspect-ratio: 1; place-self: center; border-radius: 50%; }
.play[data-game="balapan"] .bl-die i.on { background: #2b2d42; }
.play[data-game="balapan"] .bl-opts { display: grid; gap: 10px; width: 100%; max-width: 560px; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="balapan"] .bl-opts .choice { min-width: 0; min-height: 88px; padding: 8px 4px; font-size: 1.9rem; }
@keyframes bl-spin { to { transform: rotate(360deg); } }
@keyframes bl-stall { 20% { transform: translateX(-6px) rotate(-2deg); } 40% { transform: translateX(5px) rotate(1.5deg); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
@keyframes bl-streak {
  from { opacity: 0.9; transform: translate3d(var(--sx), var(--sy), 0); }
  to { opacity: 0; transform: translate3d(calc(var(--sx) - 44px), var(--sy), 0); }
}
@media (max-width: 560px) {
  .play[data-game="balapan"] .bl-opts .choice { font-size: 1.7rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="balapan"] .bl-car.is-go .bl-wheel { animation: none !important; }
  .play[data-game="balapan"] .bl-streak { display: none; }
  .play[data-game="balapan"] .bl-car.is-stall svg { animation: none !important; }
}`;

  // ---------- mobil: SVG tampak samping, menghadap kanan, tanpa wajah ----------
  function mobil(badan, strip) {
    const roda = (cx) => svg('g', { class: 'bl-wheel' },
      svg('circle', { cx, cy: 46, r: 11, fill: '#2b2d42' }),
      svg('circle', { cx, cy: 46, r: 5.5, fill: '#cfd4e6' }),
      svg('rect', { x: cx - 1.5, y: 40, width: 3, height: 12, rx: 1.5, fill: '#8b92ab' }),
      svg('rect', { x: cx - 6, y: 44.5, width: 12, height: 3, rx: 1.5, fill: '#8b92ab' }));
    return svg('svg', { viewBox: '0 0 120 60', 'aria-hidden': 'true' },
      svg('ellipse', { cx: 60, cy: 57, rx: 52, ry: 3, fill: 'rgba(0,0,0,0.18)' }),
      svg('path', { d: 'M28 30 L42 12 Q44 10 48 10 L80 10 Q84 10 86 12 L100 30 Z', fill: badan }),
      svg('path', { d: 'M40 29 L50 14 L62 14 L62 29 Z', fill: '#d9f0ff' }),
      svg('path', { d: 'M67 14 L79 14 L91 29 L67 29 Z', fill: '#d9f0ff' }),
      svg('rect', { x: 3, y: 28, width: 114, height: 20, rx: 9, fill: badan }),
      svg('rect', { x: 3, y: 36, width: 114, height: 4, fill: strip, opacity: 0.9 }),
      svg('rect', { x: 111, y: 31, width: 6, height: 5, rx: 2, fill: '#ffe066' }),
      svg('rect', { x: 3, y: 31, width: 5, height: 5, rx: 2, fill: '#ff8787' }),
      svg('rect', { x: 4, y: 19, width: 20, height: 4, rx: 2, fill: strip }),
      svg('rect', { x: 8, y: 22, width: 3, height: 7, fill: strip }),
      roda(30), roda(90));
  }

  // ---------- soal ----------
  function opsiAngka(jawab, calon, n) {
    const set = new Set([jawab]);
    shuffle(calon.filter((v) => v >= 0 && v !== jawab)).forEach((v) => { if (set.size < n) set.add(v); });
    for (let g = 1; set.size < n; g++) { const v = jawab + g * (g % 2 ? 1 : -1); if (v >= 0) set.add(v); }
    return [...set].sort((a, b) => a - b);
  }
  function soalTK() {
    const band = [[1, 3], [1, 3], [3, 5], [3, 5], [3, 5], [4, 6], [4, 6], [4, 6]];
    const out = [];
    for (const [a, b] of band) {
      let n, g = 0;
      do { n = rand(a, b); g++; } while (out.length && out[out.length - 1].jawab === n && g < 20);
      out.push({
        jawab: n, opsi: TI.numChoices(n, 3, 1, 6).sort((x, y) => x - y),
        node: h('div', { class: 'bl-die pop-in', role: 'img', 'aria-label': n + ' titik' }, Array.from({ length: 9 }, (_, i) => h('i', { class: DADU[n].includes(i) ? 'on' : '' }))),
      });
    }
    return out;
  }
  function soalSD() {
    const out = [];
    const tampil = (a, op, b, jawab, calon) => out.push({
      jawab, opsi: opsiAngka(jawab, calon, 4),
      node: h('div', { class: 'bl-sum pop-in' }, a + ' ' + op + ' ' + b + ' = ', h('b', null, '?')),
      ucap: a + (op === '+' ? ' tambah ' : op === '-' ? ' kurang ' : ' kali ') + b,
    });
    const tambah = (lo, hi, max) => { const a = rand(lo, hi), b = rand(lo, Math.min(hi, max - a)); tampil(a, '+', b, a + b, [a + b + 1, a + b - 1, a + b + 10, a + b - 10, a + b + 2, a + b - 2]); };
    const kurang = (lo, hi) => { const a = rand(lo, hi), b = rand(5, a - 4); tampil(a, '-', b, a - b, [a - b + 1, a - b - 1, a - b + 10, a - b - 10, a - b + 2, a - b - 2]); };
    const kali = (a1, a2, b1, b2) => {
      const a = rand(a1, a2), b = rand(b1, b2), p = a * b;
      tampil(a, '×', b, p, [(a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1), p + 2, p - 2, a + b]);
    };
    tambah(8, 24, 40);
    kurang(18, 40);
    tambah(15, 30, 50);
    kurang(30, 50);
    kali(2, 5, 2, 6);
    kali(3, 6, 4, 8);
    kali(6, 9, 3, 7);
    kali(6, 9, 6, 9);
    return out;
  }

  TI.register({
    id: 'balapan',
    title: 'Balapan Hitung',
    cat: 'mat',
    icon: '🏎️',
    desc: 'Jawab hitungan dengan benar, mobilmu melesat. Menangkan balapannya!',
    async start(ctx) {
      TI.style('balapan', CSS);
      const reduced = TI.reduced();
      const WAKTU_LAWAN = ctx.isTK ? 56 : 45; // detik nyata sampai lawan finis
      const soal = ctx.isTK ? soalTK() : soalSD();
      const N_OPSI = ctx.isTK ? 3 : 4;

      // ---------- tampilan ----------
      const lane1 = h('div', { class: 'bl-lane', style: '--tc:#2f6fed' }, h('span', { class: 'bl-tag' }, 'Lawan'));
      const lane2 = h('div', { class: 'bl-lane', style: '--tc:#e5484d' }, h('span', { class: 'bl-tag' }, 'Kamu'));
      const ticks = [];
      for (let i = 1; i < TOTAL; i++) { const t = h('i', { class: 'bl-tick', 'aria-hidden': 'true' }); ticks.push(t); lane2.append(t); }
      const finish = h('div', { class: 'bl-finish', 'aria-hidden': 'true' });
      const flag = h('span', { class: 'bl-flag', 'aria-hidden': 'true' }, '🏁');
      const lawan = h('div', { class: 'bl-car', 'aria-hidden': 'true' }, mobil('#2f6fed', '#ffd23f'));
      const kamu = h('div', { class: 'bl-car', 'aria-hidden': 'true' }, mobil('#e5484d', '#ffffff'));
      const scene = h('div', { class: 'ti-scene bl-scene' }, lane1, lane2, finish, flag, lawan, kamu);
      const card = h('div', { class: 'ti-panel bl-card' });
      const opts = h('div', { class: 'bl-opts', style: '--n:' + N_OPSI });
      card.append(h('p', { class: 'ti-label' }, 'Siap-siap...'));
      ctx.el.append(scene, card, opts);
      ctx.progress(0, TOTAL);

      // ---------- ukuran ----------
      let W = 0, H = 0, cw = 90, x0 = 8, xEnd = 200, lh = 70, y1 = 0, y2 = 0, ukurTerakhir = 0;
      function ukur() {
        const w = scene.clientWidth || 360, hh = scene.clientHeight || 230;
        if (w === W && hh === H) return;
        W = w; H = hh;
        cw = Math.round(clamp(W * 0.3, 84, 170));
        const carH = cw * 0.5;
        y1 = Math.round(H * 0.1);
        lh = Math.round(clamp(Math.min(carH + 36, (H - y1 - 8 - 22) / 2), 60, 130));
        y2 = y1 + lh + 8;
        scene.style.setProperty('--cw', cw + 'px');
        scene.style.setProperty('--lh', lh + 'px');
        lane1.style.transform = 'translate3d(0,' + y1 + 'px,0)';
        lane2.style.transform = 'translate3d(0,' + y2 + 'px,0)';
        lane1.style.top = lane2.style.top = '0';
        x0 = 8; xEnd = W - cw - 22;
        finish.style.left = (W - 26) + 'px';
        finish.style.height = (y2 + lh - y1 + 12) + 'px';
        finish.style.transform = 'translate3d(0,' + (y1 - 6) + 'px,0)';
        finish.style.top = '0';
        flag.style.left = (W - 30) + 'px';
        flag.style.transform = 'translate3d(0,' + (y1 - 30) + 'px,0)';
        ticks.forEach((t, i) => { t.style.left = Math.round(x0 + cw * 0.5 + (xEnd - x0) * ((i + 1) / TOTAL)) + 'px'; });
        carY1 = y1 + lh - carH - 7; carY2 = y2 + lh - carH - 7;
      }
      let carY1 = 0, carY2 = 0;

      // ---------- keadaan balapan ----------
      let racing = false, over = false, tLawan = 0, lawanF = 0, kamuF = 0, benar = 0, lastNow = 0;
      let tween = null, menang = null, idx = 0, terkunci = true;
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const pos = (f) => x0 + (xEnd - x0) * f;

      function gambarMobil() {
        lawan.style.transform = 'translate3d(' + pos(lawanF).toFixed(1) + 'px,' + carY1.toFixed(1) + 'px,0)';
        kamu.style.transform = 'translate3d(' + pos(kamuF).toFixed(1) + 'px,' + carY2.toFixed(1) + 'px,0)';
      }

      function garisKecepatan() {
        if (reduced) return;
        const x = pos(kamuF);
        for (let k = 0; k < 5; k++) {
          const s = h('i', { class: 'bl-streak', 'aria-hidden': 'true' });
          s.style.setProperty('--sx', (x - 8 - Math.random() * 14).toFixed(1) + 'px');
          s.style.setProperty('--sy', (carY2 + cw * 0.16 + k * (cw * 0.07)).toFixed(1) + 'px');
          scene.append(s);
          ctx.after(460, () => s.remove());
        }
      }

      function majuSatu() {
        benar++;
        ctx.progress(benar, TOTAL);
        ctx.sfx('whoosh');
        garisKecepatan();
        tween = { dari: kamuF, ke: benar / TOTAL, t: 0, dur: 0.6 };
        kamu.classList.add('is-go');
        if (benar >= TOTAL && !menang) menang = 'kamu';
      }

      // ---------- soal di bawah lintasan ----------
      function tampilSoal() {
        const q = soal[idx];
        card.replaceChildren(q.node);
        opts.replaceChildren();
        q.opsi.forEach((v, k) => {
          const b = h('button', { type: 'button', class: 'choice', 'aria-label': String(v) }, String(v));
          b.addEventListener('click', () => jawab(b, v));
          opts.append(b);
        });
        ctx.ask(ctx.isTK ? 'Ada berapa titik?' : 'Berapa hasilnya?', { speak: idx === 0, say: ctx.isTK ? 'Hitung titiknya. Ada berapa titik?' : 'Jawab hitungan dengan cepat!' });
        terkunci = false;
      }

      function jawab(btn, v) {
        if (!racing || over || terkunci) return;
        const q = soal[idx];
        if (v === q.jawab) {
          terkunci = true;
          btn.classList.add('is-correct');
          if (ctx.isTK) ctx.say(String(v));
          majuSatu();
          idx++;
          if (idx < soal.length && !menang) ctx.after(380, tampilSoal);
          else opts.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        } else {
          btn.disabled = true;
          terkunci = true;
          ctx.wrong(btn, { say: false });
          kamu.classList.remove('is-stall'); void kamu.offsetWidth; kamu.classList.add('is-stall');
          ctx.after(500, () => { terkunci = false; kamu.classList.remove('is-stall'); });
        }
      }

      // ---------- hitung mundur ----------
      function angkaBesar(teks) {
        const el = h('div', { class: 'bl-count', 'aria-hidden': 'true' }, h('span', { class: 'pop-in' }, teks));
        scene.append(el);
        ctx.after(640, () => el.remove());
      }
      function spanduk(teks, kalah) {
        const b = h('div', { class: 'bl-banner pop-in' + (kalah ? ' is-lose' : '') }, teks);
        scene.append(b);
      }

      function selesai(kamuMenang) {
        if (over) return;
        over = true;
        racing = false;
        lawan.classList.remove('is-go'); kamu.classList.remove('is-go');
        opts.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        const m = ctx.mistakes;
        if (kamuMenang) {
          spanduk('Kamu menang! 🏆');
          ctx.ask('Kamu menang! Hebat sekali!', { speak: false });
          ctx.after(1100, () => ctx.finish({
            stars: m <= 1 ? 3 : 2, total: TOTAL,
            lesson: 'Latihan setiap hari membuat hitunganmu makin cepat.',
          }));
        } else {
          spanduk('Lawan duluan!', true);
          ctx.ask('Lawan duluan. Ayo coba lagi!', { speak: false });
          ctx.after(1300, () => ctx.finish({
            stars: 1, total: TOTAL,
            message: 'Ayo coba lagi, kamu pasti bisa lebih cepat!',
            lesson: 'Latihan setiap hari membuat hitunganmu makin cepat.',
          }));
        }
      }

      // ---------- loop ----------
      ukur();
      gambarMobil();
      ctx.on(window, 'resize', () => { ukur(); gambarMobil(); });
      ctx.loop((dt, now) => {
        if (!ctx.alive) return false;
        const real = lastNow ? clamp((now - lastNow) / 1000, 0, 0.5) : 0;
        lastNow = now;
        ukurTerakhir += dt;
        if (ukurTerakhir > 0.5) { ukurTerakhir = 0; ukur(); }
        if (racing) {
          tLawan += real;
          lawanF = Math.min(1, tLawan / WAKTU_LAWAN);
        }
        if (tween) {
          tween.t += real;
          const p = clamp(tween.t / tween.dur, 0, 1);
          kamuF = tween.dari + (tween.ke - tween.dari) * ease(p);
          if (p >= 1) { tween = null; kamu.classList.remove('is-go'); }
        }
        gambarMobil();
        if (racing && !over) {
          if (menang === 'kamu' && !tween) selesai(true);
          else if (!menang && lawanF >= 1) selesai(false);
        }
        if (over) return false;
      });

      // ---------- mulai: hitung mundur 3-2-1 ----------
      ctx.ask(ctx.isTK ? 'Hitung titiknya, mobilmu melesat!' : 'Jawab dengan benar, mobilmu melesat!');
      await ctx.wait(500);
      for (const n of ['3', '2', '1']) {
        ctx.sfx('klik');
        angkaBesar(n);
        await ctx.wait(700);
      }
      ctx.sfx('whoosh');
      angkaBesar('Ayo!');
      racing = true;
      lawan.classList.add('is-go');
      tampilSoal();
    },
  });
})();
