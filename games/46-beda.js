/* 46 Cari Perbedaan (logika, ada tombol Bantu).
   Dua gambar pemandangan SVG buatan sendiri (tanpa orang dan hewan): halaman rumah, taman masjid, pantai.
   Gambar 2 sama dengan gambar 1 kecuali beberapa perbedaan (warna, hilang, tambahan, ukuran, posisi).
   Tiap perbedaan punya area ketuk transparan (tombol) di KEDUA gambar. TK: 3 perbedaan besar per gambar. SD: 5 perbedaan.
   Bantu: ungkap satu perbedaan; ketukan ke-3 mengungkap semua sisanya. */
(function () {
  const { h, svg } = TI;

  const VW = 320, VH = 200;
  const OL = { stroke: '#51485f', 'stroke-width': 1.4, 'stroke-linejoin': 'round' };
  const R = (x, y, w, hh, fill, o) => svg('rect', { x, y, width: w, height: hh, fill, ...o });
  const C = (cx, cy, r, fill, o) => svg('circle', { cx, cy, r, fill, ...o });
  const E = (cx, cy, rx, ry, fill, o) => svg('ellipse', { cx, cy, rx, ry, fill, ...o });
  const P = (pts, fill, o) => svg('polygon', { points: pts, fill, ...o });
  const D = (d, fill, o) => svg('path', { d, fill, ...o });
  const G = (attrs, ...kids) => svg('g', attrs, ...kids);
  const garis = (d, warna, lebar) => D(d, 'none', { stroke: warna, 'stroke-width': lebar || 2, 'stroke-linecap': 'round' });

  const awan = (x, y) => G(null, C(x, y + 2, 11, '#fff'), C(x + 14, y - 5, 14, '#fff'), C(x + 29, y + 2, 11, '#fff'), R(x, y + 2, 29, 11, '#fff'));
  function wedge(cx, cy, r, a0, a1, fill) {
    const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return D('M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z', fill);
  }
  function bunga(x, y, kelopak, tengah) {
    const k = [0, 72, 144, 216, 288].map((a) => C(x + 5 * Math.cos(a * Math.PI / 180), y + 5 * Math.sin(a * Math.PI / 180), 4, kelopak));
    return G(null, garis('M' + x + ' ' + (y + 3) + ' V' + (y + 16), '#3b9b4f', 2), E(x + 4, y + 11, 4, 2, '#4cc16a', { transform: 'rotate(-30 ' + (x + 4) + ' ' + (y + 11) + ')' }), ...k, C(x, y, 3.4, tengah));
  }
  function pelepah(x, y, sudut, p) {
    return D('M0 0 Q' + (p * 0.5) + ' ' + (-p * 0.38) + ' ' + p + ' ' + (p * 0.12) + ' Q' + (p * 0.5) + ' ' + (-p * 0.08) + ' 0 0 Z', '#2f9e5b', { transform: 'translate(' + x + ' ' + y + ') rotate(' + sudut + ')', stroke: '#1d6b3b', 'stroke-width': 1, 'stroke-linejoin': 'round' });
  }
  const bintang5 = (cx, cy, r, fill) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      return (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
    }).join(' ');
    return P(pts, fill);
  };

  // ---------- tiga pemandangan ----------
  // diffs: id, besar (untuk TK), pusat area ketuk (cx, cy) dan ukuran elips (w, h) dalam satuan gambar (320 x 200), ucapan saat ketemu.
  // draw(a): a = himpunan id perbedaan yang AKTIF (gambar 2). Gambar 1 dipanggil dengan himpunan kosong.
  const SCENES = [
    {
      id: 'rumah', nama: 'Halaman rumah',
      diffs: [
        { id: 'atap', besar: true, cx: 74, cy: 73, w: 124, h: 56, say: 'Warna atapnya beda!' },
        { id: 'layang', besar: true, cx: 258, cy: 64, w: 54, h: 104, say: 'Layang-layangnya hilang!' },
        { id: 'awan', besar: true, cx: 190, cy: 31, w: 68, h: 46, say: 'Ada awan tambahan!' },
        { id: 'mobil', besar: false, cx: 228, cy: 161, w: 120, h: 62, say: 'Mobilnya bergeser!' },
        { id: 'bunga', besar: false, cx: 128, cy: 160, w: 34, h: 34, say: 'Warna bunganya beda!' },
      ],
      draw(a) {
        const dx = a.has('mobil') ? -30 : 0;
        const sinar = Array.from({ length: 8 }, (_, i) => {
          const t = i * Math.PI / 4;
          return garis('M' + (292 + 17 * Math.cos(t)).toFixed(1) + ' ' + (26 + 17 * Math.sin(t)).toFixed(1) + ' L' + (292 + 23 * Math.cos(t)).toFixed(1) + ' ' + (26 + 23 * Math.sin(t)).toFixed(1), '#ffd23f', 3);
        });
        return [
          R(0, 0, VW, VH, '#cdeeff'),
          C(292, 26, 13, '#ffd23f'), ...sinar,
          awan(24, 36), awan(104, 22), a.has('awan') ? awan(176, 34) : null,
          E(70, 148, 100, 26, '#a5de88'), E(250, 150, 110, 22, '#9ad87c'), R(0, 144, VW, 28, '#8fd672'),
          R(0, 172, VW, 28, '#7b8190'), R(0, 170, VW, 3, '#cfd4da'),
          ...[8, 52, 96, 140, 184, 228, 272].map((x) => R(x, 187, 22, 3, '#f1f3f5')),
          // rumah
          R(98, 58, 12, 26, '#b86b4b', OL),
          R(28, 92, 92, 52, '#ffe3b3', OL),
          P('18,94 74,50 130,94', a.has('atap') ? '#4c8df6' : '#e5484d', OL),
          C(74, 74, 7, '#cdeeff', OL), garis('M74 67 V81 M67 74 H81', '#51485f', 1.2),
          R(64, 112, 20, 32, '#8a5a2b', OL), C(80, 129, 1.8, '#ffd23f'),
          R(38, 104, 18, 18, '#cdeeff', OL), garis('M47 104 V122 M38 113 H56', '#51485f', 1.2),
          R(92, 104, 18, 18, '#cdeeff', OL), garis('M101 104 V122 M92 113 H110', '#51485f', 1.2),
          R(60, 144, 28, 4, '#bfc5cc'),
          // pohon
          R(164, 98, 12, 46, '#8a5a2b', OL),
          C(170, 82, 26, '#3fae5a', { ...OL, 'stroke-width': 2.2 }), C(150, 96, 18, '#3fae5a', { ...OL, 'stroke-width': 2.2 }), C(190, 96, 18, '#3fae5a', { ...OL, 'stroke-width': 2.2 }),
          C(170, 82, 26, '#3fae5a'), C(150, 96, 18, '#3fae5a'), C(190, 96, 18, '#3fae5a'),
          C(160, 78, 3.2, '#e5484d'), C(180, 90, 3.2, '#e5484d'), C(152, 100, 3.2, '#e5484d'), C(172, 70, 3.2, '#e5484d'),
          // bunga
          bunga(44, 156, '#ff8fc7', '#ffd23f'), bunga(72, 160, '#fff', '#ffb703'), bunga(100, 157, '#b197fc', '#ffd23f'),
          bunga(128, 157, a.has('bunga') ? '#ffd23f' : '#e5484d', a.has('bunga') ? '#e5484d' : '#ffd23f'),
          // mobil (tanpa wajah: hanya badan, jendela, roda)
          G({ transform: 'translate(' + dx + ' 0)' },
            R(208, 154, 68, 20, '#4dabf7', { rx: 7, ...OL }),
            P('220,155 228,138 256,138 266,155', '#4dabf7', OL),
            P('224,154 230,141 241,141 241,154', '#e9f7ff'), P('245,154 245,141 254,141 261,154', '#e9f7ff'),
            R(272, 159, 5, 5, '#ffe066'),
            C(224, 176, 8, '#2b2d42'), C(224, 176, 3, '#adb5bd'), C(260, 176, 8, '#2b2d42'), C(260, 176, 3, '#adb5bd')),
          // layang-layang
          a.has('layang') ? null : G(null,
            P('258,26 273,50 258,76 243,50', '#ff8fc7', OL), garis('M258 26 V76 M243 50 H273', '#51485f', 1.1),
            garis('M258 76 q-8 12 0 22 q8 10 0 20', '#e5484d', 2),
            P('254,92 262,92 258,98', '#ffd23f'), P('254,110 262,110 258,116', '#4dabf7')),
        ];
      },
    },
    {
      id: 'masjid', nama: 'Taman masjid',
      diffs: [
        { id: 'kubah', besar: true, cx: 160, cy: 82, w: 86, h: 50, say: 'Warna kubahnya beda!' },
        { id: 'bulan', besar: true, cx: 56, cy: 38, w: 44, h: 46, say: 'Bulannya hilang!' },
        { id: 'lampu', besar: true, cx: 216, cy: 138, w: 40, h: 70, say: 'Ada lampu tambahan!' },
        { id: 'kurma', besar: false, cx: 298, cy: 87, w: 34, h: 30, say: 'Buah kurmanya hilang!' },
        { id: 'bintang', besar: false, cx: 236, cy: 27, w: 30, h: 28, say: 'Satu bintang hilang!' },
      ],
      draw(a) {
        const lampu = (x) => G(null, R(x - 2, 130, 4, 36, '#adb5bd'), C(x, 124, 14, 'rgba(255,224,102,0.28)'), C(x, 124, 7, '#ffe066', { stroke: '#e0a100', 'stroke-width': 1.2 }), R(x - 5, 164, 10, 4, '#868e96'));
        const titik = [[16, 18], [108, 12], [150, 38], [196, 16], [292, 26], [306, 70], [26, 74], [186, 60], [126, 54], [270, 52]];
        return [
          R(0, 0, VW, VH, '#26336b'), R(0, 100, VW, 56, '#3a4a8c'), R(0, 126, VW, 30, '#4b5aa3'),
          ...titik.map(([x, y]) => C(x, y, 1.5, '#fff')),
          a.has('bintang') ? null : bintang5(236, 28, 8, '#ffe066'),
          a.has('bulan') ? null : D('M61.7 22.4 A16 16 0 1 0 71.8 46.1 A13 13 0 1 1 61.7 22.4 Z', '#ffe9a3', { stroke: '#f3cf6a', 'stroke-width': 1 }),
          R(0, 152, VW, 48, '#2e6b46'),
          P('120,200 142,152 178,152 200,200', '#cdb98f'),
          // pohon kurma di kanan
          D('M298 156 Q290 122 298 80', 'none', { stroke: '#8a5a2b', 'stroke-width': 7, 'stroke-linecap': 'round' }),
          ...[-165, -130, -95, -60, -25, 15, 150].map((s) => pelepah(298, 78, s, 30)),
          a.has('kurma') ? null : G(null, C(291, 86, 3.4, '#8a3b12'), C(298, 89, 3.4, '#8a3b12'), C(305, 85, 3.4, '#8a3b12')),
          // masjid
          R(112, 98, 96, 54, '#f3e9d2', OL),
          D('M124 98 A36 36 0 0 1 196 98 Z', a.has('kubah') ? '#4c8df6' : '#2fbf8a', OL),
          R(158, 46, 4, 20, '#ffd23f'), C(160, 44, 4, '#ffd23f'),
          D('M148 152 V128 A12 12 0 0 1 172 128 V152 Z', '#8a5a2b', OL),
          D('M122 132 V120 A7 7 0 0 1 136 120 V132 Z', '#ffe066', OL), D('M184 132 V120 A7 7 0 0 1 198 120 V132 Z', '#ffe066', OL),
          R(70, 64, 20, 88, '#f3e9d2', OL), R(66, 88, 28, 5, '#d8c9a3', OL), R(76, 104, 8, 14, '#ffe066'), P('66,64 80,38 94,64', '#2fbf8a', OL),
          R(230, 64, 20, 88, '#f3e9d2', OL), R(226, 88, 28, 5, '#d8c9a3', OL), R(236, 104, 8, 14, '#ffe066'), P('226,64 240,38 254,64', '#2fbf8a', OL),
          // semak
          C(96, 152, 11, '#3f8f5a'), C(110, 156, 9, '#3f8f5a'), C(268, 156, 10, '#3f8f5a'),
          lampu(34), lampu(270), a.has('lampu') ? lampu(216) : null,
        ];
      },
    },
    {
      id: 'pantai', nama: 'Pantai',
      diffs: [
        { id: 'layar', besar: true, cx: 218, cy: 87, w: 42, h: 48, say: 'Warna layarnya beda!' },
        { id: 'payung', besar: true, cx: 112, cy: 126, w: 76, h: 90, say: 'Payung pantainya hilang!' },
        { id: 'bola', besar: true, cx: 252, cy: 172, w: 34, h: 34, say: 'Ada bola tambahan!' },
        { id: 'kelapa', besar: false, cx: 296, cy: 102, w: 28, h: 28, say: 'Kelapanya kurang satu!' },
        { id: 'matahari', besar: false, cx: 52, cy: 36, w: 76, h: 76, say: 'Mataharinya lebih besar!' },
      ],
      draw(a) {
        const rs = a.has('matahari') ? 26 : 18;
        const ombak = (y, w, wr) => D('M0 ' + y + ' q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0', 'none', { stroke: w, 'stroke-width': wr || 2.5, 'stroke-linecap': 'round' });
        return [
          R(0, 0, VW, VH, '#bfe9ff'),
          C(52, 36, rs + 6, 'rgba(255,210,63,0.3)'), C(52, 36, rs, '#ffd23f'),
          awan(132, 26), awan(236, 44),
          R(0, 94, VW, 62, '#3aa6e8'), R(0, 94, VW, 8, '#6cc3f5'),
          ombak(116, '#bfe9ff'), ombak(132, '#8fd3f7'), ombak(146, '#bfe9ff'),
          D('M0 152 Q80 142 160 150 T320 148 V200 H0 Z', '#f6d98b'),
          E(30, 186, 6, 2.5, '#e6c46f'), E(150, 190, 7, 2.5, '#e6c46f'), E(230, 184, 5, 2, '#e6c46f'), E(190, 168, 4, 1.6, '#e6c46f'),
          // perahu layar
          D('M178 108 H228 L218 122 H188 Z', '#8a5a2b', OL), R(201, 66, 3, 42, '#5e3b17'),
          P('206,68 206,104 232,104', a.has('layar') ? '#ffd23f' : '#e5484d', OL), P('199,76 199,104 182,104', '#fff', OL),
          // payung pantai
          a.has('payung') ? null : G(null, garis('M112 160 V118', '#8a5a2b', 3.5), D('M84 120 A28 28 0 0 1 140 120 Z', '#e5484d', OL), wedge(112, 120, 28, 240, 300, '#fff'), D('M84 120 Q98 126 112 120 Q126 126 140 120', 'none', { stroke: '#51485f', 'stroke-width': 1.2 })),
          // istana pasir
          P('36,178 76,178 70,162 42,162', '#e8c86a', OL), R(46, 150, 12, 14, '#e8c86a', OL), R(58, 154, 10, 10, '#e8c86a', OL), garis('M52 150 V140', '#51485f', 1.4), P('52,140 62,143 52,146', '#e5484d'),
          // pohon kelapa
          D('M300 156 Q292 124 298 88', 'none', { stroke: '#8a5a2b', 'stroke-width': 7, 'stroke-linecap': 'round' }),
          ...[-165, -130, -95, -60, -25, 15, 150].map((s) => pelepah(298, 86, s, 30)),
          C(291, 95, 4.4, '#6b3f1d'), C(301, 97, 4.4, '#6b3f1d'), a.has('kelapa') ? null : C(296, 103, 4.4, '#6b3f1d'),
          // bola pantai
          a.has('bola') ? G(null, C(252, 172, 11, '#fff', OL), wedge(252, 172, 11, -90, -30, '#e5484d'), wedge(252, 172, 11, 30, 90, '#4dabf7'), wedge(252, 172, 11, 150, 210, '#ffd23f'), C(252, 172, 11, 'none', OL)) : null,
        ];
      },
    },
  ];

  const CSS = `
    & .bd-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
    & .bd-info { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; }
    & .bd-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
    & .bd-count { display: inline-flex; align-items: center; gap: 6px; }
    & .bd-count i { display: block; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #e5484d; background: #fff; transition: background-color var(--dur-ui) ease, transform var(--dur-ui) var(--ease-out); }
    & .bd-count i.is-on { background: #e5484d; transform: scale(1.15); }
    & .bd-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 980px; }
    & .bd-frame {
      position: relative; aspect-ratio: ${VW} / ${VH}; border-radius: 18px; overflow: hidden; border: 4px solid #fff;
      box-shadow: 0 5px 0 var(--shadow); background: #fff; touch-action: manipulation; user-select: none; -webkit-user-select: none;
    }
    & .bd-svg { display: block; width: 100%; height: 100%; }
    & .bd-tag {
      position: absolute; left: 8px; top: 8px; z-index: 3; min-width: 26px; height: 26px; padding: 0 7px; border-radius: 13px;
      display: grid; place-items: center; background: rgba(43, 45, 66, 0.78); color: #fff; font-weight: 800; font-size: 0.9rem; pointer-events: none;
    }
    & .bd-pos { position: absolute; z-index: 2; min-width: 48px; min-height: 48px; transform: translate(-50%, -50%); }
    & .bd-hot { position: absolute; inset: 0; display: block; padding: 0; margin: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; -webkit-appearance: none; appearance: none; }
    & .bd-ring {
      position: absolute; inset: 0; border: 4px solid #e5484d; border-radius: 50%; opacity: 0; pointer-events: none;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85), inset 0 0 0 2px rgba(255, 255, 255, 0.6);
    }
    & .bd-pos.is-found .bd-ring { opacity: 1; animation: ti-pop var(--dur-ui) var(--ease-out); }
    & .bd-pos.is-hint::after {
      content: ""; position: absolute; inset: -2px; border: 3px dashed #f59f00; border-radius: 50%; pointer-events: none;
      animation: bd-pulse 700ms var(--ease-in-out) 3; /* motion-ok: petunjuk berkedip lembut, jarang muncul */
    }
    @keyframes bd-pulse { 50% { transform: scale(1.14); } }
    & .bd-spark { position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #ffd23f; pointer-events: none; animation: bd-spark 420ms var(--ease-out) both; } /* motion-ok: percikan kecil saat ketemu */
    @keyframes bd-spark { to { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
    & .bd-ripple { position: absolute; z-index: 1; width: 30px; height: 30px; margin: -15px 0 0 -15px; border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.9); background: rgba(43, 45, 66, 0.18); pointer-events: none; animation: bd-ripple 280ms var(--ease-out) both; }
    @keyframes bd-ripple { from { opacity: 1; transform: scale(0.7); } to { opacity: 0; transform: scale(1.3); } }
    @media (max-width: 700px) {
      & .bd-pair { grid-template-columns: 1fr; max-width: 420px; gap: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .bd-pos.is-found .bd-ring { animation: none; }
      & .bd-pos.is-hint::after { animation: none; }
      & .bd-spark, & .bd-ripple { display: none; }
    }
  `.replace(/&/g, '.play[data-game="beda"]');

  const pct = (v, total) => (v / total * 100).toFixed(3) + '%';

  function gambarSvg(scene, aktif) {
    return svg('svg', { viewBox: '0 0 ' + VW + ' ' + VH, class: 'bd-svg', preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': scene.nama, focusable: 'false' }, scene.draw(aktif));
  }

  TI.register({
    id: 'beda',
    title: 'Cari Perbedaan',
    cat: 'logika',
    icon: '🔎',
    desc: 'Temukan hal yang berbeda di dua gambar.',
    // dipakai alat uji
    _tes: { SCENES },
    async start(ctx) {
      TI.style('beda', CSS);
      const tk = ctx.isTK;
      const reduced = TI.reduced();
      const jumlah = tk ? 3 : 5;
      const total = SCENES.length * jumlah;
      let temuTotal = 0;

      for (let si = 0; si < SCENES.length; si++) {
        if (!ctx.alive) return;
        ctx.progress(temuTotal, total);
        ctx.clear();
        await main(SCENES[si], si);
      }
      if (!ctx.alive) return;
      ctx.progress(total, total);
      const m = ctx.mistakes;
      ctx.finish({
        stars: m === 0 ? 3 : m <= 3 ? 2 : 1,
        total: SCENES.length,
        lesson: 'Mengamati dengan teliti membantu kita menemukan hal kecil yang berbeda.',
      });

      function main(scene, si) {
        return new Promise((resolve) => {
          const diffs = scene.diffs.filter((d) => !tk || d.besar).slice(0, jumlah);
          const aktif = new Set(diffs.map((d) => d.id));
          const ditemu = new Set();
          let salahBeruntun = 0, bantu = 0, sibuk = false;

          ctx.ask(si === 0
            ? 'Cari ' + jumlah + ' perbedaan antara gambar 1 dan gambar 2. Ketuk bagian yang berbeda!'
            : scene.nama + '. Cari ' + jumlah + ' perbedaan!');

          const bingkai = [gambarSvg(scene, new Set()), gambarSvg(scene, aktif)].map((gs, i) => {
            const fr = h('div', { class: 'bd-frame', 'data-no': i + 1 }, gs, h('span', { class: 'bd-tag', 'aria-hidden': 'true' }, 'Gambar ' + (i + 1)));
            fr.addEventListener('click', (e) => ketukLain(e, fr));
            return fr;
          });
          // area ketuk + lingkaran penanda di kedua gambar
          const pos = {};
          diffs.forEach((d) => {
            pos[d.id] = bingkai.map((fr, i) => {
              const el = h('div', { class: 'bd-pos', style: 'left:' + pct(d.cx, VW) + ';top:' + pct(d.cy, VH) + ';width:' + pct(d.w, VW) + ';height:' + pct(d.h, VH) },
                h('button', { type: 'button', class: 'bd-hot', 'aria-label': 'Perbedaan di gambar ' + (i + 1) }),
                h('span', { class: 'bd-ring', 'aria-hidden': 'true' }));
              el.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); temukan(d.id, false); });
              fr.append(el);
              return el;
            });
          });

          const bulat = diffs.map(() => h('i'));
          const hitung = h('span', { class: 'bd-chip bd-count', 'aria-live': 'polite' }, h('span', { class: 'bd-count-n' }, '0 dari ' + diffs.length), ...bulat);
          const bantuBtn = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          bantuBtn.addEventListener('click', () => bantuan());
          ctx.el.append(h('div', { class: 'bd-wrap' },
            h('div', { class: 'bd-info' }, h('span', { class: 'bd-chip' }, 'Gambar ' + (si + 1) + ' dari ' + SCENES.length + ': ' + scene.nama), hitung),
            h('div', { class: 'bd-pair' }, bingkai),
            h('div', { class: 'ti-toolbar' }, bantuBtn)));

          function percik(el) {
            if (reduced) return;
            for (let k = 0; k < 7; k++) {
              const a = (k / 7) * Math.PI * 2, jarak = 30 + (k % 2) * 12;
              const s = h('span', { class: 'bd-spark', style: '--dx:' + (Math.cos(a) * jarak).toFixed(0) + 'px;--dy:' + (Math.sin(a) * jarak).toFixed(0) + 'px' });
              el.append(s);
              ctx.after(460, () => s.remove());
            }
          }

          function temukan(id, otomatis) {
            if (ditemu.has(id)) return;
            ditemu.add(id);
            temuTotal++;
            salahBeruntun = 0;
            const d = diffs.find((x) => x.id === id);
            pos[id].forEach((el) => {
              el.classList.remove('is-hint');
              el.classList.add('is-found');
              const b = el.querySelector('button');
              b.disabled = true;
              percik(el);
            });
            bulat.forEach((b, i) => b.classList.toggle('is-on', i < ditemu.size));
            hitung.querySelector('.bd-count-n').textContent = ditemu.size + ' dari ' + diffs.length;
            ctx.progress(temuTotal, total);
            ctx.sfx('benar');
            if (!otomatis || ditemu.size < diffs.length) ctx.say(d.say);
            if (ditemu.size === diffs.length) selesai();
          }

          function ketukLain(e, fr) {
            if (e.target.closest && e.target.closest('.bd-pos')) return;
            const r = fr.getBoundingClientRect();
            const rip = h('span', { class: 'bd-ripple', style: 'left:' + (e.clientX - r.left - 4) + 'px;top:' + (e.clientY - r.top - 4) + 'px' });
            fr.append(rip);
            ctx.after(320, () => rip.remove());
            ctx.sfx('tap');
            salahBeruntun++;
            if (salahBeruntun >= 5) {
              // 5 kali salah berturut-turut = 1 kesalahan, dan satu perbedaan bergoyang halus sebagai petunjuk
              salahBeruntun = 0;
              ctx.mistakes++;
              const sisa = diffs.filter((x) => !ditemu.has(x.id));
              if (sisa.length) {
                const d = sisa[0];
                pos[d.id].forEach((el) => { el.classList.add('is-hint'); ctx.after(2300, () => el.classList.remove('is-hint')); });
                ctx.say('Coba cari di dekat sini.');
              }
            }
          }

          async function bantuan() {
            if (sibuk || ditemu.size === diffs.length) return;
            bantu++;
            ctx.mistakes++;
            ctx.sfx('tap');
            const sisa = diffs.filter((x) => !ditemu.has(x.id));
            if (bantu <= 2) { temukan(sisa[0].id, false); return; }
            sibuk = true;
            bantuBtn.disabled = true;
            for (const d of sisa) {
              if (!ctx.alive) return;
              temukan(d.id, true);
              await ctx.wait(reduced ? 150 : 380);
            }
          }

          async function selesai() {
            bantuBtn.disabled = true;
            await ctx.correct(null, { say: si < SCENES.length - 1 ? 'Semua perbedaan ketemu! Hebat!' : 'Semua ketemu! Kamu teliti sekali!', min: 1000 });
            resolve();
          }
        });
      }
    },
  });
})();
