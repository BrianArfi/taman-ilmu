/* 23 Ayo Thawaf & Sa'i. Thawaf: titik pemain (tanpa wajah) mengelilingi Ka'bah 7 kali berlawanan arah jarum jam
   (ketuk "Langkah" atau seret melingkar). Sa'i (SD): berjalan Shafa - Marwah 7 kali. Fakta hanya dari SPEC.md bagian 23.
   Gerak titik lewat ctx.loop dengan easing ease-in-out. */
(function () {
  const { h, svg, shuffle } = TI;

  const KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh'];
  const RUKUN = [
    { label: 'Ihram', say: 'Ihram, niat dan memakai pakaian ihram', icon: '🤍' },
    { label: 'Wukuf di Arafah', icon: '⛰️' },
    { label: 'Thawaf', icon: '🕋' },
    { label: "Sa'i", icon: '👣' },
    { label: 'Tahallul', say: 'Tahallul, memotong atau mencukur rambut', icon: '✂️' },
  ];
  const LESSON = "Haji adalah rukun Islam kelima bagi yang mampu. Thawaf 7 kali mengelilingi Ka'bah, Sa'i 7 kali antara Shafa dan Marwah.";
  const P = '.play[data-game="haji"]';

  const CSS = `
${P} .hj-panel { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 12px; flex: none; min-height: 70px; padding: 6px 16px; }
${P} .hj-lbl { font-weight: 800; color: var(--muted); font-size: 1.1rem; }
${P} .hj-n { font-size: 2.6rem; line-height: 1; color: var(--c); min-width: 1.2em; text-align: center; }
${P} .hj-n.is-pop { animation: hj-pop var(--dur-ui-max) var(--ease-pop); }
${P} .hj-scene {
  position: relative; flex: none; width: min(100%, 420px, max(300px, calc(100dvh - 400px))); aspect-ratio: 1; border-radius: 22px; overflow: hidden;
  background: #efe5cf; box-shadow: 0 5px 0 var(--shadow); touch-action: none; user-select: none; -webkit-user-select: none; cursor: grab;
}
${P} .hj-scene.is-sai { aspect-ratio: 400 / 250; width: min(100%, 560px); }
${P} .hj-scene svg { display: block; width: 100%; height: 100%; }
${P} .hj-big {
  position: absolute; left: 50%; top: 13%; width: 5.4rem; height: 5.4rem; margin-left: -2.7rem; display: grid; place-items: center; pointer-events: none;
  border-radius: 50%; background: radial-gradient(circle at 40% 32%, #fff6c4, #ffd23f 70%); border: 4px solid #fff;
  box-shadow: 0 6px 0 rgba(176, 124, 0, 0.35); font-size: 3.4rem; font-weight: 800; line-height: 1; color: #9a5b00; opacity: 0;
}
${P} .hj-scene.is-sai .hj-big { top: 17%; width: 4.4rem; height: 4.4rem; margin-left: -2.2rem; font-size: 2.8rem; }
${P} .hj-big.is-show { animation: hj-num 1100ms var(--ease-out) both; } /* motion-ok: angka putaran muncul sebentar, perayaan kecil */
${P} .hj-lamp-on { opacity: 0; transition: opacity var(--dur-ui-max) var(--ease-out); }
${P} .hj-lamp.is-on .hj-lamp-on { opacity: 1; }
${P} .hj-glow.is-pulse { animation: hj-pulse 220ms var(--ease-out); transform-box: fill-box; transform-origin: center; }
${P} .hj-bunga { transform-box: fill-box; transform-origin: center; animation: hj-bunga 520ms var(--ease-out) both; } /* motion-ok: percikan jejak langkah */
${P} .hj-go { width: min(100%, 420px); min-height: 72px; font-size: 1.6rem; flex: none; }
${P} .hj-msg { margin: 0; min-height: 1.4em; text-align: center; font-weight: 800; color: #b34700; }
${P} .hj-opt { display: inline-flex; flex-direction: column; align-items: center; gap: 6px; }
${P} .hj-opt b { font-size: 2.2rem; line-height: 1; }
@keyframes hj-pop { 50% { transform: scale(1.2); } }
@keyframes hj-num {
  0% { opacity: 0; transform: scale(0.95); }
  18% { opacity: 1; transform: scale(1.06); }
  30% { transform: scale(1); }
  75% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes hj-pulse { 50% { transform: scale(1.35); } }
@keyframes hj-bunga { from { opacity: 0.9; transform: scale(0.95); } to { opacity: 0; transform: scale(1.6); } }
@media (prefers-reduced-motion: reduce) {
  ${P} .hj-bunga, ${P} .hj-glow.is-pulse { animation: none; }
  ${P} .hj-big.is-show { animation: hj-fade 900ms var(--ease-out) both; } /* motion-ok: pengganti lembut saat gerak dikurangi */
}
@keyframes hj-fade { 0% { opacity: 0; } 20%, 75% { opacity: 1; } 100% { opacity: 0; } }`;

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const kurung = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- gambar thawaf (tampak atas) ----------
  const CX = 200, CY = 200, R = 125;
  function gambarThawaf(uid) {
    const s = svg;
    const el = s('svg', { viewBox: '0 0 400 400', role: 'img', 'aria-label': "Ka'bah dilihat dari atas, dengan lintasan thawaf melingkar" });
    el.append(s('defs', null,
      s('radialGradient', { id: uid + 'f', cx: '50%', cy: '50%', r: '55%' },
        s('stop', { offset: '0%', 'stop-color': '#ffffff' }), s('stop', { offset: '100%', 'stop-color': '#f2ead7' })),
      s('radialGradient', { id: uid + 'd', cx: '38%', cy: '32%', r: '75%' },
        s('stop', { offset: '0%', 'stop-color': '#ffffff' }), s('stop', { offset: '100%', 'stop-color': '#ffe58a' }))));
    el.append(
      s('rect', { width: 400, height: 400, fill: '#efe5cf' }),
      s('circle', { cx: CX, cy: CY, r: 194, fill: 'url(#' + uid + 'f)', stroke: '#e2d6b9', 'stroke-width': 3 }),
      s('circle', { cx: CX, cy: CY, r: 150, fill: 'none', stroke: '#ece3cc', 'stroke-width': 2 }),
      s('circle', { cx: CX, cy: CY, r: 100, fill: 'none', stroke: '#ece3cc', 'stroke-width': 2 }),
      // lintasan putus-putus
      s('circle', { cx: CX, cy: CY, r: R, fill: 'none', stroke: '#c9bb94', 'stroke-width': 4, 'stroke-dasharray': '7 9', 'stroke-linecap': 'round' }));
    // panah arah (berlawanan jarum jam)
    for (const deg of [45, 135, 225, 315]) {
      const a = deg * Math.PI / 180;
      const arah = Math.atan2(-Math.cos(a), Math.sin(a)) * 180 / Math.PI;
      el.append(s('path', {
        d: 'M-7 -7 L7 0 L-7 7 Z', fill: '#e0b43a', opacity: 0.85, stroke: '#fff', 'stroke-width': 1.5, 'stroke-linejoin': 'round',
        transform: 'translate(' + (CX + R * Math.cos(a)).toFixed(1) + ' ' + (CY + R * Math.sin(a)).toFixed(1) + ') rotate(' + arah.toFixed(1) + ')',
      }));
    }
    // Ka'bah: kubus hitam, sabuk emas, pintu emas
    el.append(
      s('ellipse', { cx: 206, cy: 252, rx: 50, ry: 9, fill: 'rgba(60, 50, 20, 0.2)' }),
      s('polygon', { points: '164,190 228,190 246,176 182,176', fill: '#3d3d44' }),
      s('rect', { x: 164, y: 190, width: 64, height: 56, fill: '#1b1b1f' }),
      s('polygon', { points: '228,190 246,176 246,232 228,246', fill: '#101013' }),
      s('rect', { x: 164, y: 203, width: 64, height: 9, fill: '#f2c94c' }),
      s('rect', { x: 164, y: 211, width: 64, height: 1.6, fill: '#c9962a' }),
      s('polygon', { points: '228,203 246,189 246,198 228,212', fill: '#d9a92b' }),
      s('polygon', { points: '182,176 246,176 246,179 182,179', fill: 'rgba(255,255,255,0.08)' }),
      s('path', { d: 'M203 246 L203 226 Q211 216 219 226 L219 246 Z', fill: '#e8bd45', stroke: '#b5851f', 'stroke-width': 1.5 }),
      s('text', { x: 205, y: 272, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#7a6330', text: "Ka'bah" }));
    // tujuh lampu (satu menyala per putaran)
    const lampu = [];
    for (let k = 0; k < 7; k++) {
      const a = Math.PI / 2 - (2 * Math.PI * k) / 7;
      const x = CX + 168 * Math.cos(a), y = CY + 168 * Math.sin(a);
      const g = s('g', { class: 'hj-lamp', transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' },
        s('circle', { r: 13, fill: '#e6dfca', stroke: '#cfc4a3', 'stroke-width': 2 }),
        s('g', { class: 'hj-lamp-on' },
          s('circle', { r: 19, fill: 'rgba(255, 210, 63, 0.4)' }),
          s('circle', { r: 13, fill: 'url(#' + uid + 'd)', stroke: '#e0a800', 'stroke-width': 2 })),
        s('text', { y: 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#6a5a2b', text: String(k + 1) }));
      el.append(g);
      lampu.push(g);
    }
    // titik pemain: lingkaran putih bersinar, tanpa wajah
    const glow = s('circle', { class: 'hj-glow', r: 20, fill: 'rgba(255, 214, 80, 0.5)' });
    const dot = s('g', null, glow,
      s('circle', { r: 11, fill: '#fff', stroke: '#f2b705', 'stroke-width': 4 }),
      s('circle', { r: 4, cx: -3, cy: -3, fill: 'rgba(255, 233, 150, 0.9)' }));
    el.append(dot);
    return { el, dot, glow, lampu };
  }

  // ---------- gambar sa'i ----------
  const SAI_A = 82, SAI_B = 318, SAI_Y = 198;
  function gambarSai(uid) {
    const s = svg;
    const el = s('svg', { viewBox: '0 0 400 250', role: 'img', 'aria-label': 'Bukit Shafa di kiri, bukit Marwah di kanan, dan jalan di antaranya' });
    el.append(s('defs', null,
      s('linearGradient', { id: uid + 's', x1: 0, y1: 0, x2: 0, y2: 1 },
        s('stop', { offset: '0%', 'stop-color': '#aee0ff' }), s('stop', { offset: '100%', 'stop-color': '#fff0cc' })),
      s('radialGradient', { id: uid + 'd', cx: '38%', cy: '32%', r: '75%' },
        s('stop', { offset: '0%', 'stop-color': '#ffffff' }), s('stop', { offset: '100%', 'stop-color': '#ffe58a' }))));
    el.append(
      s('rect', { width: 400, height: 250, fill: 'url(#' + uid + 's)' }),
      s('ellipse', { cx: 70, cy: 52, rx: 30, ry: 9, fill: 'rgba(255,255,255,0.8)' }),
      s('ellipse', { cx: 330, cy: 70, rx: 36, ry: 10, fill: 'rgba(255,255,255,0.7)' }),
      // bukit Shafa (kiri)
      s('path', { d: 'M0 176 L0 128 Q22 84 60 74 Q98 66 122 108 Q142 142 156 176 Z', fill: '#d4af73' }),
      s('path', { d: 'M60 74 Q98 66 122 108 Q142 142 156 176 L96 176 Q104 120 60 74 Z', fill: '#bf9755' }),
      s('ellipse', { cx: 40, cy: 130, rx: 12, ry: 6, fill: '#b58a4e', opacity: 0.7 }),
      s('ellipse', { cx: 82, cy: 156, rx: 9, ry: 5, fill: '#a77d43', opacity: 0.7 }),
      // bukit Marwah (kanan)
      s('path', { d: 'M244 176 Q262 130 288 98 Q322 56 356 66 Q390 78 400 122 L400 176 Z', fill: '#d9b57a' }),
      s('path', { d: 'M356 66 Q390 78 400 122 L400 176 L350 176 Q366 118 356 66 Z', fill: '#c39c5c' }),
      s('ellipse', { cx: 318, cy: 132, rx: 12, ry: 6, fill: '#b58a4e', opacity: 0.7 }),
      s('ellipse', { cx: 360, cy: 158, rx: 9, ry: 5, fill: '#a77d43', opacity: 0.7 }),
      // tanah dan jalan
      s('rect', { x: 0, y: 174, width: 400, height: 76, fill: '#ecd9a8' }),
      s('rect', { x: 36, y: 182, width: 328, height: 32, rx: 16, fill: '#f9f1d9', stroke: '#dcc78e', 'stroke-width': 2 }),
      s('line', { x1: 56, y1: SAI_Y, x2: 344, y2: SAI_Y, stroke: '#e3d3a2', 'stroke-width': 3, 'stroke-dasharray': '8 10', 'stroke-linecap': 'round' }),
      s('rect', { x: 30, y: 222, width: 104, height: 24, rx: 12, fill: '#fff', stroke: '#d8c28a', 'stroke-width': 2 }),
      s('text', { x: 82, y: 240, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#6b4a1e', text: 'Shafa' }),
      s('rect', { x: 266, y: 222, width: 104, height: 24, rx: 12, fill: '#fff', stroke: '#d8c28a', 'stroke-width': 2 }),
      s('text', { x: 318, y: 240, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#6b4a1e', text: 'Marwah' }));
    // tujuh penanda perjalanan
    const penanda = [];
    for (let k = 0; k < 7; k++) {
      const g = s('g', { class: 'hj-lamp', transform: 'translate(' + (128 + k * 24) + ' 22)' },
        s('circle', { r: 10, fill: '#fff', stroke: '#d8c28a', 'stroke-width': 2 }),
        s('g', { class: 'hj-lamp-on' }, s('circle', { r: 10, fill: 'url(#' + uid + 'd)', stroke: '#e0a800', 'stroke-width': 2 })),
        s('text', { y: 4.5, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#6a5a2b', text: String(k + 1) }));
      el.append(g);
      penanda.push(g);
    }
    const glow = s('circle', { class: 'hj-glow', r: 19, fill: 'rgba(255, 214, 80, 0.5)' });
    const dot = s('g', null, glow,
      s('circle', { r: 10, fill: '#fff', stroke: '#f2b705', 'stroke-width': 4 }),
      s('circle', { r: 3.6, cx: -3, cy: -3, fill: 'rgba(255, 233, 150, 0.9)' }));
    el.append(dot);
    return { el, dot, glow, penanda };
  }

  TI.register({
    id: 'haji',
    title: "Ayo Thawaf & Sa'i",
    cat: 'islam',
    icon: '⛺',
    desc: "Putari Ka'bah 7 kali, lalu berjalan dari Shafa ke Marwah.",
    start(ctx) {
      TI.style('haji', CSS);
      const reduced = TI.reduced();
      const TK = ctx.isTK;
      const TOTAL = TK ? 9 : 17;
      let selesaiUnit = 0;
      const maju = (n = 1) => { selesaiUnit += n; ctx.progress(selesaiUnit, TOTAL); };

      const ulangAnim = (el, kelas, ms) => {
        el.classList.remove(kelas); void el.getBoundingClientRect(); el.classList.add(kelas);
        if (ms) ctx.after(ms, () => el.classList.remove(kelas));
      };
      function angkaBesar(box, n) {
        box.textContent = String(n);
        ulangAnim(box, 'is-show', 1150);
      }
      function bunga(svgEl, x, y) {
        if (reduced) return;
        const c = svg('circle', { class: 'hj-bunga', cx: x.toFixed(1), cy: y.toFixed(1), r: 7, fill: '#ffd23f' });
        svgEl.insertBefore(c, svgEl.lastChild);
        ctx.after(560, () => c.remove());
      }

      // ---------- babak thawaf ----------
      async function thawaf() {
        ctx.clear();
        const uid = 'hj' + Math.random().toString(36).slice(2, 6);
        const art = gambarThawaf(uid);
        const big = h('div', { class: 'hj-big', 'aria-hidden': 'true' }, '1');
        const scene = h('div', { class: 'hj-scene', 'aria-label': "Seret melingkar berlawanan arah jarum jam di sekitar Ka'bah" }, art.el, big);
        const nEl = h('b', { class: 'hj-n' }, '0');
        const panel = h('div', { class: 'ti-panel hj-panel' }, h('span', { class: 'hj-lbl' }, 'Putaran'), nEl, h('span', { class: 'hj-lbl' }, 'dari 7'));
        const pesan = h('p', { class: 'hj-msg', 'aria-live': 'polite' });
        const btn = h('button', { type: 'button', class: 'ti-btn hj-go' }, 'Langkah 👣');
        ctx.el.append(panel, scene, pesan, btn);
        const tanya = TK ? "Ayo thawaf mengelilingi Ka'bah! Ketuk Langkah." : "Thawaf: kelilingi Ka'bah 7 kali. Ka'bah di sebelah kiri.";
        ctx.ask(tanya, { say: TK ? "Ayo thawaf mengelilingi Ka'bah! Ketuk tombol Langkah." : "Thawaf: kelilingi Ka'bah 7 kali. Ka'bah ada di sebelah kiri kita." });

        const langkah = TK ? 0.25 : 0.125;
        let prog = 0, shown = 0, tw = null, lap = 0, tutup = false, seret = null, peringatan = -1e9;
        const taruh = () => {
          const a = Math.PI / 2 - 2 * Math.PI * shown;
          art.dot.setAttribute('transform', 'translate(' + (CX + R * Math.cos(a)).toFixed(1) + ' ' + (CY + R * Math.sin(a)).toFixed(1) + ')');
        };
        taruh();

        function lapSelesai(k) {
          nEl.textContent = String(k);
          ulangAnim(nEl, 'is-pop', 320);
          art.lampu[k - 1].classList.add('is-on');
          angkaBesar(big, k);
          ctx.sfx('benar');
          ctx.say(k === 7 ? 'Tujuh! Thawaf selesai, hebat!' : KATA[k] + '!');
          maju();
        }
        function geser(ke, dur) {
          prog = Math.min(7, ke);
          tw = { dari: shown, ke: prog, t: 0, dur: reduced ? 0.12 : dur };
        }
        function ketuk() {
          if (tutup || prog >= 7) return;
          ctx.sfx('tap');
          ulangAnim(art.glow, 'is-pulse', 240);
          const a = Math.PI / 2 - 2 * Math.PI * shown;
          bunga(art.el, CX + R * Math.cos(a), CY + R * Math.sin(a));
          const baru = prog + langkah;
          const jarak = baru - shown;
          geser(baru, kurung(0.34 * jarak / langkah, 0.26, 0.9));
        }
        btn.addEventListener('click', ketuk);

        // seret melingkar di scene
        const sudutDari = (e) => {
          const r = scene.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          return Math.hypot(dx, dy) < 22 ? null : Math.atan2(dy, dx);
        };
        scene.addEventListener('pointerdown', (e) => {
          if (tutup) return;
          seret = sudutDari(e);
          try { scene.setPointerCapture(e.pointerId); } catch (_) { /* tidak didukung */ }
        });
        scene.addEventListener('pointermove', (e) => {
          if (seret == null || tutup) return;
          const a = sudutDari(e);
          if (a == null) return;
          let d = a - seret;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          seret = a;
          if (d < -0.003) { // berlawanan jarum jam (sudut layar mengecil)
            tw = null;
            prog = Math.min(7, Math.max(prog, shown) + (-d) / (2 * Math.PI));
            shown = prog;
            taruh();
          } else if (d > 0.012) {
            const now = performance.now();
            if (now - peringatan > 4500) {
              peringatan = now;
              ctx.sfx('salah');
              const teks = "Ka'bah ada di sebelah kiri, putar ke arah sebaliknya ya.";
              pesan.textContent = teks;
              ctx.say(teks);
              ctx.after(3500, () => { pesan.textContent = ''; });
            }
          }
        });
        const lepas = () => { seret = null; };
        scene.addEventListener('pointerup', lepas);
        scene.addEventListener('pointercancel', lepas);

        return new Promise((resolve) => {
          ctx.loop((dt) => {
            if (tutup) return false;
            if (tw) {
              tw.t += dt;
              const p = Math.min(1, tw.t / tw.dur);
              shown = tw.dari + (tw.ke - tw.dari) * easeInOut(p);
              if (p >= 1) { shown = tw.ke; tw = null; }
              taruh();
            }
            const l = Math.min(7, Math.floor(shown + 1e-4));
            while (lap < l) { lap++; lapSelesai(lap); }
            if (lap >= 7 && !tw) {
              tutup = true;
              btn.disabled = true;
              ctx.after(1400, () => { scene.style.cursor = 'default'; resolve(); });
              return false;
            }
          });
        }).then(() => {
          btn.remove(); pesan.remove(); panel.remove();
        });
      }

      // ---------- babak sa'i (SD) ----------
      async function sai() {
        ctx.clear();
        const uid = 'hs' + Math.random().toString(36).slice(2, 6);
        const art = gambarSai(uid);
        const big = h('div', { class: 'hj-big', 'aria-hidden': 'true' }, '1');
        const scene = h('div', { class: 'hj-scene is-sai', 'aria-label': 'Bukit Shafa dan Marwah' }, art.el, big);
        scene.style.cursor = 'default';
        const nEl = h('b', { class: 'hj-n' }, '0');
        const panel = h('div', { class: 'ti-panel hj-panel' }, h('span', { class: 'hj-lbl' }, "Sa'i ke-"), nEl, h('span', { class: 'hj-lbl' }, 'dari 7'));
        const btn = h('button', { type: 'button', class: 'ti-btn hj-go' }, 'Jalan ke Marwah ➜');
        ctx.el.append(panel, scene, btn);
        ctx.ask("Sa'i: berjalan dari Shafa ke Marwah, 7 kali.", { say: "Sa'i: berjalan antara bukit Shafa dan Marwah, 7 kali. Mulai dari Shafa." });

        let x = SAI_A, perjalanan = 0, jalan = null;
        const taruh = (loncat) => art.dot.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + (SAI_Y - loncat).toFixed(1) + ')');
        taruh(0);

        return new Promise((resolve) => {
          btn.addEventListener('click', () => {
            if (jalan || perjalanan >= 7) return;
            const keMarwah = perjalanan % 2 === 0;
            ctx.sfx('whoosh');
            btn.disabled = true;
            jalan = { dari: x, ke: keMarwah ? SAI_B : SAI_A, t: 0, dur: reduced ? 0.3 : 0.95 }; // motion-ok: perjalanan antar bukit
          });
          ctx.loop((dt) => {
            if (perjalanan >= 7) return false;
            if (!jalan) return;
            jalan.t += dt;
            const p = Math.min(1, jalan.t / jalan.dur);
            x = jalan.dari + (jalan.ke - jalan.dari) * easeInOut(p);
            taruh(reduced ? 0 : Math.abs(Math.sin(p * Math.PI * 4)) * 5);
            if (p >= 1) {
              x = jalan.ke; jalan = null;
              taruh(0);
              perjalanan++;
              nEl.textContent = String(perjalanan);
              ulangAnim(nEl, 'is-pop', 320);
              art.penanda[perjalanan - 1].classList.add('is-on');
              angkaBesar(big, perjalanan);
              ulangAnim(art.glow, 'is-pulse', 240);
              ctx.sfx('benar');
              ctx.say(perjalanan === 7 ? 'Tujuh! Sa\'i selesai, di bukit Marwah.' : KATA[perjalanan] + '!');
              maju();
              if (perjalanan >= 7) { ctx.after(1500, resolve); return; }
              btn.textContent = perjalanan % 2 === 0 ? 'Jalan ke Marwah ➜' : '⬅ Jalan ke Shafa';
              btn.disabled = false;
            }
          });
        }).then(() => { btn.remove(); panel.remove(); });
      }

      // ---------- soal ----------
      async function soalTK() {
        ctx.ask("Berapa kali thawaf mengelilingi Ka'bah?");
        await ctx.choose({
          options: shuffle([7, 5, 10]).map((n) => ({ node: h('span', { class: 'hj-opt' }, h('b', null, n), TI.dots(n)), value: n, say: String(n), cls: 'is-big', aria: n + ' kali' })),
          answer: 7, speakLabel: true,
        });
        maju();
        ctx.clear();
        ctx.ask("Ka'bah ada di kota?");
        await ctx.choose({ options: shuffle(['Makkah', 'Madinah', 'Jakarta']), answer: 'Makkah', speakLabel: true });
        maju();
      }
      async function soalSD() {
        ctx.clear();
        ctx.ask("Sa'i ke-7 berakhir di bukit?");
        await ctx.choose({ options: shuffle(['Marwah', 'Shafa']), answer: 'Marwah' });
        maju();
        ctx.clear();
        ctx.ask('Urutkan rukun haji dari yang pertama!');
        await ctx.order({ items: RUKUN, guide: 'after-wrong', label: 'Rukun' });
        maju();
        ctx.note('Rukun haji berurutan: Ihram (niat dan memakai pakaian ihram), Wukuf di Arafah, Thawaf, Sa\'i, dan Tahallul (memotong atau mencukur rambut).', { title: 'Ingat ya!' });
        await ctx.next();
        ctx.clear();
        ctx.ask('Haji dilaksanakan di bulan?');
        await ctx.choose({ options: shuffle(['Dzulhijjah', 'Ramadhan', 'Muharram']), answer: 'Dzulhijjah' });
        maju();
        ctx.note('Wukuf di Arafah dilakukan tanggal 9 Dzulhijjah. Haji adalah rukun Islam kelima, wajib bagi yang mampu.');
        await ctx.next();
      }

      async function alur() {
        ctx.progress(0, TOTAL);
        await thawaf();
        if (!ctx.alive) return;
        ctx.note(TK ? "Thawaf mengelilingi Ka'bah 7 kali. Ka'bah ada di sebelah kiri kita." : "Thawaf adalah mengelilingi Ka'bah 7 kali. Ka'bah berada di sebelah kiri, jadi kita berputar berlawanan arah jarum jam.", { title: 'Tahukah kamu?' });
        await ctx.next();
        if (!ctx.alive) return;
        if (TK) {
          ctx.clear();
          ctx.correct(null, { say: 'Bagus! Thawaf selesai. Terus naik ke babak soal!' }); await soalTK();
        } else {
          ctx.correct(null, { say: 'Bagus! Thawaf selesai. Terus naik ke babak sai!' }); await sai();
          if (!ctx.alive) return;
          ctx.note("Sa'i mengenang Siti Hajar yang berjalan antara bukit Shafa dan Marwah untuk mencari air bagi Nabi Ismail 'alaihis salam. Sa'i dimulai di Shafa dan berakhir di Marwah.", { title: 'Kisahnya' });
          await ctx.next();
          ctx.correct(null, { say: 'Bagus! Terus naik ke babak soal!' }); await soalSD();
        }
        if (!ctx.alive) return;
        ctx.progress(TOTAL, TOTAL);
        ctx.finish({ lesson: LESSON });
      }
      return alur();
    },
  });
})();
