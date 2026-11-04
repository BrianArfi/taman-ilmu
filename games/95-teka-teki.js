/* 95 Teka-teki Siapa. Einstein junior: baca petunjuk, tebak siapa di rumah mana. Penghuni hanya teks, tanpa emoji hewan. */
(function () {
  const { h, svg, shuffle } = TI;

  const CSS = `
.play[data-game="teka-teki"] .tt-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="teka-teki"] .tt-houses { display: flex; justify-content: center; align-items: flex-end; gap: 10px; width: min(100%, 440px); }
.play[data-game="teka-teki"] .tt-house { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px 10px; border-radius: 18px; background: var(--card); box-shadow: 0 4px 0 var(--shadow); }
.play[data-game="teka-teki"] .tt-house svg { width: 100%; max-width: 110px; height: auto; display: block; }
.play[data-game="teka-teki"] .tt-who { margin: 0; min-height: 1.6em; font-weight: 800; font-size: 1.15rem; text-align: center; }
.play[data-game="teka-teki"] .tt-clues { width: min(100%, 440px); margin: 0; padding: 10px 14px 10px 38px; border-radius: 18px; background: #fff8dc; box-shadow: 0 4px 0 var(--shadow); font-weight: 700; font-size: 1.05rem; line-height: 1.5; }
.play[data-game="teka-teki"] .tt-clues li { margin: 2px 0; }
`;

  function rumahSVG(warna) {
    return svg('svg', { viewBox: '0 0 100 92', 'aria-hidden': 'true', focusable: 'false' },
      svg('polygon', { points: '8,44 50,8 92,44', fill: warna, stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      svg('rect', { x: 18, y: 44, width: 64, height: 40, rx: 4, fill: '#fff', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 3 }),
      svg('rect', { x: 42, y: 58, width: 16, height: 26, rx: 2, fill: '#8a6d3b' }),
      svg('rect', { x: 24, y: 50, width: 12, height: 12, rx: 2, fill: '#bfe3ff', stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 2 }));
  }

  // rumah: warna tetap kiri ke kanan. penghuni: jawaban per rumah.
  const TK = {
    rumah: [
      { warna: '#e5484d', nama: 'Merah' },
      { warna: '#2f6fed', nama: 'Biru' },
    ],
    penghuni: ['Kucing', 'Ikan'],
    petunjuk: [
      'Kucing tinggal di rumah merah.',
      'Ikan tidak tinggal di rumah merah.',
    ],
    tanya: [
      { soal: 'Siapa yang tinggal di rumah merah?', jawab: 'Kucing' },
      { soal: 'Di rumah apa Ikan tinggal?', jawab: 'Biru', opsi: ['Merah', 'Biru'], ucap: ['Rumah merah', 'Rumah biru'] },
    ],
  };
  const SD = {
    rumah: [
      { warna: '#e5484d', nama: 'Merah' },
      { warna: '#e8b400', nama: 'Kuning' },
      { warna: '#2f6fed', nama: 'Biru' },
    ],
    penghuni: ['Kucing', 'Ikan', 'Burung'],
    petunjuk: [
      'Kucing tinggal di rumah merah.',
      'Ikan tidak tinggal di rumah biru.',
      'Burung tinggal di rumah biru.',
    ],
    tanya: [
      { soal: 'Siapa yang tinggal di rumah merah?', jawab: 'Kucing' },
      { soal: 'Di rumah apa Ikan tinggal?', jawab: 'Kuning', opsi: ['Merah', 'Kuning', 'Biru'], ucap: ['Rumah merah', 'Rumah kuning', 'Rumah biru'] },
      { soal: 'Siapa yang tinggal di rumah biru?', jawab: 'Burung' },
    ],
  };

  TI.register({
    id: 'teka-teki',
    title: 'Teka-teki Siapa',
    cat: 'logika',
    icon: '❔',
    desc: 'Baca petunjuknya, siapa yang dimaksud?',
    start(ctx) {
      TI.style('teka-teki', CSS);
      const tk = ctx.isTK;
      const P = tk ? TK : SD;
      const nOpsi = tk ? 3 : 4;

      ctx.series(P.tanya, async (t, i) => {
        if (i === 0) {
          const baris = h('div', { class: 'tt-houses' });
          P.rumah.forEach((rm) => {
            baris.append(h('div', { class: 'tt-house pop-in' },
              rumahSVG(rm.warna),
              h('p', { class: 'tt-who' }, 'Rumah ' + rm.nama),
              h('p', { class: 'tt-who', 'aria-hidden': 'true' }, '?')));
          });
          const clues = h('ol', { class: 'tt-clues' });
          P.petunjuk.forEach((c) => clues.append(h('li', null, c)));
          ctx.el.append(h('div', { class: 'tt-wrap' }, baris, clues));
        }
        ctx.ask(t.soal);
        let opsi;
        if (t.opsi) {
          opsi = shuffle(t.opsi.map((o, k) => ({ label: o, value: o, say: t.ucap ? t.ucap[k] : 'Rumah ' + o })));
        } else {
          const lain = P.penghuni.filter((x) => x !== t.jawab);
          const perlu = Math.min(nOpsi - 1, lain.length);
          const pool = ['Ayam', 'Bebek', 'Kambing', 'Sapi', 'Kelinci'].filter((x) => !P.penghuni.includes(x) && x !== t.jawab);
          const pengecoh = shuffle(lain.concat(shuffle(pool).slice(0, Math.max(0, perlu - lain.length)))).slice(0, perlu);
          opsi = shuffle([t.jawab].concat(pengecoh).map((o) => ({ label: o, value: o, say: o })));
        }
        const r = await ctx.choose({ options: opsi, answer: t.jawab, speakLabel: true, layout: 'is-col' });
        if (i === P.tanya.length - 1 && r.firstTry) ctx.say('Semua benar! Kamu detektif hebat.');
      }, {
        lesson: tk
          ? 'Petunjuk dibaca satu per satu, lalu disimpulkan. Kucing di rumah merah, Ikan di rumah biru.'
          : 'Petunjuk dibaca satu per satu, lalu disimpulkan. Kucing di rumah merah, Ikan di rumah kuning, Burung di rumah biru.',
      });
    },
  });
})();
