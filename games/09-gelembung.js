/* 09 Pecah Gelembung. Arkade: gelembung berisi angka naik pelan dari bawah, anak memecahkan yang benar.
   Gerak gelembung lewat ctx.loop + translate3d (bukan top/left). Satu sesi = 10 jawaban benar. Babak 2 di tengah: lebih cepat. Tiap 3x salah permainan melambat. */
(function () {
  const { h, rand, shuffle, sample } = TI;

  const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  function kata(n) {
    if (n < 10) return SATUAN[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return SATUAN[n - 10] + ' belas';
    if (n < 100) return SATUAN[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SATUAN[n % 10] : '');
    return String(n);
  }

  const WARNA = ['#ff6b6b', '#ff922b', '#fcc419', '#51cf66', '#22b8cf', '#4c8dff', '#9775fa', '#f06595'];
  const TOTAL = 10;

  const CSS = `
.play[data-game="gelembung"] .gel-panel {
  display: flex; align-items: center; justify-content: center; gap: 16px; flex: none; min-height: 84px; padding: 8px 16px;
}
.play[data-game="gelembung"] .gel-target { display: inline-block; font-size: clamp(2.4rem, 9vw, 3.4rem); font-weight: 800; line-height: 1; color: var(--c); white-space: nowrap; }
.play[data-game="gelembung"] .gel-panel .ti-dots { font-size: 1.15rem; max-width: calc(3.5em + 17px); }
.play[data-game="gelembung"] .gel-scene {
  background:
    radial-gradient(circle at 18% 86%, rgba(255, 255, 255, 0.7) 0, transparent 22%),
    radial-gradient(circle at 84% 30%, rgba(255, 255, 255, 0.55) 0, transparent 20%),
    linear-gradient(180deg, #e9f7ff 0%, #cdeafd 55%, #b4dcfb 100%);
}
.play[data-game="gelembung"] .gel-bub {
  position: absolute; left: 0; top: 0; padding: 0; border: 0; background: none; cursor: pointer;
  will-change: transform; -webkit-tap-highlight-color: transparent;
}
.play[data-game="gelembung"] .gel-bub:focus-visible { outline-offset: 0; border-radius: 50%; }
.play[data-game="gelembung"] .gel-body {
  position: absolute; inset: 0; display: grid; place-items: center; border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--bc, #4c8dff) 62%, #fff);
  background: radial-gradient(circle at 50% 55%, color-mix(in srgb, var(--bc, #4c8dff) 12%, transparent) 40%, color-mix(in srgb, var(--bc, #4c8dff) 42%, transparent) 100%);
  box-shadow: inset -5px -7px 12px rgba(255, 255, 255, 0.45), inset 3px 4px 8px rgba(255, 255, 255, 0.35), 0 4px 10px rgba(30, 80, 140, 0.12);
  transition: transform var(--dur-press) var(--ease-out);
}
.play[data-game="gelembung"] .gel-body::before {
  content: ""; position: absolute; left: 17%; top: 12%; width: 30%; height: 17%; border-radius: 50%;
  background: rgba(255, 255, 255, 0.85); transform: rotate(-32deg);
}
.play[data-game="gelembung"] .gel-bub:active .gel-body { transform: scale(0.95); }
.play[data-game="gelembung"] .gel-num {
  position: relative; font-size: 2.1rem; font-weight: 800; line-height: 1;
  color: color-mix(in srgb, var(--bc, #4c8dff) 48%, #1c2038); text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}
.play[data-game="gelembung"].lvl-sd .gel-num { font-size: 1.8rem; }
.play[data-game="gelembung"] .gel-bub.is-in .gel-body { animation: gel-in var(--dur-ui) var(--ease-out) both; }
.play[data-game="gelembung"] .gel-bub.is-wrong .gel-body { animation: gel-shake var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="gelembung"] .gel-bub.is-swap .gel-body { animation: gel-in var(--dur-ui) var(--ease-out) both; }
.play[data-game="gelembung"] .gel-bub.is-pop { pointer-events: none; }
.play[data-game="gelembung"] .gel-bub.is-pop .gel-body { animation: gel-pop 180ms var(--ease-out) both; }
.play[data-game="gelembung"] .gel-spark {
  position: absolute; left: 0; top: 0; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; pointer-events: none;
  background: color-mix(in srgb, var(--bc, #4c8dff) 70%, #fff); transform: translate3d(var(--cx), var(--cy), 0);
  animation: gel-spark 280ms var(--ease-out) both;
}
@keyframes gel-in { from { opacity: 0; transform: scale(0.95); } }
@keyframes gel-pop { to { opacity: 0; transform: scale(1.3); } }
@keyframes gel-shake { 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
@keyframes gel-spark {
  from { opacity: 1; transform: translate3d(var(--cx), var(--cy), 0) scale(1); }
  to { opacity: 0; transform: translate3d(calc(var(--cx) + var(--dx)), calc(var(--cy) + var(--dy)), 0) scale(0.6); }
}
@media (max-width: 560px) {
  .play[data-game="gelembung"] .gel-num { font-size: 1.8rem; }
  .play[data-game="gelembung"].lvl-sd .gel-num { font-size: 1.55rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="gelembung"] .gel-bub.is-in .gel-body, .play[data-game="gelembung"] .gel-bub.is-swap .gel-body { animation-name: ti-fade !important; }
  .play[data-game="gelembung"] .gel-bub.is-pop .gel-body { animation-name: gel-fade-out !important; }
  .play[data-game="gelembung"] .gel-bub.is-wrong .gel-body { animation: none !important; }
  .play[data-game="gelembung"] .gel-spark { display: none; }
}
@keyframes gel-fade-out { to { opacity: 0; } }`;

  // ---------- target ----------
  function targetTK() {
    return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((n) => ({
      res: n, text: String(n), dots: n,
      ask: 'Pecahkan angka ' + n + '!', say: 'Pecahkan angka ' + kata(n) + '!',
      pool: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((v) => v !== n),
    }));
  }
  function targetSD() {
    const daftar = [], dipakai = new Set();
    const jenis = ['+', '+', '+', '+', '-', '-', '-', 'x', 'x', 'x'];
    for (const k of jenis) {
      for (let coba = 0; coba < 80; coba++) {
        let a, b, res, alt, teks, ucap;
        if (k === '+') { a = rand(3, 15); b = rand(2, Math.min(12, 20 - a)); res = a + b; alt = a - b; teks = a + ' + ' + b; ucap = kata(a) + ' tambah ' + kata(b); }
        else if (k === '-') { a = rand(8, 20); b = rand(2, Math.min(9, a - 1)); res = a - b; alt = a + b; teks = a + ' - ' + b; ucap = kata(a) + ' kurang ' + kata(b); }
        else { a = rand(2, 5); b = rand(2, 5); res = a * b; alt = a + b; teks = a + ' × ' + b; ucap = kata(a) + ' kali ' + kata(b); }
        if (dipakai.has(res) && coba < 79) continue;
        dipakai.add(res);
        const pool = [res - 3, res - 2, res - 1, res + 1, res + 2, res + 3, alt, alt + 1].filter((v) => v >= 0 && v !== res);
        for (let i = 0; i < 4; i++) pool.push(rand(Math.max(0, res - 6), res + 6));
        daftar.push({ res, text: teks, dots: 0, ask: 'Pecahkan jawabannya: ' + teks.replace(/ /g, '\u00a0'), say: 'Pecahkan jawabannya: ' + ucap, pool: pool.filter((v) => v !== res) });
        break;
      }
    }
    return daftar;
  }

  TI.register({
    id: 'gelembung',
    title: 'Pecah Gelembung',
    cat: 'mat',
    icon: '🫧',
    desc: 'Gelembung angka melayang naik. Pecahkan yang jawabannya benar!',
    start(ctx) {
      TI.style('gelembung', CSS);
      const reduced = TI.reduced();
      const N = ctx.isTK ? 5 : 6;
      const minSize = ctx.isTK ? 72 : 64;
      const maxSize = ctx.isTK ? 96 : 84;
      const targets = ctx.isTK ? targetTK() : targetSD();

      let tIdx = 0, target = targets[0], selesai = 0, berhenti = false, babak2 = false, gagal = 0;
      let W = 0, H = 0, lane = 0, size = minSize, amp = 0, waktu = 0, tanpaBenar = 0, ukurTerakhir = 0;

      const panel = h('div', { class: 'ti-panel gel-panel', 'aria-hidden': 'true' });
      const scene = h('div', { class: 'ti-scene gel-scene' });
      ctx.el.append(panel, scene);
      ctx.progress(0, TOTAL);

      function tampilkanTarget() {
        const isi = [h('span', { class: 'gel-target pop-in' }, target.text)];
        if (target.dots) isi.push(TI.dots(target.dots));
        panel.replaceChildren(...isi);
        const puji = tIdx > 0 ? TI.pick(['Hebat! ', 'Bagus! ', 'Benar! ']) : '';
        ctx.ask(target.ask, { say: puji + target.say });
      }

      function ukur() {
        const w = scene.clientWidth || 360, hh = scene.clientHeight || 360;
        const lama = H;
        W = w; H = hh;
        lane = W / N;
        size = Math.round(Math.max(minSize, Math.min(maxSize, lane)));
        amp = reduced ? 0 : Math.min(12, Math.max(4, (lane - size) / 2 + 6));
        for (const b of bubbles) {
          b.el.style.width = b.el.style.height = size + 'px';
          if (lama && lama !== H) b.y *= H / lama;
        }
      }

      // ---------- gelembung ----------
      const bubbles = [];
      const dipakaiNilai = (kecuali) => bubbles.filter((o) => o !== kecuali && !o.popped).map((o) => o.value);

      function nilaiSalah(b) {
        const pakai = new Set(dipakaiNilai(b));
        const calon = target.pool.filter((v) => !pakai.has(v) && v !== target.res);
        const dari = calon.length ? calon : target.pool.filter((v) => v !== target.res);
        return dari.length ? dari[rand(0, dari.length - 1)] : target.res + 1;
      }
      function setNilai(b, v) {
        b.value = v;
        b.num.textContent = String(v);
        b.el.setAttribute('aria-label', String(v));
        b.warna = WARNA[rand(0, WARNA.length - 1)];
        b.el.style.setProperty('--bc', b.warna);
      }
      function kecepatan() {
        return H * (ctx.isTK ? 0.12 : 0.17) * (reduced ? 0.55 : 1) * (0.95 + Math.random() * 0.1) * (babak2 ? 1.25 : 1);
      }
      function munculLagi(b, paksaBenar) {
        const lain = bubbles.filter((o) => o !== b && !o.popped);
        const adaBenar = lain.some((o) => o.value === target.res && o.y > size * 0.3);
        setNilai(b, paksaBenar || !adaBenar ? target.res : nilaiSalah(b));
        b.popped = false;
        b.speed = kecepatan();
        b.y = H - size * 0.55;
        b.op = 1;
        b.el.style.opacity = '';
        b.el.style.visibility = '';
        b.el.classList.remove('is-pop', 'is-wrong', 'is-swap', 'is-in');
        void b.el.offsetWidth;
        b.el.classList.add('is-in');
        gambar(b);
      }
      function gambar(b) {
        const goyang = reduced ? 0 : Math.sin(waktu * b.freq + b.fase) * amp;
        b.x = Math.max(0, Math.min(W - size, lane * (b.i + 0.5) - size / 2 + goyang));
        b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px,0)';
      }

      function buatGelembung(i) {
        const num = h('span', { class: 'gel-num' });
        const el = h('button', { type: 'button', class: 'gel-bub', 'data-tap': true }, h('span', { class: 'gel-body' }, num));
        const b = { i, el, num, value: 0, x: 0, y: 0, speed: 0, popped: false, op: 1, warna: '', fase: Math.random() * 6.28, freq: 1.1 + Math.random() * 0.9 };
        el.addEventListener('click', () => ketuk(b));
        scene.append(el);
        bubbles.push(b);
        return b;
      }

      function ketuk(b) {
        if (b.popped || berhenti) return;
        if (b.value === target.res) {
          b.popped = true;
          ctx.sfx('pop');
          meledak(b);
          selesai++; gagal = 0; if (!babak2 && selesai >= 5) { babak2 = true; for (const x of bubbles) x.speed *= 1.25; ctx.correct(null, { say: 'Bagus! Babak 2, lebih cepat!' }); }
          ctx.progress(selesai, TOTAL);
          if (selesai >= TOTAL) {
            berhenti = true;
            ctx.after(500, () => ctx.finish({
              lesson: ctx.isTK ? 'Kamu sudah kenal angka 1 sampai 10!' : 'Berhitung cepat itu latihan, makin sering makin lancar.',
            }));
            return;
          }
          tIdx++;
          target = targets[tIdx];
          tanpaBenar = 0;
          tampilkanTarget();
          ctx.after(260, () => { if (!berhenti) munculLagi(b, true); });
        } else {
          const itu = ctx.isTK ? 'Itu angka ' + kata(b.value) + '. Cari angka ' + kata(target.res) + '.' : false;
          if (++gagal >= 3) { gagal = 0; for (const x of bubbles) x.speed *= 0.7; ctx.say('Santai saja, pelan-pelan.'); } ctx.wrong(b.el, { say: itu });
        }
      }

      function meledak(b) {
        b.el.classList.remove('is-in', 'is-wrong');
        b.el.classList.add('is-pop');
        const cx = b.x + size / 2, cy = b.y + size / 2;
        if (!reduced) {
          for (let k = 0; k < 8; k++) {
            const sudut = (k / 8) * Math.PI * 2 + Math.random() * 0.5, jarak = size * (0.55 + Math.random() * 0.35);
            const sp = h('i', { class: 'gel-spark', 'aria-hidden': 'true' });
            sp.style.setProperty('--bc', b.warna);
            sp.style.setProperty('--cx', cx.toFixed(1) + 'px');
            sp.style.setProperty('--cy', cy.toFixed(1) + 'px');
            sp.style.setProperty('--dx', (Math.cos(sudut) * jarak).toFixed(1) + 'px');
            sp.style.setProperty('--dy', (Math.sin(sudut) * jarak).toFixed(1) + 'px');
            scene.append(sp);
            ctx.after(320, () => sp.remove());
          }
        }
        ctx.after(200, () => { if (b.popped) b.el.style.visibility = 'hidden'; });
      }

      // ---------- mulai ----------
      ukur();
      // Posisi awal berjenjang supaya layar langsung terisi dan gelembung bertetangga tidak sejajar.
      const urutan = [];
      for (let i = 0; i < N; i++) urutan.push(i);
      const peringkat = [];
      for (let i = 0; i < N; i++) peringkat[i] = i % 2 === 0 ? i / 2 : Math.ceil(N / 2) + (i - 1) / 2;
      if (Math.random() < 0.5) peringkat.reverse();
      for (const i of urutan) {
        const b = buatGelembung(i);
        b.el.style.width = b.el.style.height = size + 'px';
        setNilai(b, 0);
        b.speed = kecepatan();
        b.y = (H - size) * (1 - (peringkat[i] + 0.5) / N);
      }
      // Pasti ada satu jawaban benar di dekat tengah layar.
      const tengah = bubbles.reduce((p, b) => (Math.abs(b.y - H * 0.4) < Math.abs(p.y - H * 0.4) ? b : p), bubbles[0]);
      for (const b of bubbles) setNilai(b, b === tengah ? target.res : nilaiSalah(b));
      bubbles.forEach(gambar);
      tampilkanTarget();

      ctx.on(window, 'resize', () => { ukur(); bubbles.forEach(gambar); });

      ctx.loop((dt) => {
        if (berhenti) return false;
        waktu += dt;
        ukurTerakhir += dt;
        if (ukurTerakhir > 0.6) { ukurTerakhir = 0; if (scene.clientHeight !== H || scene.clientWidth !== W) ukur(); }
        let adaBenar = false;
        for (const b of bubbles) {
          if (b.popped) continue;
          b.y -= b.speed * dt;
          if (b.y < -size * 0.5) { munculLagi(b, false); continue; }
          // memudar halus saat keluar lewat atas
          const op = b.y > size * 0.3 ? 1 : Math.max(0, (b.y + size * 0.5) / (size * 0.8));
          if (op !== b.op) { b.op = op; b.el.style.opacity = op >= 1 ? '' : op.toFixed(2); }
          gambar(b);
          if (b.value === target.res && b.y > -size * 0.1 && b.y < H - size * 0.4) adaBenar = true;
        }
        // Jaring pengaman: selalu ada jawaban benar yang bisa diketuk.
        if (adaBenar) tanpaBenar = 0;
        else {
          tanpaBenar += dt;
          if (tanpaBenar > 0.7) {
            tanpaBenar = 0;
            const calon = bubbles.filter((b) => !b.popped && b.y > size * 0.2 && b.y < H - size).sort((a, c) => c.y - a.y)[0];
            if (calon) { setNilai(calon, target.res); calon.el.classList.remove('is-swap'); void calon.el.offsetWidth; calon.el.classList.add('is-swap'); }
          }
        }
      });
    },
  });
})();
