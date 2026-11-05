/* 95 Teka-teki Siapa. Einstein junior: baca petunjuk, tebak siapa di rumah mana. Penghuni hanya teks, tanpa emoji hewan.
   Papan tampil tiap soal dan penghuni terungkap satu per satu. Petunjuk bisa
   diketuk untuk didengar (TK dibacakan otomatis). Urut gampang dulu.
   Bantu: ketuk 1-2 bacakan ulang petunjuk, ketuk 3 jawab otomatis. */
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
.play[data-game="teka-teki"] .tt-clue { border: 0; background: none; padding: 0; font: inherit; font-weight: inherit; text-align: left; cursor: pointer; color: inherit; }
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
      { soal: 'Siapa yang tinggal di rumah merah?', jawab: 'Kucing', sulit: 0, ungkap: [0, 'Kucing'] },
      { soal: 'Di rumah apa Ikan tinggal?', jawab: 'Biru', opsi: ['Merah', 'Biru'], ucap: ['Rumah merah', 'Rumah biru'], sulit: 1, ungkap: [1, 'Ikan'] },
      { soal: 'Kucing di rumah merah. Siapa di rumah satunya?', jawab: 'Ikan', sulit: 1, ungkap: [1, 'Ikan'] },
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
      { soal: 'Siapa yang tinggal di rumah merah?', jawab: 'Kucing', sulit: 0, ungkap: [0, 'Kucing'] },
      { soal: 'Di rumah apa Ikan tinggal?', jawab: 'Kuning', opsi: ['Merah', 'Kuning', 'Biru'], ucap: ['Rumah merah', 'Rumah kuning', 'Rumah biru'], sulit: 1, ungkap: [1, 'Ikan'] },
      { soal: 'Siapa yang tinggal di rumah biru?', jawab: 'Burung', sulit: 0, ungkap: [2, 'Burung'] },
      { soal: 'Kucing di rumah merah, Burung di rumah biru. Siapa di rumah kuning?', jawab: 'Ikan', sulit: 2, ungkap: [1, 'Ikan'] },
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

      const tanya = [...P.tanya].sort((a, b) => a.sulit - b.sulit);
      const terjawab = {};
      ctx.series(tanya, async (t, i) => {
        const baris = h('div', { class: 'tt-houses' });
        P.rumah.forEach((rm, ri) => {
          baris.append(h('div', { class: 'tt-house pop-in' },
            rumahSVG(rm.warna),
            h('p', { class: 'tt-who' }, 'Rumah ' + rm.nama),
            h('p', { class: 'tt-who', 'aria-hidden': 'true' }, terjawab[ri] || '?')));
        });
        const clues = h('ol', { class: 'tt-clues' });
        P.petunjuk.forEach((c) => {
          const b = h('button', { type: 'button', class: 'tt-clue', 'data-tap': true }, c);
          b.addEventListener('click', () => { ctx.sfx('tap'); ctx.say(c); });
          clues.append(h('li', null, b));
        });
        const btnBantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        ctx.el.append(h('div', { class: 'tt-wrap' }, baris, clues, btnBantu));
        ctx.sfx('pop');
        let bantu = 0, terjawabQ = false;
        btnBantu.addEventListener('click', async () => {
          if (!ctx.alive || terjawabQ || bantu >= 3) return;
          bantu++;
          ctx.mistakes++;
          if (bantu >= 3) {
            const benar = [...ctx.el.querySelectorAll('.ti-choices .choice:not([disabled])')].find((x) => x.textContent.trim() === t.jawab);
            if (benar) benar.click();
          } else {
            ctx.sfx('klik');
            for (const c of P.petunjuk) { if (ctx.alive && !terjawabQ) await ctx.sayWait(c); }
          }
        });
        if (tk && i === 0) for (const c of P.petunjuk) { if (ctx.alive) await ctx.sayWait(c); }
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
        terjawabQ = true;
        // Ungkap penghuni di rumahnya.
        baris.children[t.ungkap[0]].querySelectorAll('.tt-who')[1].textContent = t.ungkap[1];
        terjawab[t.ungkap[0]] = t.ungkap[1];
        ctx.sfx('pop');
        await ctx.wait(600);
        if (i === tanya.length - 1) ctx.correct(null, { say: r.firstTry ? 'Semua benar! Kamu detektif hebat.' : 'Rumah misteri terpecahkan!' });
      }, {
        lesson: tk
          ? 'Petunjuk dibaca satu per satu, lalu disimpulkan. Kucing di rumah merah, Ikan di rumah biru.'
          : 'Petunjuk dibaca satu per satu, lalu disimpulkan. Kucing di rumah merah, Ikan di rumah kuning, Burung di rumah biru.',
      });
    },
  });
})();
