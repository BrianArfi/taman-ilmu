/* 21 Tangkap Hijaiyah. Arkade: huruf hijaiyah dalam gelembung jatuh, anak menggeser keranjang untuk menangkapnya.
   TK: 3 babak, tiap babak satu huruf target (tangkap 3 kali). SD: tangkap huruf berurutan, bar waktu 75 detik;
   kalau dua target lolos, huruf berikutnya disorot dan condong pelan ke keranjang (bantuan, pola yang sama dengan TK).
   Gerak gelembung dan keranjang lewat ctx.loop + translate3d. Geser: seret di area permainan, tombol panah, atau papan ketik. */
(function () {
  const { h, rand, pick, shuffle, sample } = TI;

  // Data huruf sama persis dengan 01-hijaiyah.js. Dua "Ha" (ح dan ه) tidak boleh muncul bersama dalam satu babak.
  const HURUF = [
    ['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tsa'], ['ج', 'Jim'], ['ح', 'Ha'], ['خ', 'Kho'],
    ['د', 'Dal'], ['ذ', 'Dzal'], ['ر', 'Ro'], ['ز', 'Zai'], ['س', 'Sin'], ['ش', 'Syin'], ['ص', 'Shod'],
    ['ض', 'Dhod'], ['ط', 'Tho'], ['ظ', 'Zho'], ['ع', "'Ain"], ['غ', 'Ghoin'], ['ف', 'Fa'], ['ق', 'Qof'],
    ['ك', 'Kaf'], ['ل', 'Lam'], ['م', 'Mim'], ['ن', 'Nun'], ['و', 'Wau'], ['ه', "Ha'"], ['ي', 'Ya'],
  ].map(([ar, nama], i) => ({ ar, nama, no: i + 1 }));
  const grup = (x) => (x.nama === "Ha'" ? 'Ha' : x.nama);

  // Huruf yang bentuknya mirip (beda titik saja). Di TK pengecoh diambil dari keluarga lain supaya adil.
  const KELUARGA = ['ا', 'بتث', 'جحخ', 'دذ', 'رز', 'سش', 'صض', 'طظ', 'عغ', 'فق', 'ك', 'ل', 'م', 'ن', 'و', 'ه', 'ي'];
  const keluargaDari = (ar) => KELUARGA.findIndex((f) => f.includes(ar));

  const WARNA = ['#ff6b6b', '#ff922b', '#f2b200', '#37b24d', '#22b8cf', '#4c8dff', '#9775fa', '#f06595'];
  const P = '.play[data-game="tangkap"]';

  const CSS = `
${P} .tg-panel { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 16px; flex: none; min-height: 86px; padding: 8px 16px; }
${P} .tg-lbl { font-weight: 800; color: var(--muted); font-size: 1.05rem; }
${P} .tg-big {
  display: grid; place-items: center; min-width: 78px; height: 78px; padding: 0 12px; border-radius: 22px;
  background: color-mix(in srgb, var(--c) 12%, #fff); border: 3px solid var(--c);
  font-family: var(--font-ar); font-size: 3.4rem; line-height: 1; padding-bottom: 8px; color: #1c2038; direction: rtl;
}
${P} .tg-big.is-empty { font-family: var(--font); font-weight: 800; color: var(--c); font-size: 2.6rem; padding-bottom: 0; border-style: dashed; }
${P} .tg-big.is-pop { animation: tg-in var(--dur-ui) var(--ease-out) both; }
${P} .tg-nm { font-size: 1.5rem; font-weight: 800; color: var(--c); }
${P} .tg-arrow-i { font-size: 1.8rem; color: var(--muted); }
${P} .tg-pips { display: flex; gap: 8px; align-items: center; }
${P} .tg-pip { width: 24px; height: 24px; border-radius: 50%; background: var(--line); box-shadow: inset 0 2px 0 rgba(0,0,0,0.06); transition: transform var(--dur-ui) var(--ease-out), background-color var(--dur-ui) ease; }
${P} .tg-pip.is-on { background: var(--sun); transform: scale(1.12); box-shadow: 0 2px 0 #d99a00; }
${P} .tg-count { font-weight: 800; font-size: 1.2rem; color: var(--c); }
${P} .tg-time { width: 100%; height: 12px; border-radius: 999px; background: var(--line); overflow: hidden; }
${P} .tg-time-in { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ffb703, #ff6b6b); transform-origin: left center; transition: transform 100ms linear; }

${P} .tg-scene {
  min-height: 330px; touch-action: none; cursor: grab;
  background:
    radial-gradient(ellipse 60px 20px at 18% 18%, rgba(255,255,255,0.85) 0 60%, transparent 62%),
    radial-gradient(ellipse 80px 24px at 76% 28%, rgba(255,255,255,0.75) 0 60%, transparent 62%),
    radial-gradient(ellipse 50px 16px at 52% 8%, rgba(255,255,255,0.7) 0 60%, transparent 62%),
    linear-gradient(180deg, #a8e0ff 0%, #d7f1ff 58%, #fff3d1 100%);
}
${P} .tg-scene::before {
  content: ""; position: absolute; left: -4%; right: -4%; bottom: 0; height: 40px; pointer-events: none;
  background: linear-gradient(180deg, #7bd88f, #3fae63); border-radius: 50% 50% 0 0 / 22px 22px 0 0;
}
${P} .tg-bub { position: absolute; left: 0; top: 0; pointer-events: none; will-change: transform; }
${P} .tg-bub-in {
  position: absolute; inset: 0; display: grid; place-items: center; border-radius: 50%;
  border: 4px solid color-mix(in srgb, var(--bc, #4c8dff) 72%, #fff);
  background: radial-gradient(circle at 34% 28%, #fff 0 12%, color-mix(in srgb, var(--bc, #4c8dff) 16%, #fff) 62%, color-mix(in srgb, var(--bc, #4c8dff) 34%, #fff) 100%);
  box-shadow: 0 4px 10px rgba(30, 70, 120, 0.18), inset -4px -6px 10px rgba(255,255,255,0.5);
  animation: tg-in var(--dur-ui) var(--ease-out) both;
}
${P} .tg-bub-l { font-family: var(--font-ar); font-size: 2.5rem; line-height: 1; color: #1c2038; direction: rtl; padding-bottom: 8px; font-weight: 700; }
${P}.lvl-sd .tg-bub-l { font-size: 2.2rem; }
${P} .tg-bub.is-hint .tg-bub-in { border-color: #ffb703; box-shadow: 0 0 0 5px rgba(255,183,3,0.45), 0 4px 10px rgba(30,70,120,0.18); }
${P} .tg-bub.is-caught .tg-bub-in { animation: tg-caught 200ms var(--ease-out) both; }
${P} .tg-basket { position: absolute; left: 0; top: 0; will-change: transform; pointer-events: none; }
${P} .tg-basket-in { width: 100%; height: 100%; }
${P} .tg-basket-in svg { display: block; width: 100%; height: 100%; overflow: visible; }
${P} .tg-basket-in.is-bounce { animation: tg-bounce 240ms var(--ease-out); }
${P} .tg-basket-in.is-shake { animation: tg-shake var(--dur-ui-max) var(--ease-in-out); }
${P} .tg-spark {
  position: absolute; left: 0; top: 0; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; pointer-events: none;
  background: var(--bc, #ffb703); animation: tg-spark 300ms var(--ease-out) both;
}
${P} .tg-plus {
  position: absolute; left: 0; top: 0; width: 60px; margin-left: -30px; text-align: center; pointer-events: none;
  font-size: 1.7rem; font-weight: 800; color: #e67700; text-shadow: 0 2px 0 #fff, 0 0 8px #fff;
  animation: tg-plus 700ms var(--ease-out) both; /* motion-ok: angka +1 melayang naik, umpan balik skor */
}
${P} .tg-plus.is-bad { color: #e5484d; }
${P} .tg-controls { display: flex; gap: 14px; justify-content: center; width: 100%; max-width: 860px; flex: none; }
${P} .tg-go { flex: 1 1 0; max-width: 280px; min-height: 72px; font-size: 2.3rem; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
@keyframes tg-in { from { opacity: 0; transform: scale(0.95); } }
@keyframes tg-caught { to { opacity: 0; transform: translateY(16px) scale(0.6); } }
@keyframes tg-bounce { 35% { transform: translateY(6px) scale(1.07, 0.9); } 70% { transform: translateY(-2px) scale(0.98, 1.03); } }
@keyframes tg-shake { 20% { transform: translateX(-9px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(3px); } }
@keyframes tg-spark {
  from { opacity: 1; transform: translate3d(var(--cx), var(--cy), 0) scale(1); }
  to { opacity: 0; transform: translate3d(calc(var(--cx) + var(--dx)), calc(var(--cy) + var(--dy)), 0) scale(0.6); }
}
@keyframes tg-plus {
  from { opacity: 1; transform: translate3d(var(--cx), var(--cy), 0); }
  to { opacity: 0; transform: translate3d(var(--cx), calc(var(--cy) - 46px), 0); }
}
@media (max-width: 560px) {
  ${P} .tg-big { min-width: 66px; height: 66px; font-size: 2.9rem; }
  ${P} .tg-bub-l { font-size: 2.2rem; }
  ${P}.lvl-sd .tg-bub-l { font-size: 2rem; }
}
@media (prefers-reduced-motion: reduce) {
  ${P} .tg-spark { display: none; }
  ${P} .tg-basket-in.is-bounce, ${P} .tg-basket-in.is-shake { animation: none; }
  ${P} .tg-plus { animation-name: tg-fade !important; }
  ${P} .tg-bub-in { animation-name: tg-fade !important; }
}
@keyframes tg-fade { from { opacity: 0; } }`;

  // Keranjang anyaman (SVG buatan sendiri, tanpa wajah).
  function gambarKeranjang() {
    const s = TI.svg;
    return s('svg', { viewBox: '0 0 120 80', 'aria-hidden': 'true' },
      s('path', { d: 'M8 17 Q60 31 112 17 L101 66 Q60 79 19 66 Z', fill: '#e2a458', stroke: '#8a5522', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      s('path', { d: 'M12 31 Q60 45 108 31', fill: 'none', stroke: '#b97a35', 'stroke-width': 3, 'stroke-linecap': 'round' }),
      s('path', { d: 'M15 44 Q60 58 105 44', fill: 'none', stroke: '#b97a35', 'stroke-width': 3, 'stroke-linecap': 'round' }),
      s('path', { d: 'M18 56 Q60 70 102 56', fill: 'none', stroke: '#b97a35', 'stroke-width': 3, 'stroke-linecap': 'round' }),
      [30, 45, 60, 75, 90].map((x, i) => s('path', { d: 'M' + x + ' 24 L' + (x + (x - 60) * 0.18) + ' 70', fill: 'none', stroke: '#f0c47d', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: i % 2 ? 0.7 : 0.95 })),
      s('ellipse', { cx: 60, cy: 17, rx: 54, ry: 11, fill: '#6b3f17', stroke: '#f4cf8f', 'stroke-width': 4 }),
      s('ellipse', { cx: 60, cy: 19, rx: 44, ry: 6, fill: '#4a2a0d', opacity: 0.55 }));
  }

  const kurung = (v, a, b) => Math.max(a, Math.min(b, v));

  TI.register({
    id: 'tangkap',
    title: 'Tangkap Hijaiyah',
    cat: 'islam',
    icon: '🧺',
    desc: 'Geser keranjang untuk menangkap huruf hijaiyah yang jatuh!',
    start(ctx) {
      TI.style('tangkap', CSS);
      const reduced = TI.reduced();
      const TK = ctx.isTK;

      // ---------- elemen ----------
      const panel = h('div', { class: 'ti-panel tg-panel' });
      const timeIn = h('i', { class: 'tg-time-in' });
      const timeBar = TK ? null : h('div', { class: 'tg-time', 'aria-hidden': 'true' }, timeIn);
      const scene = h('div', { class: 'ti-scene tg-scene', 'data-tap': true, 'aria-label': 'Area permainan. Seret ke kiri dan kanan untuk menggeser keranjang.' });
      const basketIn = h('div', { class: 'tg-basket-in' }, gambarKeranjang());
      const basket = h('div', { class: 'tg-basket', 'aria-hidden': 'true' }, basketIn);
      scene.append(basket);
      const btnKiri = h('button', { type: 'button', class: 'ti-btn tg-go', 'aria-label': 'Geser keranjang ke kiri' }, '⬅️');
      const btnKanan = h('button', { type: 'button', class: 'ti-btn tg-go', 'aria-label': 'Geser keranjang ke kanan' }, '➡️');
      const controls = h('div', { class: 'tg-controls' }, btnKiri, btnKanan);
      ctx.el.append(panel, ...(timeBar ? [timeBar] : []), scene, controls);

      // ---------- ukuran dan keranjang ----------
      let W = 360, H = 360, bw = 110, bh = 72, bTop = 0, size = TK ? 76 : 66;
      let bx = 0, px = 0, holdBtn = 0, keyDir = 0, dragging = false, waktu = 0;
      function ukur() {
        const lamaW = W;
        W = scene.clientWidth || 360; H = scene.clientHeight || 360;
        bw = Math.round(kurung(W * (TK ? 0.3 : 0.25), TK ? 104 : 90, TK ? 150 : 128));
        bh = Math.round(bw * 0.667);
        size = TK ? 76 : 66;
        bTop = H - bh - 4;
        basket.style.width = bw + 'px';
        basket.style.height = bh + 'px';
        if (!bx) bx = px = W / 2; else { bx = bx * W / lamaW; px = px * W / lamaW; }
        bx = kurung(bx, bw / 2, W - bw / 2); px = kurung(px, bw / 2, W - bw / 2);
        gambarKeranjangPos();
      }
      function gambarKeranjangPos() {
        basket.style.transform = 'translate3d(' + (px - bw / 2).toFixed(1) + 'px,' + bTop + 'px,0)';
      }
      function dorong(arah, jarak) { bx = kurung(bx + arah * jarak, bw / 2, W - bw / 2); }

      // tombol panah: ketuk = geser sedikit, tahan = geser terus
      for (const [btn, arah] of [[btnKiri, -1], [btnKanan, 1]]) {
        let terakhirTekan = 0;
        btn.addEventListener('pointerdown', () => { terakhirTekan = performance.now(); holdBtn = arah; dorong(arah, W * 0.12); });
        const lepas = () => { if (holdBtn === arah) holdBtn = 0; };
        btn.addEventListener('pointerup', lepas);
        btn.addEventListener('pointercancel', lepas);
        btn.addEventListener('pointerleave', lepas);
        // klik tanpa tekanan jari sebelumnya = papan ketik atau pembaca layar
        btn.addEventListener('click', () => { if (performance.now() - terakhirTekan > 600) dorong(arah, W * 0.16); });
      }
      ctx.on(document, 'keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') { keyDir = -1; e.preventDefault(); }
        else if (e.key === 'ArrowRight' || e.key === 'd') { keyDir = 1; e.preventDefault(); }
      });
      ctx.on(document, 'keyup', (e) => {
        if ((e.key === 'ArrowLeft' || e.key === 'a') && keyDir < 0) keyDir = 0;
        if ((e.key === 'ArrowRight' || e.key === 'd') && keyDir > 0) keyDir = 0;
      });
      // seret (atau ketuk) di area permainan: keranjang mengikuti jari
      const xDari = (e) => kurung(e.clientX - scene.getBoundingClientRect().left, bw / 2, W - bw / 2);
      scene.addEventListener('pointerdown', (e) => {
        dragging = true; bx = xDari(e);
        try { scene.setPointerCapture(e.pointerId); } catch (_) { /* tidak didukung */ }
      });
      scene.addEventListener('pointermove', (e) => { if (dragging) bx = xDari(e); });
      const selesaiSeret = () => { dragging = false; };
      scene.addEventListener('pointerup', selesaiSeret);
      scene.addEventListener('pointercancel', selesaiSeret);
      ctx.on(window, 'resize', ukur);

      // ---------- status permainan ----------
      let fase = 'siap'; // siap | main | jeda | selesai
      let target = null;         // huruf target (TK) atau huruf berikutnya (SD)
      const bubbles = [];
      let babakKe = 0, babakTertangkap = 0, muncul = 0, jedaMuncul = 0, targetTerakhir = 0, salahBerturut = 0;
      let bantuan = 0, petunjuk = false, hanyaSalah = 0;
      let urutanSD = [], idxSD = 0, awalSD = null;
      let selesaiBabak = null;
      const TOTAL = TK ? 9 : 8;
      const WAKTU_SD = 75;
      let sisaWaktu = WAKTU_SD;

      const detikJatuh = TK ? 3.0 : 2.9;
      const maksDiLayar = TK ? 2 : 3;
      const jedaMin = TK ? 0.7 : 0.7;

      // ---------- panel ----------
      function panelTK(n) {
        const pips = h('span', { class: 'tg-pips', 'aria-hidden': 'true' });
        for (let i = 0; i < 3; i++) pips.append(h('i', { class: 'tg-pip' + (i < n ? ' is-on' : '') }));
        panel.replaceChildren(
          h('span', { class: 'tg-lbl' }, 'Tangkap huruf:'),
          h('span', { class: 'tg-big ti-arabic is-pop', 'aria-label': 'Huruf ' + target.nama }, target.ar),
          h('span', { class: 'tg-nm' }, target.nama),
          pips);
      }
      function panelSD(popTerakhir, popNext) {
        const terakhir = idxSD === 0 ? awalSD : urutanSD[idxSD - 1];
        const next = petunjuk ? urutanSD[idxSD] : null;
        panel.replaceChildren(
          h('span', { class: 'tg-lbl' }, idxSD === 0 ? 'Mulai dari' : 'Terakhir'),
          h('span', { class: 'tg-big ti-arabic' + (popTerakhir ? ' is-pop' : ''), 'aria-label': 'Huruf ' + terakhir.nama }, terakhir.ar),
          h('span', { class: 'tg-arrow-i', 'aria-hidden': 'true' }, '➜'),
          h('span', { class: 'tg-lbl' }, 'Berikutnya'),
          next
            ? h('span', { class: 'tg-big ti-arabic is-pop', 'aria-label': 'Huruf ' + next.nama }, next.ar)
            : h('span', { class: 'tg-big is-empty', 'aria-label': 'belum diketahui' }, '?'),
          h('span', { class: 'tg-count' }, idxSD + ' / ' + TOTAL));
      }

      // ---------- huruf yang jatuh ----------
      function adaTargetDiLayar() { return bubbles.some((b) => b.L.no === target.no && b.state === 'jatuh'); }
      function pengecoh() {
        const pakai = new Set(bubbles.filter((b) => b.state === 'jatuh').map((b) => b.L.no));
        let pool = HURUF.filter((x) => grup(x) !== grup(target) && x.no !== target.no && !pakai.has(x.no));
        if (TK) {
          const fam = keluargaDari(target.ar);
          const beda = pool.filter((x) => keluargaDari(x.ar) !== fam);
          if (beda.length) pool = beda;
        } else if (Math.random() < 0.55) {
          // SD: sering memakai huruf di sekitar target (mirip atau bertetangga)
          const dekat = pool.filter((x) => Math.abs(x.no - target.no) <= 3);
          if (dekat.length) pool = dekat;
        }
        return pick(pool);
      }
      function pilihX() {
        let terbaik = W / 2, jauhTerbaik = -1;
        for (let k = 0; k < 8; k++) {
          const x = TK
            ? kurung(px + rand(-Math.round(W * 0.34), Math.round(W * 0.34)), size / 2 + 6, W - size / 2 - 6)
            : rand(Math.round(size / 2 + 6), Math.round(W - size / 2 - 6));
          let jauh = 1e9;
          for (const o of bubbles) if (o.state === 'jatuh' && o.y < H * 0.45) jauh = Math.min(jauh, Math.abs(o.cx - x));
          if (jauh > jauhTerbaik) { jauhTerbaik = jauh; terbaik = x; }
        }
        return terbaik;
      }
      function munculkan(jadiTarget) {
        const L = jadiTarget ? target : pengecoh();
        const huruf = h('span', { class: 'tg-bub-l' }, L.ar);
        const el = h('div', { class: 'tg-bub', 'aria-hidden': 'true' }, h('span', { class: 'tg-bub-in' }, huruf));
        el.style.width = el.style.height = size + 'px';
        scene.insertBefore(el, basket);
        const kec = (H + size * 0.4) / detikJatuh * (reduced ? 0.8 : 1) * (0.94 + Math.random() * 0.12);
        const warna = pick(WARNA);
        el.style.setProperty('--bc', warna);
        const b = { el, L, warna, x: pilihX(), y: -size, vy: kec, fase: Math.random() * 6.28, op: 1, state: 'jatuh', cx: 0 };
        b.cx = b.x;
        bubbles.push(b);
        gambarBubble(b);
        muncul++;
        if (jadiTarget) targetTerakhir = 0; else targetTerakhir++;
        return b;
      }
      function gambarBubble(b) {
        const goyang = reduced ? 0 : Math.sin(waktu * 1.7 + b.fase) * (TK ? 5 : 8);
        b.cx = kurung(b.x + goyang, size / 2, W - size / 2);
        b.el.style.transform = 'translate3d(' + (b.cx - size / 2).toFixed(1) + 'px,' + b.y.toFixed(1) + 'px,0)';
      }
      function buangBubble(b) {
        b.state = 'hilang';
        const i = bubbles.indexOf(b);
        if (i >= 0) bubbles.splice(i, 1);
        b.el.remove();
      }

      // ---------- efek ----------
      function ulangAnim(el, kelas) { el.classList.remove(kelas); void el.offsetWidth; el.classList.add(kelas); }
      function percik(cx, cy, warna) {
        if (reduced) return;
        for (let k = 0; k < 7; k++) {
          const sudut = (k / 7) * Math.PI * 2 + Math.random() * 0.6, jarak = 30 + Math.random() * 26;
          const sp = h('i', { class: 'tg-spark', 'aria-hidden': 'true' });
          sp.style.setProperty('--bc', warna);
          sp.style.setProperty('--cx', cx.toFixed(1) + 'px');
          sp.style.setProperty('--cy', cy.toFixed(1) + 'px');
          sp.style.setProperty('--dx', (Math.cos(sudut) * jarak).toFixed(1) + 'px');
          sp.style.setProperty('--dy', (Math.sin(sudut) * jarak - 10).toFixed(1) + 'px');
          scene.append(sp);
          ctx.after(340, () => sp.remove());
        }
      }
      function plus(cx, cy, teks, buruk) {
        const el = h('span', { class: 'tg-plus' + (buruk ? ' is-bad' : ''), 'aria-hidden': 'true' }, teks);
        el.style.setProperty('--cx', cx.toFixed(1) + 'px');
        el.style.setProperty('--cy', cy.toFixed(1) + 'px');
        scene.append(el);
        ctx.after(760, () => el.remove());
      }

      // ---------- tangkap ----------
      function tangkap(b) {
        b.state = 'tangkap';
        const i = bubbles.indexOf(b);
        if (i >= 0) bubbles.splice(i, 1);
        b.el.classList.add('is-caught');
        ctx.after(220, () => b.el.remove());
        const cx = b.cx, cy = bTop + 6;
        if (b.L.no === target.no) {
          ctx.sfx('pop');
          ctx.say(b.L.nama);
          ulangAnim(basketIn, 'is-bounce');
          percik(cx, cy, b.warna);
          plus(cx, cy - 18, '+1', false);
          salahBerturut = 0; petunjuk = false; hanyaSalah = 0;
          if (TK) benarTK(); else benarSD();
        } else {
          ctx.wrong(null, { say: false });
          ulangAnim(basketIn, 'is-shake');
          plus(cx, cy - 18, 'Bukan', true);
          salahBerturut++;
          if (!TK && salahBerturut >= 2 && !petunjuk && idxSD < TOTAL) {
            petunjuk = true; // petunjuk lembut setelah dua kali salah: huruf berikutnya terbuka
            panelSD(false, true);
            ctx.say('Petunjuk: huruf berikutnya adalah ' + urutanSD[idxSD].nama);
          }
        }
      }
      function benarTK() {
        babakTertangkap++;
        panelTK(babakTertangkap);
        ctx.progress(babakKe * 3 + babakTertangkap, TOTAL);
        if (babakTertangkap >= 3 && selesaiBabak) { const f = selesaiBabak; selesaiBabak = null; f(); }
      }
      function benarSD() {
        idxSD++;
        ctx.progress(idxSD, TOTAL);
        if (idxSD >= TOTAL) { panelSD(true); selesaiSD(true); return; }
        target = urutanSD[idxSD];
        panelSD(true);
      }

      // ---------- loop utama ----------
      let umpanTargetLewat = 0, targetLolos = 0;
      ctx.loop((dt) => {
        if (fase === 'selesai') return false;
        waktu += dt;
        // gerak keranjang
        const arah = holdBtn || keyDir;
        if (arah) bx = kurung(bx + arah * W * 1.05 * dt, bw / 2, W - bw / 2);
        px += (bx - px) * (1 - Math.exp(-dt * (reduced ? 30 : 16)));
        if (Math.abs(bx - px) < 0.05) px = bx;
        gambarKeranjangPos();

        if (fase !== 'main') return;
        // gerak huruf
        for (const b of bubbles.slice()) {
          b.y += b.vy * dt;
          if (b.state === 'jatuh') {
            // TK: huruf target selalu condong halus ke keranjang; SD: baru condong setelah dua target lolos
            if (b.L.no === target.no && b.y > H * 0.12 && b.y < bTop - size * 0.4) {
              const kuat = TK ? (targetLolos >= 2 ? 440 : 140) : targetLolos >= 2 ? 440 : 0;
              if (kuat) {
                const dx = px - b.x;
                if (Math.abs(dx) < W * 0.6) { b.x += kurung(dx, -kuat * dt, kuat * dt); }
              }
            }
            gambarBubble(b);
            b.el.classList.toggle('is-hint', petunjuk && b.L.no === target.no);
            const dasar = b.y + size;
            const tengahY = b.y + size / 2;
            if (dasar >= bTop + 8 && tengahY <= bTop + bh * 0.6 && Math.abs(b.cx - px) <= bw / 2 + size * 0.12) { tangkap(b); continue; }
            if (tengahY > bTop + bh * 0.6) {
              b.state = 'lolos'; // lewat keranjang: memudar pelan
              if (b.L.no === target.no) {
                umpanTargetLewat++; targetLolos++;
                if (!TK && targetLolos >= 2 && !petunjuk && idxSD < TOTAL) {
                  petunjuk = true; // sama seperti dua kali salah menangkap: huruf berikutnya terbuka
                  panelSD(false, true);
                  ctx.say('Petunjuk: huruf berikutnya adalah ' + urutanSD[idxSD].nama);
                }
              }
            }
          } else if (b.state === 'lolos') {
            b.op -= dt * 2.4;
            b.el.style.opacity = Math.max(0, b.op).toFixed(2);
            gambarBubble(b);
            if (b.op <= 0 || b.y > H + size) buangBubble(b);
          }
        }
        // muncul huruf baru
        jedaMuncul += dt;
        const diLayar = bubbles.filter((b) => b.state === 'jatuh').length;
        const boleh = TK ? muncul < 12 : true;
        if (boleh && diLayar < maksDiLayar && jedaMuncul >= jedaMin) {
          jedaMuncul = 0;
          let jadiTarget;
          if (!adaTargetDiLayar() && (targetTerakhir >= 1 || diLayar === 0)) jadiTarget = true;
          else if (adaTargetDiLayar()) jadiTarget = false;
          else jadiTarget = Math.random() < (TK ? 0.65 : 0.3);
          if (TK && umpanTargetLewat > 0 && !adaTargetDiLayar()) { jadiTarget = true; umpanTargetLewat = 0; }
          munculkan(jadiTarget);
        }
        // TK: babak selesai kalau 12 huruf sudah jatuh semua
        if (TK && selesaiBabak && muncul >= 12 && bubbles.length === 0) { const f = selesaiBabak; selesaiBabak = null; f(); }
      });

      // jam SD dihitung dari detak (bukan dari bingkai), jadi ikut berhenti saat tab disembunyikan
      if (!TK) {
        ctx.every(100, () => {
          if (fase !== 'main') return;
          sisaWaktu = Math.max(0, sisaWaktu - 0.1);
          timeIn.style.transform = 'scaleX(' + (sisaWaktu / WAKTU_SD).toFixed(3) + ')';
          if (sisaWaktu <= 0) selesaiSD(false);
        });
      }

      // ---------- alur TK ----------
      function pilihTarget() {
        const pakai = [];
        const calon = shuffle(HURUF);
        for (const x of calon) {
          if (pakai.length >= 3) break;
          if (pakai.some((y) => grup(y) === grup(x))) continue; // ح dan ه tidak dalam satu sesi
          pakai.push(x);
        }
        return pakai;
      }
      async function alurTK() {
        const daftar = pilihTarget();
        for (let r = 0; r < 3; r++) {
          if (!ctx.alive) return;
          target = daftar[r];
          babakKe = r;
          babakTertangkap = 0; muncul = 0; jedaMuncul = 0; targetTerakhir = 0; umpanTargetLewat = 0; targetLolos = 0;
          panelTK(0);
          ctx.ask('Tangkap huruf ' + target.nama + '!');
          await ctx.wait(1500);
          fase = 'main';
          await new Promise((res) => { selesaiBabak = res; });
          fase = 'jeda';
          for (const b of bubbles.slice()) { b.el.classList.add('is-caught'); }
          ctx.after(220, () => { for (const b of bubbles.slice()) buangBubble(b); });
          if (!ctx.alive) return;
          ctx.progress((r + 1) * 3, TOTAL);
          if (babakTertangkap >= 3) {
            await ctx.correct(null, { say: r < 2 ? pick(['Hebat!', 'Pintar!', 'Keren!']) : 'Masya Allah, hebat!', min: 900 });
          } else {
            await ctx.sayWait('Hampir! Ayo coba huruf berikutnya.');
          }
        }
        fase = 'selesai';
        const salah = ctx.mistakes;
        ctx.finish({
          stars: salah <= 2 ? 3 : salah <= 6 ? 2 : 1,
          lesson: "Makin sering melihat huruf hijaiyah, makin lancar membaca Al-Qur'an.",
        });
      }

      // ---------- alur SD ----------
      function selesaiSD(berhasil) {
        if (fase === 'selesai') return;
        fase = 'selesai';
        for (const b of bubbles.slice()) buangBubble(b);
        const salah = ctx.mistakes;
        const dapat = idxSD;
        const bintang = berhasil ? (salah <= 3 ? 3 : 2) : (dapat >= 5 ? 2 : 1);
        ctx.after(berhasil ? 700 : 200, () => ctx.finish({
          stars: bintang,
          message: berhasil ? 'Masya Allah, urutan hurufmu hebat!' : 'Waktu habis! Kamu menangkap ' + dapat + ' huruf berurutan.',
          lesson: "Makin sering melihat huruf hijaiyah, makin lancar membaca Al-Qur'an.",
        }));
      }
      async function alurSD() {
        const awal = rand(1, 20);
        awalSD = HURUF[awal - 1];
        urutanSD = HURUF.slice(awal, awal + TOTAL);
        idxSD = 0; target = urutanSD[0];
        panelSD(false);
        ctx.progress(0, TOTAL);
        ctx.ask('Tangkap huruf berikutnya setelah ' + awalSD.nama + ', berurutan ya!');
        await ctx.wait(1700);
        fase = 'main';
      }

      // ---------- mulai ----------
      ukur();
      if (TK) alurTK(); else alurSD();
      ctx.progress(0, TOTAL);
    },
  });
})();
