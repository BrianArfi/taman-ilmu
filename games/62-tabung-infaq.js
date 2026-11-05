/* 62 Tabung Infaq. Arkade: geser celengan untuk menangkap koin jatuh, lalu hitung total.
   Ronde tetap (TK 6 koin lambat, SD 12 item + batu yang mengurangi). Diakhiri tebakan total.
   Babak 2 di tengah permainan: item jatuh lebih cepat. */
(function () {
  const { h, rand, numChoices } = TI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const CSS = `
.play[data-game="tabung-infaq"] .tq-hud { flex: none; display: flex; align-items: center; gap: 14px; padding: 8px 16px; font-weight: 800; font-size: 1.2rem; }
.play[data-game="tabung-infaq"] .tq-hud .tq-total { margin-left: auto; color: var(--c); font-size: 1.4rem; white-space: nowrap; }
.play[data-game="tabung-infaq"] .tq-scene { flex: 1 1 300px; cursor: default; background: linear-gradient(180deg, #bfe3ff 0, #e3f4ff 70%, #ffe9c4 100%); }
.play[data-game="tabung-infaq"] .tq-item { position: absolute; left: 0; top: 0; display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; font-weight: 800; font-size: 1rem; line-height: 1; color: #7a4d00; background: radial-gradient(circle at 32% 28%, #ffe9a8 0, #ffd23f 55%, #e8a800 100%); border: 4px solid #b97c00; will-change: transform; }
.play[data-game="tabung-infaq"] .tq-item.is-batu { border-radius: 38% 62% 55% 45%; color: #fff; background: radial-gradient(circle at 35% 30%, #adb5bd 0, #868e96 60%, #495057 100%); border-color: #343a40; font-size: 0.85rem; }
.play[data-game="tabung-infaq"] .tq-item.is-got { transition: opacity var(--dur-ui) var(--ease-out), transform var(--dur-ui) var(--ease-out); opacity: 0; }
.play[data-game="tabung-infaq"] .tq-ker { position: absolute; left: 0; top: 0; font-size: 3.4rem; line-height: 1; will-change: transform; }
.play[data-game="tabung-infaq"] .tq-ctl { flex: none; display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; }
.play[data-game="tabung-infaq"] .tq-ctl .ti-btn { min-width: 76px; min-height: 72px; font-size: 1.8rem; padding: 8px 14px; }
.play[data-game="tabung-infaq"] .tq-ctl .ti-slider { flex: 1; max-width: 320px; min-height: 64px; }
.play[data-game="tabung-infaq"] .tq-pop { position: absolute; left: 0; top: 0; z-index: 3; font-weight: 800; font-size: 1.3rem; color: #0e9f6e; pointer-events: none; animation: tq-float 700ms var(--ease-out) both; } /* motion-ok: angka melayang saat koin tertangkap */
.play[data-game="tabung-infaq"] .tq-pop.is-min { color: #e5484d; }
@keyframes tq-float { from { opacity: 0; transform: translate3d(var(--px), var(--py), 0) scale(0.95); } 25% { opacity: 1; } to { opacity: 0; transform: translate3d(var(--px), calc(var(--py) - 44px), 0); } }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="tabung-infaq"] .tq-pop { animation-name: ti-fade !important; }
}`;

  TI.register({
    id: 'tabung-infaq',
    title: 'Tabung Infaq',
    cat: 'islam',
    icon: '🏺',
    desc: 'Tangkap koin jatuh lalu hitung sedekahmu.',
    async start(ctx) {
      TI.style('tabung-infaq', CSS);
      const TK = ctx.isTK;
      const halte = h('span', null, 'Koin: 0/' + (TK ? 6 : 12));
      const totalEl = h('span', { class: 'tq-total' }, 'Rp0');
      ctx.el.append(h('div', { class: 'ti-panel tq-hud' }, halte, totalEl));

      const scene = h('div', { class: 'ti-scene tq-scene' });
      const ker = h('div', { class: 'tq-ker', 'aria-hidden': 'true' }, '🧺');
      scene.append(ker);
      ctx.el.append(scene);

      let frac = 0.5;
      const slider = h('input', { type: 'range', class: 'ti-slider', min: '0', max: '100', step: '1', value: '50', 'aria-label': 'Geser celengan' });
      const btnL = h('button', { type: 'button', class: 'ti-btn', 'aria-label': 'Geser kiri' }, '◀');
      const btnR = h('button', { type: 'button', class: 'ti-btn', 'aria-label': 'Geser kanan' }, '▶');
      const setFrac = (f) => { frac = clamp(f, 0, 1); slider.value = String(Math.round(frac * 100)); gambar(); };
      slider.addEventListener('input', () => setFrac(Number(slider.value) / 100));
      btnL.addEventListener('click', () => { ctx.sfx('tap'); setFrac(frac - 0.12); });
      btnR.addEventListener('click', () => { ctx.sfx('tap'); setFrac(frac + 0.12); });
      ctx.el.append(h('div', { class: 'tq-ctl' }, btnL, slider, btnR));

      // Ukuran dan posisi keranjang.
      let W = 0, H = 0, kerY = 0;
      function ukur() {
        W = scene.clientWidth || 340; H = scene.clientHeight || 300;
        kerY = H - 76;
      }
      function gambar() {
        ker.style.transform = 'translate3d(' + (frac * (W - 64)).toFixed(1) + 'px,' + kerY + 'px,0)';
      }
      ukur(); gambar();
      ctx.on(window, 'resize', () => { ukur(); gambar(); });

      // Daftar item jatuh: koin Rp500/Rp1.000, SD diselingi 3 batu pengurang.
      const jatuh = [];
      const nKoin = TK ? 6 : 12;
      for (let i = 0; i < nKoin; i++) jatuh.push({ koin: true, v: i % 2 ? 1000 : 500 });
      if (!TK) { jatuh.splice(3, 0, { koin: false }); jatuh.splice(7, 0, { koin: false }); jatuh.splice(10, 0, { koin: false }); }
      let cepat = TK ? 210 : 270; // px per detik, naik di babak 2
      const jeda = TK ? 1.0 : 0.55; // detik antar item, boleh tumpang di layar

      ctx.ask('Geser celengannya! Tangkap koin, hindari batu!', { speak: false });
      ctx.say('Geser celengannya! Tangkap koin, hindari batu!');
      ctx.progress(0, jatuh.length);

      let total = 0, selesai = 0, tJeda = 0.6;
      const aktif = [];
      const segarkan = () => {
        halte.textContent = 'Koin: ' + selesai + '/' + jatuh.length;
        totalEl.textContent = 'Rp' + total.toLocaleString('id-ID');
      };
      function luncurkan(def) {
        const el = h('div', {
          class: 'tq-item' + (def.koin ? '' : ' is-batu'),
          'aria-hidden': 'true',
        }, def.koin ? String(def.v) : 'Batu');
        scene.append(el);
        aktif.push({ def, el, x: rand(8, Math.max(8, W - 72)), y: -70 });
      }
      function pop(teks, x, y, min) {
        const p = h('span', { class: 'tq-pop' + (min ? ' is-min' : ''), 'aria-hidden': 'true' }, teks);
        p.style.setProperty('--px', x + 'px'); p.style.setProperty('--py', y + 'px');
        scene.append(p);
        ctx.after(750, () => p.remove());
      }
      function tutup(a, tertangkap) {
        const i = aktif.indexOf(a);
        if (i >= 0) aktif.splice(i, 1);
        const cx = a.x + 32;
        if (tertangkap) {
          a.el.classList.add('is-got');
          if (a.def.koin) { total += a.def.v; ctx.sfx('benar'); pop('+' + a.def.v, cx - 20, kerY - 40, false); }
          else { total = Math.max(0, total - 500); ctx.sfx('salah'); pop('-500', cx - 20, kerY - 40, true); }
          ctx.after(220, () => a.el.remove());
        } else a.el.remove();
        selesai++; segarkan(); ctx.progress(selesai, jatuh.length);
      }
      let idx = 0, rampung = false, babak2 = false;
      ctx.loop((dt) => {
        if (!ctx.alive || rampung) return false;
        if (idx < jatuh.length) {
          tJeda -= dt;
          if (tJeda <= 0) { luncurkan(jatuh[idx]); idx++; tJeda = jeda; }
        }
        if (!babak2 && idx >= Math.ceil(jatuh.length / 2)) {
          babak2 = true;
          cepat *= 1.25;
          ctx.correct(null, { say: 'Bagus! Babak 2, kecepatan naik!' });
        }
        const kx = frac * (W - 64) + 32;
        aktif.slice().forEach((a) => {
          a.y += cepat * dt;
          a.el.style.transform = 'translate3d(' + a.x + 'px,' + a.y.toFixed(1) + 'px,0)';
          if (a.y >= kerY - 30 && a.y <= kerY + 40 && Math.abs(a.x + 32 - kx) < 64) tutup(a, true);
          else if (a.y > H + 20) tutup(a, false);
        });
        if (selesai >= jatuh.length) { rampung = true; return false; }
      });
      // Tunggu sampai semua item jatuh (batas: tiap item pasti selesai oleh loop).
      while (!rampung && ctx.alive) await ctx.wait(300);
      if (!ctx.alive) return;
      await ctx.wait(400);

      ctx.clear();
      ctx.ask('Koin sudah habis. Sekarang hitung sedekahmu!');
      ctx.el.append(h('div', { class: 'ti-panel tq-hud pop-in' }, h('span', null, 'Total infaq:'), h('span', { class: 'tq-total' }, 'Rp' + total.toLocaleString('id-ID'))));
      ctx.ask('Berapa total sedekahmu?');
      const opsi = numChoices(total, TK ? 3 : 4, 0, total + 3000);
      await ctx.choose({
        options: opsi.map((v) => ({ label: 'Rp' + v.toLocaleString('id-ID'), value: v, say: v === 0 ? 'nol rupiah' : v + ' rupiah' })),
        answer: total,
        layout: 'is-col',
      });
      ctx.finish({ lesson: 'Bersedekah membuat harta jadi berkah. Sedikit yang ikhlas lebih baik.' });
    },
  });
})();
