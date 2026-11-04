/* 75 Pancing Magnet. Pancing benda logam dengan magnet. */
(function () {
  const { h, shuffle } = TI;

  const SEMUA = [
    { nama: 'Paku', icon: '🔩', logam: true, why: 'Paku terbuat dari besi, jadi ditarik magnet.' },
    { nama: 'Kunci', icon: '🔑', logam: true, why: 'Kunci terbuat dari logam besi, jadi ditarik magnet.' },
    { nama: 'Sendok', icon: '🥄', logam: true, why: 'Sendok besi ditarik magnet.' },
    { nama: 'Kaleng', icon: '🥫', logam: true, why: 'Kaleng ini terbuat dari besi, jadi ditarik magnet.' },
    { nama: 'Kayu', icon: '🪵', logam: false, why: 'Kayu bukan besi, jadi tidak ditarik magnet.' },
    { nama: 'Daun', icon: '🍃', logam: false, why: 'Daun bukan besi, jadi tidak ditarik magnet.' },
    { nama: 'Spons', icon: '🧽', logam: false, why: 'Spons bukan besi, jadi tidak ditarik magnet.' },
    { nama: 'Kertas', icon: '📄', logam: false, why: 'Kertas bukan besi, jadi tidak ditarik magnet.' },
    { nama: 'Sedotan', icon: '🥤', logam: false, why: 'Sedotan plastik bukan besi, jadi tidak ditarik magnet.' },
  ];

  const CSS = `
.play[data-game="pancing-magnet"] .pm-scene { position: relative; overflow: hidden; background: linear-gradient(180deg, #cdeffd 0 42%, #4aa3df 42% 100%); }
.play[data-game="pancing-magnet"] .pm-dasar { position: absolute; left: 0; right: 0; bottom: 0; height: 26px; background: #e8cf9a; }
.play[data-game="pancing-magnet"] .pm-gantung { position: absolute; top: 0; width: 0; will-change: transform; }
.play[data-game="pancing-magnet"] .pm-tali { width: 5px; margin: 0 auto; background: #7a6a55; border-radius: 3px; }
.play[data-game="pancing-magnet"] .pm-magnet { font-size: 2.6rem; line-height: 1; transform: translateX(-50%); display: inline-block; }
.play[data-game="pancing-magnet"] .pm-benda { position: absolute; bottom: 30px; display: grid; justify-items: center; gap: 0;
  background: none; border: 0; padding: 6px; min-width: 64px; min-height: 64px; will-change: transform, opacity; }
.play[data-game="pancing-magnet"] .pm-benda .pm-em { font-size: 2.6rem; line-height: 1; filter: drop-shadow(0 3px 2px rgba(0,0,0,0.2)); }
.play[data-game="pancing-magnet"] .pm-benda .pm-nama { font-size: 0.68rem; font-weight: 800; color: #123; background: rgba(255,255,255,0.85);
  border-radius: 8px; padding: 1px 5px; margin-top: 2px; white-space: nowrap; }
.play[data-game="pancing-magnet"] .pm-benda .pm-em { font-size: 2.3rem; }
.play[data-game="pancing-magnet"] .pm-benda.is-dapat { transition: transform 220ms var(--ease-out), opacity 220ms var(--ease-out); }
.play[data-game="pancing-magnet"] .pm-panel { display: flex; align-items: center; justify-content: center; gap: 10px; flex: none; min-height: 64px; padding: 6px 12px; }
.play[data-game="pancing-magnet"] .pm-skor { font-size: 1.4rem; font-weight: 800; color: var(--c); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="pancing-magnet"] .pm-benda.is-dapat { transition: opacity 150ms ease; }
}`;

  function tween(ctx, ms, fn) {
    return new Promise((res) => {
      let t = 0;
      ctx.loop((dt) => {
        t += Math.max(0, dt) * 1000;
        const p = Math.min(1, t / Math.max(1, ms));
        const e = 1 - Math.pow(1 - p, 3);
        fn(e);
        if (p >= 1) { res(); return false; }
      });
    });
  }

  TI.register({
    id: 'pancing-magnet',
    title: 'Pancing Magnet',
    cat: 'sains',
    icon: '🎣',
    desc: 'Pancing benda logam dengan magnet.',
    start(ctx) {
      TI.style('pancing-magnet', CSS);
      const logam = SEMUA.filter((b) => b.logam);
      const bukan = SEMUA.filter((b) => !b.logam);
      const daftar = ctx.isTK
        ? shuffle([...logam.slice(0, 3), ...bukan.slice(0, 2)])
        : shuffle([...logam.slice(0, 4), ...bukan.slice(0, 4)]);
      const target = daftar.filter((b) => b.logam).length;

      let dapat = 0, tekan = 0, gagalRuntun = 0, tahanX = null;
      const red = TI.reduced();
      const cepat = ctx.isTK ? 0.7 : 1.0;

      const panel = h('div', { class: 'ti-panel pm-panel' });
      const skor = h('span', { class: 'pm-skor', 'aria-live': 'polite' });
      panel.append(skor);
      const scene = h('div', { class: 'ti-scene pm-scene' });
      const gantung = h('div', { class: 'pm-gantung' });
      const tali = h('div', { class: 'pm-tali', style: 'height:40px' });
      const mag = h('span', { class: 'pm-magnet', 'aria-hidden': 'true' }, '🧲');
      gantung.append(tali, mag);
      scene.append(gantung, h('div', { class: 'pm-dasar' }));
      const tombol = h('button', { type: 'button', class: 'ti-btn' }, 'Turunkan magnet! 🧲');
      ctx.el.append(panel, scene, tombol);
      ctx.progress(0, target);

      const tulisSkor = () => { skor.textContent = 'Dapat ' + dapat + ' dari ' + target + ' benda logam'; };
      tulisSkor();

      const posisi = daftar.map((b, i) => ({ b, el: null, frac: daftar.length === 1 ? 0.5 : 0.12 + (0.76 * i) / (daftar.length - 1), kena: false }));
      posisi.forEach((p) => {
        const el = h('div', { class: 'pm-benda', 'aria-hidden': 'true' },
          h('span', { class: 'pm-em' }, p.b.icon), h('span', { class: 'pm-nama' }, p.b.nama));
        p.el = el;
        scene.append(el);
      });

      function letak() {
        const w = scene.clientWidth || 340;
        posisi.forEach((p) => {
          p.el.style.left = 'calc(' + (p.frac * 100).toFixed(1) + '% - 37px)';
        });
        void w;
      }
      letak();
      ctx.on(window, 'resize', letak);

      let t = Math.random() * 6;
      let kaitX = 0.5;
      ctx.loop((dt) => {
        if (!ctx.alive) return false;
        t += dt * (red ? 0.4 : 1);
        kaitX = tahanX != null ? tahanX : 0.5 + 0.38 * Math.sin(t * cepat);
        const w = scene.clientWidth || 340;
        gantung.style.transform = 'translate3d(' + (kaitX * w).toFixed(1) + 'px,0,0)';
        if (!red && ctx.isSD) {
          posisi.forEach((p, i) => {
            if (!p.kena) p.el.style.transform = 'translate3d(' + (Math.sin(t * 0.9 + i * 1.3) * 24).toFixed(1) + 'px,0,0)';
          });
        }
      });

      ctx.ask('Tangkap benda dari besi dengan magnet! Ketuk tombol untuk menurunkan magnet.');
      let sibuk = false;

      tombol.addEventListener('click', async () => {
        if (sibuk || !ctx.alive) return;
        const sisa = posisi.filter((p) => !p.kena);
        if (!sisa.length) return;
        sibuk = true;
        tombol.disabled = true;
        tekan++;
        ctx.sfx('splash');
        const turunPx = Math.max(120, (scene.clientHeight || 320) - 130);
        await tween(ctx, red ? 200 : 450, (e) => {
          tali.style.height = (40 + turunPx * e).toFixed(0) + 'px';
        });
        await ctx.wait(120);
        // Cari benda terdekat di bawah kait.
        const w = scene.clientWidth || 340;
        const kx = kaitX * w;
        let dekat = null, jarak = 1e9;
        sisa.forEach((p) => {
          const r = p.el.getBoundingClientRect(), s = scene.getBoundingClientRect();
          const cx = r.left + r.width / 2 - s.left;
          const d = Math.abs(cx - kx);
          if (d < jarak) { jarak = d; dekat = p; }
        });
        if (dekat && jarak < 52 && dekat.b.logam) {
          dekat.kena = true;
          dapat++;
          gagalRuntun = 0;
          tahanX = null;
          ctx.progress(dapat, target);
          ctx.sfx('klik');
          dekat.el.classList.add('is-dapat');
          dekat.el.style.transform = 'translate3d(0,-70px,0) scale(1.15)';
          dekat.el.style.opacity = '0';
          tulisSkor();
          ctx.say(dekat.b.nama + '! ' + dekat.b.why);
          await ctx.wait(500);
          dekat.el.style.visibility = 'hidden';
        } else if (dekat && jarak < 52 && !dekat.b.logam) {
          gagalRuntun++;
          await ctx.wrong(null, { say: dekat.b.nama + ' bukan besi. ' + dekat.b.why });
        } else {
          gagalRuntun++;
          ctx.say('Wah, tidak kena. Coba lagi!');
          await ctx.wait(600);
        }
        await tween(ctx, red ? 150 : 350, (e) => {
          tali.style.height = (40 + turunPx * (1 - e)).toFixed(0) + 'px';
        });
        // Setelah 3 gagal beruntun: tahan kait di atas benda logam lalu beri tahu caranya.
        if (dapat < target && gagalRuntun >= 3) {
          const sisaLogam = posisi.filter((p) => !p.kena && p.b.logam);
          if (sisaLogam.length) {
            tahanX = sisaLogam[0].frac;
            gagalRuntun = 0;
            await ctx.sayWait('Lihat, magnet berhenti di atas ' + sisaLogam[0].b.nama + '. Tekan tombolnya sekarang!');
          }
        }
        // Pengaman uji acak: setelah banyak tekan, kait menempel di atas logam terdekat.
        if (dapat < target && tekan > 30 && tahanX == null) {
          const sisaLogam = posisi.filter((p) => !p.kena && p.b.logam);
          if (sisaLogam.length) tahanX = sisaLogam[0].frac;
        }
        if (dapat >= target) {
          ctx.progress(target, target);
          ctx.finish({ lesson: 'Magnet menarik benda dari besi dan baja. Kayu, daun, dan plastik tidak ditarik magnet.' });
          return;
        }
        if (tahanX != null && dapat < target) ctx.ask('Sekarang tekan tombolnya! Magnet sudah di atas benda besi.');
        sibuk = false;
        tombol.disabled = false;
      });
    },
  });
})();
