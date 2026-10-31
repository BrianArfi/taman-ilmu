/* 29 Loncat Angka.
   Batu bundar bernomor di atas sungai membentuk garis bilangan. Bola melompat dengan lintasan busur (ctx.loop,
   transform), mendarat dengan percikan kecil dan bunyi tap.
   TK: batu 0-10, ketuk "Loncat!" sebanyak yang diminta lalu "Sudah!". SD: batu 0-20 (berkelok di HP), ketuk batu
   tempat bola mendarat: tambah (maju), kurang (mundur), kali (lompatan besar berulang dari 0). */
(function () {
  const { h, rand } = TI;

  const KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas', 'dua belas',
    'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas', 'dua puluh'];
  const kata = (n) => KATA[n] || String(n);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const BOLA = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="14.5" fill="#d9f03c" stroke="#9db81a" stroke-width="2"/>
    <path d="M4.2 9.5C12 12.5 12 19.5 4.2 22.5M27.8 9.5C20 12.5 20 19.5 27.8 22.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M9 7.5A9.5 9.5 0 0 1 15 5.3" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2" stroke-linecap="round"/></svg>`;

  const GELOMBANG = `<svg class="lj-waves" aria-hidden="true" focusable="false" width="100%" height="100%">
    <defs><pattern id="ljWave" patternUnits="userSpaceOnUse" width="90" height="46"><path d="M0 12Q11 4 22 12T45 12T67 12T90 12M-45 34Q-34 26 -22 34T0 34T22 34T45 34T67 34T90 34T112 34" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="2.4" stroke-linecap="round"/></pattern></defs>
    <rect class="lj-wave-r" x="-90" y="0" width="3000" height="900" fill="url(#ljWave)"/></svg>`;

  const CSS = `
    & .lj-wrap { width: 100%; max-width: 860px; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none; }
    & .lj-eq { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 12px; padding: 10px 18px; width: auto; min-width: 220px; }
    & .lj-num { display: inline-grid; place-items: center; min-width: 1.3em; font-size: 2.3rem; font-weight: 800; line-height: 1.1; }
    & .lj-op { font-size: 2rem; font-weight: 800; color: var(--c); line-height: 1; }
    & .lj-q { min-width: 1.5em; padding: 0 4px; border-radius: 14px; background: #fff4cc; color: #9a6b00; border: 3px dashed #f2c94c; }
    & .lj-q.is-done { background: var(--good-bg); color: var(--good); border: 3px solid var(--good); animation: ti-pop var(--dur-ui-max) var(--ease-out); }
    & .lj-count { flex-basis: 100%; margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--muted); text-align: center; }
    & .lj-count b { display: inline-block; min-width: 1.6em; font-size: 1.7rem; color: var(--c); }
    & .lj-scene { flex: none; min-height: 0; background: linear-gradient(#8fdcff, #46b3f0); }
    & .lj-waves { position: absolute; left: 0; top: 0; z-index: 0; pointer-events: none; }
    & .lj-slot { position: absolute; left: 0; top: 0; z-index: 1; }
    & .lj-stone { position: relative; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%; font-weight: 800; color: #4a463a; line-height: 1; font-family: inherit;
      background: radial-gradient(circle at 34% 28%, #f3eee0, #d2cab5 58%, #b3aa93);
      box-shadow: 0 4px 0 #8e8672, 0 0 0 5px rgba(255, 255, 255, 0.3);
      transition: transform var(--dur-press) var(--ease-out), box-shadow var(--dur-ui) var(--ease-out); }
    & button.lj-stone { cursor: pointer; }
    & button.lj-stone:active:not(:disabled) { transform: scale(0.94); }
    & .lj-stone[aria-disabled="true"] { cursor: default; }
    & .lj-stone.is-start { box-shadow: 0 4px 0 #8e8672, 0 0 0 5px #0e9f6e; }
    & .lj-stone.is-hit { animation: lj-hit 260ms var(--ease-out); }
    @keyframes lj-hit { 35% { transform: translateY(4px); } }
    & .lj-stone.is-wrong { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .lj-stone.is-correct { background: radial-gradient(circle at 34% 28%, #eafff3, #9fe3bf 58%, #5fc08f); box-shadow: 0 4px 0 #3f9d6d, 0 0 0 5px #fff; }
    & .lj-ball { position: absolute; left: 0; top: 0; z-index: 3; pointer-events: none; will-change: transform; }
    & .lj-ball-in { width: 100%; height: 100%; transform-origin: 50% 100%; }
    & .lj-ball-in svg { display: block; width: 100%; height: 100%; }
    & .lj-ball-in.is-land { animation: lj-squash 220ms var(--ease-out); } /* motion-ok: bola gepeng sesaat saat mendarat */
    @keyframes lj-squash { 40% { transform: scale(1.2, 0.8); } }
    & .lj-ball-in.is-wrong { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .lj-shadow { position: absolute; left: 0; top: 0; z-index: 2; border-radius: 50%; background: rgba(0, 0, 0, 0.28); pointer-events: none; will-change: transform; }
    & .lj-drop { position: absolute; z-index: 4; width: 7px; height: 7px; margin: -3px 0 0 -3px; border-radius: 50%; background: #fff; pointer-events: none;
      animation: lj-drop 480ms var(--ease-out) forwards; } /* motion-ok: percikan kecil saat bola mendarat */
    @keyframes lj-drop { from { opacity: 0.95; transform: translate(0, 0); } to { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
    & .lj-tag { position: absolute; z-index: 5; min-width: 34px; padding: 2px 10px; border-radius: 999px; background: #fff; color: var(--c); border: 3px solid var(--c);
      font-weight: 800; font-size: 1.1rem; line-height: 1.3; text-align: center; pointer-events: none; animation: ti-pop var(--dur-ui-max) var(--ease-out) both; }
    & .lj-ctl { display: flex; gap: 12px; width: 100%; max-width: 520px; }
    & .lj-ctl .ti-btn { flex: 1; min-height: 72px; font-size: 1.6rem; }
    & .lj-hint { margin: 0; font-weight: 800; color: var(--muted); text-align: center; font-size: 1.05rem; }
    @media (max-width: 560px) {
      & .lj-num { font-size: 2rem; }
      & .lj-ctl .ti-btn { padding: 8px 12px; font-size: 1.45rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .lj-stone.is-hit, & .lj-ball-in.is-land { animation: none; }
    }
  `.replace(/&/g, '.play[data-game="loncat"]');

  // Sungai dengan batu 0..n-1 dan satu bola. tappable: batu jadi tombol (SD), serpentine di layar sempit.
  function sungai(ctx, { n, tappable }) {
    const reduced = TI.reduced();
    const scene = h('div', { class: 'ti-scene lj-scene' });
    const waves = h('div', { html: GELOMBANG }).firstElementChild;
    scene.append(waves);
    const stones = [], pos = [];
    for (let i = 0; i < n; i++) {
      const el = tappable
        ? h('button', { type: 'button', class: 'lj-stone', 'aria-label': 'Angka ' + i }, String(i))
        : h('span', { class: 'lj-stone', 'aria-hidden': 'true' }, String(i));
      const slot = h('div', { class: 'lj-slot' }, el);
      stones.push(el);
      scene.append(slot);
      el._slot = slot;
    }
    const shadow = h('div', { class: 'lj-shadow' });
    const ballIn = h('div', { class: 'lj-ball-in', html: BOLA });
    const ball = h('div', { class: 'lj-ball' }, ballIn);
    scene.append(shadow, ball);

    const api = { scene, stones, pos, ballIn, cur: 0, d: 40, B: 28, lift: 14, hopping: false };

    function setBall(x, y, arc) {
      const cx = x, cy = y - api.lift - arc;
      ball.style.transform = 'translate3d(' + (cx - api.B / 2).toFixed(1) + 'px,' + (cy - api.B / 2).toFixed(1) + 'px,0)';
      const s = clamp(1 - arc / 110, 0.55, 1), sw = api.d * 0.62 * s;
      shadow.style.transform = 'translate3d(' + (x - sw / 2).toFixed(1) + 'px,' + (y - api.lift * 0.2 + api.d * 0.12).toFixed(1) + 'px,0)';
      shadow.style.opacity = String(0.9 * s);
    }
    api.place = (i) => { api.cur = i; setBall(pos[i].x, pos[i].y, 0); };

    function layout() {
      const W = scene.clientWidth || 340;
      let H;
      if (!tappable) {
        api.d = clamp(Math.floor((W - 56) / (n - 1)) - 3, 26, 58);
        const margin = api.d / 2 + 9, sp = (W - 2 * margin) / (n - 1);
        api.B = clamp(Math.round(api.d * 0.78), 22, 38);
        api.lift = api.d / 2 + api.B / 2 - 3;
        const y0 = api.lift + api.B / 2 + 58;
        for (let i = 0; i < n; i++) pos[i] = { x: margin + sp * i, y: y0 + (i % 2 ? 3 : -3) };
        H = y0 + api.d / 2 + 26;
      } else {
        const perRow = W < 560 ? 7 : 11, rows = Math.ceil(n / perRow), cell = (W - 20) / perRow;
        api.d = clamp(Math.floor(cell) - 6, 40, 60);
        api.B = clamp(Math.round(api.d * 0.58), 24, 34);
        api.lift = api.d * 0.3;
        const head = api.lift + api.B / 2 + 46 + api.d / 2, pitch = api.d + 26;
        for (let i = 0; i < n; i++) {
          const r = Math.floor(i / perRow), c = i % perRow, col = r % 2 ? perRow - 1 - c : c;
          pos[i] = { x: 10 + cell * (col + 0.5), y: head + r * pitch };
        }
        H = head + (rows - 1) * pitch + api.d / 2 + 24;
      }
      scene.style.height = Math.round(H) + 'px';
      waves.setAttribute('height', Math.round(H));
      stones.forEach((el, i) => {
        el.style.width = el.style.height = api.d + 'px';
        el.style.fontSize = Math.round(api.d * (tappable ? 0.4 : 0.44)) + 'px';
        el.style.paddingTop = tappable ? Math.round(api.d * 0.16) + 'px' : '';
        el._slot.style.transform = 'translate3d(' + (pos[i].x - api.d / 2).toFixed(1) + 'px,' + (pos[i].y - api.d / 2).toFixed(1) + 'px,0)';
      });
      ball.style.width = ball.style.height = api.B + 'px';
      shadow.style.width = Math.round(api.d * 0.62) + 'px';
      shadow.style.height = Math.round(api.d * 0.22) + 'px';
      api.place(api.cur);
    }
    api.layout = layout;

    // Percikan di batu i.
    function percik(i) {
      if (reduced) return;
      for (let k = 0; k < 5; k++) {
        const a = (-160 + k * 35) * Math.PI / 180, r = 16 + (k % 2) * 8;
        const d = h('i', { class: 'lj-drop', style: { left: pos[i].x + 'px', top: pos[i].y - api.d * 0.2 + 'px' } });
        d.style.setProperty('--dx', (Math.cos(a) * r).toFixed(1) + 'px'); d.style.setProperty('--dy', (Math.sin(a) * r - 6).toFixed(1) + 'px');
        scene.append(d);
        ctx.after(520, () => d.remove());
      }
    }
    // Lompat dari batu i ke batu j selama ms milidetik, lintasan busur.
    api.hop = (i, j, ms, tinggi) => new Promise((resolve) => {
      const A = pos[i], B = pos[j];
      const dist = Math.hypot(B.x - A.x, B.y - A.y);
      const dur = ms || clamp(250 + dist * 0.9, 300, 720);
      const hgt = tinggi != null ? tinggi : clamp(24 + dist * 0.2, 26, 78) * (reduced ? 0.6 : 1);
      let t = 0;
      api.hopping = true;
      /* motion-ok: bola melompat antar batu (gerak permainan), transform saja */
      ctx.loop((dt) => {
        t += dt * 1000;
        const p = Math.min(1, t / dur);
        setBall(A.x + (B.x - A.x) * p, A.y + (B.y - A.y) * p, hgt * 4 * p * (1 - p));
        if (p >= 1) {
          api.cur = j; api.hopping = false;
          ctx.sfx('tap');
          if (!reduced) {
            ballIn.classList.remove('is-land'); void ballIn.offsetWidth; ballIn.classList.add('is-land');
            const st = stones[j]; st.classList.remove('is-hit'); void st.offsetWidth; st.classList.add('is-hit');
            ctx.after(300, () => st.classList.remove('is-hit'));
          }
          percik(j);
          resolve();
          return false;
        }
      });
    });
    // Gelembung angka di dekat batu i.
    api.tag = (i, teks) => {
      const t = h('span', { class: 'lj-tag' }, teks);
      t.style.left = (pos[i].x - 17) + 'px'; t.style.top = (pos[i].y - api.lift - api.B - 26) + 'px';
      scene.append(t);
      return t;
    };
    // Gerak air pelan (hiasan).
    if (!reduced) {
      let tt = 0;
      const rect = waves.querySelector('.lj-wave-r');
      /* motion-ok: riak air hiasan bergeser sangat pelan, transform saja */
      ctx.loop((dt) => { tt += dt; rect.style.transform = 'translate(' + ((tt * 9) % 90).toFixed(1) + 'px,0)'; });
    }
    return api;
  }

  const persamaan = (bagian) => h('div', { class: 'ti-card lj-eq' }, ...bagian);
  const angka = (v, cls) => h('span', { class: 'lj-num' + (cls ? ' ' + cls : '') }, String(v));
  const op = (t) => h('span', { class: 'lj-op', 'aria-hidden': 'true' }, t);

  // ---------- TK ----------
  async function soalTK(ctx, { a, b }) {
    ctx.ask('Bola di angka ' + a + '. Loncat ' + b + ' kali!');
    const sg = sungai(ctx, { n: 11, tappable: false });
    const hasil = angka('?', 'lj-q');
    const hitung = h('b', null, '0');
    const eq = persamaan([angka(a), op('+'), angka(b), op('='), hasil, h('p', { class: 'lj-count' }, 'Loncatan: ', hitung)]);
    const bLoncat = h('button', { type: 'button', class: 'ti-btn' }, 'Loncat!');
    const bSudah = h('button', { type: 'button', class: 'ti-btn', style: '--c:#0e9f6e' }, 'Sudah!');
    const wrap = h('div', { class: 'lj-wrap' }, eq, sg.scene, h('div', { class: 'lj-ctl' }, bLoncat, bSudah));
    ctx.el.append(wrap);
    sg.layout();
    sg.place(a);
    sg.stones[a].classList.add('is-start');
    ctx.on(window, 'resize', sg.layout);

    let sudah = 0, antre = 0, salah = 0, kunci = false, jalan = null, rencana = a; // rencana = batu tujuan setelah semua lompatan dalam antrean
    const kunciUI = (ya) => { kunci = ya; bLoncat.disabled = ya; bSudah.disabled = ya; };
    // Antrean lompatan: ketukan cepat tidak hilang, bola melompat satu per satu.
    async function proses() {
      while (antre > 0 && ctx.alive) {
        antre--;
        const dari = sg.cur;
        await sg.hop(dari, dari + 1, 300);
        sudah++;
        hitung.textContent = String(sudah);
        ctx.say(kata(sudah));
      }
      jalan = null;
    }
    bLoncat.addEventListener('click', () => {
      if (kunci) return;
      if (rencana >= 10) { ctx.sfx('salah'); ctx.say('Sudah di ujung. Coba hitung lagi.'); return; }
      rencana++; antre++;
      if (!jalan) jalan = proses();
    });

    function selesaiBenar() {
      hasil.textContent = String(a + b); hasil.classList.add('is-done');
      sg.stones[a + b].classList.add('is-correct');
    }
    const ucapan = () => kata(a) + ' tambah ' + kata(b) + ' sama dengan ' + kata(a + b);

    bSudah.addEventListener('click', async () => {
      if (kunci) return;
      kunciUI(true);
      if (jalan) await jalan;
      if (sudah === 0) { kunciUI(false); ctx.say('Ketuk Loncat dulu ya.'); return; }
      if (sudah === b) {
        selesaiBenar();
        await ctx.correct(null, { say: false, min: 500 });
        await ctx.sayWait(ucapan() + '!');
        done();
        return;
      }
      salah++;
      const kurang = sudah < b;
      await ctx.wrong(sg.ballIn, { say: 'Kamu loncat ' + kata(sudah) + ' kali. Soalnya ' + kata(b) + ' kali. ' + (kurang ? 'Kurang.' : 'Kebanyakan.') + ' Coba hitung lagi.', min: 700 });
      // Bola kembali ke awal.
      await sg.hop(sg.cur, a, 340);
      sudah = 0; rencana = a; hitung.textContent = '0';
      if (salah >= 3) {
        // Tiga kali salah: bola melompat sendiri sambil menghitung.
        ctx.say('Lihat ya, bola melompat sendiri.');
        await ctx.wait(1300);
        for (let k = 1; k <= b; k++) {
          await sg.hop(a + k - 1, a + k, 460);
          hitung.textContent = String(k);
          ctx.say(kata(k));
          await ctx.wait(420);
        }
        selesaiBenar();
        await ctx.correct(null, { say: false, min: 400 });
        await ctx.sayWait(ucapan() + '!');
        done();
        return;
      }
      kunciUI(false);
    });
    let done;
    await new Promise((res) => { done = res; });
  }

  // ---------- SD ----------
  function buatSoalSD(tipe) {
    for (let g = 0; g < 100; g++) {
      if (tipe === 'tambah') {
        const a = rand(2, 12), b = rand(2, 9);
        if (a + b <= 20) return { tipe, a, b, ans: a + b };
      } else if (tipe === 'kurang') {
        const a = rand(9, 20), b = rand(2, 9);
        if (a - b >= 1) return { tipe, a, b, ans: a - b };
      } else {
        const x = rand(2, 4), y = rand(3, 5);
        if (x * y <= 20) return { tipe, x, y, ans: x * y };
      }
    }
    return tipe === 'kali' ? { tipe, x: 3, y: 4, ans: 12 } : { tipe, a: 7, b: 5, ans: tipe === 'tambah' ? 12 : 2 };
  }

  async function soalSD(ctx, q) {
    const mulai = q.tipe === 'kali' ? 0 : q.a;
    let teks, ucapAwal, ucapHasil, bagian;
    const hasil = angka('?', 'lj-q');
    if (q.tipe === 'tambah') {
      teks = q.a + ' + ' + q.b + ' = ?';
      ucapAwal = 'Bola di angka ' + kata(q.a) + '. Loncat maju ' + kata(q.b) + '. Mendarat di angka berapa?';
      ucapHasil = kata(q.a) + ' tambah ' + kata(q.b) + ' sama dengan ' + kata(q.ans);
      bagian = [angka(q.a), op('+'), angka(q.b), op('='), hasil];
    } else if (q.tipe === 'kurang') {
      teks = q.a + ' - ' + q.b + ' = ?';
      ucapAwal = 'Bola di angka ' + kata(q.a) + '. Loncat mundur ' + kata(q.b) + '. Mendarat di angka berapa?';
      ucapHasil = kata(q.a) + ' dikurangi ' + kata(q.b) + ' sama dengan ' + kata(q.ans);
      bagian = [angka(q.a), op('-'), angka(q.b), op('='), hasil];
    } else {
      teks = q.x + ' × ' + q.y + ' = ?';
      ucapAwal = 'Bola mulai dari nol. Loncat ' + kata(q.x) + ' kali, tiap loncatan ' + kata(q.y) + ' angka. Mendarat di angka berapa?';
      ucapHasil = kata(q.x) + ' kali ' + kata(q.y) + ' sama dengan ' + kata(q.ans);
      bagian = [angka(q.x), op('×'), angka(q.y), op('='), hasil];
    }
    const petunjuk = q.tipe === 'tambah' ? 'Mulai dari ' + kata(q.a) + ', lalu maju ' + kata(q.b) + ' langkah.'
      : q.tipe === 'kurang' ? 'Mulai dari ' + kata(q.a) + ', lalu mundur ' + kata(q.b) + ' langkah.'
        : kata(q.x) + ' lompatan, tiap lompatan ' + kata(q.y) + ' angka.';
    ctx.ask(teks, { say: ucapAwal });
    const sg = sungai(ctx, { n: 21, tappable: true });
    const tip = h('p', { class: 'lj-hint' }, q.tipe === 'kali' ? q.x + ' lompatan, tiap lompatan ' + q.y + ' angka. Ketuk batu tempat bola mendarat.' : 'Ketuk batu tempat bola mendarat.');
    ctx.el.append(h('div', { class: 'lj-wrap' }, persamaan(bagian), sg.scene, tip));
    sg.layout();
    sg.place(mulai);
    sg.stones[mulai].classList.add('is-start');
    ctx.on(window, 'resize', sg.layout);

    let salah = 0, sibuk = false;
    const kunciUI = (ya) => { sibuk = ya; sg.stones.forEach((st) => { if (ya) st.setAttribute('aria-disabled', 'true'); else st.removeAttribute('aria-disabled'); }); };
    // Bola menunjukkan caranya.
    async function tunjukkan() {
      if (q.tipe === 'kali') {
        for (let k = 1; k <= q.x; k++) {
          await sg.hop((k - 1) * q.y, k * q.y, 560 + q.y * 30, 40 + q.y * 5);
          sg.tag(k * q.y, String(k * q.y));
          ctx.say(kata(k * q.y));
          await ctx.wait(420);
        }
      } else {
        const arah = q.tipe === 'tambah' ? 1 : -1;
        for (let k = 0; k < q.b; k++) await sg.hop(q.a + arah * k, q.a + arah * (k + 1), 300);
      }
    }
    await new Promise((resolve) => {
      sg.stones.forEach((st, v) => {
        st.addEventListener('click', async () => {
          if (sibuk) return;
          kunciUI(true);
          if (v === q.ans) {
            st.classList.add('is-correct');
            hasil.textContent = String(q.ans); hasil.classList.add('is-done');
            await ctx.correct(null, { say: false, min: 350 });
            await tunjukkan();
            await ctx.sayWait(ucapHasil + '!');
            resolve();
            return;
          }
          salah++;
          if (salah >= 3) {
            await ctx.wrong(st, { say: 'Lihat ya, bola menunjukkan caranya.', min: 800 });
            sg.stones[q.ans].classList.add('is-correct');
            hasil.textContent = String(q.ans); hasil.classList.add('is-done');
            await tunjukkan();
            await ctx.sayWait(ucapHasil + '.');
            resolve();
            return;
          }
          await ctx.wrong(st, { say: salah >= 2 ? petunjuk : 'Belum tepat. Coba lagi ya.' });
          kunciUI(false);
        });
      });
    });
  }

  TI.register({
    id: 'loncat',
    title: 'Loncat Angka',
    cat: 'mat',
    icon: '🎾',
    desc: 'Bantu bola melompat di batu bernomor untuk menambah, mengurangi, dan mengali.',
    start(ctx) {
      TI.style('loncat', CSS);
      let soal;
      if (ctx.isTK) {
        // 8 soal: loncatan makin banyak. Bola mulai di angka a, loncat b kali, a + b <= 10.
        const bs = [1, 2, 2, 3, 3, 4, 4, 5];
        soal = bs.map((b) => ({ a: rand(0, Math.min(5, 10 - b)), b })).map((s) => () => soalTK(ctx, s));
      } else {
        const urut = ['tambah', 'tambah', 'kurang', 'tambah', 'kurang', 'kali', 'kali', 'kali'];
        soal = urut.map((t) => buatSoalSD(t)).map((q) => () => soalSD(ctx, q));
      }
      return ctx.series(soal, (jalankan) => jalankan(), {
        lesson: 'Menambah artinya maju di garis bilangan, mengurangi artinya mundur.',
      });
    },
  });
})();
