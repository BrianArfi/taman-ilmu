/* 31 Menara Balok. Arkade susun: balok berayun di atas menara, ketuk untuk menjatuhkan.
   Bagian yang menggantung terpotong dan jatuh. Gerak lewat ctx.loop + translate3d.
   Di sela aksi ada soal hitung balok dan tinggi menara. */
(function () {
  const { h } = TI;

  const WARNA = ['#ff6b6b', '#ff922b', '#f0a800', '#37b24d', '#1c9fc9', '#4c8dff', '#9775fa', '#e64980'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const CSS = `
.play[data-game="menara"] .mn-hud { flex: none; display: grid; gap: 2px; padding: 8px 16px; text-align: left; }
.play[data-game="menara"] .mn-row { display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 1.15rem; }
.play[data-game="menara"] .mn-left { flex: none; white-space: nowrap; }
.play[data-game="menara"] .mn-time { flex: 1; height: 12px; border-radius: 999px; background: var(--line); overflow: hidden; }
.play[data-game="menara"] .mn-time i { display: block; height: 100%; border-radius: inherit; background: var(--c); transform-origin: left center; transform: scaleX(1); }
.play[data-game="menara"] .mn-unit { color: var(--muted); font-weight: 700; font-size: 1rem; }
.play[data-game="menara"] .mn-scene { flex: 1 1 340px; cursor: pointer; background: linear-gradient(180deg, #7cc6f5 0%, #b9e3fa 55%, #e6f6ff 100%); }
.play[data-game="menara"] .mn-bg, .play[data-game="menara"] .mn-world { position: absolute; left: 0; top: 0; width: 100%; height: 100%; will-change: transform; }
.play[data-game="menara"] .mn-sun { position: absolute; right: 12px; top: 8px; font-size: 2rem; line-height: 1; pointer-events: none; }
.play[data-game="menara"] .mn-cloud { position: absolute; height: 26px; border-radius: 999px; background: rgba(255, 255, 255, 0.85); }
.play[data-game="menara"] .mn-cloud::before { content: ""; position: absolute; left: 22%; top: -14px; width: 42%; height: 28px; border-radius: 50%; background: inherit; }
.play[data-game="menara"] .mn-ground {
  position: absolute; left: 0; top: 0; width: 100%; height: 600px;
  background: linear-gradient(180deg, #5fbf5a 0, #5fbf5a 12px, #8a6a45 12px, #7a5b3a 100%);
}
.play[data-game="menara"] .mn-ped {
  position: absolute; left: 0; top: 0; border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #d9d2c3 0, #b9b09c 100%); box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.5);
}
.play[data-game="menara"] .mn-rope {
  position: absolute; left: 0; top: 0; width: 4px; height: 1600px; border-radius: 2px; z-index: 1;
  background: linear-gradient(90deg, #8a6d3b, #b89455);
}
.play[data-game="menara"] .mn-rope::after { content: ""; position: absolute; left: -5px; bottom: -2px; width: 14px; height: 14px; border-radius: 50%; background: #6b5b3e; }
.play[data-game="menara"] .mn-blk { position: absolute; left: 0; top: 0; z-index: 2; will-change: transform; }
.play[data-game="menara"] .mn-piece { position: absolute; left: 0; top: 0; z-index: 0; will-change: transform; }
.play[data-game="menara"] .mn-body {
  position: relative; display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; border-radius: 7px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bc, #4c8dff) 72%, #fff) 0, var(--bc, #4c8dff) 100%);
  box-shadow: inset 0 -5px 0 color-mix(in srgb, var(--bc, #4c8dff) 68%, #000), inset 0 2px 0 rgba(255, 255, 255, 0.35), 0 2px 4px rgba(0, 0, 0, 0.14);
  color: #fff; font-weight: 800; font-size: 1.2rem; line-height: 1; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.28);
  transform-origin: 50% 100%;
}
.play[data-game="menara"] .mn-body::after { content: ""; position: absolute; inset: 0; background: #fff; opacity: 0; }
.play[data-game="menara"] .mn-blk.is-in .mn-body { animation: mn-in var(--dur-ui) var(--ease-out) both; }
.play[data-game="menara"] .mn-blk.is-land .mn-body { animation: mn-land 200ms var(--ease-out) both; }
.play[data-game="menara"] .mn-blk.is-perfect .mn-body::after { animation: mn-glint 420ms var(--ease-out) both; } /* motion-ok: kilau Pas! sengaja sedikit lebih lama */
.play[data-game="menara"] .mn-blk.is-count .mn-body::after { opacity: 0.6; transition: opacity var(--dur-press) var(--ease-out); }
.play[data-game="menara"] .mn-spark {
  position: absolute; left: 0; top: 0; z-index: 3; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 2px; pointer-events: none;
  background: #ffd23f; transform: translate3d(var(--cx), var(--cy), 0); animation: mn-spark 380ms var(--ease-out) both; /* motion-ok: percikan perayaan */
}
.play[data-game="menara"] .mn-float {
  position: absolute; left: 0; top: 0; z-index: 4; white-space: nowrap; pointer-events: none; font-size: 1.6rem; font-weight: 800;
  color: #ffd23f; text-shadow: 0 2px 0 #b9650a, 0 0 6px rgba(0, 0, 0, 0.25);
  transform: translate3d(var(--cx), var(--cy), 0) translateX(-50%); animation: mn-float 800ms var(--ease-out) both; /* motion-ok: teks pujian naik pelan */
}
.play[data-game="menara"] .mn-float.is-oops { color: #fff; text-shadow: 0 2px 0 #c92a2a, 0 0 6px rgba(0, 0, 0, 0.25); }
.play[data-game="menara"] .mn-bottom { flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 104px; gap: 10px; }
.play[data-game="menara"] .mn-drop { width: min(100%, 440px); min-height: 76px; font-size: 1.7rem; }
.play[data-game="menara"] .mn-bottom .ti-choices { flex-wrap: nowrap; gap: 8px; }
.play[data-game="menara"] .mn-bottom .choice { flex: 1 1 0; min-width: 0; min-height: 84px; padding: 8px 4px; font-size: 1.35rem; }
.play[data-game="menara"] .mn-opt { display: flex; flex-direction: column; align-items: center; gap: 6px; }
@keyframes mn-in { from { opacity: 0; transform: scale(0.95); } }
@keyframes mn-land { from { transform: scaleY(0.88); } to { transform: none; } }
@keyframes mn-glint { from { opacity: 0.85; } to { opacity: 0; } }
@keyframes mn-spark {
  from { opacity: 1; transform: translate3d(var(--cx), var(--cy), 0) scale(1); }
  to { opacity: 0; transform: translate3d(calc(var(--cx) + var(--dx)), calc(var(--cy) + var(--dy)), 0) scale(0.6); }
}
@keyframes mn-float {
  from { opacity: 0; transform: translate3d(var(--cx), calc(var(--cy) + 8px), 0) translateX(-50%) scale(0.95); }
  20% { opacity: 1; }
  to { opacity: 0; transform: translate3d(var(--cx), calc(var(--cy) - 46px), 0) translateX(-50%); }
}
@media (max-width: 560px) {
  .play[data-game="menara"] .mn-row { font-size: 1.05rem; }
  .play[data-game="menara"] .mn-drop { font-size: 1.5rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="menara"] .mn-blk.is-in .mn-body { animation-name: ti-fade !important; }
  .play[data-game="menara"] .mn-blk.is-land .mn-body { animation: none !important; }
  .play[data-game="menara"] .mn-spark { display: none; }
  .play[data-game="menara"] .mn-float { animation-name: mn-float-r !important; }
}
@keyframes mn-float-r { from { opacity: 0; } 20% { opacity: 1; } to { opacity: 0; } }`;

  TI.register({
    id: 'menara',
    title: 'Menara Balok',
    cat: 'mat',
    icon: '🧱',
    desc: 'Jatuhkan balok pas di atas menara, lalu hitung tinggi menaranya!',
    start(ctx) {
      TI.style('menara', CSS);
      const reduced = TI.reduced();
      const RONDE = ['Pemanasan', 'Tantangan', 'Final'];
      const TOTAL = ctx.isTK ? 8 : 10;
      const ASK_AT = ctx.isTK ? [3, 6, 8] : [4, 8, 10];
      const WAKTU = 60; // detik nyata, berhenti saat soal
      const TOL = ctx.isTK ? 16 : 8; // selisih (px) yang masih dihitung "Pas!"
      const G = 2600;

      // ---------- tampilan ----------
      const left = h('span', { class: 'mn-left' }, 'Ronde 1 ' + RONDE[0] + ' · Sisa balok: ' + TOTAL);
      const barFill = h('i');
      const hud = h('div', { class: 'ti-panel mn-hud' },
        h('div', { class: 'mn-row' }, left, h('span', { class: 'mn-time', 'aria-hidden': 'true' }, barFill)),
        ctx.isSD ? h('div', { class: 'mn-unit' }, 'Tiap balok tingginya 3 cm') : null);

      const bg = h('div', { class: 'mn-bg', 'aria-hidden': 'true' });
      [[6, 36, 120], [58, 96, 90], [24, -130, 130], [66, -260, 100], [10, -420, 110], [52, -560, 120]].forEach(([x, y, w]) => {
        const c = h('div', { class: 'mn-cloud', style: { left: x + '%', top: y + 'px', width: w + 'px' } });
        bg.append(c);
      });
      const piecesLayer = h('div');
      const ground = h('div', { class: 'mn-ground' });
      const ped = h('div', { class: 'mn-ped' });
      const towerLayer = h('div');
      const rope = h('div', { class: 'mn-rope' });
      const fxLayer = h('div');
      const world = h('div', { class: 'mn-world' }, piecesLayer, ground, ped, towerLayer, rope, fxLayer);
      const scene = h('div', { class: 'ti-scene mn-scene', 'data-tap': true, role: 'button', 'aria-label': 'Jatuhkan balok' },
        bg, world, h('span', { class: 'mn-sun', 'aria-hidden': 'true' }, '☀️'));

      const bottom = h('div', { class: 'mn-bottom' });
      const dropBtn = h('button', { type: 'button', class: 'ti-btn mn-drop' }, 'Jatuhkan!');
      ctx.el.append(hud, scene, bottom);
      ctx.progress(0, TOTAL);

      // ---------- keadaan ----------
      let W = 0, H = 0, bh = 36, groundY = 0, y0 = 0, pedH = 0, bw0 = 120;
      let state = 'swing'; // swing | drop | wait | ask | done
      let cur = null, drops = 0, streak = 0, phase = Math.random() * 6.28;
      let rondeLalu = -1, meleset = 0, mudah = false;
      const ronde = () => Math.min(2, Math.floor((drops * 3) / TOTAL));
      let cam = 0, camTarget = 0, tLeft = WAKTU, lastNow = 0, ukurTerakhir = 0, timeUp = false;
      const stack = [], pieces = [];
      const pedData = { x: 0, w: 0 };

      const place = (b) => { b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px,0)'; };
      const topData = () => (stack.length ? stack[stack.length - 1] : pedData);
      const rowY = (i) => y0 - (i + 1) * bh; // y atas balok ke-i (mulai 0)

      function mkBlock(num, w, color) {
        const el = h('div', { class: 'mn-blk' }, h('span', { class: 'mn-body' }, h('b', null, num)));
        el.style.width = Math.round(w) + 'px';
        el.style.height = bh + 'px';
        el.style.setProperty('--bc', color);
        return { el, w, x: 0, y: 0, vy: 0, color, num };
      }

      function ukur(first) {
        const w = scene.clientWidth || 360, hh = scene.clientHeight || 360;
        if (!first && w === W && hh === H) return;
        const k = first || !W ? 1 : w / W;
        W = w; H = hh;
        bh = Math.round(clamp(H / 10.5, ctx.isTK ? 30 : 28, 54));
        const groundH = Math.round(clamp(H * 0.08, 26, 44));
        groundY = H - groundH;
        pedH = Math.round(bh * 0.45);
        y0 = groundY - pedH;
        bw0 = Math.round(clamp(W * (ctx.isTK ? 0.5 : 0.38), 90, ctx.isTK ? 280 : 210));
        pedData.w = Math.round(Math.min(W - 24, bw0 * 1.35));
        pedData.x = Math.round((W - pedData.w) / 2);
        ground.style.transform = 'translate3d(0,' + groundY + 'px,0)';
        ped.style.width = pedData.w + 'px';
        ped.style.height = pedH + 'px';
        ped.style.transform = 'translate3d(' + pedData.x + 'px,' + y0 + 'px,0)';
        const all = stack.concat(cur ? [cur] : []);
        all.forEach((b) => { b.x *= k; b.w *= k; b.el.style.width = Math.round(b.w) + 'px'; b.el.style.height = bh + 'px'; });
        stack.forEach((b, i) => { b.y = rowY(i); place(b); });
        if (cur) { cur.targetY = rowY(stack.length); if (state === 'swing') cur.y = cur.targetY - bh * 1.9; place(cur); }
        camTarget = camFor();
      }
      function camFor() { return Math.max(0, H * 0.6 - (y0 - stack.length * bh)); }

      // ---------- efek ----------
      function percikan(cx, cy, n) {
        if (reduced) return;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + Math.random() * 0.6, d = 26 + Math.random() * 30;
          const sp = h('i', { class: 'mn-spark', 'aria-hidden': 'true' });
          sp.style.setProperty('--cx', cx.toFixed(1) + 'px');
          sp.style.setProperty('--cy', cy.toFixed(1) + 'px');
          sp.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
          sp.style.setProperty('--dy', (Math.sin(a) * d - 8).toFixed(1) + 'px');
          fxLayer.append(sp);
          ctx.after(420, () => sp.remove());
        }
      }
      function teks(txt, cx, cy, oops) {
        const t = h('span', { class: 'mn-float' + (oops ? ' is-oops' : ''), 'aria-hidden': 'true' }, txt);
        t.style.setProperty('--cx', cx.toFixed(1) + 'px');
        t.style.setProperty('--cy', cy.toFixed(1) + 'px');
        fxLayer.append(t);
        ctx.after(860, () => t.remove());
      }
      function jatuhkanPotongan(x, y, w, vx, vr, color, num) {
        if (w < 2) return;
        const b = mkBlock(num == null ? '' : num, w, color);
        b.x = x; b.y = y; b.vx = vx; b.rot = 0; b.vr = reduced ? 0 : vr; b.vy = 40;
        place(b);
        b.el.className = 'mn-piece';
        piecesLayer.append(b.el);
        pieces.push(b);
      }

      // ---------- alur balok ----------
      function omega() {
        const o = ctx.isTK ? 1.45 + drops * 0.04 : 1.9 + drops * 0.12;
        return reduced ? o * 0.6 : o;
      }
      function spawn() {
        const w = stack.length ? stack[stack.length - 1].w : bw0;
        const b = mkBlock(stack.length + 1, w, WARNA[drops % WARNA.length]);
        b.targetY = rowY(stack.length);
        b.y = b.targetY - bh * 1.9;
        b.x = (W - w) / 2;
        b.el.classList.add('is-in');
        place(b);
        towerLayer.append(b.el);
        cur = b;
        rope.style.transform = 'translate3d(' + (b.x + b.w / 2 - 2).toFixed(1) + 'px,' + (b.y - 1596).toFixed(1) + 'px,0)';
        state = 'swing';
        rope.style.visibility = '';
        const r = ronde();
        if (r !== rondeLalu) {
          if (drops > 0) {
            ctx.say('Ronde ' + (r + 1) + ' ' + RONDE[r] + '! Makin cepat, kamu pasti bisa!');
            teks('Ronde ' + (r + 1) + '!', W / 2, H * 0.25);
          }
          rondeLalu = r;
        }
        mudah = meleset >= 3;
        if (meleset === 3) ctx.say('Masih ada kesempatan! Sekarang lebih gampang, ketuk pas balok di tengah!');
        bottom.replaceChildren(dropBtn);
        ctx.ask('Ketuk untuk menjatuhkan balok!', { speak: false });
      }

      function jatuhkan() {
        if (state !== 'swing' || !cur) return;
        state = 'drop';
        rope.style.visibility = 'hidden';
        ctx.sfx('whoosh');
        const b = cur, first = stack.length === 0, top = topData();
        let x = b.x;
        if (first) x = clamp(x, pedData.x - b.w * 0.5, pedData.x + pedData.w - b.w * 0.5);
        b.x = x;
        b.res = { ov: Math.min(x + b.w, top.x + top.w) - Math.max(x, top.x), dc: (x + b.w / 2) - (top.x + top.w / 2) };
        b.vy = 0;
        if (b.res.ov < 3) { // meleset total: jatuh ke tanah
          cur = null; drops++; meleset++;
          towerLayer.removeChild(b.el);
          jatuhkanPotongan(b.x, b.y, b.w, (b.res.dc > 0 ? 1 : -1) * 50, (b.res.dc > 0 ? 1 : -1) * 2.2, b.color, '');
          streak = 0;
          state = 'wait';
          ctx.after(260, () => {
            ctx.wrong(null, { say: false });
            teks('Meleset!', W / 2, rowY(stack.length) + bh / 2, true);
          });
          selesaiJatuh();
        }
      }

      function mendarat() {
        const b = cur, first = stack.length === 0, top = topData();
        meleset = 0;
        const { ov, dc } = b.res;
        let x = b.x, w = b.w;
        b.y = b.targetY;
        cur = null; drops++;
        state = 'wait';
        if (Math.abs(dc) <= TOL) { // Pas!
          x = top.x + (top.w - w) / 2;
          streak++;
          b.el.classList.add('is-perfect');
          ctx.sfx('benar');
          percikan(x + w / 2, b.y + bh / 2, 10);
          teks(streak > 1 ? 'Pas! x' + streak : 'Pas!', x + w / 2, b.y - 6);
        } else {
          streak = 0;
          const nx = Math.max(x, top.x);
          if (x < top.x) jatuhkanPotongan(x, b.y, top.x - x, -50, -2.6, b.color, '');
          else jatuhkanPotongan(top.x + top.w, b.y, x + w - (top.x + top.w), 50, 2.6, b.color, '');
          x = nx; w = ov;
          ctx.sfx('pop');
          percikan(x + w / 2, b.y + bh, 4);
          teks('+1', x + w / 2, b.y - 6);
        }
        b.x = x; b.w = w;
        b.el.style.width = Math.round(w) + 'px';
        b.el.classList.remove('is-in');
        b.el.classList.add('is-land');
        place(b);
        stack.push(b);
        camTarget = camFor();
        selesaiJatuh();
      }

      async function selesaiJatuh() {
        ctx.progress(drops, TOTAL);
        left.textContent = 'Ronde ' + (ronde() + 1) + ' ' + RONDE[ronde()] + ' · Sisa balok: ' + (TOTAL - drops);
        await ctx.wait(560);
        if (ASK_AT.includes(drops)) await tanya(ASK_AT.indexOf(drops) === ASK_AT.length - 1 && ctx.isSD ? 'sisa' : ctx.isSD ? 'tinggi' : 'hitung');
        if (drops >= TOTAL) return selesai();
        spawn();
      }

      function waktuHabis() {
        timeUp = true;
        state = 'wait';
        rope.style.visibility = 'hidden';
        if (cur) { cur.el.remove(); cur = null; }
        teks('Waktu habis!', W / 2, H * 0.3, true);
        (async () => {
          await ctx.wait(700);
          await tanya(ctx.isSD ? 'tinggi' : 'hitung');
          selesai();
        })();
      }

      // ---------- soal ----------
      async function tanya(jenis) {
        state = 'ask';
        const n = stack.length;
        bottom.replaceChildren();
        let teksSoal, jawab, opsi;
        if (jenis === 'hitung') {
          teksSoal = 'Ada berapa balok di menara?';
          jawab = n;
          opsi = TI.numChoices(n, 3, 1, Math.max(n + 3, 5)).map((v) => ({
            value: v, say: String(v), aria: v + ' balok',
            node: h('span', { class: 'mn-opt' }, h('span', null, v), TI.dots(v)),
          }));
        } else if (jenis === 'tinggi') {
          teksSoal = 'Tiap balok tingginya 3 cm. Berapa tinggi menara?';
          jawab = n * 3;
          const pool = [n * 3 + 3, n * 3 - 3, n * 3 + 6, n * 3 - 6, n + 3, n * 2].filter((v) => v > 0 && v !== jawab);
          opsi = TI.optionsFrom(jawab, [...new Set(pool)], 4).map((v) => ({ value: v, label: v + ' cm', say: v + ' senti meter' }));
        } else {
          teksSoal = 'Berapa balok lagi supaya menara punya 15 balok?';
          jawab = 15 - n;
          const pool = [jawab - 2, jawab - 1, jawab + 1, jawab + 2, n, 15].filter((v) => v > 0 && v !== jawab);
          opsi = TI.optionsFrom(jawab, [...new Set(pool)], 4).map((v) => ({ value: v, label: String(v) }));
        }
        ctx.ask(teksSoal, { say: teksSoal.replace('cm', 'senti meter') });
        if (jenis === 'hitung') {
          for (const b of stack) { // hitung dari bawah ke atas
            b.el.classList.add('is-count');
            ctx.sfx('klik');
            await ctx.wait(230);
            b.el.classList.remove('is-count');
          }
        }
        const wrap = h('div', { class: 'ti-choices' });
        bottom.append(wrap);
        await ctx.choose({ options: opsi, answer: jawab, into: wrap, speakLabel: ctx.isTK });
        bottom.replaceChildren();
        if (!timeUp && drops < TOTAL) await ctx.wait(200);
      }

      function selesai() {
        state = 'done';
        const m = ctx.mistakes + (timeUp ? TOTAL - drops : 0);
        const stars = ctx.isTK ? (m <= 1 ? 3 : m <= 3 ? 2 : 1) : (m <= 2 ? 3 : m <= 5 ? 2 : 1);
        bottom.replaceChildren();
        ctx.ask(ctx.isTK ? 'Menara kamu sudah jadi!' : 'Menara kamu sudah jadi! Tingginya ' + stack.length * 3 + ' cm.', { speak: false });
        ctx.after(500, () => ctx.finish({
          stars, total: TOTAL,
          lesson: ctx.isTK ? 'Menghitung benda bertumpuk: hitung dari bawah ke atas.' : 'Perkalian membantu menghitung cepat: 4 balok × 3 cm = 12 cm.',
        }));
      }

      // ---------- input ----------
      ctx.on(scene, 'pointerdown', (e) => { if (e.button > 0) return; jatuhkan(); });
      dropBtn.addEventListener('click', jatuhkan);
      ctx.on(document, 'keydown', (e) => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); jatuhkan(); } });
      ctx.on(window, 'resize', () => ukur(false));

      // ---------- mulai ----------
      ukur(true);
      spawn();
      ctx.ask('Ketuk untuk menjatuhkan balok. Susun setinggi mungkin!');

      ctx.loop((dt, now) => {
        if (state === 'done') return false;
        const real = lastNow ? clamp((now - lastNow) / 1000, 0, 0.5) : 0;
        lastNow = now;
        ukurTerakhir += dt;
        if (ukurTerakhir > 0.5) { ukurTerakhir = 0; ukur(false); }

        // kamera ikut naik
        const kecepatan = reduced ? 1 : Math.min(1, dt * 6);
        cam += (camTarget - cam) * kecepatan;
        if (Math.abs(camTarget - cam) < 0.2) cam = camTarget;
        world.style.transform = 'translate3d(0,' + cam.toFixed(1) + 'px,0)';
        bg.style.transform = 'translate3d(0,' + (cam * 0.35).toFixed(1) + 'px,0)';

        // potongan yang jatuh
        for (let i = pieces.length - 1; i >= 0; i--) {
          const p = pieces[i];
          p.vy += G * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt;
          p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) rotate(' + p.rot.toFixed(2) + 'rad)';
          if (p.y > groundY + 10) { p.el.remove(); pieces.splice(i, 1); }
        }

        if (state === 'swing' && cur) {
          if (drops > 0) tLeft -= real; // waktu baru berjalan setelah balok pertama dijatuhkan
          barFill.style.transform = 'scaleX(' + clamp(tLeft / WAKTU, 0, 1).toFixed(3) + ')';
          phase += omega() * dt;
          const amp0 = Math.max(0, (W - cur.w) / 2 - 8);
          const amp = Math.min(amp0, ctx.isTK ? Math.min(W * 0.22, 150) : 190) * (mudah ? 0.55 : 1);
          cur.x = (W - cur.w) / 2 + amp * Math.sin(phase);
          place(cur);
          rope.style.transform = 'translate3d(' + (cur.x + cur.w / 2 - 2).toFixed(1) + 'px,' + (cur.y - 1600 + 4).toFixed(1) + 'px,0)';
          if (tLeft <= 0 && !timeUp) waktuHabis();
        } else if (state === 'drop' && cur) {
          cur.vy += G * dt;
          cur.y += cur.vy * dt;
          if (cur.y >= cur.targetY) { cur.y = cur.targetY; place(cur); mendarat(); } else place(cur);
        }
      });
    },
  });
})();
