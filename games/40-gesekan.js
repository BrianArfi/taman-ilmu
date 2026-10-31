/* 40 Luncur Kotak. Fisika gesekan sungguhan di <canvas>:
   setelah dilepas pegas, kotak melambat dengan a = mu * g, jadi berhenti pada jarak d = v^2 / (2 * mu * g).
   TK: kekuatan dorong tetap, anak memilih lantai. SD: atur kekuatan dengan slider, atau pilih lantai saat kekuatan terkunci.
   Maksimal 3 dorongan per tantangan, lalu ditunjukkan cara yang benar. */
(function () {
  const { h, pick, shuffle } = TI;

  const G_ACC = 9.8;        // m/s^2
  const VMAX = 8;           // m/s pada kekuatan 100
  const WORLD = 10;         // lebar layar dalam meter
  const XS = 2.2;           // posisi pusat kotak saat lepas dari pegas (m)
  const WALL = 0.45;        // tebal dinding pegas (m)
  const HALF = 0.45;        // setengah lebar kotak (m)
  const HW = 0.85;          // kotak dianggap masuk zona jika pusatnya dalam +-HW dari pusat zona
  const HZ = 1.05;          // setengah lebar zona yang digambar

  const SURF = {
    es: { id: 'es', name: 'Es', say: 'Es', icon: '🧊', mu: 0.05, level: 1, base: '#bfe9fb', top: '#e8f8ff' },
    minyak: { id: 'minyak', name: 'Minyak', say: 'Lantai berminyak', icon: '🛢️', mu: 0.08, level: 1, base: '#4b4f63', top: '#6a6f86' },
    kayu: { id: 'kayu', name: 'Kayu', say: 'Lantai kayu', icon: '🪵', mu: 0.2, level: 2, base: '#c8914f', top: '#e0ac6a' },
    rumput: { id: 'rumput', name: 'Rumput', say: 'Rumput', icon: '🌿', mu: 0.4, level: 3, base: '#5fb85a', top: '#7fd56f' },
    pasir: { id: 'pasir', name: 'Pasir', say: 'Pasir', icon: '🏖️', mu: 0.6, level: 4, base: '#e6c98a', top: '#f3dfa8' },
  };
  const NORMAL = ['es', 'kayu', 'rumput', 'pasir'];
  const distOf = (mu, v) => (v * v) / (2 * mu * G_ACC);
  const vFor = (mu, d) => Math.sqrt(2 * mu * G_ACC * d);
  const fmt = (n) => n.toFixed(1).replace('.', ',');

  // dz = jarak pusat zona dari titik lepas (m). TK: kekuatan tetap = vFor(lantai benar, dz).
  const TK_LIST = [
    { type: 'surface', ans: 'kayu', dz: 4.8 },
    { type: 'surface', ans: 'es', dz: 6.0 },
    { type: 'surface', ans: 'rumput', dz: 4.0 },
    { type: 'surface', ans: 'pasir', dz: 3.0 },
    { type: 'surface', ans: 'kayu', dz: 3.6 },
  ];
  // SD: type 'power' = lantai terkunci, atur kekuatan (ans = lantai, dz). 'surface' = kekuatan terkunci (s), pilih lantai.
  const SD_LIST = [
    { type: 'power', ans: 'kayu', dz: 4.5 },
    { type: 'surface', ans: 'kayu', s: 60 },
    { type: 'power', ans: 'rumput', dz: 3.4 },
    { type: 'power', ans: 'es', dz: 5.0 },
    { type: 'surface', ans: 'rumput', s: 75 },
    { type: 'power', ans: 'minyak', dz: 5.2, oil: true },
  ];
  // lengkapi: dz untuk tipe surface = jarak lantai benar, s untuk tipe power = kekuatan benar
  SD_LIST.forEach((c) => {
    if (c.type === 'surface') c.dz = Math.round(distOf(SURF[c.ans].mu, (VMAX * c.s) / 100) * 10) / 10;
    else c.s = Math.round((vFor(SURF[c.ans].mu, c.dz) / VMAX) * 100);
  });
  TK_LIST.forEach((c) => { c.v = vFor(SURF[c.ans].mu, c.dz); });

  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  TI.register({
    id: 'gesekan',
    title: 'Luncur Kotak',
    cat: 'sains',
    icon: '🛷',
    desc: 'Dorong kotak di lantai licin atau kasar, lalu berhenti di zona hijau.',
    start(ctx) {
      TI.style('gesekan', `
.play[data-game="gesekan"] .ti-scene { flex: none; min-height: 0; height: clamp(210px, 40vw, 330px); background: #8ed2ff; }
.play[data-game="gesekan"] .gs-hint { margin: 0; min-height: 1.5em; width: 100%; max-width: 860px; text-align: center; font-weight: 800; color: var(--muted); }
.play[data-game="gesekan"] .gs-ctl { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 860px; }
.play[data-game="gesekan"] .gs-surf { display: flex; justify-content: center; gap: 8px; width: 100%; }
.play[data-game="gesekan"] .gs-sbtn { flex: 1 1 0; max-width: 150px; min-width: 64px; min-height: 84px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px 4px; border: 3px solid var(--line); border-radius: 18px; background: var(--card); box-shadow: 0 4px 0 var(--shadow); font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: transform var(--dur-press) var(--ease-out), border-color var(--dur-ui) ease, background-color var(--dur-ui) ease, opacity var(--dur-ui) ease; }
.play[data-game="gesekan"] .gs-sbtn:active:not(:disabled) { transform: scale(0.96); }
.play[data-game="gesekan"] .gs-sbtn:disabled { cursor: default; opacity: 0.4; }
.play[data-game="gesekan"] .gs-sbtn[aria-pressed="true"] { opacity: 1; border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, #fff); }
.play[data-game="gesekan"] .gs-sbtn[aria-pressed="true"]:disabled { opacity: 1; }
.play[data-game="gesekan"] .gs-ic { font-size: 1.9rem; line-height: 1; }
.play[data-game="gesekan"] .gs-pips { display: inline-flex; gap: 3px; }
.play[data-game="gesekan"] .gs-pips i { width: 8px; height: 8px; border-radius: 50%; background: #d9d2c3; display: block; }
.play[data-game="gesekan"] .gs-pips i.is-on { background: var(--c); }
.play[data-game="gesekan"] .gs-mu { font-size: 0.8rem; color: var(--muted); }
.play[data-game="gesekan"] .gs-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 22px; width: 100%; }
.play[data-game="gesekan"] .gs-slide { display: grid; gap: 2px; flex: 1 1 250px; min-width: 0; max-width: 420px; }
.play[data-game="gesekan"] .gs-slide .ti-slider { width: 100%; }
.play[data-game="gesekan"] .gs-go { flex: 0 0 auto; min-width: 200px; font-size: 1.6rem; }
.play[data-game="gesekan"] .gs-fixed { margin: 0; font-weight: 800; color: var(--muted); }
.play[data-game="gesekan"] .gs-intro { display: grid; justify-items: center; gap: 12px; width: 100%; max-width: 760px; }
`);

      const tk = ctx.isTK;
      const list = tk ? TK_LIST : SD_LIST;
      const reduced = TI.reduced();
      const S = {
        w: 0, h: 0, sc: 1, gy: 0, dpr: 1,
        sf: SURF.kayu, x: XS - 0.6, alpha: 1, compress: 0.6, v: 0, moving: false,
        zc: XS + 5, flagT: 0, flagWave: 0.3, trails: [], cur: null, spark: [], dust: [], rest: 3, clouds: [], phase: 0,
      };
      for (let i = 0; i < 3; i++) S.clouds.push({ x: 0.15 + i * 0.33, y: 0.1 + (i % 2) * 0.12, s: 0.8 + i * 0.15, v: 6 + i * 3 });

      // ---------- tampilan ----------
      const cv = h('canvas', { role: 'img', 'aria-label': 'Kotak kayu didorong pegas di lantai, zona hijau dengan bendera di kanan' });
      const scene = h('div', { class: 'ti-scene' }, cv);
      const hint = h('p', { class: 'gs-hint', 'aria-live': 'polite' });
      const ctl = h('div', { class: 'gs-ctl' });
      ctx.el.append(scene, hint, ctl);
      const g2 = cv.getContext('2d');
      function fit() {
        S.dpr = Math.min(2, window.devicePixelRatio || 1);
        S.w = Math.max(200, scene.clientWidth); S.h = Math.max(160, scene.clientHeight);
        cv.width = Math.round(S.w * S.dpr); cv.height = Math.round(S.h * S.dpr);
        g2.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
        S.sc = S.w / WORLD; S.gy = S.h * 0.68;
      }
      ctx.on(window, 'resize', fit);
      const X = (m) => m * S.sc;

      // ---------- gambar ----------
      function rr(x, y, w, hh, r) {
        g2.moveTo(x + r, y); g2.arcTo(x + w, y, x + w, y + hh, r); g2.arcTo(x + w, y + hh, x, y + hh, r); g2.arcTo(x, y + hh, x, y, r); g2.arcTo(x, y, x + w, y, r); g2.closePath();
      }
      function cloud(x, y, s) {
        g2.fillStyle = 'rgba(255,255,255,0.9)'; g2.beginPath();
        [[0, 0, 15], [16, -6, 19], [34, 0, 14], [17, 6, 17]].forEach(([dx, dy, r]) => { g2.moveTo(x + dx * s + r * s, y + dy * s); g2.arc(x + dx * s, y + dy * s, r * s, 0, 7); });
        g2.fill();
      }
      function drawFloor(sf) {
        const y0 = S.gy, hF = S.h - S.gy;
        g2.fillStyle = sf.base; g2.fillRect(0, y0, S.w, hF);
        g2.fillStyle = sf.top; g2.fillRect(0, y0, S.w, 7);
        if (sf.id === 'es') {
          g2.strokeStyle = 'rgba(255,255,255,0.85)'; g2.lineWidth = 3; g2.lineCap = 'round';
          for (let i = 0; i < 9; i++) { const x = (i * 0.12 + hash(i) * 0.06) * S.w, y = y0 + 14 + hash(i + 9) * (hF - 28); g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x + 26 + hash(i + 3) * 30, y - 5); g2.stroke(); }
          g2.fillStyle = 'rgba(255,255,255,0.9)';
          for (let i = 0; i < 12; i++) { const x = hash(i + 40) * S.w, y = y0 + 10 + hash(i + 70) * (hF - 16); g2.fillRect(x, y, 3, 3); }
        } else if (sf.id === 'kayu') {
          g2.strokeStyle = 'rgba(122,79,30,0.55)'; g2.lineWidth = 2;
          g2.beginPath(); g2.moveTo(0, y0 + hF * 0.5); g2.lineTo(S.w, y0 + hF * 0.5); g2.stroke();
          for (let x = 0.4; x < WORLD; x += 1.3) { g2.beginPath(); g2.moveTo(X(x), y0 + 7); g2.lineTo(X(x), y0 + hF * 0.5); g2.stroke(); }
          for (let x = 1.05; x < WORLD; x += 1.3) { g2.beginPath(); g2.moveTo(X(x), y0 + hF * 0.5); g2.lineTo(X(x), S.h); g2.stroke(); }
        } else if (sf.id === 'rumput') {
          g2.strokeStyle = '#3f9a3f'; g2.lineWidth = 2; g2.lineCap = 'round';
          for (let x = 2; x < S.w; x += 7) { const hh = 5 + hash(x) * 9; g2.beginPath(); g2.moveTo(x, y0 + 4); g2.lineTo(x + (hash(x + 1) - 0.5) * 5, y0 - hh + 4); g2.stroke(); }
          g2.fillStyle = '#4ea84b';
          for (let i = 0; i < 40; i++) g2.fillRect(hash(i + 5) * S.w, y0 + 12 + hash(i + 25) * (hF - 16), 3, 5);
        } else if (sf.id === 'pasir') {
          g2.fillStyle = '#c9a35c';
          for (let i = 0; i < 90; i++) { g2.beginPath(); g2.arc(hash(i + 11) * S.w, y0 + 8 + hash(i + 61) * (hF - 12), 1.6 + hash(i) * 1.4, 0, 7); g2.fill(); }
        } else if (sf.id === 'minyak') {
          const cols = ['rgba(255,120,200,0.35)', 'rgba(120,220,255,0.35)', 'rgba(255,230,120,0.3)'];
          for (let i = 0; i < 7; i++) { g2.fillStyle = cols[i % 3]; g2.beginPath(); g2.ellipse(hash(i + 3) * S.w, y0 + hF * (0.3 + 0.5 * hash(i + 20)), 40 + hash(i) * 50, 7, 0, 0, 7); g2.fill(); }
          g2.strokeStyle = 'rgba(255,255,255,0.3)'; g2.lineWidth = 2;
          g2.beginPath(); g2.moveTo(0, y0 + 3); g2.lineTo(S.w, y0 + 3); g2.stroke();
        }
      }
      function drawWallSpring() {
        const wpx = X(WALL), top = S.gy - 1.6 * S.sc;
        g2.fillStyle = '#8b94a8'; g2.fillRect(0, top, wpx, S.gy - top);
        g2.strokeStyle = '#6b7488'; g2.lineWidth = 2;
        for (let y = S.gy - S.sc * 0.4; y > top; y -= S.sc * 0.4) { g2.beginPath(); g2.moveTo(0, y); g2.lineTo(wpx, y); g2.stroke(); }
        // pegas: zigzag dari dinding sampai muka kiri kotak (atau titik lepas)
        const size = Math.max(32, 0.9 * S.sc), yc = S.gy - size / 2;
        const xEnd = Math.min(X(S.x - HALF), X(XS - HALF)), xs = wpx;
        const n = 9, amp = size * 0.2;
        g2.strokeStyle = '#5d6b85'; g2.lineWidth = 3.5; g2.lineJoin = 'round'; g2.beginPath(); g2.moveTo(xs, yc);
        for (let i = 1; i < n * 2; i++) g2.lineTo(xs + ((xEnd - xs) * i) / (n * 2), yc + (i % 2 ? -amp : amp));
        g2.lineTo(xEnd, yc); g2.stroke();
        g2.fillStyle = '#5d6b85'; g2.fillRect(xEnd - 3, yc - size * 0.34, 6, size * 0.68);
      }
      function drawZone() {
        const x0 = X(S.zc - HZ), x1 = X(S.zc + HZ), y0 = S.gy;
        g2.fillStyle = 'rgba(14,159,110,0.6)'; g2.fillRect(x0, y0 - 3, x1 - x0, 12);
        g2.strokeStyle = '#0b7d56'; g2.lineWidth = 3; g2.setLineDash([6, 5]);
        g2.beginPath(); g2.moveTo(x0, y0 + 9); g2.lineTo(x0, y0 - 0.7 * S.sc); g2.moveTo(x1, y0 + 9); g2.lineTo(x1, y0 - 0.7 * S.sc); g2.stroke(); g2.setLineDash([]);
        // bendera di sisi kanan zona
        const ph = Math.max(48, 1.5 * S.sc), px = x1 + 2, top = y0 - ph;
        g2.strokeStyle = '#6b7488'; g2.lineWidth = 4; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(px, y0); g2.lineTo(px, top); g2.stroke();
        const fl = Math.max(26, 0.8 * S.sc), amp = (3 + S.flagWave * 7);
        g2.fillStyle = '#e5484d'; g2.beginPath(); g2.moveTo(px, top);
        for (let i = 1; i <= 6; i++) g2.lineTo(px - (fl * i) / 6, top + 4 + Math.sin(S.phase * 5 + i * 0.9) * amp * (i / 6));
        for (let i = 6; i >= 1; i--) g2.lineTo(px - (fl * i) / 6, top + fl * 0.55 + Math.sin(S.phase * 5 + i * 0.9) * amp * (i / 6));
        g2.lineTo(px, top + fl * 0.55); g2.closePath(); g2.fill();
        g2.fillStyle = '#ffc93c'; g2.beginPath(); g2.arc(px, top, 4, 0, 7); g2.fill();
      }
      function drawCrate() {
        if (S.alpha <= 0) return;
        const size = Math.max(32, 0.9 * S.sc), cx = X(S.x), top = S.gy - size;
        g2.save(); g2.globalAlpha = S.alpha;
        g2.beginPath(); rr(cx - size / 2, top, size, size, 5); g2.fillStyle = '#d99a52'; g2.fill();
        g2.strokeStyle = '#8a5a2b'; g2.lineWidth = 3; g2.stroke();
        g2.lineWidth = 2; g2.strokeStyle = 'rgba(138,90,43,0.75)';
        g2.beginPath(); g2.moveTo(cx - size / 2 + 5, top + 5); g2.lineTo(cx + size / 2 - 5, top + size - 5); g2.moveTo(cx + size / 2 - 5, top + 5); g2.lineTo(cx - size / 2 + 5, top + size - 5); g2.stroke();
        g2.beginPath(); rr(cx - size / 2 + 5, top + 5, size - 10, size - 10, 3); g2.stroke();
        g2.restore();
      }
      function render() {
        const W = S.w, H = S.h;
        const sky = g2.createLinearGradient(0, 0, 0, S.gy);
        sky.addColorStop(0, '#8ed2ff'); sky.addColorStop(1, '#e8f8ff');
        g2.fillStyle = sky; g2.fillRect(0, 0, W, H);
        g2.fillStyle = 'rgba(255,214,64,0.35)'; g2.beginPath(); g2.arc(W * 0.92, H * 0.14, 30, 0, 7); g2.fill();
        g2.fillStyle = '#ffd23f'; g2.beginPath(); g2.arc(W * 0.92, H * 0.14, 17, 0, 7); g2.fill();
        S.clouds.forEach((c) => cloud(c.x * W, c.y * H, c.s));
        drawFloor(S.sf);
        drawWallSpring();
        // penanda jarak dari titik lepas (SD)
        if (!tk) {
          g2.font = '800 12px sans-serif'; g2.textAlign = 'center'; g2.fillStyle = 'rgba(43,45,66,0.75)'; g2.strokeStyle = 'rgba(43,45,66,0.5)'; g2.lineWidth = 2;
          for (let k = 0; XS + k < WORLD - 0.2; k++) {
            g2.beginPath(); g2.moveTo(X(XS + k), S.gy + 8); g2.lineTo(X(XS + k), S.gy + 14); g2.stroke();
            if (k % 2 === 0) g2.fillText(k + ' m', X(XS + k), S.gy + 28);
          }
        }
        drawZone();
        // jejak garis (lama lebih pudar)
        g2.lineCap = 'round';
        S.trails.forEach((t, i) => {
          g2.strokeStyle = i === S.trails.length - 1 && S.cur === t ? 'rgba(43,45,66,0.7)' : 'rgba(43,45,66,0.22)'; g2.lineWidth = 3;
          g2.beginPath(); g2.moveTo(X(t.a), S.gy + 5); g2.lineTo(X(t.b), S.gy + 5); g2.stroke();
        });
        drawCrate();
        S.dust.forEach((p) => { g2.globalAlpha = Math.max(0, p.life); g2.fillStyle = p.c; g2.beginPath(); g2.arc(p.x, p.y, p.r, 0, 7); g2.fill(); });
        S.spark.forEach((p) => { g2.globalAlpha = Math.max(0, p.life); g2.fillStyle = p.c; g2.fillRect(p.x - 3, p.y - 3, 6, 6); });
        g2.globalAlpha = 1;
        // sisa dorongan
        for (let i = 0; i < 3; i++) { g2.beginPath(); g2.arc(16 + i * 20, 16, 7, 0, 7); g2.fillStyle = i < S.rest ? '#ffb703' : 'rgba(255,255,255,0.45)'; g2.fill(); g2.lineWidth = 2; g2.strokeStyle = 'rgba(43,45,66,0.35)'; g2.stroke(); }
      }

      ctx.loop((dt) => {
        S.phase += dt;
        if (!reduced) S.clouds.forEach((c) => { c.x += (c.v * dt) / Math.max(1, S.w); if (c.x > 1.12) c.x = -0.15; });
        if (S.flagT > 0) { S.flagT = Math.max(0, S.flagT - dt); S.flagWave = 0.3 + 0.7 * Math.min(1, S.flagT); } else S.flagWave = 0.3;
        S.spark = S.spark.filter((p) => { p.life -= dt * 1.1; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; return p.life > 0; });
        S.dust = S.dust.filter((p) => { p.life -= dt * p.fade; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; return p.life > 0; });
        render();
      });

      // ---------- gerak: pegas lalu meluncur ----------
      function spawnDust(speed) {
        if (reduced || speed < 0.4) return;
        const sf = S.sf, bx = X(S.x - HALF), by = S.gy;
        if (sf.id === 'es') { if (Math.random() < 0.3) S.dust.push({ x: bx + Math.random() * 20, y: by + 2 + Math.random() * 8, vx: -10, vy: 0, g: 0, r: 2 + Math.random() * 1.5, life: 0.9, fade: 2, c: '#fff' }); return; }
        const n = sf.id === 'pasir' ? 2 : sf.id === 'rumput' ? 1 : Math.random() < 0.2 ? 1 : 0;
        for (let i = 0; i < n; i++) {
          S.dust.push({
            x: bx + Math.random() * 10, y: by - 2, vx: -speed * 8 * Math.random() - 8, vy: -20 - Math.random() * 40, g: 160, r: 2 + Math.random() * 3, life: 1, fade: 1.8,
            c: sf.id === 'pasir' ? '#d8b878' : sf.id === 'rumput' ? '#58b24f' : '#c9a066',
          });
        }
      }
      // Jalankan satu dorongan. Hasil: xf (pusat kotak berhenti), outcome 'hit' | 'short' | 'long', dist (m).
      function slide(sf, v) {
        return new Promise((resolve) => {
          S.sf = sf;
          const a = sf.mu * G_ACC, dFin = (v * v) / (2 * a), xf = XS + dFin;
          const tPush = Math.max(0.14, (2 * S.compress) / v), tStop = v / a, total = tPush + tStop;
          const speedUp = Math.max(0.85, Math.min(3, total / 2.5)) * (reduced ? 0.8 : 1);
          const xr = XS - S.compress, aS = v / tPush;
          const tr = { a: XS, b: XS }; S.trails.push(tr); S.cur = tr; if (S.trails.length > 3) S.trails.shift();
          const outcome = Math.abs(xf - S.zc) <= HW ? 'hit' : xf < S.zc ? 'short' : 'long';
          let t = 0, pushed = false;
          S.moving = true; S.alpha = 1;
          ctx.sfx('whoosh');
          ctx.loop((dt) => {
            t += Math.max(0, dt) * speedUp;
            let spd = 0;
            if (t < tPush) { S.x = xr + 0.5 * aS * t * t; spd = aS * t; }
            else {
              if (!pushed) { pushed = true; }
              const u = Math.min(t - tPush, tStop);
              S.x = XS + v * u - 0.5 * a * u * u; spd = Math.max(0, v - a * u);
              tr.b = S.x;
            }
            spawnDust(spd);
            const gone = S.x > WORLD + 0.7;
            if (t >= total || gone) {
              S.moving = false;
              if (!gone) S.x = xf;
              tr.b = Math.min(S.x, WORLD + 0.5);
              resolve({ xf, outcome, dist: dFin });
              return false;
            }
          });
        });
      }
      function burst() {
        if (reduced) return;
        const cols = ['#ffd23f', '#ff6b6b', '#2f6fed', '#0e9f6e', '#9b4dde'];
        for (let i = 0; i < 28; i++) S.spark.push({ x: X(S.zc), y: S.gy - 20, vx: (Math.random() - 0.5) * 280, vy: -140 - Math.random() * 200, life: 1, c: pick(cols) });
      }
      const tween = (ms, fn) => new Promise((res) => {
        let t = 0;
        ctx.loop((dt) => { t += Math.max(0, dt) * 1000; const p = Math.min(1, t / ms); fn(1 - Math.pow(1 - p, 3)); if (p >= 1) { res(); return false; } });
      });
      // kotak kembali ke pegas (memudar lalu muncul lagi)
      async function resetCrate(compress) {
        await tween(reduced ? 80 : 160, (e) => { S.alpha = 1 - e; });
        S.compress = compress; S.x = XS - compress; S.dust = [];
        await tween(reduced ? 80 : 200, (e) => { S.alpha = e; });
        S.alpha = 1;
      }
      const compressOf = (v) => 0.3 + 0.55 * (v / VMAX);

      // ---------- satu tantangan ----------
      async function playChallenge(ch, idx) {
        S.zc = XS + ch.dz; S.rest = 3; S.trails = []; S.cur = null; S.flagT = 0;
        hint.textContent = '';
        let selected = ch.type === 'power' ? ch.ans : null;
        let power = ch.type === 'surface' ? ch.s : (ch.s > 50 ? 22 : 80);
        const lockedSurf = ch.type === 'power';
        const lockedPower = tk || ch.type === 'surface';
        const vNow = () => (tk ? ch.v : (VMAX * power) / 100);
        S.sf = SURF[selected || 'kayu']; S.compress = compressOf(vNow()); S.x = XS - S.compress; S.alpha = 1;

        // kontrol
        ctl.replaceChildren();
        const ids = ch.oil ? ['minyak'] : NORMAL;
        const sbtns = {};
        const row = h('div', { class: 'gs-surf' });
        ids.forEach((id, i) => {
          const sf = SURF[id];
          const pips = h('span', { class: 'gs-pips', 'aria-hidden': 'true' });
          for (let k = 1; k <= 4; k++) pips.append(h('i', { class: k <= sf.level ? 'is-on' : '' }));
          const b = h('button', { type: 'button', class: 'gs-sbtn pop-in', style: '--i:' + i, 'aria-pressed': 'false', 'aria-label': sf.say + (tk ? '' : ', gesekan ' + fmt(sf.mu)) },
            h('span', { class: 'gs-ic', 'aria-hidden': 'true' }, sf.icon), h('span', null, sf.name),
            tk ? pips : h('span', { class: 'gs-mu' }, 'μ ' + fmt(sf.mu)));
          sbtns[id] = b;
          b.addEventListener('click', () => {
            if (busy || lockedSurf) return;
            selected = id; S.sf = sf; ctx.sfx('tap'); ctx.say(sf.say);
            refresh();
          });
          row.append(b);
        });
        const powVal = h('b', null, String(power));
        const slider = h('input', { type: 'range', class: 'ti-slider', min: 10, max: 100, step: 1, value: power, 'aria-label': 'Kekuatan dorongan' });
        const go = h('button', { type: 'button', class: 'ti-btn gs-go' }, '💥 Dorong!');
        const ctlRow = h('div', { class: 'gs-row' });
        if (!tk) ctlRow.append(h('label', { class: 'gs-slide' }, h('span', { class: 'ti-label' }, '💪 Kekuatan: ', powVal, lockedPower ? ' (terkunci)' : ''), slider));
        else ctlRow.append(h('p', { class: 'gs-fixed' }, '💪 Dorongan sama setiap kali'));
        ctlRow.append(go);
        ctl.append(row, ctlRow);
        let busy = false;
        function refresh() {
          ids.forEach((id) => {
            sbtns[id].setAttribute('aria-pressed', String(selected === id));
            sbtns[id].disabled = busy || (lockedSurf && selected !== id);
          });
          slider.disabled = busy || lockedPower;
          go.disabled = busy || !selected;
          if (lockedSurf) { sbtns[selected].disabled = true; }
        }
        ctx.on(slider, 'input', () => {
          if (busy || lockedPower) return;
          power = +slider.value; powVal.textContent = String(power);
          S.compress = compressOf(vNow()); S.x = XS - S.compress;
        });
        refresh();

        if (tk) ctx.ask(idx === 0 ? 'Dorong kotak sampai berhenti di zona hijau! Pilih lantainya dulu.' : 'Pilih lantai yang pas, lalu dorong kotaknya!');
        else if (ch.oil) ctx.ask('Ada tumpahan minyak! Atur kekuatan supaya kotak berhenti di zona hijau.');
        else if (ch.type === 'power') ctx.ask('Lantai ' + SURF[ch.ans].say.toLowerCase().replace('lantai ', '') + ' terkunci. Atur kekuatan dorongan, lalu dorong!');
        else ctx.ask('Kekuatan dorongan terkunci. Pilih lantai yang tepat, lalu dorong!');

        const waitPush = () => new Promise((res) => { const f = () => { if (busy || !selected) return; go.removeEventListener('click', f); res(); }; go.addEventListener('click', f); });
        const setSurface = (id) => { selected = id; S.sf = SURF[id]; refresh(); };
        const setPower = (p) => { power = p; slider.value = String(p); powVal.textContent = String(p); S.compress = compressOf(vNow()); S.x = XS - S.compress; };

        // petunjuk saat meleset
        const hintFor = (res) => {
          const short = res.outcome === 'short';
          if (tk || ch.type === 'surface') return short ? 'Kurang jauh! Coba lantai yang lebih licin.' : 'Kebablasan! Pilih lantai yang lebih kasar.';
          return short ? 'Kurang jauh! Tambah kekuatan dorongannya.' : 'Kebablasan! Kurangi kekuatan dorongannya.';
        };

        async function doPush(demo) {
          busy = true; refresh();
          const sf = SURF[selected], v = vNow();
          const res = await slide(sf, v);
          if (res.outcome === 'hit') {
            S.flagT = 1.4; burst(); ctx.sfx('benar');
            if (!tk) hint.textContent = 'Berhenti di ' + fmt(res.dist) + ' m. Tepat di zona!';
            if (!demo) await ctx.correct(null, { say: pick(['Tepat sekali!', 'Hebat, kotaknya berhenti di zona!', 'Keren!']) });
            else await ctx.sayWait('Nah, seperti ini caranya.');
          }
          busy = false; refresh();
          return res;
        }

        while (S.rest > 0) {
          await waitPush();
          if (!ctx.alive) return;
          S.rest--;
          hint.textContent = '';
          const res = await doPush(false);
          if (res.outcome === 'hit') { await ctx.wait(500); return; }
          const msg = hintFor(res);
          if (!tk) hint.textContent = 'Berhenti di ' + fmt(res.dist) + ' m. ' + msg; else hint.textContent = msg;
          if (S.rest === 0) {
            await ctx.wrong(null, { say: 'Belum kena. Lihat caranya ya.' });
            hint.textContent = 'Lihat caranya ya.';
            // tunjukkan cara yang benar
            await resetCrate(compressOf(ch.type === 'power' ? (VMAX * ch.s) / 100 : vNow()));
            if (ch.type === 'power') setPower(ch.s); else setSurface(ch.ans);
            S.compress = compressOf(vFor(SURF[ch.ans].mu, ch.dz)); S.x = XS - S.compress;
            await ctx.wait(500);
            S.trails = [];
            await doPush(true);
            await ctx.wait(500);
            return;
          }
          await ctx.wrong(null, { say: msg });
          await resetCrate(compressOf(vNow()));
        }
      }

      return (async () => {
        fit();
        const n = list.length, total = n + (tk ? 0 : 1);
        for (let i = 0; i < n && ctx.alive; i++) {
          ctx.progress(i, total);
          await playChallenge(list[i], i);
        }
        if (!ctx.alive) return;
        if (!tk) {
          ctx.progress(n, total);
          ctx.clear();
          ctx.ask('Mengapa sol sepatu dibuat bergerigi?');
          await ctx.choose({
            options: shuffle(['Supaya gesekan besar dan tidak terpeleset', 'Supaya lebih ringan', 'Supaya cepat kotor']).map((v) => ({ value: v, label: v })),
            answer: 'Supaya gesekan besar dan tidak terpeleset', layout: 'is-col',
          });
        }
        if (!ctx.alive) return;
        ctx.progress(total, total);
        const miss = ctx.mistakes;
        ctx.finish({
          stars: miss <= total ? 3 : miss <= total * 2 ? 2 : 1,
          lesson: 'Permukaan kasar membuat gesekan besar sehingga benda cepat berhenti. Permukaan licin gesekannya kecil.',
        });
      })();
    },
  });
})();
