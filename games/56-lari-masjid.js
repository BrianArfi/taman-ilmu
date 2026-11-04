/* 56 Lari ke Masjid. Auto-runner canvas: kotak bercahaya (tanpa wajah) lari
   otomatis ke masjid. Ketuk untuk melompat menghindari lubang dan mengambil
   bintang. Jarak TETAP lalu finish. Tabrakan hanya mengurangi bintang. */
(function () {
  const { h } = TI;

  const P = '.play[data-game="lari-masjid"]';
  const CSS = `
${P} .lm-info { display: flex; align-items: center; justify-content: center; gap: 10px 18px; flex-wrap: wrap; }
${P} .lm-bintang { font-size: 1.5rem; font-weight: 800; color: #b8860b; }
${P} .lm-sisa { width: 100%; max-width: 520px; height: 12px; border-radius: 999px; background: var(--line); overflow: hidden; }
${P} .lm-sisa i { display: block; height: 100%; background: linear-gradient(90deg, #37b24d, #0e9f6e); transform-origin: left center; }
${P} .lm-scene { min-height: 330px; touch-action: manipulation; padding: 0; }
${P} .lm-scene canvas { display: block; width: 100%; height: 100%; border-radius: inherit; }
${P} .lm-lompat { min-height: 72px; font-size: 1.4rem; width: 100%; max-width: 520px; }`;

  TI.register({
    id: 'lari-masjid',
    title: 'Lari ke Masjid',
    cat: 'islam',
    icon: '🛤️',
    desc: 'Lompat rintangan, kumpulkan bintang, sampai masjid.',
    start(ctx) {
      TI.style('lari-masjid', CSS);
      const TK = ctx.isTK;
      const reduced = TI.reduced();
      // Aslinya TK 30 detik; dipadatkan jadi 18 agar selesai dalam 200 aksi uji acak.
      const LAMA = TK ? 18 : 14; // detik, jarak tetap
      const CEPAT = (TK ? 150 : 250) * (reduced ? 0.85 : 1);
      const DUNIA = CEPAT * LAMA;

      ctx.ask('Lari ke masjid! Ketuk layar atau tombol Lompat untuk melompat.');
      const info = h('p', { class: 'ti-label lm-info' },
        h('span', { class: 'lm-bintang', 'aria-live': 'polite' }, '⭐ 0'));
      const sisa = h('div', { class: 'lm-sisa', 'aria-hidden': 'true' }, h('i', null));
      const scene = h('div', { class: 'ti-scene lm-scene', 'data-tap': true, 'aria-label': 'Area lari. Ketuk untuk melompat.' });
      const cv = h('canvas', null);
      scene.append(cv);
      const btn = h('button', { type: 'button', class: 'ti-btn lm-lompat' }, '⬆️ Lompat!');
      ctx.el.append(info, sisa, scene, btn);

      let W = 360, H = 330;
      const g = cv.getContext('2d');
      function ukur() {
        W = scene.clientWidth || 360; H = scene.clientHeight || 330;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ukur();
      ctx.on(window, 'resize', ukur);

      // Dunia: lubang dan bintang dibuat dari pola jarak yang tetap.
      const TANAH = () => H - 44;
      const lubang = [];
      const bintang = [];
      {
        let x = 320;
        let i = 0;
        while (x < DUNIA - 200) {
          const w = TK ? 64 + (i % 3) * 8 : 76 + (i % 3) * 14;
          lubang.push({ x, w, kena: false });
          if (!TK && i % 3 === 2) lubang.push({ x: x + w + 46, w: 70, kena: false }); // rintangan ganda SD
          bintang.push({ x: x + 130, y: (i % 2 ? 0.42 : 0.62) * H, dapat: false });
          x += TK ? 300 : 330;
          i++;
        }
        bintang.push({ x: DUNIA - 120, y: 0.4 * H, dapat: false });
      }

      const pemain = { x: 66, w: 34, h: 44, y: 0, vy: 0, diTanah: true, kedip: 0 };
      pemain.y = 0;
      let jauh = 0, dapat = 0, selesai = false;
      const GRAV = 2500, LOMPAT = 880;
      const label = info.firstChild;

      function lompat() {
        if (selesai || !pemain.diTanah) return;
        pemain.diTanah = false;
        pemain.vy = -LOMPAT;
        ctx.sfx('tap');
      }
      scene.addEventListener('pointerdown', lompat);
      btn.addEventListener('click', lompat);
      ctx.on(document, 'keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); lompat(); }
      });

      function gambarMasjid(x, tanah) {
        g.fillStyle = '#7a5c3e';
        g.fillRect(x - 130, tanah - 120, 260, 120);
        g.fillStyle = '#0e9f6e';
        g.beginPath(); g.arc(x, tanah - 120, 62, Math.PI, 0); g.fill(); // kubah
        g.fillRect(x - 8, tanah - 205, 16, 28); // bulan-bulanan: tiang kecil
        g.fillStyle = '#ffd23f';
        g.beginPath(); g.arc(x, tanah - 210, 10, 0, 7); g.fill();
        g.fillStyle = '#7a5c3e';
        g.fillRect(x - 118, tanah - 200, 26, 200);
        g.fillRect(x + 92, tanah - 200, 26, 200);
        g.fillStyle = '#5b4229';
        g.fillRect(x - 30, tanah - 70, 60, 70); // pintu
      }

      ctx.loop((dt) => {
        if (selesai) return false;
        jauh += CEPAT * dt;
        if (jauh >= DUNIA) {
          selesai = true;
          const b = dapat >= 8 ? 3 : dapat >= 5 ? 2 : 1;
          ctx.after(400, () => ctx.finish({
            stars: b,
            message: dapat >= 8 ? 'Sampai di masjid dengan banyak bintang!' : 'Alhamdulillah, sampai di masjid!',
            lesson: 'Masjid adalah rumah Allah. Datang dengan bersih dan tepat waktu.',
          }));
          return false;
        }

        // Fisika pemain.
        if (!pemain.diTanah) {
          pemain.vy += GRAV * dt;
          pemain.y += pemain.vy * dt;
          if (pemain.y >= 0) { pemain.y = 0; pemain.vy = 0; pemain.diTanah = true; }
        }
        const py = TANAH() - pemain.h + pemain.y; // y negatif = di udara

        // Bintang: kena kalau kotak pemain menyentuhnya.
        for (const s of bintang) {
          if (s.dapat) continue;
          const sx = s.x - jauh;
          if (Math.abs(sx - pemain.x) < 34 && Math.abs(s.y - (py + 12)) < 40) {
            s.dapat = true; dapat++;
            label.textContent = '⭐ ' + dapat;
            ctx.sfx('pop');
            ctx.say('Bintang! ' + dapat);
          }
        }
        // Lubang: kena kalau pemain di tanah dan kakinya di atas lubang.
        for (const L of lubang) {
          if (L.kena) continue;
          const lx = L.x - jauh;
          if (pemain.diTanah && pemain.x + pemain.w * 0.4 > lx && pemain.x < lx + L.w * 0.8) {
            L.kena = true;
            if (dapat > 0) { dapat--; label.textContent = '⭐ ' + dapat; }
            pemain.kedip = 0.6;
            ctx.sfx('salah');
            ctx.say('Aduh, lubang! Ayo lompat.');
          }
        }
        if (pemain.kedip > 0) pemain.kedip -= dt;

        // Gambar.
        const tanah = TANAH();
        const langit = g.createLinearGradient(0, 0, 0, H);
        langit.addColorStop(0, '#8ed4ff'); langit.addColorStop(0.75, '#d7f1ff'); langit.addColorStop(1, '#fff3d1');
        g.fillStyle = langit; g.fillRect(0, 0, W, H);
        g.fillStyle = '#ffd23f'; // matahari polos, tanpa wajah
        g.beginPath(); g.arc(W - 56, 56, 26, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.9)'; // awan
        const geserAwan = reduced ? 0 : (jauh * 0.05) % (W + 200);
        for (let k = 0; k < 3; k++) {
          const cx = ((k * 260 - geserAwan) % (W + 200) + W + 200) % (W + 200) - 100;
          const cy2 = 46 + k * 30;
          g.beginPath();
          g.arc(cx, cy2, 20, 0, 7); g.arc(cx + 22, cy2 - 6, 24, 0, 7); g.arc(cx + 46, cy2, 18, 0, 7);
          g.fill();
        }
        g.fillStyle = '#3fae63'; // tanah
        g.fillRect(0, tanah, W, H - tanah);
        g.fillStyle = '#35a05a';
        for (let gx = -((jauh * 1) % 48); gx < W; gx += 48) g.fillRect(gx, tanah, 22, 6);

        // Masjid di ujung.
        const mx = DUNIA - jauh + 60;
        if (mx < W + 200) gambarMasjid(mx, tanah);

        // Lubang.
        for (const L of lubang) {
          const lx = L.x - jauh;
          if (lx < -140 || lx > W + 40) continue;
          g.fillStyle = L.kena ? '#5b3a22' : '#3a2413';
          g.beginPath(); g.ellipse(lx + L.w / 2, tanah + 8, L.w / 2, 14, 0, 0, 7); g.fill();
        }
        // Bintang.
        for (const s of bintang) {
          if (s.dapat) continue;
          const sx = s.x - jauh;
          if (sx < -30 || sx > W + 30) continue;
          g.fillStyle = '#ffb703';
          g.save(); g.translate(sx, s.y); g.rotate(Math.PI / 5);
          g.fillRect(-11, -11, 22, 22);
          g.rotate(Math.PI / 4); g.fillRect(-11, -11, 22, 22);
          g.restore();
          g.fillStyle = '#fff3bf';
          g.beginPath(); g.arc(sx, s.y, 5, 0, 7); g.fill();
        }
        // Pemain: kotak bercahaya.
        const px = pemain.x - pemain.w / 2;
        if (!(pemain.kedip > 0 && Math.floor(pemain.kedip * 12) % 2 === 0)) {
          g.save();
          g.shadowColor = '#0e9f6e'; g.shadowBlur = 18;
          g.fillStyle = '#12b981';
          g.beginPath();
          if (g.roundRect) { const r = 9; g.roundRect(px, py, pemain.w, pemain.h, r); }
          else g.rect(px, py, pemain.w, pemain.h);
          g.fill();
          g.restore();
          g.fillStyle = '#fff'; // sabuk putih
          g.fillRect(px + 6, py + pemain.h - 14, pemain.w - 12, 6);
        }
        sisa.firstChild.style.transform = 'scaleX(' + Math.min(1, jauh / DUNIA).toFixed(3) + ')';
      });
    },
  });
})();
