/* 48 Susun Bentuk (logika, ada tombol Bantu). Memakai ctx.place: ketuk kepingan lalu ketuk tempatnya, atau seret.
   Papan = gambar siluet yang terbagi jadi slot bentuk geometri. Slot adalah elemen HTML (div) di atas latar SVG,
   supaya bisa difokus dan diketuk alat uji; isinya SVG bentuk. Kepingan dengan bentuk dan ukuran sama boleh saling tukar.
   TK: pohon, rumah, perahu. SD: roket, kereta, masjid. Saat gambar lengkap, gambar "hidup". */
(function () {
  const { h, svg } = TI;

  const W = 200, H = 160; // satuan papan
  const T = 0.7;          // skala kepingan di nampan terhadap papan

  // ---------- bentuk ----------
  // Semua bentuk digambar di kotak 0..w x 0..h.
  function bentuk(kind, w, hh, a) {
    switch (kind) {
      case 'segitiga': return svg('polygon', { points: `${w / 2},0 ${w},${hh} 0,${hh}`, ...a });
      case 'sikuKiri': return svg('polygon', { points: `${w},0 ${w},${hh} 0,${hh}`, ...a }); // sisi tegak di kanan
      case 'sikuKanan': return svg('polygon', { points: `0,0 0,${hh} ${w},${hh}`, ...a }); // sisi tegak di kiri
      case 'trapesium': return svg('polygon', { points: `0,0 ${w},0 ${w * 0.82},${hh} ${w * 0.18},${hh}`, ...a });
      case 'lingkaran': return svg('ellipse', { cx: w / 2, cy: hh / 2, rx: w / 2, ry: hh / 2, ...a });
      case 'setengah': return svg('path', { d: `M0 ${hh} A${w / 2} ${hh} 0 0 1 ${w} ${hh} Z`, ...a });
      default: return svg('rect', { x: 0, y: 0, width: w, height: hh, rx: 2, ...a }); // persegi, persegi panjang
    }
  }
  const NAMA = { persegi: 'Persegi', pp: 'Persegi panjang', segitiga: 'Segitiga', sikuKiri: 'Segitiga', sikuKanan: 'Segitiga', trapesium: 'Trapesium', lingkaran: 'Lingkaran', setengah: 'Setengah lingkaran' };
  const rk = (x, y, w, hh, fill, extra) => svg('rect', { x, y, width: w, height: hh, fill, ...extra });
  const ck = (cx, cy, r, fill, extra) => svg('circle', { cx, cy, r, fill, ...extra });

  // ---------- gambar ----------
  // warna: [isi, garis]
  const GAMBAR = {
    pohon: {
      nama: 'Pohon', hidup: 'sway',
      cerita: 'Jadi pohon! Daunnya lingkaran, batangnya persegi panjang.',
      latar: () => [rk(0, 0, W, H, '#d9f1ff'), ck(34, 30, 14, '#ffd23f'), ck(150, 28, 11, '#fff'), ck(164, 32, 13, '#fff'), ck(138, 34, 9, '#fff'), rk(0, 142, W, 18, '#9be07a')],
      bagian: [
        { id: 'batang', kind: 'pp', x: 88, y: 104, w: 24, h: 38, c: ['#a9743a', '#6e4721'] },
        { id: 'daun', kind: 'lingkaran', x: 54, y: 16, w: 92, h: 92, c: ['#4cc16a', '#2b8a3e'] },
      ],
      tambahan: [],
    },
    rumah: {
      nama: 'Rumah', hidup: 'hop',
      cerita: 'Jadi rumah! Badannya persegi, atapnya segitiga, pintunya persegi panjang.',
      latar: () => [rk(0, 0, W, H, '#d9f1ff'), ck(160, 30, 14, '#ffd23f'), ck(40, 34, 10, '#fff'), ck(54, 38, 12, '#fff'), ck(28, 40, 8, '#fff'), rk(0, 142, W, 18, '#9be07a')],
      bagian: [
        { id: 'badan', kind: 'persegi', x: 60, y: 72, w: 80, h: 70, c: ['#ffd88a', '#c99a3e'] },
        { id: 'atap', kind: 'segitiga', x: 48, y: 30, w: 104, h: 42, c: ['#ef6b6b', '#b83232'] },
        { id: 'pintu', kind: 'pp', x: 88, y: 102, w: 24, h: 40, c: ['#8a5a2b', '#5e3b17'] },
      ],
      tambahan: [
        { x: 68, y: 86, w: 16, h: 16, isi: () => rk(0, 0, 16, 16, '#fff3a0', { rx: 2, stroke: '#e0a100', 'stroke-width': 2 }) },
        { x: 116, y: 86, w: 16, h: 16, isi: () => rk(0, 0, 16, 16, '#fff3a0', { rx: 2, stroke: '#e0a100', 'stroke-width': 2 }) },
      ],
    },
    perahu: {
      nama: 'Perahu', hidup: 'rock',
      cerita: 'Jadi perahu! Badannya trapesium, layarnya segitiga, tiangnya persegi panjang.',
      latar: () => [rk(0, 0, W, H, '#d9f1ff'), ck(158, 30, 14, '#ffd23f'), rk(0, 112, W, 48, '#4dabf7'),
        svg('path', { d: 'M0 124 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0', fill: 'none', stroke: '#a5d8ff', 'stroke-width': 3 }),
        svg('path', { d: 'M0 146 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0', fill: 'none', stroke: '#74c0fc', 'stroke-width': 3 })],
      bagian: [
        { id: 'badan', kind: 'trapesium', x: 40, y: 98, w: 120, h: 34, c: ['#c7803d', '#8a5a2b'] },
        { id: 'tiang', kind: 'pp', x: 92, y: 36, w: 12, h: 62, c: ['#8a5a2b', '#5e3b17'] },
        { id: 'layar', kind: 'sikuKanan', x: 104, y: 38, w: 48, h: 60, c: ['#fff1b8', '#d9a400'], nama: 'Segitiga' },
      ],
      tambahan: [],
    },
    roket: {
      nama: 'Roket', hidup: 'fly',
      cerita: 'Jadi roket! Badannya persegi panjang, ujungnya segitiga, sayapnya segitiga siku-siku, jendelanya lingkaran.',
      latar: () => [rk(0, 0, W, H, '#1b2a5a'), ck(24, 24, 2, '#fff'), ck(60, 14, 1.6, '#fff'), ck(150, 20, 2, '#fff'), ck(176, 52, 1.8, '#fff'), ck(30, 80, 1.6, '#fff'), ck(170, 100, 2, '#fff'), ck(18, 120, 1.6, '#fff'), ck(130, 8, 1.6, '#fff'), rk(0, 142, W, 18, '#b8bfd8')],
      bagian: [
        { id: 'badan', kind: 'pp', x: 78, y: 56, w: 44, h: 72, c: ['#eef2f7', '#9aa3b5'] },
        { id: 'ujung', kind: 'segitiga', x: 78, y: 20, w: 44, h: 36, c: ['#ef6b6b', '#b83232'] },
        { id: 'sirapKiri', kind: 'sikuKiri', x: 50, y: 96, w: 28, h: 34, c: ['#ffb703', '#c77d00'], nama: 'Segitiga siku-siku' },
        { id: 'sirapKanan', kind: 'sikuKanan', x: 122, y: 96, w: 28, h: 34, c: ['#ffb703', '#c77d00'], nama: 'Segitiga siku-siku' },
        { id: 'jendela', kind: 'lingkaran', x: 88, y: 70, w: 24, h: 24, c: ['#74c0fc', '#1c6fb8'] },
      ],
      tambahan: [
        { x: 86, y: 130, w: 28, h: 30, kelas: 'sb-flame', isi: () => svg('g', null, svg('path', { d: 'M0 0 H28 L14 30 Z', fill: '#ff922b' }), svg('path', { d: 'M7 0 H21 L14 18 Z', fill: '#ffe066' })) },
      ],
    },
    kereta: {
      nama: 'Kereta', hidup: 'rumble',
      cerita: 'Jadi kereta! Gerbongnya persegi panjang, kabinnya persegi, rodanya lingkaran.',
      latar: () => [rk(0, 0, W, H, '#d9f1ff'), ck(30, 28, 13, '#ffd23f'), ck(130, 26, 10, '#fff'), ck(144, 30, 12, '#fff'), rk(0, 132, W, 28, '#9be07a'),
        rk(0, 140, W, 4, '#868e96'), ...[10, 38, 66, 94, 122, 150, 178].map((x) => rk(x, 144, 14, 5, '#a9743a'))],
      bagian: [
        { id: 'gerbong', kind: 'pp', x: 84, y: 74, w: 96, h: 46, c: ['#4dabf7', '#1c6fb8'] },
        { id: 'kabin', kind: 'persegi', x: 34, y: 66, w: 50, h: 54, c: ['#ef6b6b', '#b83232'], nama: 'Persegi' },
        { id: 'roda1', kind: 'lingkaran', x: 46, y: 112, w: 26, h: 26, c: ['#495057', '#212529'] },
        { id: 'roda2', kind: 'lingkaran', x: 98, y: 112, w: 26, h: 26, c: ['#495057', '#212529'] },
        { id: 'roda3', kind: 'lingkaran', x: 146, y: 112, w: 26, h: 26, c: ['#495057', '#212529'] },
      ],
      tambahan: [
        { x: 152, y: 56, w: 16, h: 18, isi: () => rk(0, 0, 16, 18, '#495057', { rx: 2 }) },
        { x: 150, y: 40, w: 20, h: 20, kelas: 'sb-puff', isi: () => ck(10, 10, 9, '#fff', { opacity: 0.95 }) },
        { x: 150, y: 40, w: 20, h: 20, kelas: 'sb-puff is-b', isi: () => ck(10, 10, 9, '#fff', { opacity: 0.95 }) },
      ],
    },
    masjid: {
      nama: 'Masjid', hidup: 'glow',
      cerita: 'Jadi masjid! Kubahnya setengah lingkaran, bangunannya persegi, menaranya persegi panjang dan segitiga.',
      latar: () => [rk(0, 0, W, H, '#ffe3b8'), ck(166, 26, 12, '#fff3d0'), ck(30, 30, 9, '#fff'), ck(44, 34, 11, '#fff'), rk(0, 142, W, 18, '#b7e08a')],
      bagian: [
        { id: 'badan', kind: 'persegi', x: 68, y: 78, w: 64, h: 64, c: ['#fff0c9', '#c9a85e'], nama: 'Persegi' },
        { id: 'kubah', kind: 'setengah', x: 68, y: 46, w: 64, h: 32, c: ['#2fbf8a', '#16805a'] },
        { id: 'menaraKiri', kind: 'pp', x: 36, y: 64, w: 18, h: 78, c: ['#fff0c9', '#c9a85e'] },
        { id: 'puncakKiri', kind: 'segitiga', x: 32, y: 38, w: 26, h: 26, c: ['#2fbf8a', '#16805a'] },
        { id: 'menaraKanan', kind: 'pp', x: 146, y: 64, w: 18, h: 78, c: ['#fff0c9', '#c9a85e'] },
        { id: 'puncakKanan', kind: 'segitiga', x: 142, y: 38, w: 26, h: 26, c: ['#2fbf8a', '#16805a'] },
      ],
      tambahan: [
        { x: 82, y: 94, w: 12, h: 22, isi: () => svg('path', { d: 'M0 22 V8 A6 6 0 0 1 12 8 V22 Z', fill: '#ffe066', stroke: '#e0a100', 'stroke-width': 1.5 }) },
        { x: 106, y: 94, w: 12, h: 22, isi: () => svg('path', { d: 'M0 22 V8 A6 6 0 0 1 12 8 V22 Z', fill: '#ffe066', stroke: '#e0a100', 'stroke-width': 1.5 }) },
        { x: 38, y: 74, w: 14, h: 14, kelas: 'sb-lamp', isi: () => ck(7, 7, 6, '#ffe066') },
        { x: 148, y: 74, w: 14, h: 14, kelas: 'sb-lamp', isi: () => ck(7, 7, 6, '#ffe066') },
        { x: 94, y: 28, w: 12, h: 18, isi: () => svg('path', { d: 'M6 0 L8 6 L12 6 L9 10 L10 16 L6 12 L2 16 L3 10 L0 6 L4 6 Z', fill: '#ffd23f' }) },
      ],
    },
  };
  const TK_GAMBAR = ['pohon', 'rumah', 'perahu'];
  const SD_GAMBAR = ['roket', 'kereta', 'masjid'];

  const pct = (v, total) => (v / total * 100).toFixed(3) + '%';

  // Area ketuk mengikuti bentuk (bukan kotak pembatas), supaya slot yang tumpang tindih tetap enak diketuk.
  // Sedikit lebih besar dari bentuk (3px) agar mudah kena.
  function klip(kind) {
    const m = '3px';
    const poly = (pts) => 'polygon(' + pts.join(',') + ')';
    switch (kind) {
      case 'segitiga': return poly(['50% -' + m, 'calc(100% + 4px) calc(100% + ' + m + ')', '-4px calc(100% + ' + m + ')']);
      case 'sikuKiri': return poly(['calc(100% + ' + m + ') -' + m, 'calc(100% + ' + m + ') calc(100% + ' + m + ')', '-4px calc(100% + ' + m + ')']);
      case 'sikuKanan': return poly(['-' + m + ' -' + m, '-' + m + ' calc(100% + ' + m + ')', 'calc(100% + 4px) calc(100% + ' + m + ')']);
      case 'trapesium': return poly(['-' + m + ' -' + m, 'calc(100% + ' + m + ') -' + m, 'calc(82% + ' + m + ') calc(100% + ' + m + ')', 'calc(18% - ' + m + ') calc(100% + ' + m + ')']);
      case 'lingkaran': case 'setengah': {
        const pts = [];
        const dari = kind === 'setengah' ? 180 : 0, sampai = kind === 'setengah' ? 360 : 360;
        for (let a = dari; a < sampai; a += 15) {
          const r = a * Math.PI / 180;
          const x = 50 + 52 * Math.cos(r);
          const y = kind === 'setengah' ? 100 + 104 * Math.sin(r) : 50 + 52 * Math.sin(r);
          pts.push(x.toFixed(1) + '% ' + y.toFixed(1) + '%');
        }
        if (kind === 'setengah') { pts.push('102% 103%', '-2% 103%'); }
        return poly(pts);
      }
      default: return '';
    }
  }

  const CSS = `
    & .sb-wrap { --bw: min(420px, calc(100vw - 28px)); display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
    & .sb-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    & .sb-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
    & .sb-board { position: relative; width: var(--bw); aspect-ratio: ${W} / ${H}; border-radius: 22px; overflow: hidden; box-shadow: 0 5px 0 var(--shadow); border: 4px solid #fff; box-sizing: content-box; }
    & .sb-bg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    & .sb-art { position: absolute; inset: 0; transform-origin: 50% 90%; }
    & .sb-slot { position: absolute; display: block; cursor: pointer; border-radius: 4px; }
    & .sb-slot svg.sb-svg { display: block; width: 100%; height: 100%; overflow: visible; }
    & .sb-shape { fill: rgba(255, 255, 255, 0.5); stroke: #5c6078; stroke-width: 2.5px; stroke-dasharray: 6 5; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
    & .sb-slot.is-filled .sb-shape { fill: var(--pc); stroke: var(--pl); stroke-dasharray: none; stroke-width: 2px; }
    & .sb-slot.is-filled svg.sb-svg { animation: ti-pop var(--dur-ui) var(--ease-out); }
    & .sb-slot.is-filled { cursor: default; }
    & .sb-slot.is-wrong { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .sb-slot.is-hint .sb-shape { stroke: #f59f00; stroke-width: 4px; }
    & .sb-slot.is-hint { animation: ti-hint 700ms var(--ease-in-out) 2; } /* motion-ok: petunjuk berkedip lembut, jarang muncul */
    & .sb-extra { position: absolute; pointer-events: none; opacity: 0; transition: opacity 300ms var(--ease-out); }
    & .sb-extra svg { display: block; width: 100%; height: 100%; overflow: visible; }
    & .sb-art.is-alive .sb-extra { opacity: 1; }
    & .sb-flame { transform-origin: 50% 0; }
    & .sb-art.is-alive .sb-flame { animation: sb-flicker 240ms var(--ease-in-out) infinite alternate; }
    & .sb-art.is-alive .sb-puff { animation: sb-puff 1100ms var(--ease-out) infinite; }
    & .sb-art.is-alive .sb-puff.is-b { animation-delay: 550ms; }
    & .sb-art.is-alive .sb-lamp { animation: sb-lamp 700ms var(--ease-in-out) infinite alternate; }
    & .sb-art[data-hidup="fly"].is-alive { animation: sb-fly 900ms var(--ease-in-out) infinite alternate; }
    & .sb-art[data-hidup="rock"].is-alive { animation: sb-rock 1100ms var(--ease-in-out) infinite alternate; }
    & .sb-art[data-hidup="sway"].is-alive { animation: sb-sway 1200ms var(--ease-in-out) infinite alternate; }
    & .sb-art[data-hidup="hop"].is-alive { animation: sb-hop 520ms var(--ease-pop) 3; } /* motion-ok: perayaan gambar selesai */
    & .sb-art[data-hidup="rumble"].is-alive { animation: sb-rumble 260ms var(--ease-in-out) infinite alternate; }
    @keyframes sb-fly { to { transform: translateY(-9%); } }
    @keyframes sb-rock { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
    @keyframes sb-sway { from { transform: rotate(-2.5deg); } to { transform: rotate(2.5deg); } }
    @keyframes sb-hop { 50% { transform: translateY(-6%); } }
    @keyframes sb-rumble { from { transform: translateX(-1%); } to { transform: translateX(1%); } }
    @keyframes sb-flicker { from { transform: scaleY(0.8); } to { transform: scaleY(1.1); } }
    @keyframes sb-puff { from { opacity: 0.9; transform: translateY(0) scale(0.95); } to { opacity: 0; transform: translateY(-34px) scale(1.5); } }
    @keyframes sb-lamp { from { opacity: 0.55; } to { opacity: 1; } }
    & .sb-tray { gap: 8px; min-height: 84px; align-items: center; }
    & .sb-tray .ti-chip { flex-direction: column; gap: 4px; padding: 8px 10px; min-width: 76px; min-height: 76px; }
    & .sb-tray .ti-chip .ti-lbl { font-size: 0.78rem; line-height: 1.1; font-weight: 800; }
    & .sb-tray .ti-chip.is-gone { display: none; }
    & .sb-pc { display: block; flex: none; overflow: visible; }
    @media (min-width: 600px) and (max-height: 840px) {
      & .sb-wrap { --bw: 340px; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .sb-art.is-alive, & .sb-art.is-alive .sb-flame, & .sb-art.is-alive .sb-puff, & .sb-art.is-alive .sb-lamp { animation: none; }
      & .sb-slot.is-filled svg.sb-svg, & .sb-slot.is-wrong, & .sb-slot.is-hint { animation: none; }
      & .sb-art.is-alive .sb-puff { opacity: 0; }
    }
  `.replace(/&/g, '.play[data-game="susun"]');

  function kunciBagian(p) { return p.kind + ':' + p.w + 'x' + p.h; }

  TI.register({
    id: 'susun',
    title: 'Susun Bentuk',
    cat: 'logika',
    icon: '📐',
    desc: 'Pasang bentuk-bentuk ke gambar sampai lengkap.',
    // dipakai alat uji
    _tes: { GAMBAR, TK_GAMBAR, SD_GAMBAR },
    async start(ctx) {
      TI.style('susun', CSS);
      const daftar = ctx.isTK ? TK_GAMBAR : SD_GAMBAR;
      const reduced = TI.reduced();
      let m0 = 0, bantuTotal = 0;

      for (let gi = 0; gi < daftar.length; gi++) {
        if (!ctx.alive) return;
        ctx.progress(gi, daftar.length);
        ctx.clear();
        await susun(GAMBAR[daftar[gi]], gi);
      }
      if (!ctx.alive) return;
      ctx.progress(daftar.length, daftar.length);
      const m = ctx.mistakes;
      ctx.finish({
        stars: m <= 2 ? 3 : m <= 6 ? 2 : 1,
        total: daftar.length,
        lesson: 'Gambar besar tersusun dari bentuk-bentuk sederhana: segitiga, persegi, dan lingkaran.',
      });

      async function susun(g, gi) {
        const bagian = g.bagian.map((p) => ({ ...p, key: kunciBagian(p) }));
        ctx.ask(gi === 0 ? 'Ketuk bentuk, lalu ketuk tempatnya. Boleh juga diseret!' : 'Susun gambar ' + g.nama.toLowerCase() + '!');

        // ----- papan -----
        const latar = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'sb-bg', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' }, g.latar());
        const art = h('div', { class: 'sb-art', 'data-hidup': g.hidup });
        const papan = h('div', { class: 'sb-board' }, latar, art);
        const slotObj = [];
        bagian.forEach((p, i) => {
          const el = h('div', { class: 'sb-slot', style: 'left:' + pct(p.x, W) + ';top:' + pct(p.y, H) + ';width:' + pct(p.w, W) + ';height:' + pct(p.h, H) + ';z-index:' + (i + 1) + ';--pc:' + p.c[0] + ';--pl:' + p.c[1] + (klip(p.kind) ? ';clip-path:' + klip(p.kind) : '') },
          svg('svg', { viewBox: '0 0 ' + p.w + ' ' + p.h, class: 'sb-svg', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
            bentuk(p.kind, p.w, p.h, { class: 'sb-shape' })));
          slotObj.push({ id: p.id, el, label: 'Tempat ' + (p.nama || NAMA[p.kind]).toLowerCase() });
          art.append(el);
        });
        g.tambahan.forEach((t) => {
          art.append(h('div', { class: 'sb-extra ' + (t.kelas || ''), style: 'left:' + pct(t.x, W) + ';top:' + pct(t.y, H) + ';width:' + pct(t.w, W) + ';height:' + pct(t.h, H) + ';z-index:30' },
            svg('svg', { viewBox: '0 0 ' + t.w + ' ' + t.h, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' }, t.isi())));
        });

        // ----- kepingan -----
        const kepingan = bagian.map((p) => ({
          id: p.id,
          label: p.nama || NAMA[p.kind],
          target: bagian.filter((q) => q.key === p.key).map((q) => q.id),
          warna: p.c,
          node: svg('svg', {
            viewBox: '-2 -2 ' + (p.w + 4) + ' ' + (p.h + 4), class: 'sb-pc', 'aria-hidden': 'true', focusable: 'false',
            style: 'width: calc(var(--bw) * ' + ((p.w + 4) / W * T).toFixed(4) + '); height: calc(var(--bw) * ' + ((p.h + 4) / W * T).toFixed(4) + ')',
          }, bentuk(p.kind, p.w, p.h, { fill: p.c[0], stroke: p.c[1], 'stroke-width': 2.5, 'stroke-linejoin': 'round' })),
        }));
        const tray = h('div', { class: 'ti-tray sb-tray' });
        const bantuBtn = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        const info = h('span', { class: 'sb-chip' }, 'Gambar ' + (gi + 1) + ' dari ' + daftar.length);
        const pasangChip = h('span', { class: 'sb-chip' }, '0 dari ' + kepingan.length + ' terpasang');
        ctx.el.append(h('div', { class: 'sb-wrap' }, h('div', { class: 'sb-info' }, info, pasangChip), papan, tray, h('div', { class: 'ti-toolbar' }, bantuBtn)));

        // ----- bantu -----
        let bantu = 0, sibuk = false, selesai = false;
        m0 = ctx.mistakes - bantuTotal;
        const slotDari = (id) => slotObj.find((s) => s.id === id);
        function pasangan() {
          // pasangan (kepingan, slot) berikutnya yang benar: kepingan pertama yang belum terpasang, slot kosong yang cocok
          for (const p of kepingan) {
            if (p.placed || !p.btn) continue;
            const s = p.target.map(slotDari).find((x) => x && !x.full);
            if (s) return { p, s };
          }
          return null;
        }
        async function satuLangkah(sorot) {
          const pr = pasangan();
          if (!pr) return;
          const { p, s } = pr;
          sibuk = true;
          if (sorot) {
            p.btn.classList.add('is-hint'); s.el.classList.add('is-hint');
            await ctx.wait(reduced ? 250 : 650);
            p.btn.classList.remove('is-hint'); s.el.classList.remove('is-hint');
          }
          if (!p.btn.classList.contains('is-selected')) p.btn.click();
          s.el.click();
          await ctx.wait(420);
          sibuk = false;
        }
        bantuBtn.addEventListener('click', async () => {
          if (sibuk || selesai) return;
          bantu++;
          bantuTotal++;
          ctx.mistakes++;
          ctx.sfx('tap');
          if (bantu <= 2) { await satuLangkah(true); return; }
          sibuk = true;
          bantuBtn.disabled = true;
          ctx.say('Aku bantu sampai selesai ya.');
          await ctx.wait(800);
          sibuk = false;
          while (ctx.alive && pasangan()) await satuLangkah(false);
        });
        // 3 kali salah memasang: tunjukkan satu pasangan yang benar
        ctx.every(300, async () => {
          if (sibuk || selesai) return;
          if (ctx.mistakes - bantuTotal - m0 >= 3) {
            m0 = ctx.mistakes - bantuTotal;
            ctx.say('Ini yang pas.');
            await satuLangkah(true);
          }
        });

        await ctx.place({
          pieces: kepingan,
          slots: slotObj,
          tray,
          move: false,
          onPlace(p, s) {
            s.el.classList.add('is-filled');
            const n = kepingan.filter((x) => x.placed).length;
            pasangChip.textContent = n + ' dari ' + kepingan.length + ' terpasang';
          },
        });
        selesai = true;
        if (!ctx.alive) return;
        art.classList.add('is-alive');
        pasangChip.textContent = g.nama + '!';
        ctx.sfx('menang');
        ctx.say(g.cerita);
        // tombol Bantu berubah jadi Lanjut: anak sendiri yang memilih kapan ke gambar berikutnya
        bantuBtn.className = 'ti-btn pop-in';
        bantuBtn.textContent = gi < daftar.length - 1 ? 'Gambar berikutnya ➜' : 'Selesai ➜';
        bantuBtn.disabled = false;
        await new Promise((res) => bantuBtn.addEventListener('click', () => { ctx.sfx('tap'); res(); }, { once: true }));
      }
    },
  });
})();
