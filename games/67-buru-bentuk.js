/* 67 Buru Bentuk. Banyak bentuk acak tersebar, ketuk semua targetnya.
   Ronde menanjak: TK 2 ronde (6 lalu 8 objek), SD 3 ronde (12, 16, 20 objek,
   pengecoh mirip mulai ronde 2, target ronde 3 lima buah). Tombol Bantu:
   ketuk 1-2 tunjuk 1 target (denyut), ketuk 3 temukan semua otomatis.
   Bentuk yang salah diketuk lalu dinonaktifkan supaya sesi selalu selesai. */
(function () {
  const { h, svg, shuffle, rand, sample } = TI;

  const BENTUK = {
    lingkaran: 'Lingkaran',
    segitiga: 'Segitiga',
    persegi: 'Persegi',
    bintang: 'Bintang',
  };
  const MIRIP = { persegi: 'persegi panjang', lingkaran: 'oval' };
  const EKSTRA = {
    'persegi panjang': 'Persegi panjang',
    oval: 'Oval',
    'belah ketupat': 'Belah ketupat',
  };

  const CSS = `
.play[data-game="buru-bentuk"] .bb-wrap { width: 100%; max-width: 640px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="buru-bentuk"] .bb-target { display: flex; align-items: center; gap: 12px; padding: 8px 18px; font-size: 1.5rem; font-weight: 800; }
.play[data-game="buru-bentuk"] .bb-target svg { width: 64px; height: 64px; }
.play[data-game="buru-bentuk"] .bb-scene { width: 100%; height: clamp(300px, 44vh, 420px); }
.play[data-game="buru-bentuk"] .bb-obj { position: absolute; left: 0; top: 0; width: 72px; height: 72px; padding: 4px; border-radius: 18px; background: rgba(255,255,255,0.75); border: 3px solid transparent; }
.play[data-game="buru-bentuk"] .bb-obj svg { display: block; width: 100%; height: 100%; overflow: visible; }
.play[data-game="buru-bentuk"] .bb-obj.is-found { background: #d3f9d8; border-color: #37b24d; }
.play[data-game="buru-bentuk"] .bb-obj.is-out { opacity: 0.35; }
.play[data-game="buru-bentuk"] .bb-hitung { font-size: 1.25rem; font-weight: 800; }
.play[data-game="buru-bentuk"] .bb-obj.is-hint { border-color: var(--c); animation: bb-hint 600ms var(--ease-in-out) 2; } /* motion-ok: petunjuk Bantu, hanya setelah diminta */
@keyframes bb-hint { 50% { transform: scale(1.12); } }
@media (prefers-reduced-motion: reduce) {
.play[data-game="buru-bentuk"] .bb-obj.is-hint { animation: none; }
}`;

  function bentuk(kind, warna) {
    const isi = { fill: warna, stroke: '#fff', 'stroke-width': 4, 'stroke-linejoin': 'round' };
    if (kind === 'lingkaran') return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('circle', { cx: 30, cy: 30, r: 24, ...isi }));
    if (kind === 'oval') return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('ellipse', { cx: 30, cy: 30, rx: 26, ry: 17, ...isi }));
    if (kind === 'segitiga') return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('polygon', { points: '30,6 55,52 5,52', ...isi }));
    if (kind === 'persegi') return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('rect', { x: 8, y: 8, width: 44, height: 44, rx: 6, ...isi }));
    if (kind === 'persegi panjang') return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('rect', { x: 4, y: 16, width: 52, height: 28, rx: 6, ...isi }));
    if (kind === 'belah ketupat') return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('polygon', { points: '30,4 54,30 30,56 6,30', ...isi }));
    // bintang: 5 sudut
    let p = '';
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 12 : 25, a = (Math.PI / 5) * i - Math.PI / 2;
      p += (30 + r * Math.cos(a)).toFixed(1) + ',' + (30 + r * Math.sin(a)).toFixed(1) + ' ';
    }
    return svg('svg', { viewBox: '0 0 60 60', 'aria-hidden': 'true' }, svg('polygon', { points: p.trim(), ...isi }));
  }

  const NAMA = Object.assign({}, BENTUK, EKSTRA);
  const WARNA = ['#e5484d', '#2f6fed', '#f0a800', '#37b24d', '#9775fa', '#e64980'];

  TI.register({
    id: 'buru-bentuk',
    title: 'Buru Bentuk',
    cat: 'mat',
    icon: '🔍',
    desc: 'Temukan bentuk target di keramaian.',
    async start(ctx) {
      TI.style('buru-bentuk', CSS);
      const TK = ctx.isTK;
      const targetDaftar = TK
        ? sample(Object.keys(BENTUK), 2)
        : sample(Object.keys(BENTUK), 3);
      const NOBJ_TK = [6, 8], NOBJ_SD = [12, 16, 20];
      const nObjList = TK ? NOBJ_TK : NOBJ_SD;
      const nTarget = TK ? 3 : 4;

      ctx.progress(0, targetDaftar.length);
      for (let r = 0; r < targetDaftar.length; r++) {
        if (!ctx.alive) return;
        const target = targetDaftar[r];
        const nObj = nObjList[r];
        const nT = !TK && r === targetDaftar.length - 1 ? nTarget + 1 : nTarget;
        const mirip = !TK && r > 0 && MIRIP[target] ? MIRIP[target] : null;
        const pool = Object.keys(NAMA).filter((k) => k !== target && k !== mirip);
        // Susun daftar objek: target + pengecoh (mirip bila ada) + acak.
        const daftar = [];
        for (let i = 0; i < nT; i++) daftar.push(target);
        if (mirip) { daftar.push(mirip, mirip); }
        while (daftar.length < nObj) daftar.push(pool[(daftar.length) % pool.length]);
        const acak = shuffle(daftar);

        ctx.ask('Ronde ' + (r + 1) + ' dari ' + targetDaftar.length + ': ketuk semua ' + NAMA[target] + '! Ada ' + nT + '.');
        const wrap = h('div', { class: 'bb-wrap' });
        const hitung = h('div', { class: 'bb-hitung' }, 'Ketemu: 0 dari ' + nT);
        const scene = h('div', { class: 'ti-scene bb-scene' });
        const btnBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        wrap.append(
          h('div', { class: 'ti-panel bb-target pop-in' }, bentuk(target, '#2f6fed'), h('span', null, NAMA[target])),
          btnBantu, scene, hitung);
        ctx.el.append(wrap);

        // Petak posisi acak supaya tidak bertumpuk dan tidak meluber.
        const cols = 4, rows = Math.ceil(nObj / cols);
        const selPos = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, nObj);
        let ketemu = 0, selesai = false, bantu = 0;
        const done = new Promise((res) => {
          acak.forEach((kind, i) => {
            const sel = selPos[i];
            const cx = (sel % cols) / cols, cy = Math.floor(sel / cols) / rows;
            const jx = rand(-8, 8), jy = rand(-6, 6);
            const b = h('button', {
              type: 'button', class: 'bb-obj pop-in', style: '--i:' + (i % 6),
              'aria-label': NAMA[kind],
            }, bentuk(kind, WARNA[i % WARNA.length]));
            b._target = (kind === target);
            // Posisi: sudut kiri atas sel grid + goyangan kecil. Tombol 72px muat di sel.
            b.style.left = 'calc(' + (cx * 100).toFixed(1) + '% + ' + jx + 'px)';
            b.style.top = 'calc(' + (cy * 100).toFixed(1) + '% + ' + jy + 'px)';
            b.addEventListener('click', async () => {
              if (b.disabled) return;
              if (kind === target) {
                b.disabled = true;
                b.classList.add('is-found');
                ketemu++;
                hitung.textContent = 'Ketemu: ' + ketemu + ' dari ' + nT;
                await ctx.correct(b, { say: NAMA[target] });
                if (ketemu >= nT) {
                  selesai = true;
                  scene.querySelectorAll('button').forEach((x) => { x.disabled = true; });
                  ctx.after(500, res);
                }
              } else {
                b.disabled = true;
                b.classList.add('is-out');
                await ctx.wrong(b, { say: 'Itu ' + NAMA[kind] + ', bukan ' + NAMA[target] + '.' });
              }
            });
            scene.append(b);
          });
        });
        btnBantu.addEventListener('click', async () => {
          if (!ctx.alive || selesai || bantu >= 3) return;
          bantu++;
          ctx.mistakes++;
          ctx.sfx('klik');
          const sisa = [...scene.querySelectorAll('button:not([disabled])')].filter((x) => x._target);
          if (!sisa.length) return;
          if (bantu >= 3) {
            btnBantu.disabled = true;
            for (const x of sisa) { if (!ctx.alive || selesai) return; x.click(); await ctx.wait(400); }
          } else {
            const x = sisa[rand(0, sisa.length - 1)];
            x.classList.add('is-hint');
            ctx.sfx('pop');
            ctx.after(1300, () => x.classList.remove('is-hint'));
          }
        });
        await done;
        if (!ctx.alive) return;
        await ctx.wait(300);
        ctx.sfx('pop');
        ctx.clear();
        ctx.progress(r + 1, targetDaftar.length);
      }
      ctx.finish({ lesson: 'Setiap bentuk punya ciri: segitiga 3 sisi, persegi 4 sisi sama, lingkaran tanpa sudut.' });
    },
  });
})();
