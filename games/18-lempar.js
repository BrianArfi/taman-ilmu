/* 18 Lempar Tepat. Fisika proyektil sungguhan di <canvas>: x = v cos(a) t, y = v sin(a) t - 1/2 g t^2.
   TK: sudut tetap 45 derajat, hanya kekuatan. SD: sudut dan kekuatan, tembok, dan satu target di Bulan (gravitasi 1/6). */
(function () {
  const { h, pick } = TI;

  const VMAX = 17; // kecepatan (m/s) saat kekuatan 100
  // Dunia: k = skala ukuran benda, g = gravitasi (m/s^2), w = lebar dunia (m), ts = percepatan waktu animasi.
  const WORLD = {
    earth: { k: 1, g: 9.8, w: 30, ts: 1.6 },
    moon: { k: 2, g: 1.62, w: 60, ts: 3.2 },
  };
  // d = jarak pusat keranjang (m), w = lebar mulut keranjang (m), ang = sudut contoh jawaban benar.
  const TK_TARGETS = [{ d: 10, w: 4.6 }, { d: 14, w: 4.6 }, { d: 18, w: 4.4 }, { d: 22, w: 4.4 }, { d: 26, w: 4.2 }];
  const SD_TARGETS = [
    { d: 12, w: 3.8, ang: 42 },
    { d: 17, w: 3.6, ang: 38 },
    { d: 22, w: 3.4, ang: 50 },
    { d: 26, w: 3.2, ang: 34 },
    { d: 23, w: 3.4, ang: 58, wall: { x: 11, h: 7.5 } },
    { d: 52, w: 9, ang: 45, moon: true },
  ];

  // ---------- fisika (murni, tanpa kanvas) ----------
  // Geometri pelontar dalam meter. Disesuaikan skala supaya tidak mengecil di layar HP.
  function geom(wd, sc) {
    return { px: 2.2 * wd.k, py: Math.max(1.0 * wd.k, 22 / sc), L: Math.max(1.5 * wd.k, 34 / sc) };
  }
  function launchPoint(gm, deg) {
    const r = (deg * Math.PI) / 180;
    return { x: gm.px + gm.L * Math.cos(r), y: gm.py + gm.L * Math.sin(r) };
  }

  // Simulasi lengkap satu lemparan. Hasil: lintasan (titik tiap 1/120 detik) dan akhir ('hit' | 'short' | 'long' | 'wall').
  function simulate(tg, wd, gm, deg, power) {
    const a = (deg * Math.PI) / 180, v = (VMAX * power) / 100;
    const o = launchPoint(gm, deg);
    const vx = v * Math.cos(a), vy = v * Math.sin(a), g = wd.g, dt = 1 / 120;
    const rad = 0.42 * wd.k;
    const rim = 0.5 * tg.w, left = tg.d - tg.w / 2, right = tg.d + tg.w / 2;
    const wl = tg.wall ? tg.wall.x - 0.4 : 0, wr = tg.wall ? tg.wall.x + 0.4 : 0;
    const pts = [[o.x, o.y]];
    let outcome = 'long', prev = [o.x, o.y];
    const fall = (x, y) => { // jatuh lurus ke tanah
      for (let j = 1; j < 2400; j++) { const t = j * dt, yy = y - 0.5 * g * t * t; if (yy <= 0) { pts.push([x, 0]); return; } pts.push([x, yy]); }
    };
    for (let i = 1; i < 6000; i++) {
      const t = i * dt, x = o.x + vx * t, y = o.y + vy * t - 0.5 * g * t * t, vyNow = vy - g * t;
      if (tg.wall && x + rad * 0.6 > wl && x - rad * 0.6 < wr && y < tg.wall.h + rad * 0.3) {
        outcome = 'wall'; fall(Math.min(prev[0], wl - rad * 0.6), prev[1]); break;
      }
      if (vyNow < 0 && prev[1] > rim && y <= rim) { // melewati bibir keranjang saat turun
        const f = (prev[1] - rim) / (prev[1] - y), xc = prev[0] + (x - prev[0]) * f;
        if (xc >= left && xc <= right) {
          outcome = 'hit'; pts.push([xc, rim]);
          const xe = tg.d + (xc - tg.d) * 0.4; // meluncur ke dasar keranjang
          for (let j = 1; j < 40; j++) { const tt = j * dt, yy = rim - 0.5 * g * tt * tt * 2.2; if (yy <= rim * 0.25) break; pts.push([xc + (xe - xc) * Math.min(1, j / 14), yy]); }
          break;
        }
      }
      if (y < rim && x > left - rad * 0.5 && x < right + rad * 0.5 && prev[0] <= left - rad * 0.5) { // kena sisi keranjang
        outcome = 'short'; fall(left - rad * 0.55, prev[1]); break;
      }
      if (y <= 0) {
        const f = prev[1] / (prev[1] - y), xl = prev[0] + (x - prev[0]) * f;
        pts.push([xl, 0]); outcome = xl < left ? 'short' : 'long'; break;
      }
      if (x > wd.w + 3 * wd.k) { pts.push([x, y]); outcome = 'long'; break; }
      pts.push([x, y]); prev = [x, y];
    }
    return { pts, dt, outcome };
  }

  // Cari kekuatan (m/s) untuk sudut tertentu supaya bola tepat melewati bibir di tengah keranjang.
  function solve(tg, wd, gm, deg) {
    const r = (deg * Math.PI) / 180, o = launchPoint(gm, deg), rim = 0.5 * tg.w;
    const xAtRim = (v) => {
      const vy = v * Math.sin(r), disc = vy * vy - 2 * wd.g * (rim - o.y);
      return disc < 0 ? -1e9 : o.x + v * Math.cos(r) * ((vy + Math.sqrt(disc)) / wd.g);
    };
    let lo = 0.5, hi = 80;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (xAtRim(m) < tg.d) lo = m; else hi = m; }
    const v = (lo + hi) / 2;
    return { v, p: (v / VMAX) * 100 };
  }

  const HINT = {
    short: 'Kurang jauh! Tambah kekuatannya.',
    long: 'Terlalu jauh! Kurangi kekuatannya.',
    wall: 'Kena tembok! Naikkan sudutnya supaya bola melambung lebih tinggi.',
  };

  TI.register({
    id: 'lempar',
    title: 'Lempar Tepat',
    cat: 'sains',
    icon: '🎯',
    desc: 'Atur kekuatan lemparan dan masukkan bola ke keranjang.',
    start(ctx) {
      TI.style('lempar', `
.play[data-game="lempar"] .ti-scene { flex: none; min-height: 0; height: clamp(250px, 42vw, 380px); background: #8ed2ff; }
.play[data-game="lempar"] .ti-scene canvas { transition: opacity 180ms var(--ease-out); }
.play[data-game="lempar"] .lp-hint { margin: 0; min-height: 1.5em; width: 100%; max-width: 860px; text-align: center; font-weight: 800; color: var(--muted); }
.play[data-game="lempar"] .lp-ctl { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 22px; width: 100%; max-width: 860px; }
.play[data-game="lempar"] .lp-slide { display: grid; gap: 2px; flex: 1 1 250px; min-width: 0; max-width: 420px; }
.play[data-game="lempar"] .lp-slide .ti-slider { width: 100%; }
.play[data-game="lempar"] .lp-val { color: var(--ink); }
.play[data-game="lempar"] .lp-go { flex: 0 0 auto; min-width: 190px; font-size: 1.6rem; }
.play[data-game="lempar"] .lp-ctl.is-busy .ti-slider { pointer-events: none; opacity: 0.6; }
.play[data-game="lempar"] .lp-intro { display: grid; justify-items: center; gap: 14px; width: 100%; max-width: 760px; }
`);

      const targets = ctx.isTK ? TK_TARGETS : SD_TARGETS;
      const S = {
        moon: false, wd: WORLD.earth, gm: null, w: 0, h: 0, gy: 0, sc: 1, dpr: 1,
        theta: 45, power: ctx.isTK ? 25 : 30, tg: null, appear: 1, ball: null,
        trail: [], oldTrail: [], sol: null, spark: [], rest: 3, busy: true, jig: 0, jigT: 0, clouds: [], stars: [],
      };
      for (let i = 0; i < 3; i++) S.clouds.push({ x: 0.15 + i * 0.33, y: 0.12 + (i % 2) * 0.14, s: 0.8 + i * 0.15, v: 5 + i * 3 });
      for (let i = 0; i < 70; i++) S.stars.push({ x: Math.random(), y: Math.random() * 0.8, r: 0.6 + Math.random() * 1.2 });

      // ---------- tampilan ----------
      const cv = h('canvas', { role: 'img', 'aria-label': 'Lapangan lempar bola: pelontar di kiri dan keranjang di kanan' });
      const scene = h('div', { class: 'ti-scene' }, cv);
      const hint = h('p', { class: 'lp-hint', 'aria-live': 'polite' });
      const powVal = h('b', { class: 'lp-val' }, String(S.power));
      const power = h('input', { type: 'range', class: 'ti-slider', min: 10, max: 100, step: 1, value: S.power, 'aria-label': 'Kekuatan lemparan' });
      const angVal = h('b', { class: 'lp-val' }, S.theta + '°');
      const angle = ctx.isSD ? h('input', { type: 'range', class: 'ti-slider', min: 15, max: 75, step: 1, value: S.theta, 'aria-label': 'Sudut lemparan' }) : null;
      const go = h('button', { type: 'button', class: 'ti-btn lp-go' }, '🎯 Lempar!');
      const ctl = h('div', { class: 'lp-ctl is-busy' },
        h('label', { class: 'lp-slide' }, h('span', { class: 'ti-label' }, '💪 Kekuatan: ', powVal), power),
        angle ? h('label', { class: 'lp-slide' }, h('span', { class: 'ti-label' }, '📐 Sudut: ', angVal), angle) : null,
        go);
      ctx.el.append(scene, hint, ctl);

      const G = cv.getContext('2d');
      function fit() {
        S.dpr = Math.min(2, window.devicePixelRatio || 1);
        S.w = Math.max(200, scene.clientWidth); S.h = Math.max(160, scene.clientHeight);
        cv.width = Math.round(S.w * S.dpr); cv.height = Math.round(S.h * S.dpr);
        G.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
        S.gy = S.h * 0.86; S.sc = S.w / S.wd.w; S.gm = geom(S.wd, S.sc);
      }
      ctx.on(window, 'resize', fit);

      // ---------- gambar ----------
      const X = (m) => m * S.sc, Y = (m) => S.gy - m * S.sc;
      function rr(x, y, w, hh, r) { // persegi bulat (roundRect belum ada di browser lama)
        G.moveTo(x + r, y); G.arcTo(x + w, y, x + w, y + hh, r); G.arcTo(x + w, y + hh, x, y + hh, r); G.arcTo(x, y + hh, x, y, r); G.arcTo(x, y, x + w, y, r); G.closePath();
      }
      function cloud(x, y, s) {
        G.fillStyle = 'rgba(255,255,255,0.9)'; G.beginPath();
        [[0, 0, 15], [16, -6, 19], [34, 0, 14], [17, 6, 17]].forEach(([dx, dy, r]) => { G.moveTo(x + dx * s + r * s, y + dy * s); G.arc(x + dx * s, y + dy * s, r * s, 0, 7); });
        G.fill();
      }
      function drawBasket(tg) {
        const cx = X(tg.d), wpx = tg.w * S.sc, hpx = 0.5 * tg.w * S.sc;
        G.save();
        G.globalAlpha = S.appear; G.translate(cx, S.gy + (1 - S.appear) * 12);
        G.scale(1, 1 + S.jig * 0.12 * Math.sin(S.jigT * 24));
        G.fillStyle = '#6b3f17'; G.beginPath(); G.ellipse(0, -hpx, wpx / 2, Math.max(3, wpx * 0.07), 0, 0, 7); G.fill();
        const body = () => { G.beginPath(); G.moveTo(-wpx / 2, -hpx); G.lineTo(wpx / 2, -hpx); G.lineTo(wpx * 0.36, 0); G.lineTo(-wpx * 0.36, 0); G.closePath(); };
        body(); G.fillStyle = '#e0a458'; G.fill();
        G.save(); body(); G.clip(); G.strokeStyle = 'rgba(168,100,31,0.55)'; G.lineWidth = Math.max(1.5, wpx * 0.03);
        for (let i = 1; i < 4; i++) { G.beginPath(); G.moveTo(-wpx / 2, -hpx + (hpx * i) / 4); G.lineTo(wpx / 2, -hpx + (hpx * i) / 4); G.stroke(); }
        for (let x = -wpx; x < wpx; x += wpx * 0.2) { G.beginPath(); G.moveTo(x, -hpx); G.lineTo(x + hpx * 0.6, 0); G.stroke(); }
        G.restore();
        body(); G.lineJoin = 'round'; G.lineWidth = 3; G.strokeStyle = '#a8641f'; G.stroke();
        G.fillStyle = '#b9732a'; G.beginPath(); rr(-wpx / 2 - 3, -hpx - 4, wpx + 6, 8, 4); G.fill();
        G.restore();
      }
      function drawWall(wl) {
        const x0 = X(wl.x - 0.4), w = X(0.8), top = Y(wl.h);
        G.fillStyle = '#c5694a'; G.fillRect(x0, top, w, S.gy - top);
        G.strokeStyle = '#9c4a31'; G.lineWidth = 2;
        const row = S.sc * 0.8;
        for (let y = S.gy - row, n = 0; y > top - 1; y -= row, n++) { G.beginPath(); G.moveTo(x0, y); G.lineTo(x0 + w, y); G.stroke(); G.beginPath(); G.moveTo(x0 + w * (n % 2 ? 0.3 : 0.7), y); G.lineTo(x0 + w * (n % 2 ? 0.3 : 0.7), y + row); G.stroke(); }
        G.fillStyle = '#e0856a'; G.fillRect(x0 - 2, top - 5, w + 4, 6);
      }
      function drawCannon() {
        const gm = S.gm, px = X(gm.px), py = Y(gm.py), L = gm.L * S.sc, r = (S.theta * Math.PI) / 180;
        G.fillStyle = '#7a4f2a'; G.beginPath(); G.moveTo(px - 18, S.gy); G.lineTo(px + 18, S.gy); G.lineTo(px + 7, py + 6); G.lineTo(px - 7, py + 6); G.closePath(); G.fill();
        G.save(); G.translate(px, py); G.rotate(-r);
        G.fillStyle = '#41546e'; G.beginPath(); rr(-6, -8, L + 6, 16, 6); G.fill();
        G.fillStyle = '#5d7596'; G.fillRect(2, -6, L - 8, 4);
        G.fillStyle = '#2c3a50'; G.beginPath(); rr(L - 6, -10, 9, 20, 3); G.fill();
        G.restore();
        G.fillStyle = '#c8d1de'; G.beginPath(); G.arc(px, py, 9, 0, 7); G.fill();
        G.fillStyle = '#41546e'; G.beginPath(); G.arc(px, py, 4, 0, 7); G.fill();
      }
      function drawBall() {
        const b = S.ball; if (!b) return;
        const x = X(b.x), y = Y(b.y), r = Math.max(6, 0.42 * S.wd.k * S.sc);
        if (y < -r) { // di atas layar: tunjukkan penanda dan tinggi bola
          G.fillStyle = S.moon ? '#fff' : '#2b2d42'; G.beginPath(); G.moveTo(x, 4); G.lineTo(x - 7, 16); G.lineTo(x + 7, 16); G.closePath(); G.fill();
          G.font = '800 12px sans-serif'; G.textAlign = 'center'; G.fillText(Math.round(b.y) + ' m', x, 30);
          return;
        }
        const gr = G.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        gr.addColorStop(0, '#ffd59a'); gr.addColorStop(0.45, '#ff7a45'); gr.addColorStop(1, '#d6342c');
        G.fillStyle = gr; G.beginPath(); G.arc(x, y, r, 0, 7); G.fill();
        G.strokeStyle = 'rgba(255,255,255,0.75)'; G.lineWidth = 2; G.beginPath(); G.arc(x, y, r * 0.62, 3.6, 4.7); G.stroke();
      }
      function render() {
        const W = S.w, H = S.h, gy = S.gy, moon = S.moon;
        const sky = G.createLinearGradient(0, 0, 0, gy);
        if (moon) { sky.addColorStop(0, '#04061a'); sky.addColorStop(1, '#1a2352'); } else { sky.addColorStop(0, '#8ed2ff'); sky.addColorStop(1, '#e8f8ff'); }
        G.fillStyle = sky; G.fillRect(0, 0, W, H);
        if (moon) {
          G.fillStyle = '#fff';
          S.stars.forEach((s) => { G.globalAlpha = 0.5 + s.r / 3; G.beginPath(); G.arc(s.x * W, s.y * gy, s.r, 0, 7); G.fill(); });
          G.globalAlpha = 1;
          const ex = W * 0.84, ey = H * 0.2, er = Math.min(26, H * 0.1);
          const eg = G.createRadialGradient(ex - er * 0.3, ey - er * 0.3, er * 0.1, ex, ey, er);
          eg.addColorStop(0, '#8fd0ff'); eg.addColorStop(1, '#1f5fc4');
          G.fillStyle = eg; G.beginPath(); G.arc(ex, ey, er, 0, 7); G.fill();
          G.fillStyle = '#4fb86a'; G.beginPath(); G.ellipse(ex - er * 0.25, ey - er * 0.1, er * 0.35, er * 0.22, 0.5, 0, 7); G.ellipse(ex + er * 0.35, ey + er * 0.35, er * 0.22, er * 0.15, 0.2, 0, 7); G.fill();
        } else {
          G.fillStyle = 'rgba(255,214,64,0.35)'; G.beginPath(); G.arc(W * 0.9, H * 0.14, 34, 0, 7); G.fill();
          G.fillStyle = '#ffd23f'; G.beginPath(); G.arc(W * 0.9, H * 0.14, 20, 0, 7); G.fill();
          S.clouds.forEach((c) => cloud(c.x * W, c.y * H, c.s));
        }
        // tanah
        G.fillStyle = moon ? '#a5a9ba' : '#8bd47c'; G.fillRect(0, gy, W, H - gy);
        G.fillStyle = moon ? '#8e92a6' : '#5fbf5f'; G.fillRect(0, gy, W, 6);
        if (moon) { G.fillStyle = '#8e92a6'; [[0.3, 0.5, 20], [0.55, 0.7, 28], [0.78, 0.45, 16], [0.92, 0.72, 22], [0.14, 0.75, 14]].forEach(([fx, fy, r]) => { G.beginPath(); G.ellipse(fx * W, gy + (H - gy) * fy, r, r * 0.32, 0, 0, 7); G.fill(); }); }
        // penanda jarak dari pelontar
        const step = moon ? 20 : 10;
        G.font = '800 12px sans-serif'; G.textAlign = 'center'; G.fillStyle = moon ? '#2c3150' : '#2d6a35'; G.strokeStyle = G.fillStyle; G.lineWidth = 2;
        for (let m = step; X(S.gm.px + m) < W - 16; m += step) {
          G.beginPath(); G.moveTo(X(S.gm.px + m), gy + 6); G.lineTo(X(S.gm.px + m), gy + 13); G.stroke();
          if (ctx.isSD) G.fillText(m + ' m', X(S.gm.px + m), gy + 27);
        }
        if (S.tg && S.tg.wall) drawWall(S.tg.wall);
        drawCannon();
        // jejak titik-titik
        const dots = (arr, a) => { G.fillStyle = moon ? 'rgba(255,255,255,' + a + ')' : 'rgba(43,45,66,' + a + ')'; arr.forEach((p) => { if (Y(p[1]) > -6) { G.beginPath(); G.arc(X(p[0]), Y(p[1]), 2.6, 0, 7); G.fill(); } }); };
        dots(S.oldTrail, 0.2); dots(S.trail, 0.6);
        if (S.sol) {
          G.save(); G.setLineDash([9, 8]); G.lineWidth = 3; G.strokeStyle = moon ? '#7fd1ff' : '#2f6fed'; G.beginPath();
          S.sol.forEach((p, i) => (i ? G.lineTo(X(p[0]), Y(p[1])) : G.moveTo(X(p[0]), Y(p[1])))); G.stroke(); G.restore();
        }
        drawBall();
        if (S.tg) {
          drawBasket(S.tg);
          if (ctx.isSD && S.appear > 0.6) { G.font = '800 13px sans-serif'; G.textAlign = 'center'; G.fillStyle = moon ? '#fff' : '#2b2d42'; G.fillText(Math.round(S.tg.d - S.gm.px) + ' m', X(S.tg.d), Y(0.5 * S.tg.w) - 14); }
        }
        S.spark.forEach((p) => { G.globalAlpha = Math.max(0, p.life); G.fillStyle = p.c; G.fillRect(p.x - 3, p.y - 3, 6, 6); });
        G.globalAlpha = 1;
        // kesempatan lempar
        for (let i = 0; i < 3; i++) { G.beginPath(); G.arc(16 + i * 20, 16, 7, 0, 7); G.fillStyle = i < S.rest ? '#ffb703' : 'rgba(255,255,255,0.45)'; G.fill(); G.lineWidth = 2; G.strokeStyle = 'rgba(43,45,66,0.35)'; G.stroke(); }
        if (ctx.isSD) { G.font = '800 13px sans-serif'; G.textAlign = 'right'; G.fillStyle = moon ? '#fff' : '#2b2d42'; G.fillText(moon ? 'Di Bulan' : 'Di Bumi', W - 12, H - 8); }
      }

      ctx.loop((dt) => {
        dt = Math.max(0, dt);
        if (!TI.reduced() && !S.moon) S.clouds.forEach((c) => { c.x += (c.v * dt) / Math.max(1, S.w); if (c.x > 1.12) c.x = -0.15; });
        if (S.jig > 0) { S.jig = Math.max(0, S.jig - dt * 2.4); S.jigT += dt; }
        S.spark = S.spark.filter((p) => { p.life -= dt * 1.1; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; return p.life > 0; });
        render();
      });

      // ---------- kontrol ----------
      function setBusy(b) {
        S.busy = b; go.disabled = b; ctl.classList.toggle('is-busy', b);
        power.disabled = b; if (angle) angle.disabled = b;
      }
      ctx.on(power, 'input', () => { if (S.busy) return; S.power = +power.value; powVal.textContent = String(S.power); });
      if (angle) ctx.on(angle, 'input', () => { if (S.busy) return; S.theta = +angle.value; angVal.textContent = S.theta + '°'; });
      let pending = null;
      ctx.on(go, 'click', () => { if (S.busy || !pending) return; const r = pending; pending = null; r(); });
      function waitThrow() { return new Promise((res) => { pending = res; setBusy(false); }); }

      // ---------- alur ----------
      function fly(res) {
        return new Promise((resolve) => {
          const total = (res.pts.length - 1) * res.dt;
          const ts = Math.max(S.wd.ts, total / (S.moon ? 2.3 : 1.9));
          let tt = 0, nextDot = 0;
          S.ball = { x: res.pts[0][0], y: res.pts[0][1] };
          ctx.loop((dtr) => {
            tt += Math.max(0, dtr) * ts; // dt pertama bisa sedikit negatif
            if (tt >= total) { const l = res.pts[res.pts.length - 1]; S.ball = { x: l[0], y: l[1] }; resolve(); return false; }
            const f = tt / res.dt, i = Math.floor(f), a = f - i, p0 = res.pts[i], p1 = res.pts[Math.min(i + 1, res.pts.length - 1)];
            S.ball.x = p0[0] + (p1[0] - p0[0]) * a; S.ball.y = p0[1] + (p1[1] - p0[1]) * a;
            while (tt >= nextDot) { S.trail.push([S.ball.x, S.ball.y]); nextDot += 0.12; }
          });
        });
      }
      function burst() {
        if (TI.reduced()) return;
        const tg = S.tg, cols = ['#ffd23f', '#ff6b6b', '#2f6fed', '#0e9f6e', '#9b4dde'];
        for (let i = 0; i < 26; i++) S.spark.push({ x: X(tg.d), y: Y(0.5 * tg.w), vx: (Math.random() - 0.5) * 260, vy: -120 - Math.random() * 200, life: 1, c: pick(cols) });
      }
      async function switchWorld(toMoon) {
        cv.style.opacity = '0'; await ctx.wait(190);
        S.moon = toMoon; S.wd = toMoon ? WORLD.moon : WORLD.earth; S.trail = []; S.oldTrail = []; S.sol = null; S.ball = null; S.tg = null;
        fit(); scene.style.background = toMoon ? '#04061a' : '#8ed2ff';
        cv.style.opacity = '1';
      }
      function setSliders(deg, p) {
        S.theta = deg; S.power = Math.round(p); power.value = String(S.power); powVal.textContent = String(S.power);
        if (angle) { angle.value = String(deg); angVal.textContent = deg + '°'; }
      }
      const showHint = (t) => { hint.textContent = t; };

      async function playTarget(tg, i) {
        setBusy(true);
        if (!!tg.moon !== S.moon) {
          await switchWorld(!!tg.moon);
          const box = h('div', { class: 'lp-intro' });
          ctx.ask('Kita pindah ke Bulan!');
          ctl.hidden = true; hint.hidden = true; ctx.el.append(box);
          ctx.note('Gravitasi di Bulan lebih kecil, jadi bola melayang lebih jauh.', { title: 'Selamat datang di Bulan!', into: box });
          const ok = h('button', { type: 'button', class: 'ti-btn' }, 'Ayo mencoba ➜');
          box.append(ok);
          await new Promise((res) => ok.addEventListener('click', () => { TI.sfx('tap'); res(); }, { once: true }));
          box.remove(); ctl.hidden = false; hint.hidden = false;
        }
        S.tg = tg; S.rest = 3; S.trail = []; S.oldTrail = []; S.sol = null; S.ball = null; S.appear = 0; S.jig = 0;
        setSliders(45, S.power); showHint('');
        const t0 = performance.now();
        const grow = () => { S.appear = TI.reduced() ? 1 : Math.min(1, (performance.now() - t0) / 240); return S.appear < 1; };
        ctx.loop(() => grow() ? undefined : false);

        if (ctx.isTK) ctx.ask(i === 0 ? 'Lempar bola ke keranjang! Geser kekuatan, lalu ketuk Lempar.' : 'Ayo lempar ke keranjang berikutnya!');
        else if (tg.moon) ctx.ask('Di Bulan! Atur sudut dan kekuatan, lalu ketuk Lempar.');
        else if (tg.wall) ctx.ask('Ada tembok! Lempar bola melewati tembok ke keranjang.');
        else ctx.ask('Target ' + (i + 1) + ' dari ' + targets.length + ': atur sudut dan kekuatan, lalu ketuk Lempar.');

        while (S.rest > 0) {
          await waitThrow();
          const deg = S.theta, pw = S.power;
          setBusy(true); S.rest--; S.oldTrail = S.trail; S.trail = []; showHint('');
          const res = simulate(tg, S.wd, S.gm, deg, pw);
          ctx.sfx('whoosh');
          await fly(res);
          if (res.outcome === 'hit') {
            S.ball = null; S.jig = 1; S.jigT = 0; burst();
            await ctx.correct(null, { say: pick(['Masuk! Hebat!', 'Tepat sekali!', 'Keren, bolanya masuk!']) });
            return true;
          }
          S.miss++;
          let msg = HINT[res.outcome];
          if (res.outcome === 'long' && S.moon) msg = 'Terlalu jauh! Di Bulan bola terbang lebih jauh, kurangi kekuatannya.';
          if (S.rest === 0) {
            showHint('Belum kena. Lihat lintasan yang benar ya.');
            await ctx.wrong(null, { say: 'Belum kena. Lihat lintasan yang benar ya.' });
            S.ball = null;
            // tunjukkan jawaban: lintasan putus-putus dan bola mengikutinya
            const deg2 = ctx.isTK ? 45 : tg.ang, sv = solve(tg, S.wd, S.gm, deg2);
            setSliders(deg2, sv.p);
            const demo = simulate(tg, S.wd, S.gm, deg2, sv.p);
            S.sol = demo.pts; S.oldTrail = []; S.trail = [];
            await ctx.wait(500);
            await fly(demo);
            S.ball = null; S.jig = 1; S.jigT = 0; burst(); ctx.sfx('benar');
            await ctx.sayWait('Nah, seperti ini caranya.');
            return false;
          }
          showHint(msg);
          await ctx.wrong(null, { say: msg });
          await ctx.wait(250);
          S.ball = null;
        }
        return false;
      }

      return (async () => {
        S.miss = 0;
        fit();
        const n = targets.length;
        for (let i = 0; i < n && ctx.alive; i++) {
          ctx.progress(i, n);
          await playTarget(targets[i], i);
        }
        if (!ctx.alive) return;
        ctx.progress(n, n);
        ctx.finish({
          stars: S.miss <= n ? 3 : S.miss <= n * 2 ? 2 : 1,
          lesson: 'Bola selalu jatuh ke bawah karena gravitasi bumi. Kekuatan dan sudut lemparan menentukan jauhnya.',
        });
      })();
    },
  });
})();
