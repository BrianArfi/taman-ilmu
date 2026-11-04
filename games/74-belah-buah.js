/* 74 Belah Buah Hitung. Belah hanya buah yang jawabannya benar. */
(function () {
  const { h, shuffle, sample, rand } = TI;

  const BUAH = ['🍉', '🍎', '🍊', '🍇', '🍓', '🍌', '🥭', '🍍'];
  const RONDE = 8;
  const POS = [[6, 8], [38, 2], [68, 10], [16, 52], [50, 48], [76, 54]];
  const KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
    'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas',
    'delapan belas', 'sembilan belas', 'dua puluh'];

  function buatTarget() {
    if (Math.random() < 0.5) {
      const a = rand(1, 9), b = rand(1, 10 - a);
      return { teks: a + ' + ' + b, ucap: a + ' tambah ' + b, hasil: a + b, maks: 10 };
    }
    const a = rand(2, 10), b = rand(1, a - 1);
    return { teks: a + ' - ' + b, ucap: a + ' kurang ' + b, hasil: a - b, maks: 10 };
  }

  function buatTargetSD() {
    const r = Math.random();
    if (r < 0.5) {
      const a = rand(4, 20), b = rand(2, a - 2);
      return { teks: a + ' - ' + b, ucap: a + ' kurang ' + b, hasil: a - b, maks: 30 };
    }
    const a = rand(2, 6), b = rand(2, 6);
    return { teks: a + ' × ' + b, ucap: a + ' kali ' + b, hasil: a * b, maks: 36 };
  }

  function pengecoh(hasil, n, maks) {
    const ada = new Set([hasil]), out = [];
    [1, -1, 2, -2, 3, 10, -10].forEach((d) => {
      const v = hasil + d;
      if (out.length < n && v >= 0 && v <= maks && !ada.has(v)) { ada.add(v); out.push(v); }
    });
    let g = 0;
    while (out.length < n && g++ < 60) {
      const v = rand(Math.max(0, hasil - 5), Math.min(maks, hasil + 5));
      if (!ada.has(v)) { ada.add(v); out.push(v); }
    }
    return out.slice(0, n);
  }

  const CSS = `
.play[data-game="belah-buah"] .bb-target { font-size: clamp(1.8rem, 7vw, 2.6rem); font-weight: 800; color: var(--c); white-space: nowrap; }
.play[data-game="belah-buah"] .bb-panel { display: flex; align-items: center; justify-content: center; gap: 10px; flex: none; min-height: 76px; padding: 8px 14px; }
.play[data-game="belah-buah"] .bb-scene { position: relative; overflow: hidden; background: linear-gradient(180deg, #e3f7ff 0%, #d3f2d8 100%); }
.play[data-game="belah-buah"] .bb-buah { position: absolute; left: 0; top: 0; width: 76px; height: 76px; padding: 0; border: 0; border-radius: 50%;
  background: rgba(255,255,255,0.85); box-shadow: 0 4px 10px rgba(30,80,40,0.15); cursor: pointer;
  display: grid; place-items: center; will-change: transform; -webkit-tap-highlight-color: transparent; }
.play[data-game="belah-buah"] .bb-buah .bb-em { font-size: 2.4rem; line-height: 1; }
.play[data-game="belah-buah"] .bb-buah .bb-angka { position: absolute; right: 2px; bottom: 2px; min-width: 30px; height: 30px; padding: 0 4px;
  border-radius: 15px; background: #2b2d42; color: #fff; font-weight: 800; font-size: 1.05rem; display: grid; place-items: center; }
.play[data-game="belah-buah"] .bb-buah:active { transform: scale(0.95); }
.play[data-game="belah-buah"] .bb-buah.is-salah { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="belah-buah"] .bb-buah.is-benar { pointer-events: none; }
.play[data-game="belah-buah"] .bb-buah.is-benar .bb-dalam { animation: bb-pop 200ms var(--ease-out) both; }
.play[data-game="belah-buah"] .bb-dalam { display: grid; place-items: center; }
.play[data-game="belah-buah"] .bb-buah.is-tunjuk { outline: 5px solid var(--good); outline-offset: 2px; }
@keyframes bb-pop { to { opacity: 0; transform: scale(1.25); } }
@media (max-width: 560px) {
  .play[data-game="belah-buah"] .bb-buah { width: 72px; height: 72px; }
  .play[data-game="belah-buah"] .bb-buah .bb-em { font-size: 2.1rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="belah-buah"] .bb-buah.is-salah { animation: none !important; }
  .play[data-game="belah-buah"] .bb-buah.is-benar .bb-dalam { animation-name: ti-fade !important; }
}`;

  function satuRonde(ctx, target) {
    return new Promise((resolve) => {
      ctx.ask('Belah buah yang hasilnya ' + target.teks + '!', { say: 'Belah buah yang hasilnya ' + target.ucap + '!' });
      const panel = h('div', { class: 'ti-panel bb-panel' },
        h('span', { class: 'bb-target', 'aria-hidden': 'true' }, target.teks + ' = ?'));
      const scene = h('div', { class: 'ti-scene bb-scene' });
      ctx.el.append(panel, scene);
      const nilai = shuffle([target.hasil, ...pengecoh(target.hasil, 4, target.maks)]);
      const ikon = sample(BUAH, 5);
      const stop = { go: true, salah: 0, selesai: false };
      const buah = nilai.map((v, i) => {
        const el = h('button', {
          type: 'button', class: 'bb-buah pop-in', style: '--i:' + i, 'data-tap': true,
          'aria-label': 'Buah berisi angka ' + v,
        }, h('span', { class: 'bb-dalam' }, h('span', { class: 'bb-em', 'aria-hidden': 'true' }, ikon[i]), h('span', { class: 'bb-angka' }, String(v))));
        const f = {
          el, v, i,
          x: POS[i % POS.length][0], y: POS[i % POS.length][1],
          fase: Math.random() * 6.28, cepat: 1.1 + Math.random() * 0.9,
        };
        el.addEventListener('click', async () => {
          if (stop.selesai) return;
          ctx.say('Angka ' + v);
          if (v === target.hasil) {
            stop.selesai = true;
            el.classList.add('is-benar');
            ctx.sfx('pop');
            ctx.after(260, async () => {
              henti();
              await ctx.correct(null, { say: 'Betul! ' + target.teks + ' sama dengan ' + target.hasil + '.' });
              resolve();
            });
          } else {
            stop.salah++;
            el.classList.remove('is-salah'); void el.offsetWidth; el.classList.add('is-salah');
            if (stop.salah >= 3) {
              stop.selesai = true;
              await ctx.wrong(el, { say: false });
              const benar = buah.find((b) => b.v === target.hasil);
              benar.el.classList.add('is-tunjuk');
              await ctx.sayWait('Lihat, yang hasilnya ' + target.hasil + ' adalah buah ini.');
              henti();
              resolve();
            } else {
              ctx.wrong(el, { say: 'Itu angka ' + v + '. Cari yang hasilnya ' + target.hasil + '.' });
            }
          }
        });
        scene.append(el);
        return f;
      });
      const gambar = () => {
        const w = scene.clientWidth || 340, hh = scene.clientHeight || 340;
        buah.forEach((f) => {
          const px = (f.x / 100) * Math.max(0, w - 80), py = (f.y / 100) * Math.max(0, hh - 80);
          f.el.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
        });
      };
      gambar();
      let t = 0;
      const red = TI.reduced();
      let henti = () => {};
      henti = ctx.loop((dt) => {
        if (!stop.go) return false;
        t += dt;
        if (!red) {
          const w = scene.clientWidth || 340, hh = scene.clientHeight || 340;
          buah.forEach((f) => {
            const px = (f.x / 100) * Math.max(0, w - 80) + Math.sin(t * f.cepat + f.fase) * 8;
            const py = (f.y / 100) * Math.max(0, hh - 80) + Math.cos(t * f.cepat * 0.8 + f.fase) * 7;
            f.el.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
          });
        }
      });
      ctx.on(window, 'resize', gambar);
    });
  }

  TI.register({
    id: 'belah-buah',
    title: 'Belah Buah Hitung',
    cat: 'mat',
    icon: '🍉',
    desc: 'Belah hanya buah yang jawabannya benar.',
    start(ctx) {
      TI.style('belah-buah', CSS);
      const buat = ctx.isTK ? buatTarget : buatTargetSD;
      const daftar = Array.from({ length: RONDE }, buat);
      ctx.series(daftar, (target) => satuRonde(ctx, target), {
        lesson: ctx.isTK
          ? 'Menambah dan mengurangi sampai 10 membuat berhitung makin cepat.'
          : 'Kurang dan kali adalah kebalikan tambah dan bagi. Latihan membuat hafal.',
      });
    },
  });
})();
