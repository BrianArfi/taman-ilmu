/* 12 Kenal Bentuk. Semua bentuk digambar sendiri dengan SVG (tanpa wajah, tanpa emoji hewan/orang).
   SD urut nama, sisi, definisi, benda nyata (gampang dulu). */
(function () {
  const { h, svg, rand, pick, shuffle, sample, numChoices } = TI;

  // [warna isi, warna garis]
  const WARNA = [
    ['#ff6b6b', '#c92a2a'], ['#ffb703', '#c77d00'], ['#4dabf7', '#1c6fb8'],
    ['#51cf66', '#2b8a3e'], ['#b197fc', '#6f48c8'], ['#ff8fc7', '#c2417f'],
  ];

  // Titik sudut segi-n beraturan di kotak 100x100.
  const titik = (n, r, mulai, cy = 50) => Array.from({ length: n }, (_, i) => {
    const a = mulai + (i * 2 * Math.PI) / n;
    return (50 + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
  }).join(' ');
  const titikBintang = () => Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 20 : 46;
    return (50 + r * Math.cos(a)).toFixed(1) + ',' + (54 + r * Math.sin(a)).toFixed(1);
  }).join(' ');
  const poligon = (points) => (a) => svg('polygon', { points, ...a });
  const kotak = (x, y, w, t) => (a) => svg('rect', { x, y, width: w, height: t, rx: 6, ...a });

  const BENTUK = {
    lingkaran: { nama: 'Lingkaran', gambar: (a) => svg('circle', { cx: 50, cy: 50, r: 41, ...a }) },
    segitiga: { nama: 'Segitiga', gambar: poligon('50,10 93,86 7,86') },
    persegi: { nama: 'Persegi', gambar: kotak(15, 15, 70, 70) },
    'persegi panjang': { nama: 'Persegi panjang', gambar: kotak(6, 28, 88, 44) },
    'belah ketupat': { nama: 'Belah ketupat', gambar: poligon('50,6 94,50 50,94 6,50') },
    trapesium: { nama: 'Trapesium', gambar: poligon('27,24 73,24 95,78 5,78') },
    'segi lima': { nama: 'Segi lima', gambar: poligon(titik(5, 44, -Math.PI / 2, 54)) },
    'segi enam': { nama: 'Segi enam', gambar: poligon(titik(6, 44, 0)) },
    oval: { nama: 'Oval', gambar: (a) => svg('ellipse', { cx: 50, cy: 50, rx: 45, ry: 29, ...a }) },
    bintang: { nama: 'Bintang', gambar: poligon(titikBintang()) },
    'setengah lingkaran': { nama: 'Setengah lingkaran', gambar: (a) => svg('path', { d: 'M8 70 A42 42 0 0 1 92 70 Z', ...a }) },
  };
  const SEMUA = Object.keys(BENTUK);
  const TK = ['lingkaran', 'segitiga', 'persegi', 'persegi panjang', 'bintang', 'oval'];
  const SISI = { segitiga: 3, persegi: 4, 'persegi panjang': 4, 'belah ketupat': 4, trapesium: 4, 'segi lima': 5, 'segi enam': 6 };

  function bentuk(kunci, warna, cls, putar) {
    const [isi, garis] = warna;
    const g = BENTUK[kunci].gambar({ fill: isi, stroke: garis, 'stroke-width': 5, 'stroke-linejoin': 'round' });
    return svg('svg', { viewBox: '0 0 100 100', class: 'bt-shape' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true', focusable: 'false' },
      putar ? svg('g', { transform: 'rotate(' + putar + ' 50 50)' }, g) : g);
  }

  // Papan tulis sederhana (benda nyata berbentuk persegi panjang).
  function papanTulis() {
    return svg('svg', { viewBox: '0 0 160 110', class: 'bt-papan', 'aria-hidden': 'true', focusable: 'false' },
      svg('rect', { x: 6, y: 6, width: 148, height: 84, rx: 8, fill: '#2f7d4f', stroke: '#b7791f', 'stroke-width': 8 }),
      svg('path', { d: 'M24 34 H80 M24 54 H118 M24 74 H96', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: '0.85' }),
      svg('rect', { x: 20, y: 92, width: 120, height: 9, rx: 4, fill: '#b7791f' }),
      svg('rect', { x: 100, y: 88, width: 16, height: 5, rx: 2, fill: '#fff' }));
  }

  const BENDA = {
    roda: { tanya: 'Roda sepeda berbentuk?', gambar: () => h('p', { class: 'ti-big', 'aria-hidden': 'true' }, '🚲'), jawab: 'Lingkaran', lain: ['Segitiga', 'Persegi'] },
    papan: { tanya: 'Papan tulis biasanya berbentuk?', gambar: papanTulis, jawab: 'Persegi panjang', lain: ['Lingkaran', 'Segitiga'] },
    kubah: { tanya: 'Kubah masjid berbentuk seperti?', gambar: () => h('p', { class: 'ti-big', 'aria-hidden': 'true' }, '🕌'), jawab: 'Setengah bola', lain: ['Kubus', 'Tabung'] },
  };

  const CSS = `
.play[data-game="bentuk"] .bt-shape { display: block; width: 84px; height: 84px; overflow: visible; }
.play[data-game="bentuk"] .choice.is-big { padding: 10px; }
.play[data-game="bentuk"] .choice.is-big .bt-shape { width: 88px; height: 88px; }
.play[data-game="bentuk"] .bt-card { display: grid; place-items: center; width: auto; min-width: 200px; padding: 16px 30px; }
.play[data-game="bentuk"] .bt-card .bt-shape { width: 150px; height: 150px; }
.play[data-game="bentuk"] .bt-card .bt-papan { width: 190px; height: auto; display: block; }
.play[data-game="bentuk"] .bt-card .ti-big { font-size: 5.4rem; }
.play[data-game="bentuk"] .bt-count { gap: 14px; }
.play[data-game="bentuk"] .bt-prog { display: inline-flex; gap: 8px; }
.play[data-game="bentuk"] .bt-prog i {
  display: block; width: 24px; height: 24px; border-radius: 50%; border: 3px solid var(--c); background: #fff;
  transition: background-color var(--dur-ui) ease, border-color var(--dur-ui) ease, transform var(--dur-ui) var(--ease-out);
}
.play[data-game="bentuk"] .bt-prog i.is-on { background: var(--good); border-color: var(--good); transform: scale(1.12); }
.play[data-game="bentuk"] .bt-scene { display: grid; place-items: center; flex: none; background: linear-gradient(160deg, #fff4d6, #e4f4ff); min-height: 320px; padding: 12px 10px; }
.play[data-game="bentuk"] .bt-field { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; width: 100%; max-width: 480px; }
.play[data-game="bentuk"] .bt-piece {
  display: grid; place-items: center; width: calc(33.333% - 4px); min-height: 96px; padding: 4px; border: 0; border-radius: 22px;
  background: rgba(255, 255, 255, 0.55); cursor: pointer;
  transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, opacity var(--dur-ui) ease;
}
.play[data-game="bentuk"] .bt-piece .bt-shape { width: 78px; height: 78px; }
.play[data-game="bentuk"] .bt-piece:active:not(:disabled) { transform: scale(0.95); }
.play[data-game="bentuk"] .bt-piece:disabled { opacity: 0.35; cursor: default; }
.play[data-game="bentuk"] .bt-piece[aria-disabled="true"] { cursor: default; }
.play[data-game="bentuk"] .bt-piece.is-found { background: var(--good-bg); box-shadow: inset 0 0 0 4px var(--good); }
.play[data-game="bentuk"] .bt-piece.is-wrong { background: var(--bad-bg); animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
@media (max-width: 560px) {
  .play[data-game="bentuk"] .choice.is-big .bt-shape { width: 66px; height: 66px; }
  .play[data-game="bentuk"] .bt-card .bt-shape { width: 128px; height: 128px; }
  .play[data-game="bentuk"] .bt-piece { min-height: 92px; }
  .play[data-game="bentuk"] .bt-piece .bt-shape { width: 68px; height: 68px; }
}
@media (min-width: 800px) {
  .play[data-game="bentuk"] .bt-piece .bt-shape { width: 92px; height: 92px; }
  .play[data-game="bentuk"] .bt-piece { min-height: 110px; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="bentuk"] .bt-piece.is-wrong { animation: none !important; }
}`;

  // "Mana lingkaran?" tiga pilihan gambar.
  async function manaBentuk(ctx, kunci) {
    const nama = BENTUK[kunci].nama;
    const kunciOpsi = shuffle([kunci, ...sample(TK.filter((k) => k !== kunci), 2)]);
    const warna = sample(WARNA, 3);
    ctx.ask('Mana ' + nama.toLowerCase() + '?');
    await ctx.choose({
      options: kunciOpsi.map((k, i) => ({
        node: bentuk(k, warna[i]), value: k, say: BENTUK[k].nama, aria: BENTUK[k].nama, cls: 'is-big',
      })),
      answer: kunci,
      speakLabel: true,
    });
  }

  // "Cari semua segitiga!" bentuk berserakan, ketuk semua yang dimaksud.
  function cariSemua(ctx, kunci) {
    const nama = BENTUK[kunci].nama.toLowerCase();
    const banyak = rand(2, 3), total = rand(6, 9);
    const lain = shuffle(TK.filter((k) => k !== kunci));
    const daftar = shuffle([...Array(banyak).fill(kunci), ...Array.from({ length: total - banyak }, (_, i) => lain[i % lain.length])]);
    ctx.ask('Cari semua ' + nama + '!');

    const bulat = Array.from({ length: banyak }, () => h('i'));
    const info = h('span', { class: 'ti-label', 'aria-live': 'polite' }, 'Ketemu 0 dari ' + banyak);
    const lapangan = h('div', { class: 'bt-field' });
    ctx.el.append(
      h('div', { class: 'ti-row bt-count' }, h('span', { class: 'bt-prog', 'aria-hidden': 'true' }, bulat), info),
      h('div', { class: 'ti-scene bt-scene' }, lapangan));

    return new Promise((resolve) => {
      let ketemu = 0, salah = 0, selesai = false;
      const potong = [];
      daftar.forEach((k, i) => {
        const el = bentuk(k, pick(WARNA), '', rand(-14, 14));
        el.style.transform = 'translate(' + rand(-9, 9) + 'px,' + rand(-9, 9) + 'px) scale(' + (rand(88, 112) / 100) + ')';
        const btn = h('button', { type: 'button', class: 'bt-piece pop-in', style: '--i:' + i, 'aria-label': BENTUK[k].nama, 'data-tap': true }, el);
        btn._k = k;
        potong.push(btn);
        btn.addEventListener('click', async () => {
          if (selesai || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
          if (k === kunci) {
            btn.setAttribute('aria-disabled', 'true');
            btn.classList.add('is-found');
            bulat[ketemu].classList.add('is-on');
            ketemu++;
            info.textContent = 'Ketemu ' + ketemu + ' dari ' + banyak;
            if (ketemu === banyak) {
              selesai = true;
              await ctx.correct(null, { say: 'Hebat! Semua ' + nama + ' sudah ketemu!', min: 900 });
              resolve();
            } else {
              ctx.sfx('benar');
              ctx.say(BENTUK[k].nama + '!');
            }
          } else {
            btn.disabled = true;
            salah++;
            if (salah >= 3) {
              // Sudah tiga kali salah: tunjukkan semua yang benar lalu lanjut.
              selesai = true;
              ctx.wrong(btn, { say: false });
              potong.forEach((p) => { if (p._k === kunci && !p.classList.contains('is-found')) { p.classList.add('is-found'); p.setAttribute('aria-disabled', 'true'); } });
              await ctx.sayWait('Ini dia semua ' + nama + 'nya. Ayo lanjut!');
              resolve();
            } else {
              ctx.wrong(btn, { say: 'Itu ' + BENTUK[k].nama.toLowerCase() + '. Cari ' + nama + ' ya.' });
            }
          }
        });
        lapangan.append(btn);
      });
    });
  }

  const kartu = (isi) => h('div', { class: 'ti-card bt-card pop-in' }, isi);

  async function soalSD(ctx, s) {
    if (s.tipe === 'nama') {
      ctx.ask('Bentuk apa ini?');
      ctx.el.append(kartu(bentuk(s.k, pick(WARNA))));
      const opsi = shuffle([s.k, ...sample(SEMUA.filter((k) => k !== s.k), 3)]).map((k) => ({ label: BENTUK[k].nama, value: k }));
      await ctx.choose({ options: opsi, answer: s.k, layout: 'is-grid2' });
    } else if (s.tipe === 'sisi') {
      const n = SISI[s.k];
      ctx.ask('Berapa sisi ' + BENTUK[s.k].nama.toLowerCase() + '?');
      ctx.el.append(kartu(bentuk(s.k, pick(WARNA))));
      await ctx.choose({ options: numChoices(n, 4, 2, 9), answer: n });
    } else if (s.tipe === 'persegi') {
      ctx.ask('Bangun apa yang keempat sisinya sama panjang dan keempat sudutnya siku-siku?');
      const kunci = ['persegi', 'persegi panjang', 'belah ketupat', 'trapesium'];
      const warna = sample(WARNA, 4);
      await ctx.choose({
        options: shuffle(kunci.map((k, i) => ({ node: h('span', { class: 'bt-opsi' }, bentuk(k, warna[i]), h('small', null, BENTUK[k].nama)), value: k, aria: BENTUK[k].nama, cls: 'is-big' }))),
        answer: 'persegi',
        layout: 'is-grid2',
      });
    } else {
      const b = BENDA[s.id];
      ctx.ask(b.tanya);
      ctx.el.append(kartu(b.gambar()));
      await ctx.choose({ options: shuffle([b.jawab, ...b.lain]), answer: b.jawab });
    }
  }

  TI.register({
    id: 'bentuk',
    title: 'Kenal Bentuk',
    cat: 'mat',
    icon: '🔺',
    desc: 'Kenali lingkaran, segitiga, persegi, dan bentuk lainnya.',
    start(ctx) {
      TI.style('bentuk', CSS + `
.play[data-game="bentuk"] .bt-opsi { display: grid; justify-items: center; gap: 4px; }
.play[data-game="bentuk"] .bt-opsi small { font-size: 0.82rem; font-weight: 800; line-height: 1.1; }
.play[data-game="bentuk"] .bt-opsi .bt-shape { width: 70px; height: 70px; }`);

      if (ctx.isTK) {
        const target = sample(TK, 5).map((k) => ({ tipe: 'mana', k }));
        const cari = ['segitiga', 'segitiga', 'segitiga'].map((k) => ({ tipe: 'cari', k }));
        let ke = 0;
        ctx.series([...target, ...cari], async (s) => {
          ke++;
          if (ke === 4) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          if (s.tipe === 'mana') await manaBentuk(ctx, s.k);
          else await cariSemua(ctx, s.k);
        }, { lesson: 'Segitiga punya 3 sisi, persegi 4 sisi sama panjang, lingkaran tidak punya sudut.' });
      } else {
        const daftar = [
          ...sample(SEMUA, 2).map((k) => ({ tipe: 'nama', k })),
          { tipe: 'sisi', k: 'segi enam' },
          { tipe: 'sisi', k: pick(['segitiga', 'segi lima', 'trapesium', 'belah ketupat']) },
          { tipe: 'persegi' },
          { tipe: 'benda', id: 'roda' }, { tipe: 'benda', id: 'papan' }, { tipe: 'benda', id: 'kubah' },
        ];
        const sulit = (s) => (s.tipe === 'nama' ? 0 : s.tipe === 'sisi' ? 1 : s.tipe === 'persegi' ? 2 : 3);
        daftar.forEach((s) => { s.sulit = sulit(s); });
        daftar.sort((a, b) => a.sulit - b.sulit); // gampang dulu
        let ke = 0;
        ctx.series(daftar, (s) => { ke++; if (ke === 4) ctx.correct(null, { say: 'Bagus! Terus naik ke yang sulit.' }); return soalSD(ctx, s); }, {
          lesson: 'Segitiga punya 3 sisi, persegi 4 sisi sama panjang, lingkaran tidak punya sudut.',
        });
      }
    },
  });
})();
