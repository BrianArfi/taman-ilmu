/* 83 Mendarat di Bulan. Lunar-lander vertikal di <canvas>: roket jatuh bebas,
   ketuk Rem untuk mengerem, mendarat pelan di landasan.
   TK: 3 pendaratan, landasan lebar. SD: 5 pendaratan, bahan bakar terbatas. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="mendarat-bulan"] .ml-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="mendarat-bulan"] .ti-scene { flex: none; min-height: 0; height: clamp(240px, 40vw, 340px); width: min(100%, 460px); background: #0a1030; }
.play[data-game="mendarat-bulan"] .ti-scene canvas { display: block; width: 100%; height: 100%; }
.play[data-game="mendarat-bulan"] .ml-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 16px; font-weight: 800; }
.play[data-game="mendarat-bulan"] .ml-info .ok { color: var(--good); }
.play[data-game="mendarat-bulan"] .ml-info .bad { color: var(--bad); }
.play[data-game="mendarat-bulan"] .ml-rem { min-height: 88px; min-width: 220px; font-size: 1.6rem; }
.play[data-game="mendarat-bulan"] .ml-msg { margin: 0; min-height: 1.6em; font-weight: 800; color: var(--muted); text-align: center; }
`;

  TI.register({
    id: 'mendarat-bulan',
    title: 'Mendarat di Bulan',
    cat: 'sains',
    icon: '🌕',
    desc: 'Rem di saat tepat, mendarat mulus.',
    start(ctx) {
      TI.style('mendarat-bulan', CSS);
      const isTK = ctx.isTK;
      const target = isTK ? 3 : 5;
      const padW = isTK ? 0.5 : 0.34; // lebar landasan (fraksi layar)
      const vmax = isTK ? 95 : 70; // kecepatan aman (px/detik)
      const grav = 130; // px/detik kuadrat
      const remKuat = 340; // impuls tiap ketuk (px/detik)

      const wrap = h('div', { class: 'ml-wrap' });
      const scene = h('div', { class: 'ti-scene' });
      const cv = h('canvas', { role: 'img', 'aria-label': 'Roket turun ke landasan bulan' });
      scene.append(cv);
      const info = h('div', { class: 'ml-info' });
      const msg = h('p', { class: 'ml-msg', 'aria-live': 'polite' });
      const rem = h('button', { type: 'button', class: 'ti-btn ml-rem' }, '🔥 Rem!');
      wrap.append(scene, info, msg, rem);
      ctx.el.append(wrap);

      const G = cv.getContext('2d');
      let W = 300, Hh = 260;
      function fit() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = Math.max(200, scene.clientWidth); Hh = Math.max(180, scene.clientHeight);
        cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
        G.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.on(window, 'resize', fit);
      fit();

      const bintang = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random() * 0.8, r: 0.6 + Math.random() * 1.4 }));
      const S = { y: 0, vy: 0, fuel: 100, brake: 0, boom: 0, okFlash: 0, done: false };
      const tanahY = () => Hh - 34;
      const padX = () => W / 2, padWpx = () => W * padW;

      function gambar() {
        G.clearRect(0, 0, W, Hh);
        const langit = G.createLinearGradient(0, 0, 0, tanahY());
        langit.addColorStop(0, '#04061a'); langit.addColorStop(1, '#1a2352');
        G.fillStyle = langit; G.fillRect(0, 0, W, Hh);
        G.fillStyle = '#fff';
        bintang.forEach((s) => { G.globalAlpha = 0.5 + s.r / 4; G.beginPath(); G.arc(s.x * W, s.y * tanahY(), s.r, 0, 7); G.fill(); });
        G.globalAlpha = 1;
        G.fillStyle = '#ffd23f'; G.beginPath(); G.arc(W * 0.85, Hh * 0.16, 18, 0, 7); G.fill();
        G.fillStyle = '#a5a9ba'; G.fillRect(0, tanahY(), W, Hh - tanahY());
        G.fillStyle = '#8e92a6'; G.fillRect(0, tanahY(), W, 5);
        // landasan
        const px = padX(), pw = padWpx();
        G.fillStyle = '#0e9f6e'; G.fillRect(px - pw / 2, tanahY() - 8, pw, 8);
        G.fillStyle = '#fff'; G.font = '800 12px sans-serif'; G.textAlign = 'center';
        G.fillText('LANDASAN', px, tanahY() - 14);
        // roket
        const rx = W / 2, ry = S.y;
        G.save();
        G.translate(rx, ry);
        if (S.brake > 0) {
          G.fillStyle = '#ff922b';
          G.beginPath(); G.moveTo(-8, 16); G.lineTo(0, 16 + 14 + S.brake * 22); G.lineTo(8, 16); G.closePath(); G.fill();
        }
        G.fillStyle = '#eef2f7'; G.fillRect(-10, -16, 20, 32);
        G.fillStyle = '#ef6b6b'; G.beginPath(); G.moveTo(-10, -16); G.lineTo(0, -28); G.lineTo(10, -16); G.closePath(); G.fill();
        G.fillStyle = '#74c0fc'; G.beginPath(); G.arc(0, -4, 5, 0, 7); G.fill();
        G.fillStyle = '#9aa3b5'; G.fillRect(-14, 8, 4, 8); G.fillRect(10, 8, 4, 8);
        G.restore();
        if (S.boom > 0) {
          G.fillStyle = 'rgba(255,120,40,' + Math.max(0, S.boom) + ')';
          G.beginPath(); G.arc(rx, tanahY() - 6, 34 * S.boom + 8, 0, 7); G.fill();
        }
      }

      let kunciInfo = '';
      function segarInfo(ke) {
        const kunci = ke + '|' + Math.round(Math.abs(S.vy)) + '|' + Math.round(S.fuel);
        if (kunci === kunciInfo) return;
        kunciInfo = kunci;
        const anak = [
          h('span', null, '🚀 ' + Math.min(ke + 1, target) + ' / ' + target),
          isTK ? null : h('span', null, '⛽ ' + Math.max(0, Math.round(S.fuel))),
          h('span', { class: Math.abs(S.vy) <= vmax ? 'ok' : 'bad' }, '▼ ' + Math.round(Math.abs(S.vy))),
          h('span', null, 'Aman di bawah ' + vmax),
        ].filter(Boolean);
        info.replaceChildren(...anak);
      }

      let jalan = false;
      ctx.loop(() => { if (jalan) gambar(); });

      function percobaan(ke, gagal) {
        return new Promise((selesai) => {
          S.y = 10; S.vy = 20; S.fuel = 100; S.done = false; S.boom = 0;
          jalan = true;
          segarInfo(ke);
          msg.textContent = gagal > 0 ? 'Ayo coba lagi, rem lebih awal.' : 'Ketuk Rem supaya mendarat pelan.';
          ctx.ask(ke === 0 && gagal === 0 ? 'Roketmu turun! Ketuk Rem supaya mendarat pelan di landasan.' : 'Roket turun lagi. Rem supaya mendarat pelan.');
          rem.disabled = false;
          const t0 = performance.now();
          let terakhir = t0, tapN = 0, over = false;
          const CAP = 12;
          const end = (v) => { if (!over) { over = true; S.done = true; rem.disabled = true; selesai(v); } };
          let stopLoop = null;
          const remTap = () => {
            if (S.done || over) return;
            tapN++;
            if (tapN >= CAP) {
              msg.textContent = 'Remnya cukup, biarkan turun.';
              if (stopLoop) stopLoop();
              ctx.sfx('salah');
              ctx.wrong(null, { say: 'Remnya cukup, biarkan roket turun.' }).then(() => end(false));
              return;
            }
            if (!isTK && S.fuel <= 0) { msg.textContent = 'Bensin habis!'; ctx.sfx('salah'); return; }
            S.vy -= remKuat * 0.28;
            if (S.vy < -160) S.vy = -160;
            if (!isTK) S.fuel -= 4;
            S.brake = 1;
            ctx.sfx('whoosh');
          };
          rem.onclick = remTap;
          const stop = ctx.loop((dt) => {
            stopLoop = stop;
            const now = performance.now();
            dt = Math.min(0.05, (now - terakhir) / 1000); terakhir = now;
            if (!ctx.alive) { end(false); return false; }
            S.brake = Math.max(0, S.brake - dt * 4);
            S.boom = Math.max(0, S.boom - dt * 1.5);
            S.vy += grav * dt;
            S.y += S.vy * dt;
            segarInfo(ke);
            gambar();
            if (now - t0 > 15000) { // kelewat lama: anggap gagal, pandu pendaratan
              stop(); end(false); return false;
            }
            if (S.y >= tanahY() - 28) {
              stop();
              if (Math.abs(S.vy) <= vmax) {
                S.okFlash = 1;
                ctx.sfx('benar');
                ctx.correct(null, { say: 'Mendarat mulus! Hebat!' }).then(() => end(true));
              } else {
                S.boom = 1;
                ctx.sfx('salah');
                ctx.wrong(null, { say: 'Duar! Terlalu cepat. Rem lebih awal ya.' }).then(() => end(false));
              }
              return false;
            }
          });
        });
      }

      return (async () => {
        let mendarat = 0, panduan = 0;
        for (let ke = 0; ke < target && ctx.alive; ke++) {
          ctx.progress(ke, target);
          let gagal = 0, ok = false;
          while (!ok && ctx.alive) {
            ok = await percobaan(ke, gagal);
            if (!ok) {
              gagal++;
              if (gagal >= 2) {
                // Tunjukkan cara: turunkan perlahan otomatis.
                msg.textContent = 'Lihat, seperti ini caranya.';
                await ctx.sayWait('Lihat, seperti ini caranya. Ketuk rem sedikit-sedikit supaya turun pelan.');
                S.y = 10; S.vy = 45; jalan = true;
                await new Promise((res) => {
                  let last = performance.now();
                  let sudah = false;
                  const akhir = () => { if (!sudah) { sudah = true; res(); } };
                  ctx.loop(() => {
                    const now = performance.now();
                    const dt = Math.min(0.05, (now - last) / 1000); last = now;
                    if (!ctx.alive) { akhir(); return false; }
                    S.vy += (95 - S.vy) * Math.min(1, dt * 3);
                    S.y += S.vy * dt;
                    S.brake = 0.8;
                    gambar();
                    if (S.y >= tanahY() - 28) { S.y = tanahY() - 28; gambar(); akhir(); return false; }
                  });
                  ctx.after(9000, akhir);
                });
                jalan = false;
                await ctx.wrong(null, { say: 'Nah, mendarat pelan seperti itu.' });
                panduan++;
                break;
              }
            }
          }
          if (ok) mendarat++;
          jalan = false;
        }
        if (!ctx.alive) return;
        ctx.progress(target, target);
        ctx.finish({ lesson: 'Roket harus melambat sebelum menyentuh tanah. Mendarat pelan membuat pendaratan aman.' });
      })();
    },
  });
})();
