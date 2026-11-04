/* 87 Siang atau Malam. Pilah kegiatan ke keranjang SIANG vs MALAM (ctx.sort),
   lalu putar bumi mini dengan slider untuk melihat siang dan malam berganti. */
(function () {
  const { h, shuffle } = TI;

  const CSS = `
.play[data-game="siang-malam"] .sm-emoji { font-size: 2.6rem; line-height: 1; }
.play[data-game="siang-malam"] .sm-board { display: flex; flex-direction: column; align-items: center; gap: 10px; width: min(100%, 420px); }
.play[data-game="siang-malam"] .sm-board svg { width: 100%; height: auto; }
.play[data-game="siang-malam"] .sm-cap { font-weight: 800; min-height: 1.6em; text-align: center; }
.play[data-game="siang-malam"] .sm-row { display: flex; gap: 10px; width: 100%; }
.play[data-game="siang-malam"] .sm-row .ti-btn { flex: 1 1 0; min-height: 72px; }
`;

  const KEGIATAN = [
    { label: 'Pergi ke sekolah', icon: '🏫', bin: 'siang', why: 'Sekolah dimulai pagi hari saat matahari bersinar.' },
    { label: 'Bermain layangan', icon: '🪁', bin: 'siang', why: 'Layangan dimainkan sore hari yang terang.' },
    { label: 'Makan siang', icon: '🍚', bin: 'siang', why: 'Makan siang saat matahari tinggi.' },
    { label: 'Bermain bola', icon: '⚽', bin: 'siang', why: 'Bermain bola paling enak saat hari terang.' },
    { label: 'Menjemur baju', icon: '👕', bin: 'siang', why: 'Baju kering karena panas matahari siang.' },
    { label: 'Tidur malam', icon: '🛏️', bin: 'malam', why: 'Malam hari gelap, waktunya tidur.' },
    { label: 'Makan sahur', icon: '🍽️', bin: 'malam', why: 'Sahur dimakan sebelum fajar, saat masih malam.' },
    { label: 'Melihat bintang', icon: '⭐', bin: 'malam', why: 'Bintang hanya terlihat saat langit malam gelap.' },
    { label: 'Makan malam', icon: '🍲', bin: 'malam', why: 'Makan malam setelah matahari terbenam.' },
    { label: 'Membaca sebelum tidur', icon: '📖', bin: 'malam', why: 'Membaca sebelum tidur saat malam tiba.' },
  ];
  const BINS = [
    { id: 'siang', label: 'Siang', icon: '☀️' },
    { id: 'malam', label: 'Malam', icon: '🌙' },
  ];

  TI.register({
    id: 'siang-malam',
    title: 'Siang atau Malam',
    cat: 'sains',
    icon: '🌗',
    desc: 'Kapan waktunya? Pilah kegiatanmu.',
    start(ctx) {
      TI.style('siang-malam', CSS);
      const items = shuffle(ctx.isTK ? KEGIATAN.slice(0, 6).map((k) => ({ ...k })) : KEGIATAN.map((k) => ({ ...k })));
      // Pastikan campur siang dan malam.
      if (!items.some((x) => x.bin === 'siang')) items[0] = { ...KEGIATAN[0] };
      return (async () => {
        ctx.ask('Kegiatan ini waktunya kapan? Ketuk keranjang Siang atau Malam.');
        await ctx.sort({
          items: items.map((k) => ({
            label: k.label, bin: k.bin,
            node: h('div', { class: 'sm-emoji', 'aria-hidden': 'true' }, k.icon),
            why: ctx.isTK ? undefined : k.why,
          })),
          bins: BINS,
          onStep: (done, total) => ctx.progress(done, total + 1),
        });
        if (!ctx.alive) return;
        await putarBumi(ctx, items.length);
        if (!ctx.alive) return;
        ctx.progress(items.length + 1, items.length + 1);
        ctx.finish({ lesson: 'Siang hari matahari bersinar, malam hari waktunya istirahat. Bumi berputar sehingga ada siang dan malam.' });
      })();

      async function putarBumi(ctx, basis) {
        ctx.progress(basis, basis + 1);
        ctx.clear();
        ctx.ask('Geser untuk memutar bumi. Lihat kotamu terang atau gelap.');
        const NS = 'http://www.w3.org/2000/svg';
        const svgEl = document.createElementNS(NS, 'svg');
        svgEl.setAttribute('viewBox', '0 0 300 170');
        svgEl.setAttribute('role', 'img');
        svgEl.setAttribute('aria-label', 'Bumi kecil: sisi terang dan sisi gelap');
        svgEl.innerHTML = '<rect width="300" height="170" fill="#0a1030"/>'
          + '<g><circle cx="52" cy="40" r="22" fill="#ffd23f"/><circle cx="250" cy="40" r="16" fill="#f4f1de"/><circle cx="244" cy="35" r="13" fill="#0a1030"/></g>'
          + '<g class="sm-spin"><circle cx="150" cy="95" r="46" fill="#2f8fe0"/><path d="M150 49 A46 46 0 0 1 150 141 Z" fill="#12325e"/><path d="M120 80 Q135 70 150 78 Q165 86 160 100 Q150 112 135 106 Q122 100 120 80 Z" fill="#4caf6d"/><circle cx="150" cy="95" r="46" fill="none" stroke="#fff" stroke-width="3"/><circle class="sm-kota" cx="150" cy="62" r="6" fill="#ffd23f" stroke="#7a4d00" stroke-width="2"/></g>'
          + '<text x="150" y="162" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" class="sm-teks">Kotamu: SIANG</text>';
        const board = h('div', { class: 'sm-board' }, svgEl);
        const cap = h('p', { class: 'sm-cap', 'aria-live': 'polite' }, 'Kotamu terang: siang hari.');
        const slider = h('input', { type: 'range', class: 'ti-slider', min: 0, max: 360, step: 5, value: 0, 'aria-label': 'Putar bumi' });
        const lanjut = h('button', { type: 'button', class: 'ti-btn' }, 'Lanjut ➜');
        const spin = svgEl.querySelector('.sm-spin');
        const teks = svgEl.querySelector('.sm-teks');
        const kota = svgEl.querySelector('.sm-kota');
        slider.addEventListener('input', () => {
          const deg = +slider.value;
          spin.style.transition = 'transform 150ms var(--ease-out)';
          spin.style.transform = 'rotate(' + deg + 'deg)';
          spin.style.transformOrigin = '150px 95px';
          // Kota di atas (sudut 0): terang saat sisi kanan (siang) menghadap... sederhanakan: 4 kuadran.
          const siang = (deg % 360) < 180;
          teks.textContent = siang ? 'Kotamu: SIANG' : 'Kotamu: MALAM';
          cap.textContent = siang ? 'Kotamu terang: siang hari.' : 'Kotamu gelap: malam hari.';
          kota.setAttribute('fill', siang ? '#ffd23f' : '#9aa3b5');
        });
        ctx.el.append(board, cap, slider, lanjut);
        await new Promise((res) => lanjut.addEventListener('click', () => { ctx.sfx('tap'); res(); }, { once: true }));
      }
    },
  });
})();
