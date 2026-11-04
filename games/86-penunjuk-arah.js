/* 86 Penunjuk Arah. Kompas SVG (utara di atas): ketuk tombol arah yang benar,
   jarum ikut berputar. TK: 4 arah pokok. SD: 8 arah + fakta matahari terbit. */
(function () {
  const { h, shuffle } = TI;

  const CSS = `
.play[data-game="penunjuk-arah"] .pa-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.play[data-game="penunjuk-arah"] .pa-compass { width: min(78vw, 260px); }
.play[data-game="penunjuk-arah"] .pa-needle { transform: rotate(var(--ang, 0deg)); transform-box: view-box; transform-origin: 100px 100px; transition: transform 250ms var(--ease-out); }
.play[data-game="penunjuk-arah"] .pa-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: min(100%, 440px); }
.play[data-game="penunjuk-arah"] .pa-btn { flex: 1 1 100px; max-width: 160px; min-height: 72px; font-size: 1.1rem; }
.play[data-game="penunjuk-arah"] .pa-btn.is-show { outline: 4px solid var(--good); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="penunjuk-arah"] .pa-needle { transition: none; }
}
`;

  const ARAH4 = [
    { id: 'utara', label: 'Utara', deg: 0 },
    { id: 'timur', label: 'Timur', deg: 90 },
    { id: 'selatan', label: 'Selatan', deg: 180 },
    { id: 'barat', label: 'Barat', deg: 270 },
  ];
  const ARAH8 = [
    { id: 'utara', label: 'Utara', deg: 0 },
    { id: 'timur-laut', label: 'Timur Laut', deg: 45 },
    { id: 'timur', label: 'Timur', deg: 90 },
    { id: 'tenggara', label: 'Tenggara', deg: 135 },
    { id: 'selatan', label: 'Selatan', deg: 180 },
    { id: 'barat-daya', label: 'Barat Daya', deg: 225 },
    { id: 'barat', label: 'Barat', deg: 270 },
    { id: 'barat-laut', label: 'Barat Laut', deg: 315 },
  ];

  function kompasSVG(arah) {
    const NS = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', '0 0 200 200');
    el.setAttribute('class', 'pa-compass');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Kompas');
    let titik = '';
    arah.forEach((a) => {
      const r = (a.deg * Math.PI) / 180;
      const x = 100 + Math.sin(r) * 78, y = 100 - Math.cos(r) * 78;
      const utama = a.deg % 90 === 0;
      titik += '<text x="' + x.toFixed(1) + '" y="' + (y + 5).toFixed(1) + '" text-anchor="middle" font-size="' + (utama ? 17 : 12) + '" font-weight="800" fill="' + (a.id === 'utara' ? '#d6342c' : '#495057') + '">' + a.label[0] + '</text>';
    });
    el.innerHTML = '<circle cx="100" cy="100" r="94" fill="#fffdf5" stroke="#c9a85e" stroke-width="5"/>'
      + '<circle cx="100" cy="100" r="78" fill="none" stroke="#e3d9c2" stroke-width="2"/>'
      + titik
      + '<g class="pa-needle"><polygon points="100,28 110,100 100,112 90,100" fill="#d6342c"/><polygon points="100,172 110,100 100,112 90,100" fill="#9aa3b5"/></g>'
      + '<circle cx="100" cy="100" r="10" fill="#495057"/><circle cx="100" cy="100" r="4" fill="#fff"/>';
    return el;
  }

  TI.register({
    id: 'penunjuk-arah',
    title: 'Penunjuk Arah',
    cat: 'sains',
    icon: '🌐',
    desc: 'Utara, selatan, timur, barat. Tunjuk yang benar.',
    start(ctx) {
      TI.style('penunjuk-arah', CSS);
      const arah = ctx.isTK ? ARAH4 : ARAH8;
      const ronde = ctx.isTK ? 4 : 8;
      const target = shuffle(arah.slice()).slice(0, ronde);
      return (async () => {
        let fakta = false;
        for (let k = 0; k < target.length && ctx.alive; k++) {
          ctx.progress(k, target.length);
          await soal(target[k], k);
        }
        if (ctx.isSD && ctx.alive) {
          ctx.note('Matahari terbit dari timur dan terbenam di barat.', { title: 'Fakta' });
          fakta = true;
          await ctx.sayWait('Matahari terbit dari timur dan terbenam di barat.');
        }
        void fakta;
        if (!ctx.alive) return;
        ctx.progress(target.length, target.length);
        ctx.finish({ lesson: 'Utara selalu di atas pada kompas. Timur adalah tempat matahari terbit.' });
      })();

      function soal(t, k) {
        return new Promise((selesai) => {
          ctx.clear();
          ctx.ask((k === 0 ? 'Lihat kompas. Jarum merah menunjuk utara. ' : '') + 'Tunjuk arah ' + t.label + '.');
          const wrap = h('div', { class: 'pa-wrap' });
          const needleHost = kompasSVG(arah);
          const needle = needleHost.querySelector('.pa-needle');
          const grid = h('div', { class: 'pa-grid' });
          wrap.append(needleHost, grid);
          ctx.el.append(wrap);
          let gagal = 0, tutup = false;
          const putarKe = (deg) => needle.style.setProperty('--ang', deg + 'deg');
          arah.forEach((a, i) => {
            const btn = h('button', { type: 'button', class: 'choice pa-btn pop-in', style: '--i:' + i, 'aria-label': 'Arah ' + a.label }, a.label);
            btn.addEventListener('click', async () => {
              if (tutup || btn.disabled) return;
              putarKe(a.deg);
              if (a.id === t.id) {
                tutup = true; btn.disabled = true;
                await ctx.correct(btn, { say: 'Betul! Itu arah ' + t.label + '.' });
                selesai();
              } else {
                gagal++;
                await ctx.wrong(btn);
                if (gagal >= 3) {
                  tutup = true;
                  putarKe(t.deg);
                  const benar = [...grid.children].find((x) => x.textContent === t.label);
                  if (benar) benar.classList.add('is-show');
                  await ctx.sayWait('Arah ' + t.label + ' ada di sana. Lihat jarumnya.');
                  selesai();
                }
              }
            });
            grid.append(btn);
          });
        });
      }
    },
  });
})();
