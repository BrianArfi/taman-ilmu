/* 76 Roket Air. Pompa dan lepas di saat tepat sampai bulan. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="roket-air"] .ra-scene { position: relative; overflow: hidden; background: linear-gradient(180deg, #0b1e3a 0%, #274b73 70%, #3a6ea5 100%); }
.play[data-game="roket-air"] .ra-scene canvas { display: block; width: 100%; height: 100%; }
.play[data-game="roket-air"] .ra-alat { display: grid; gap: 8px; justify-items: center; width: 100%; max-width: 420px; }
.play[data-game="roket-air"] .ra-bar { position: relative; width: 100%; height: 34px; border-radius: 17px; background: #123;
  background: rgba(255,255,255,0.9); border: 3px solid #2b2d42; overflow: hidden; }
.play[data-game="roket-air"] .ra-zona { position: absolute; top: 0; bottom: 0; background: rgba(46,160,67,0.55); }
.play[data-game="roket-air"] .ra-jarum { position: absolute; top: -2px; bottom: -2px; width: 8px; margin-left: -4px; border-radius: 4px;
  background: #e5484d; will-change: transform; }
.play[data-game="roket-air"] .ra-tekan { position: relative; width: 100%; height: 30px; border-radius: 15px; background: #dbe6fb; overflow: hidden; }
.play[data-game="roket-air"] .ra-isi { position: absolute; inset: 0; transform-origin: left center; background: linear-gradient(90deg,#4aa3ff,#2f6fed); will-change: transform; }
.play[data-game="roket-air"] .ra-info { font-weight: 800; color: var(--c); }
.play[data-game="roket-air"] .ra-tombol { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; width: 100%; }`;

  function tween(ctx, ms, fn) {
    return new Promise((res) => {
      let t = 0;
      ctx.loop((dt) => {
        t += Math.max(0, dt) * 1000;
        const p = Math.min(1, t / Math.max(1, ms));
        fn(p);
        if (p >= 1) { res(); return false; }
      });
    });
  }

  function gambarLangit(cv, roketY, api, bulanX, bulanY) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth || 340, hh = cv.clientHeight || 300;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr);
    }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hh);
    g.fillStyle = '#fff';
    for (let i = 0; i < 24; i++) {
      const sx = (i * 97) % w, sy = (i * 57) % Math.floor(hh * 0.6);
      g.globalAlpha = 0.5 + (i % 3) * 0.2;
      g.fillRect(sx, sy, 2, 2);
    }
    g.globalAlpha = 1;
    // Bulan polos tanpa wajah.
    g.fillStyle = '#f5efcf';
    g.beginPath(); g.arc(bulanX, bulanY, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e3d9ae';
    g.beginPath(); g.arc(bulanX - 8, bulanY - 5, 6, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(bulanX + 7, bulanY + 8, 4, 0, Math.PI * 2); g.fill();
    // Tanah.
    g.fillStyle = '#1d5c38';
    g.fillRect(0, hh - 26, w, 26);
    // Roket sederhana: badan, hidung, sirip, api.
    const rx = w / 2, ry = roketY, s = 1;
    const apiH = 14 + api * 22;
    g.fillStyle = '#ffb703';
    g.beginPath(); g.moveTo(rx - 9 * s, ry); g.lineTo(rx + 9 * s, ry); g.lineTo(rx, ry + apiH); g.closePath(); g.fill();
    g.fillStyle = '#e5484d';
    g.beginPath(); g.moveTo(rx - 18 * s, ry - 30 * s); g.lineTo(rx - 10 * s, ry - 52 * s); g.lineTo(rx - 10 * s, ry - 6 * s); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(rx + 18 * s, ry - 30 * s); g.lineTo(rx + 10 * s, ry - 52 * s); g.lineTo(rx + 10 * s, ry - 6 * s); g.closePath(); g.fill();
    g.fillStyle = '#f1f3f5';
    g.beginPath();
    if (g.roundRect) g.roundRect(rx - 10 * s, ry - 62 * s, 20 * s, 62 * s, 8);
    else g.rect(rx - 10 * s, ry - 62 * s, 20 * s, 62 * s);
    g.fill();
    g.fillStyle = '#2f6fed';
    g.beginPath(); g.moveTo(rx - 10 * s, ry - 62 * s); g.lineTo(rx + 10 * s, ry - 62 * s); g.lineTo(rx, ry - 80 * s); g.closePath(); g.fill();
  }

  async function satuPenerbangan(ctx, cfg, nomor) {
    const { pompa, lebar, angin } = cfg;
    ctx.ask('Penerbangan ' + nomor + '. Ketuk pompa ' + pompa + ' kali, lalu lepas saat jarum di hijau!');
    const scene = h('div', { class: 'ti-scene ra-scene' });
    const cv = document.createElement('canvas');
    scene.append(cv);
    const alat = h('div', { class: 'ra-alat' });
    const info = h('p', { class: 'ra-info', 'aria-live': 'polite' }, 'Pompa dulu: 0 dari ' + pompa);
    const tekan = h('div', { class: 'ra-tekan', 'aria-hidden': 'true' }, h('div', { class: 'ra-isi' }));
    const isi = tekan.firstChild;
    isi.style.transform = 'scaleX(0)';
    const bar = h('div', { class: 'ra-bar', 'aria-hidden': 'true' });
    const zona = h('div', { class: 'ra-zona' });
    const jarum = h('div', { class: 'ra-jarum' });
    bar.append(zona, jarum);
    bar.style.visibility = 'hidden';
    const baris = h('div', { class: 'ra-tombol' });
    const btnPompa = h('button', { type: 'button', class: 'ti-btn' }, 'Pompa! 💨');
    baris.append(btnPompa);
    alat.append(info, tekan, bar, baris);
    ctx.el.append(scene, alat);

    const w = () => scene.clientWidth || 340, hh = () => scene.clientHeight || 300;
    gambarLangit(cv, hh() - 26, 0, w() * 0.78, 56);
    ctx.on(window, 'resize', () => gambarLangit(cv, hh() - 26, 0, w() * 0.78, 56));

    // Fase pompa.
    let hit = 0;
    await new Promise((res) => {
      btnPompa.addEventListener('click', () => {
        if (hit >= pompa) return;
        hit++;
        ctx.sfx('tap');
        isi.style.transform = 'scaleX(' + (hit / pompa).toFixed(2) + ')';
        info.textContent = hit >= pompa ? 'Bagus! Sekarang lepas di saat tepat.' : 'Pompa dulu: ' + hit + ' dari ' + pompa;
        if (hit >= pompa) { ctx.after(250, res); }
      });
    });

    // Fase lepas: jarum mengayun, anak mengetuk saat di zona hijau.
    btnPompa.remove();
    bar.style.visibility = '';
    const btnLepas = h('button', { type: 'button', class: 'ti-btn' }, 'Lepaskan! 🚀');
    baris.append(btnLepas);
    let tengah = 0.5, posisi = 0.5, gagal = 0;
    let t = Math.random() * 6;
    const red = TI.reduced();
    const hentiAyun = ctx.loop((dt) => {
      if (!ctx.alive) return false;
      t += dt * (red ? 0.7 : 1);
      if (angin) tengah = 0.5 + 0.18 * Math.sin(t * 0.6);
      posisi = tengah + (0.5 - lebar) * Math.sin(t * (ctx.isTK ? 1.6 : 2.2));
      const bw = bar.clientWidth || 300;
      jarum.style.transform = 'translate3d(' + (posisi * bw).toFixed(1) + 'px,0,0)';
      zona.style.left = ((tengah - lebar) * 100).toFixed(1) + '%';
      zona.style.width = (lebar * 200).toFixed(1) + '%';
    });

    const diZona = () => Math.abs(posisi - tengah) <= lebar;
    await new Promise((res) => {
      btnLepas.addEventListener('click', async () => {
        if (btnLepas.disabled) return;
        if (diZona()) {
          btnLepas.disabled = true;
          hentiAyun();
          res();
        } else {
          gagal++;
          if (gagal >= 3) {
            btnLepas.disabled = true;
            await ctx.wrong(null, { say: false });
            await ctx.sayWait('Lihat, lepas saat jarum ada di kotak hijau.');
            // Tunggu sampai jarum masuk zona lalu lepas otomatis.
            const cek = ctx.every(120, () => {
              if (diZona()) {
                cek();
                hentiAyun();
                res();
              }
            });
          } else {
            ctx.wrong(null, { say: 'Belum tepat. Tunggu jarum masuk hijau!' });
          }
        }
      });
    });

    // Terbang ke bulan.
    ctx.sfx('menang');
    const y0 = hh() - 26, y1 = 96;
    const red2 = TI.reduced();
    await tween(ctx, red2 ? 500 : 1400, (e) => {
      gambarLangit(cv, y0 + (y1 - y0) * e, 1 - e * 0.4, w() * 0.78, 56);
    });
    await ctx.correct(null, { say: 'Roket sampai di bulan! Hebat!' });
  }

  TI.register({
    id: 'roket-air',
    title: 'Roket Air',
    cat: 'sains',
    icon: '🚀',
    desc: 'Pompa dan lepas di saat tepat sampai bulan.',
    start(ctx) {
      TI.style('roket-air', CSS);
      const cfg = ctx.isTK
        ? { pompa: 4, lebar: 0.24, angin: false, terbang: [1, 2, 3] }
        : { pompa: 6, lebar: 0.11, angin: true, terbang: [1, 2, 3, 4, 5] };
      ctx.series(cfg.terbang, (nomor) => satuPenerbangan(ctx, cfg, nomor), {
        lesson: 'Udara yang keluar mendorong roket ke atas. Waktu pelepasan yang tepat membuat roket terbang tinggi.',
      });
    },
  });
})();
