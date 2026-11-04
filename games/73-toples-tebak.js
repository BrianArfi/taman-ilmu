/* 73 Toples Tebakan. Tebak isi toples tanpa menghitung satu-satu. */
(function () {
  const { h, svg, shuffle, sample, rand, pick, numChoices, dots } = TI;

  const WARNA = ['#e5484d', '#2f6fed', '#0e9f6e', '#ffb703', '#8a5cf6', '#0ea5b7', '#ef6aa5'];

  function toplesSvg(n) {
    const els = [
      svg('rect', { x: 44, y: 8, width: 132, height: 26, rx: 10, fill: '#8a94a6' }),
      svg('rect', { x: 30, y: 34, width: 160, height: 236, rx: 34, fill: '#d8ecff', opacity: 0.55 }),
      svg('rect', { x: 30, y: 34, width: 160, height: 236, rx: 34, fill: 'none', stroke: '#5b7fa6', 'stroke-width': 6 }),
    ];
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard++ < 1200) {
      const x = 52 + Math.random() * 116, y = 120 + Math.random() * 128;
      if (pts.every((p) => (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) > 25 * 25)) pts.push([x, y]);
    }
    pts.forEach(([x, y], i) => {
      const c = WARNA[i % WARNA.length];
      els.push(svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 11.5, fill: c, stroke: '#2b2d42', 'stroke-width': 2.5 }));
      els.push(svg('circle', { cx: (x - 3.5).toFixed(1), cy: (y - 4).toFixed(1), r: 3, fill: '#fff', opacity: 0.75 }));
    });
    els.push(svg('rect', { x: 44, y: 60, width: 16, height: 180, rx: 8, fill: '#fff', opacity: 0.5 }));
    return svg('svg', { viewBox: '0 0 220 290', class: 'tt-toples', role: 'img', 'aria-label': 'Toples berisi kelereng', focusable: 'false' }, els);
  }

  // Opsi "terdekat": 4 angka, yang paling dekat dengan n adalah jawabannya, jaraknya unik.
  function opsiTerdekat(n) {
    const jarak = sample([3, 5, 8, 12], 3);
    const offs = jarak.map((d) => (pick([-1, 1]) * d));
    let opsi = offs.map((o) => Math.max(6, n + o));
    opsi = [...new Set(opsi)].filter((v) => v !== n);
    let g = 0;
    while (opsi.length < 3 && g++ < 40) {
      const v = Math.max(6, n + pick([-1, 1]) * pick([4, 7, 10, 14]));
      if (v !== n && !opsi.includes(v)) opsi.push(v);
    }
    const semua = opsi.slice(0, 3);
    let jawab = semua[0], beda = Math.abs(semua[0] - n);
    semua.forEach((v) => { if (Math.abs(v - n) < beda) { beda = Math.abs(v - n); jawab = v; } });
    // Pastikan jarak terdekat unik.
    if (semua.filter((v) => Math.abs(v - n) === beda).length > 1) {
      const jauh = semua.find((v) => Math.abs(v - n) !== beda);
      const ganti = jawab + (jawab < n ? -6 : 6);
      semua[semua.indexOf(jauh)] = Math.max(6, ganti === jawab ? jawab + 9 : ganti);
      jawab = semua.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
    }
    return { opsi: semua, jawab };
  }

  const CSS = `
.play[data-game="toples-tebak"] .tt-toples { display: block; width: min(52vw, 210px); height: auto; }
.play[data-game="toples-tebak"] .tt-kartu { display: grid; place-items: center; width: auto; padding: 10px 26px 16px; }
.play[data-game="toples-tebak"] .tt-angka { font-size: 1.6rem; font-weight: 800; font-variant-numeric: tabular-nums; }
.play[data-game="toples-tebak"] .tt-opsi { display: grid; justify-items: center; gap: 2px; }
@media (max-width: 560px) {
  .play[data-game="toples-tebak"] .tt-toples { width: min(56vw, 190px); }
}`;

  async function soalTK(ctx, n) {
    ctx.ask('Ada berapa kelereng di toples? Tebak tanpa menghitung satu-satu!');
    ctx.el.append(h('div', { class: 'ti-card tt-kartu pop-in' }, toplesSvg(n)));
    const opsi = numChoices(n, 3, 1, 12);
    await ctx.choose({
      options: opsi.map((x) => ({
        node: h('span', { class: 'tt-opsi' }, h('span', { class: 'tt-angka' }, String(x)), dots(x)),
        value: x, say: 'Angka ' + x, aria: 'Angka ' + x, cls: 'is-big',
      })),
      answer: n,
      speakLabel: true,
    });
  }

  async function soalSD(ctx, n) {
    ctx.ask('Kira-kira ada berapa kelereng? Pilih yang paling dekat!');
    ctx.el.append(h('div', { class: 'ti-card tt-kartu pop-in' }, toplesSvg(n)));
    const { opsi, jawab } = opsiTerdekat(n);
    await ctx.choose({
      options: shuffle(opsi).map((x) => ({ label: String(x), value: x, say: 'Angka ' + x })),
      answer: jawab,
      layout: 'is-grid2',
    });
  }

  TI.register({
    id: 'toples-tebak',
    title: 'Toples Tebakan',
    cat: 'mat',
    icon: '🫙',
    desc: 'Tebak isi toples tanpa menghitung satu-satu.',
    start(ctx) {
      TI.style('toples-tebak', CSS);
      if (ctx.isTK) {
        const daftar = sample([4, 5, 6, 7, 8, 9, 10], 6);
        ctx.series(daftar, (n) => soalTK(ctx, n), {
          lesson: 'Kamu bisa menebak banyak benda dengan melihat polanya, tanpa menghitung satu-satu.',
        });
      } else {
        const daftar = Array.from({ length: 6 }, () => rand(20, 50));
        ctx.series(daftar, (n) => soalSD(ctx, n), {
          lesson: 'Membulatkan ke angka terdekat membuat tebakan kita cepat dan tidak jauh dari benar.',
        });
      }
    },
  });
})();
