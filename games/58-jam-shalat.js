/* 58 Kapan Shalatnya. Cocokkan shalat dengan gambar langitnya.
   Gambar langit dibuat sendiri dengan SVG, tanpa wajah dan tanpa matahari berwajah.
   TK: dengar nama shalat, pilih gambar (3 opsi). SD: lihat gambar pilih shalat + urutkan 5 waktu.
   Urut pagi ke malam. Jawaban terungkap + pujian tengah jalan. */
(function () {
  const { h, svg, shuffle, sample } = TI;

  // Deskripsi langit mengikuti 04-shalat di SPEC.
  const WAKTU = [
    { nama: 'Subuh', ket: 'fajar, langit masih gelap kebiru-biruan' },
    { nama: 'Zuhur', ket: 'siang, matahari tinggi, langit biru terang' },
    { nama: 'Ashar', ket: 'sore, matahari lebih rendah, langit kuning hangat' },
    { nama: 'Maghrib', ket: 'matahari terbenam setengah di ufuk, langit jingga' },
    { nama: 'Isya', ket: 'malam, gelap, ada bulan dan bintang' },
  ];

  // Langit SVG buatan sendiri: gradasi + lingkaran polos + bintang + siluet kubah.
  function langitNode(kind, besar) {
    const W = 220, H = besar ? 150 : 110;
    const hor = H - 26;
    const id = 'lg' + kind + (besar ? 'b' : 'k') + Math.floor(Math.random() * 1e6);
    const bg = {
      Subuh: ['#2b3a67', '#7a6fae', '#e98a8a'],
      Zuhur: ['#2f9df0', '#7cc7ff', '#cdeaff'],
      Ashar: ['#f0a13a', '#ffd23f', '#fff3bf'],
      Maghrib: ['#7a2e2e', '#e8590c', '#ffb703'],
      Isya: ['#0b1030', '#1c2456', '#3a3f7a'],
    }[kind];
    const isi = [
      svg('defs', {}, svg('linearGradient', { id, x1: '0', y1: '0', x2: '0', y2: '1' },
        svg('stop', { offset: '0', 'stop-color': bg[0] }),
        svg('stop', { offset: '0.62', 'stop-color': bg[1] }),
        svg('stop', { offset: '1', 'stop-color': bg[2] }))),
      svg('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#' + id + ')' }),
    ];
    if (kind === 'Subuh') isi.push(svg('circle', { cx: W * 0.68, cy: hor + 12, r: 20, fill: '#ffdf8a' }));
    if (kind === 'Zuhur') isi.push(svg('circle', { cx: W * 0.5, cy: 30, r: 20, fill: '#fff3bf', stroke: '#ffd23f', 'stroke-width': 5 }));
    if (kind === 'Ashar') isi.push(svg('circle', { cx: W * 0.3, cy: H * 0.52, r: 17, fill: '#fff3bf', stroke: '#ffdf8a', 'stroke-width': 4 }));
    if (kind === 'Maghrib') isi.push(svg('circle', { cx: W * 0.5, cy: hor, r: 22, fill: '#ff6b35' }));
    if (kind === 'Isya') {
      isi.push(svg('circle', { cx: W * 0.74, cy: 30, r: 15, fill: '#f4f1de' }));
      isi.push(svg('circle', { cx: W * 0.79, cy: 24, r: 13, fill: bg[0] }));
      for (const [sx, sy] of [[30, 24], [70, 52], [120, 26], [160, 60], [45, 78], [195, 88]]) {
        isi.push(svg('circle', { cx: sx, cy: sy, r: 2.2, fill: '#ffffff' }));
      }
    }
    isi.push(svg('rect', { x: 0, y: hor, width: W, height: H - hor, fill: 'rgba(40,30,40,0.85)' }));
    isi.push(svg('path', { d: 'M' + (W / 2 - 34) + ' ' + hor + ' A34 30 0 0 1 ' + (W / 2 + 34) + ' ' + hor + ' Z', fill: 'rgba(40,30,40,0.85)' }));
    isi.push(svg('rect', { x: W / 2 - 3, y: hor - 52, width: 6, height: 24, fill: 'rgba(40,30,40,0.85)' }));
    isi.push(svg('rect', { x: 18, y: hor - 44, width: 10, height: 44, fill: 'rgba(40,30,40,0.85)' }));
    isi.push(svg('rect', { x: W - 28, y: hor - 44, width: 10, height: 44, fill: 'rgba(40,30,40,0.85)' }));
    return svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'js-langit' }, ...isi);
  }

  const P = '.play[data-game="jam-shalat"]';
  const CSS = `
${P} .js-besar { width: 100%; max-width: 420px; border-radius: 18px; overflow: hidden; border: 3px solid var(--line); box-shadow: 0 5px 0 var(--shadow); }
${P} .js-langit { display: block; width: 100%; height: auto; }
${P} .js-pilihan { max-width: 560px; }
${P} .js-pilihan .choice { min-height: 88px; padding: 6px; }
${P} .js-pilihan .js-langit { border-radius: 12px; }
${P} .js-order .choice { min-height: 64px; }`;

  TI.register({
    id: 'jam-shalat',
    title: 'Kapan Shalatnya',
    cat: 'islam',
    icon: '🌤️',
    desc: 'Cocokkan shalat dengan gambar langitnya.',
    async start(ctx) {
      TI.style('jam-shalat', CSS);
      const TK = ctx.isTK;

      if (TK) {
        const soal = shuffle([...WAKTU, TI.pick(WAKTU)]).map((s) => ({ ...s, urut: WAKTU.indexOf(s) }));
        soal.sort((a, b) => a.urut - b.urut); // pagi ke malam
        let ke = 0;
        await ctx.series(soal, async (s) => {
          ke++;
          if (ke === 3) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          ctx.sfx('pop');
          ctx.ask('Shalat ' + s.nama + ' langitnya yang mana? (' + s.ket + ')', { say: 'Shalat ' + s.nama + ' langitnya yang mana?' });
          const lawan = shuffle(WAKTU.filter((x) => x.nama !== s.nama)).slice(0, 2);
          const wadah = h('div', { class: 'ti-choices is-grid2 js-pilihan' });
          ctx.el.append(wadah);
          await ctx.choose({
            options: shuffle([s, ...lawan]).map((x) => ({ node: langitNode(x.nama, false), value: x.nama, say: 'Langit waktu ' + x.nama, aria: 'Langit waktu ' + x.nama })),
            answer: s.nama,
            into: wadah,
            speakLabel: true,
          });
          ctx.el.append(h('p', { class: 'ti-label' }, 'Benar! Ini langit waktu ' + s.nama + '.'));
          ctx.sfx('pop');
          await ctx.wait(350);
        }, {
          lesson: 'Shalat wajib ada 5 waktu: Subuh, Zuhur, Ashar, Maghrib, Isya.',
        });
        return;
      }

      // SD: 5 soal lihat gambar + urutan 5 waktu.
      const soal = sample(WAKTU, 5).map((s) => ({ ...s, urut: WAKTU.indexOf(s) }));
      soal.sort((a, b) => a.urut - b.urut); // pagi ke malam
      const total = soal.length + 1;
      ctx.progress(0, total);
      let ke = 0;
      for (const s of soal) {
        ctx.clear();
        ke++;
        if (ke === 3) ctx.correct(null, { say: 'Bagus! Terus naik ke malam hari.' });
        ctx.ask('Langit ini waktu shalat apa?');
        ctx.el.append(h('div', { class: 'js-besar pop-in' }, langitNode(s.nama, true)));
        ctx.sfx('pop');
        const lawan = shuffle(WAKTU.filter((x) => x.nama !== s.nama)).slice(0, 3);
        await ctx.choose({
          options: shuffle([s, ...lawan]).map((x) => ({ label: x.nama, value: x.nama })),
          answer: s.nama,
          layout: 'is-grid2',
        });
        if (!ctx.alive) return;
        ctx.el.append(h('p', { class: 'ti-label' }, 'Benar! Ini waktu ' + s.nama + '.'));
        ctx.sfx('pop');
        await ctx.wait(350);
        ctx.progress(soal.indexOf(s) + 1, total);
      }
      ctx.clear();
      ctx.ask('Urutkan 5 waktu shalat dari pagi sampai malam!');
      const w = h('div', { class: 'js-order' });
      ctx.el.append(w);
      await ctx.order({
        items: WAKTU.map((x) => ({ label: x.nama, node: langitNode(x.nama, false) })),
        guide: 'never',
        into: w,
      });
      if (!ctx.alive) return;
      ctx.progress(total, total);
      ctx.finish({ lesson: 'Shalat wajib ada 5 waktu: Subuh, Zuhur, Ashar, Maghrib, Isya.' });
    },
  });
})();
