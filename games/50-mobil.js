/* 50 Mobil Pintar (logika, pengenalan coding, ada tombol Bantu).
   Anak menyusun program dari kartu perintah, lalu mobil menjalankannya satu per satu.
   TK: peta 4x4, perintah arah mutlak (atas, bawah, kiri, kanan). SD: peta 6x6, perintah relatif (maju, belok kiri, belok kanan).
   Level ditulis tangan di bawah dan diperiksa punya solusi oleh BFS (fungsi yang sama dipakai untuk tombol Bantu). */
(function () {
  const { h, svg } = TI;

  // Legenda peta: . kosong | S awal | G tujuan | t pohon | r batu | c pembatas jalan | * bintang
  const LEVEL_TK = [
    { tujuan: '🏫', nama: 'sekolah', grid: ['....', '....', '....', 'S.G.'] },
    { tujuan: '🕌', nama: 'masjid', grid: ['....', '.G..', 't...', 'S.r.'] },
    { tujuan: '🏫', nama: 'sekolah', grid: ['....', '.Gc.', '..t.', '...S'] },
    { tujuan: '🕌', nama: 'masjid', grid: ['....', '...G', '.tt.', 'S...'] },
  ];
  const LEVEL_SD = [
    { tujuan: '🕌', nama: 'masjid', dir: 0, grid: ['......', '......', '..t...', '.G....', '......', 'S.....'] },
    { tujuan: '🏫', nama: 'sekolah', dir: 0, grid: ['......', '......', '......', '...G..', '.r....', 'S...t.'] },
    { tujuan: '🕌', nama: 'masjid', dir: 0, grid: ['......', '......', '......', '...Gr.', '....t.', '.....S'] },
    { tujuan: '🏫', nama: 'sekolah', dir: 1, grid: ['S..t..', '.r.t..', '.r...G', '.rrrrr', '......', '......'] },
    { tujuan: '🕌', nama: 'masjid', dir: 0, grid: ['......', '..t...', '..*...', '...r.G', '.r....', '..S...'], bintang: true },
  ];

  const DIR = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // utara, timur, selatan, barat
  const ARAH_TK = { U: 0, R: 1, D: 2, L: 3 };
  const PERINTAH_TK = [
    { id: 'U', icon: '⬆️', say: 'Atas' }, { id: 'D', icon: '⬇️', say: 'Bawah' },
    { id: 'L', icon: '⬅️', say: 'Kiri' }, { id: 'R', icon: '➡️', say: 'Kanan' },
  ];
  const PERINTAH_SD = [
    { id: 'F', icon: '⬆️', label: 'Maju', say: 'Maju' },
    { id: 'L', icon: '↩️', label: 'Belok kiri', say: 'Belok kiri' },
    { id: 'R', icon: '↪️', label: 'Belok kanan', say: 'Belok kanan' },
  ];
  const IKON = { U: '⬆️', D: '⬇️', L: '⬅️', R: '➡️', F: '⬆️' };
  const IKON_SD = { F: '⬆️', L: '↩️', R: '↪️' };
  const MAKS = 12;

  // ---------- logika murni (dipakai juga untuk uji) ----------
  function baca(lv) {
    const n = lv.grid.length;
    const o = { n, sel: [], mulai: null, tujuan: null, bintang: null, dir: lv.dir || 0, perlu: !!lv.bintang };
    lv.grid.forEach((baris, r) => {
      o.sel[r] = [];
      [...baris].forEach((ch, c) => {
        o.sel[r][c] = ch;
        if (ch === 'S') o.mulai = { r, c };
        if (ch === 'G') o.tujuan = { r, c };
        if (ch === '*') o.bintang = { r, c };
      });
    });
    return o;
  }
  const halangan = (ch) => ch === 't' || ch === 'r' || ch === 'c';

  // st = { r, c, d, s } ; kembalikan { st, tabrak, ke } ; ke = sel yang dituju (untuk animasi)
  function langkah(o, st, cmd, tk) {
    let d = st.d;
    let maju = false;
    if (tk) { d = ARAH_TK[cmd]; maju = true; }
    else if (cmd === 'F') maju = true;
    else if (cmd === 'L') d = (d + 3) % 4;
    else d = (d + 1) % 4;
    if (!maju) return { st: { r: st.r, c: st.c, d, s: st.s }, tabrak: false };
    const r = st.r + DIR[d][0], c = st.c + DIR[d][1];
    if (r < 0 || c < 0 || r >= o.n || c >= o.n || halangan(o.sel[r][c])) return { st: { r: st.r, c: st.c, d, s: st.s }, tabrak: true, ke: { r, c } };
    const s = st.s || (o.bintang && o.bintang.r === r && o.bintang.c === c);
    return { st: { r, c, d, s: !!s }, tabrak: false };
  }
  const menang = (o, st) => st.r === o.tujuan.r && st.c === o.tujuan.c && (!o.perlu || st.s);

  // Jalankan sebagian program tanpa animasi: { ok, st, menang }
  function simulasi(o, st0, prog, tk) {
    let st = st0;
    for (let i = 0; i < prog.length; i++) {
      const r = langkah(o, st, prog[i], tk);
      if (r.tabrak) return { ok: false, st };
      st = r.st;
      if (menang(o, st)) return { ok: true, st, menang: true, di: i };
    }
    return { ok: true, st, menang: false };
  }

  // Program terpendek dari keadaan st (BFS). [] kalau sudah menang, null kalau mustahil.
  function pecahkan(o, st0, tk) {
    const cmds = tk ? ['U', 'D', 'L', 'R'] : ['F', 'L', 'R'];
    const key = (s) => s.r + ',' + s.c + ',' + (tk ? 0 : s.d) + ',' + (s.s ? 1 : 0);
    if (menang(o, st0)) return [];
    const seen = new Map([[key(st0), null]]);
    const q = [{ st: st0, jalan: [] }];
    for (let i = 0; i < q.length; i++) {
      const { st, jalan } = q[i];
      for (const cmd of cmds) {
        const r = langkah(o, st, cmd, tk);
        if (r.tabrak) continue;
        const k = key(r.st);
        if (seen.has(k)) continue;
        seen.set(k, 1);
        const j2 = jalan.concat(cmd);
        if (menang(o, r.st)) return j2;
        q.push({ st: r.st, jalan: j2 });
      }
    }
    return null;
  }
  const awal = (o) => ({ r: o.mulai.r, c: o.mulai.c, d: o.dir, s: false });

  // ---------- gaya ----------
  const CSS = `
    & .mb-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
    & .mb-main { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
    & .mb-side { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 420px; }
    & .mb-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    & .mb-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
    & .mb-status { margin: 0; min-height: 1.4em; font-weight: 800; font-size: 1.08rem; text-align: center; color: var(--c); }
    & .mb-board {
      --bw: min(var(--mbmax, 300px), calc(100vw - 40px)); --cell: calc(var(--bw) / var(--n));
      box-sizing: content-box; position: relative; display: grid; grid-template-columns: repeat(var(--n), 1fr);
      width: var(--bw); height: var(--bw); border: 4px solid #fff; border-radius: 22px; overflow: hidden;
      background: #e6ebf2; box-shadow: 0 5px 0 var(--shadow); flex: none;
    }
    & .mb-cell { position: relative; display: grid; place-items: center; background: #e8edf4; font-size: calc(var(--cell) * 0.58); line-height: 1; }
    & .mb-cell.is-alt { background: #dde4ee; }
    & .mb-cell.is-grass { background: #d3eec4; }
    & .mb-cell.is-start::after { content: ""; position: absolute; inset: 14%; border-radius: 50%; border: 3px dashed rgba(47, 111, 237, 0.45); }
    & .mb-cell.is-goal { background: #fff0b3; box-shadow: inset 0 0 0 3px #f5b301; }
    & .mb-cell.is-win .mb-ic { animation: mb-hop 420ms var(--ease-pop) 2; } /* motion-ok: perayaan sampai tujuan */
    & .mb-cell.is-hit .mb-ic { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .mb-ic { display: block; line-height: 1; }
    & .mb-star { position: absolute; display: block; z-index: 2; font-size: calc(var(--cell) * 0.5); transition: transform var(--dur-ui) var(--ease-out), opacity var(--dur-ui) var(--ease-out); }
    & .mb-star.is-taken { opacity: 0; transform: translateY(-40%) scale(0.8); }
    & .mb-car {
      position: absolute; left: 0; top: 0; z-index: 4; width: var(--cell); height: var(--cell); pointer-events: none;
      transform: translate(calc(var(--cell) * var(--x)), calc(var(--cell) * var(--y))) rotate(var(--r));
      transition: transform 250ms var(--ease-in-out), opacity 150ms var(--ease-out);
    }
    & .mb-car.is-hide { opacity: 0; }
    & .mb-car-body { display: block; width: 100%; height: 100%; padding: 7%; }
    & .mb-car.is-bump .mb-car-body { animation: mb-bump 360ms var(--ease-in-out); } /* motion-ok: mobil menabrak, kejadian jarang */
    @keyframes mb-bump { 25% { transform: translateY(-20%); } 50% { transform: translateY(2%) rotate(-5deg); } 75% { transform: translateY(-4%) rotate(4deg); } }
    @keyframes mb-hop { 50% { transform: translateY(-22%) scale(1.12); } }
    & .mb-progwrap { display: flex; flex-direction: column; gap: 4px; width: 100%; }
    & .mb-proglabel { display: flex; justify-content: space-between; margin: 0; font-weight: 800; font-size: 0.95rem; color: var(--muted); padding: 0 4px; }
    & .mb-prog {
      display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; width: 100%; padding: 8px;
      border-radius: 18px; background: rgba(255, 255, 255, 0.75); border: 3px dashed var(--line);
    }
    & .mb-slot { position: relative; aspect-ratio: 1; min-height: 44px; border-radius: 12px; background: rgba(43, 45, 66, 0.06); }
    & .mb-card {
      position: absolute; inset: 0; display: grid; place-items: center; border-radius: 12px; background: #fff; border: 3px solid var(--c);
      box-shadow: 0 3px 0 var(--shadow); font-size: 1.55rem; line-height: 1;
      transition: transform var(--dur-ui) var(--ease-out), background-color var(--dur-ui) ease, border-color var(--dur-ui) ease;
    }
    & .mb-card small { position: absolute; left: 4px; top: 1px; font-size: 0.62rem; font-weight: 800; color: var(--muted); }
    & .mb-card.is-run { background: #fff3b0; border-color: #f59f00; transform: scale(1.1); z-index: 2; }
    & .mb-card.is-hint { border-color: #f59f00; background: #fff8dc; }
    & .mb-pal { display: flex; justify-content: center; gap: 8px; width: 100%; }
    & .mb-cmd { flex: 1 1 0; min-width: 0; min-height: 72px; padding: 6px 4px; flex-direction: column; gap: 2px; font-size: 0.95rem; }
    & .mb-cmd .mb-cmd-ic { font-size: 1.9rem; line-height: 1; }
    & .mb-tools { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: 100%; }
    & .mb-tools .ti-btn { min-height: 52px; padding: 6px 16px; font-size: 1.05rem; }
    & .mb-run { width: 100%; max-width: 420px; min-height: 64px; font-size: 1.5rem; }
    @media (max-width: 560px) {
      & .mb-board { --mbmax: 280px; }
      & .mb-cmd { min-height: 64px; }
      & .mb-run { min-height: 60px; }
    }
    @media (min-width: 820px) {
      & .mb-board { --mbmax: 400px; }
      & .mb-main { flex-direction: row; align-items: flex-start; justify-content: center; gap: 26px; }
      & .mb-side { max-width: 400px; padding-top: 4px; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .mb-car { transition: opacity 150ms var(--ease-out); }
      & .mb-car.is-bump .mb-car-body, & .mb-cell.is-win .mb-ic, & .mb-cell.is-hit .mb-ic { animation: none; }
      & .mb-card.is-run { transform: none; }
    }
  `.replace(/&/g, '.play[data-game="mobil"]');

  // Mobil tampak atas, menghadap ke atas, tanpa wajah: kaca depan + lampu depan jelas menunjukkan arah depan.
  function gambarMobil() {
    return svg('svg', { viewBox: '0 0 40 40', class: 'mb-car-body', 'aria-hidden': 'true', focusable: 'false' },
      svg('rect', { x: 5, y: 8, width: 4, height: 8, rx: 1.5, fill: '#2b2d42' }),
      svg('rect', { x: 31, y: 8, width: 4, height: 8, rx: 1.5, fill: '#2b2d42' }),
      svg('rect', { x: 5, y: 24, width: 4, height: 8, rx: 1.5, fill: '#2b2d42' }),
      svg('rect', { x: 31, y: 24, width: 4, height: 8, rx: 1.5, fill: '#2b2d42' }),
      svg('rect', { x: 8, y: 3, width: 24, height: 35, rx: 8, fill: '#e5484d', stroke: '#a61e22', 'stroke-width': 1.5 }),
      svg('path', { d: 'M12 13 L28 13 L26.5 20 L13.5 20 Z', fill: '#cdeeff', stroke: '#5b7fa5', 'stroke-width': 1 }),
      svg('rect', { x: 13, y: 21.5, width: 14, height: 7, rx: 2, fill: '#f08a8d' }),
      svg('path', { d: 'M13.5 30 L26.5 30 L28 34 L12 34 Z', fill: '#cdeeff', stroke: '#5b7fa5', 'stroke-width': 1 }),
      svg('rect', { x: 10.5, y: 3.2, width: 5, height: 2.6, rx: 1, fill: '#ffe066' }),
      svg('rect', { x: 24.5, y: 3.2, width: 5, height: 2.6, rx: 1, fill: '#ffe066' }));
  }

  TI.register({
    id: 'mobil',
    title: 'Mobil Pintar',
    cat: 'logika',
    icon: '🚗',
    desc: 'Susun perintah supaya mobil sampai ke tujuan.',
    // dipakai alat uji (cek semua level punya solusi); tidak dipakai game
    _tes: { LEVEL_TK, LEVEL_SD, baca, pecahkan, awal, simulasi, langkah },
    async start(ctx) {
      TI.style('mobil', CSS);
      const tk = ctx.isTK;
      const levels = tk ? LEVEL_TK : LEVEL_SD;
      const perintah = tk ? PERINTAH_TK : PERINTAH_SD;
      const ikon = (id) => (tk ? IKON[id] : IKON_SD[id]);
      const reduced = TI.reduced();

      for (let li = 0; li < levels.length; li++) {
        if (!ctx.alive) return;
        ctx.progress(li, levels.length);
        ctx.clear();
        await mainkan(li);
      }
      if (!ctx.alive) return;
      ctx.progress(levels.length, levels.length);
      const m = ctx.mistakes;
      ctx.finish({
        stars: m <= 1 ? 3 : m <= levels.length ? 2 : 1,
        total: levels.length,
        lesson: 'Komputer mengikuti perintah satu per satu. Program yang urut dan teliti membuat mobil sampai tujuan.',
      });

      function mainkan(li) {
        return new Promise((resolve) => {
          const lv = levels[li];
          const o = baca(lv);
          const mulai = awal(o);
          let prog = [];
          let jalan = false, selesai = false, gagal = 0, bantu = 0;
          let rot = mulai.d * 90;

          // ----- papan -----
          const papan = h('div', { class: 'mb-board', style: '--n:' + o.n });
          const selEl = [];
          for (let r = 0; r < o.n; r++) for (let c = 0; c < o.n; c++) {
            const ch = o.sel[r][c];
            const cell = h('div', { class: 'mb-cell' + ((r + c) % 2 ? ' is-alt' : '') + (ch === 'G' ? ' is-goal' : '') + (ch === 'S' ? ' is-start' : '') + (ch === 't' ? ' is-grass' : '') });
            const isi = ch === 'G' ? lv.tujuan : ch === 't' ? '🌳' : ch === 'r' ? '🪨' : ch === 'c' ? '🚧' : null;
            if (isi) cell.append(h('span', { class: 'mb-ic', 'aria-hidden': 'true' }, isi));
            selEl[r * o.n + c] = cell;
            papan.append(cell);
          }
          let bintangEl = null;
          if (o.bintang) {
            bintangEl = h('span', { class: 'mb-star', 'aria-hidden': 'true' }, '⭐');
            selEl[o.bintang.r * o.n + o.bintang.c].append(bintangEl);
          }
          const mobil = h('div', { class: 'mb-car', 'aria-hidden': 'true' }, gambarMobil());
          const taruhMobil = (st) => {
            mobil.style.setProperty('--x', st.c);
            mobil.style.setProperty('--y', st.r);
            mobil.style.setProperty('--r', rot + 'deg');
          };
          taruhMobil(mulai);
          papan.append(mobil);

          // ----- papan program -----
          const slot = Array.from({ length: MAKS }, () => h('div', { class: 'mb-slot' }));
          const kartu = [];
          const progEl = h('div', { class: 'mb-prog', role: 'list', 'aria-label': 'Papan program' }, slot);
          const hitung = h('span', null);
          const label = h('p', { class: 'mb-proglabel' }, h('span', null, 'Program kamu'), hitung);
          const status = h('p', { class: 'mb-status', 'aria-live': 'polite' });

          // ----- tombol -----
          const tombolPerintah = perintah.map((p) => {
            const b = h('button', { type: 'button', class: 'choice mb-cmd', 'aria-label': p.say },
              h('span', { class: 'mb-cmd-ic', 'aria-hidden': 'true' }, p.icon), p.label ? h('span', null, p.label) : null);
            b.addEventListener('click', () => tambah(p));
            return b;
          });
          const bHapus = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '⌫ Hapus');
          const bUlang = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '🗑️ Ulang');
          const bBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          const bJalan = h('button', { type: 'button', class: 'ti-btn mb-run' }, '▶ Jalankan');
          bHapus.addEventListener('click', () => { if (!jalan && prog.length) { hapusTerakhir(); ctx.sfx('tap'); } });
          bUlang.addEventListener('click', () => { if (!jalan && prog.length) { while (prog.length) hapusTerakhir(); ctx.sfx('tap'); } });
          bJalan.addEventListener('click', () => { if (!jalan && prog.length) jalankan(); });
          bBantu.addEventListener('click', () => { if (!jalan && !selesai) bantuan(); });

          ctx.el.append(h('div', { class: 'mb-wrap' },
            h('div', { class: 'mb-info' }, h('span', { class: 'mb-chip' }, 'Level ' + (li + 1) + ' dari ' + levels.length), h('span', { class: 'mb-chip' }, 'Tujuan: ' + lv.tujuan + ' ' + lv.nama)),
            h('div', { class: 'mb-main' },
              papan,
              h('div', { class: 'mb-side' },
                status,
                h('div', { class: 'mb-progwrap' }, label, progEl),
                h('div', { class: 'mb-pal' }, tombolPerintah),
                h('div', { class: 'mb-tools' }, bHapus, bUlang, bBantu),
                bJalan))));

          function sinkron() {
            const penuh = prog.length >= MAKS;
            tombolPerintah.forEach((b) => { b.disabled = jalan || selesai || penuh; });
            bHapus.disabled = bUlang.disabled = jalan || selesai || !prog.length;
            bJalan.disabled = jalan || selesai || !prog.length;
            bBantu.disabled = jalan || selesai;
            hitung.textContent = prog.length + ' dari ' + MAKS;
          }
          const pesan = (t) => { status.textContent = t; };

          function dorongKartu(cmd, hint) {
            const i = prog.length - 1;
            const k = h('div', { class: 'mb-card pop-in' + (hint ? ' is-hint' : ''), role: 'listitem', 'aria-label': cmd.say || '' }, h('small', { 'aria-hidden': 'true' }, i + 1), ikon(cmd.id || cmd));
            slot[i].append(k);
            kartu[i] = k;
          }
          const infoCmd = (id) => perintah.find((p) => p.id === id);
          function tambah(p, hint) {
            if (jalan || selesai || prog.length >= MAKS) return;
            prog.push(p.id);
            dorongKartu(p, hint);
            ctx.sfx('klik');
            if (tk && !hint) ctx.say(p.say);
            pesan('');
            sinkron();
          }
          function hapusTerakhir() {
            prog.pop();
            const k = kartu.pop();
            if (k) k.remove();
            pesan('');
            sinkron();
          }

          // ----- gerak mobil -----
          function hadap(arah) {
            const target = arah * 90;
            const beda = ((target - rot) % 360 + 540) % 360 - 180;
            rot += beda;
          }
          async function kembali() {
            mobil.classList.add('is-hide');
            await ctx.wait(160);
            mobil.style.transition = 'none';
            rot = mulai.d * 90;
            taruhMobil(mulai);
            void mobil.offsetWidth;
            mobil.style.transition = '';
            mobil.classList.remove('is-hide');
            if (bintangEl) bintangEl.classList.remove('is-taken');
            kartu.forEach((k) => k.classList.remove('is-run'));
            await ctx.wait(120);
          }
          async function tabrak(st, cmd, ke) {
            if (tk) { hadap(ARAH_TK[cmd]); taruhMobil(st); await ctx.wait(reduced ? 60 : 230); }
            ctx.sfx('salah');
            mobil.classList.remove('is-bump'); void mobil.offsetWidth; mobil.classList.add('is-bump');
            if (ke && ke.r >= 0 && ke.c >= 0 && ke.r < o.n && ke.c < o.n) {
              const sel = selEl[ke.r * o.n + ke.c];
              sel.classList.remove('is-hit'); void sel.offsetWidth; sel.classList.add('is-hit');
            }
            await ctx.wait(reduced ? 200 : 380);
            mobil.classList.remove('is-bump');
          }

          async function jalankan() {
            if (jalan || selesai) return;
            jalan = true;
            sinkron();
            pesan('Mobil jalan...');
            let st = { ...mulai };
            for (let i = 0; i < prog.length; i++) {
              if (!ctx.alive) return;
              kartu.forEach((k) => k.classList.remove('is-run'));
              kartu[i].classList.add('is-run');
              const r = langkah(o, st, prog[i], tk);
              if (r.tabrak) {
                await tabrak(r.st, prog[i], r.ke);
                await gagalJalan('Ups! Mobil menabrak. Ubah programnya ya.');
                return;
              }
              st = r.st;
              if (tk) hadap(st.d);
              else if (prog[i] === 'L') rot -= 90;
              else if (prog[i] === 'R') rot += 90;
              taruhMobil(st);
              ctx.sfx(prog[i] === 'F' || tk ? 'whoosh' : 'tap');
              await ctx.wait(reduced ? 120 : 270);
              if (bintangEl && st.s && !bintangEl.classList.contains('is-taken')) {
                bintangEl.classList.add('is-taken');
                ctx.sfx('pop');
              }
              if (menang(o, st)) { await menangJalan(); return; }
            }
            const diTujuan = st.r === o.tujuan.r && st.c === o.tujuan.c;
            await gagalJalan(diTujuan && o.perlu ? 'Ambil bintangnya dulu ya!' : 'Mobil belum sampai. Ubah programnya ya.', diTujuan && o.perlu);
          }

          async function gagalJalan(teks, ringan) {
            gagal++;
            pesan(teks);
            await ctx.wrong(null, { say: teks, min: 900 });
            if (!ctx.alive) return;
            await kembali();
            jalan = false;
            sinkron();
            if (gagal >= 3) {
              gagal = 0;
              pesan('Lihat caranya ya!');
              ctx.say('Ayo lihat caranya.');
              await ctx.wait(800);
              await isiSolusi();
              await jalankan();
            }
          }

          async function menangJalan() {
            selesai = true;
            sinkron();
            kartu.forEach((k) => k.classList.remove('is-run'));
            pesan('Sampai di tujuan!');
            const tujuanEl = selEl[o.tujuan.r * o.n + o.tujuan.c];
            tujuanEl.classList.add('is-win');
            await ctx.correct(null, { say: 'Sampai! Hebat!', min: 1100 });
            resolve();
          }

          // ----- bantuan -----
          async function isiSolusi() {
            const sol = pecahkan(o, mulai, tk);
            while (prog.length) hapusTerakhir();
            for (const id of sol) {
              prog.push(id);
              dorongKartu(infoCmd(id), true);
              ctx.sfx('klik');
              sinkron();
              await ctx.wait(reduced ? 40 : 110);
            }
          }
          async function bantuan() {
            bantu++;
            ctx.mistakes++;
            ctx.sfx('tap');
            if (bantu >= 3) {
              jalan = true;
              sinkron();
              ctx.say('Aku bantu sampai selesai ya.');
              await ctx.wait(800);
              jalan = false;
              await isiSolusi();
              await jalankan();
              return;
            }
            // buang perintah sampai tersisa awalan yang benar (masih di jalur terpendek), lalu tambah satu perintah benar
            const total = pecahkan(o, mulai, tk).length;
            for (let k = prog.length; k >= 0; k--) {
              const sim = simulasi(o, mulai, prog.slice(0, k), tk);
              if (!sim.ok) continue;
              if (sim.menang) { pesan('Programmu sudah benar! Tekan Jalankan.'); ctx.say('Programmu sudah benar. Tekan Jalankan.'); return; }
              const sol = pecahkan(o, sim.st, tk);
              if (!sol || !sol.length || k + sol.length !== total) continue;
              while (prog.length > k) hapusTerakhir();
              tambah(infoCmd(sol[0]), true);
              pesan('Perintah ini bisa dipakai!');
              ctx.say('Coba pakai perintah ini.');
              return;
            }
          }

          // ----- mulai level -----
          sinkron();
          const kataKunci = o.perlu ? ' Ambil bintang dulu, baru ke ' + lv.nama + '!' : '';
          ctx.ask(li === 0
            ? (tk ? 'Antar mobil ke ' + lv.nama + '! Ketuk panah, lalu Jalankan.'
              : 'Susun program agar mobil sampai ke ' + lv.nama + '!')
            : 'Antar mobil ke ' + lv.nama + '!' + kataKunci);
        });
      }
    },
  });
})();
