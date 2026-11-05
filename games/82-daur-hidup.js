/* 82 Daur Hidup Kacang. Urutkan Biji, Kecambah, Tunas, Berbunga, Berbuah (SVG tanpa wajah),
   lalu SD menjawab 3 kuis syarat tumbuh: air, cahaya, tanah.
   Dua tahap berlabel; SD naik ke kuis setelah urutan. */
(function () {
  const { h, svg, shuffle } = TI;

  const CSS = `
.play[data-game="daur-hidup"] .dh-svg { display: block; width: 72px; height: 72px; }
.play[data-game="daur-hidup"] .dh-why { margin: 0; font-size: 1rem; font-weight: 700; color: var(--muted); text-align: center; }
`;

  // Gambar tahap tumbuh: potongan sederhana tanpa wajah.
  function tahapNode(i) {
    const kanan = (x, y, s) => `<path d="M${x} ${y} C${x + s * 0.3} ${y - s * 0.6} ${x + s} ${y - s * 0.5} ${x + s * 1.3} ${y}" fill="#43b85a" stroke="#2f8f44" stroke-width="1.6"/>`;
    const daun = (x, y, s, flip) => flip
      ? `<g transform="translate(${2 * x} 0) scale(-1 1)">${kanan(x, y, s)}</g>`
      : kanan(x, y, s);
    let isi = '';
    if (i === 0) isi = '<ellipse cx="36" cy="52" rx="12" ry="9" fill="#c58a3c" stroke="#8a5a1c" stroke-width="2.5"/><rect x="8" y="58" width="56" height="8" rx="3" fill="#8a5a2b"/>';
    else if (i === 1) isi = '<path d="M36 62 L36 44" stroke="#3a9d4a" stroke-width="3.5" stroke-linecap="round"/>' + daun(36, 50, 10, false) + '<ellipse cx="36" cy="63" rx="7" ry="4" fill="#c58a3c"/>';
    else if (i === 2) isi = '<path d="M36 64 L36 26" stroke="#3a9d4a" stroke-width="4" stroke-linecap="round"/>' + daun(36, 44, 13, false) + daun(36, 44, 13, true) + daun(36, 32, 11, false);
    else if (i === 3) isi = '<path d="M36 64 L36 22" stroke="#3a9d4a" stroke-width="4" stroke-linecap="round"/>' + daun(36, 46, 13, false) + daun(36, 46, 13, true) + '<g><circle cx="36" cy="16" r="5" fill="#ffe14d" stroke="#e0b400" stroke-width="1.5"/><circle cx="29" cy="12" r="4.5" fill="#ffe14d" stroke="#e0b400" stroke-width="1.2"/><circle cx="43" cy="12" r="4.5" fill="#ffe14d" stroke="#e0b400" stroke-width="1.2"/><circle cx="31" cy="20" r="4.5" fill="#ffe14d" stroke="#e0b400" stroke-width="1.2"/><circle cx="41" cy="20" r="4.5" fill="#ffe14d" stroke="#e0b400" stroke-width="1.2"/><circle cx="36" cy="15" r="3.4" fill="#f08a1c"/></g>';
    else isi = '<path d="M36 64 L36 30" stroke="#3a9d4a" stroke-width="4" stroke-linecap="round"/>' + daun(36, 50, 13, false) + daun(36, 50, 13, true) + '<circle cx="28" cy="34" r="9" fill="#e5484d" stroke="#b3262b" stroke-width="2"/><circle cx="45" cy="38" r="9" fill="#e5484d" stroke="#b3262b" stroke-width="2"/><path d="M28 26 l3 -5 M45 30 l3 -5" stroke="#3fa34d" stroke-width="2.5" stroke-linecap="round"/>';
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 72 72');
    el.setAttribute('class', 'dh-svg');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = isi;
    return el;
  }

  const TAHAP = [
    { label: 'Biji', say: 'Biji' },
    { label: 'Kecambah', say: 'Kecambah' },
    { label: 'Tunas', say: 'Tunas' },
    { label: 'Berbunga', say: 'Berbunga' },
    { label: 'Berbuah', say: 'Berbuah' },
  ];

  const KUIS = [
    { q: 'Biji haus. Ia butuh apa untuk minum?', jawab: 'Air', opsi: ['Air', 'Permen', 'Batu'], icon: '💧' },
    { q: 'Tunas butuh apa dari langit pada pagi hari?', jawab: 'Cahaya matahari', opsi: ['Cahaya matahari', 'Hujan es', 'Asap'], icon: '☀️' },
    { q: 'Biji ditanam di mana supaya tumbuh?', jawab: 'Tanah', opsi: ['Tanah', 'Bantal', 'Ember kosong'], icon: '🟫' },
  ];

  TI.register({
    id: 'daur-hidup',
    title: 'Daur Hidup Kacang',
    cat: 'sains',
    icon: '🌾',
    desc: 'Urutkan biji sampai berbuah.',
    start(ctx) {
      TI.style('daur-hidup', CSS);
      return (async () => {
        ctx.ask('Tahap 1: urutkan gambar dari biji sampai berbuah. Ketuk yang paling muda dulu.');
        ctx.sfx('pop');
        await ctx.order({
          items: TAHAP.map((t, i) => ({ label: t.label, say: t.say, node: tahapNode(i) })),
          guide: ctx.isTK ? 'always' : 'after-wrong',
          onStep: (done, total) => ctx.progress(done, ctx.isTK ? total : total + KUIS.length),
        });
        if (!ctx.alive) return;
        if (ctx.isSD) {
          ctx.correct(null, { say: 'Bagus! Terus naik ke tahap 2: syarat tumbuh.' });
          for (let i = 0; i < KUIS.length && ctx.alive; i++) {
            const k = KUIS[i];
            ctx.progress(5 + i, 5 + KUIS.length);
            ctx.ask('Tahap 2: ' + k.q);
            ctx.el.append(h('p', { class: 'dh-why pop-in' }, k.icon));
            ctx.sfx('pop');
            await ctx.choose({ options: shuffle(k.opsi.slice()), answer: k.jawab, layout: 'is-col', speakLabel: true });
            if (ctx.alive) await ctx.sayWait(k.jawab + ' membuat tanaman tumbuh sehat.');
          }
        }
        if (!ctx.alive) return;
        ctx.progress(ctx.isTK ? 5 : 8, ctx.isTK ? 5 : 8);
        ctx.finish({ lesson: 'Biji tumbuh menjadi kecambah, tunas, bunga, lalu buah. Tanaman butuh air, cahaya matahari, dan tanah yang baik.' });
      })();
    },
  });
})();
