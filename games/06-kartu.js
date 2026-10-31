/* 06 Kartu Pasangan (memory game).
   TK: dek "Benda Islami", 6 pasang kembar, nama dibacakan saat kartu dibuka.
   SD: pilih dek (Kitab & Nabi, Malaikat & Tugasnya, Asmaul Husna), cocokkan nama dengan artinya. */
(function () {
  const { h, shuffle, sample } = TI;

  // ---------- data ----------
  const TK_KARTU = [
    { id: 'masjid', icon: '🕌', nama: 'Masjid' },
    { id: 'kabah', icon: '🕋', nama: "Ka'bah" },
    { id: 'quran', icon: '📖', nama: "Al-Qur'an" },
    { id: 'bulan', icon: '🌙', nama: 'Bulan sabit' },
    { id: 'doa', icon: '🤲', nama: 'Berdoa' },
    { id: 'wudhu', icon: '💧', nama: 'Air wudhu' },
  ];
  const LESSON_TK = "Masjid tempat kita shalat, Al-Qur'an kitab suci kita.";

  // Tiap pasangan: a = sisi nama, b = sisi arti/tugas. ar = teks Arab (hanya Asmaul Husna dari SPEC).
  const DEK = [
    {
      id: 'kitab', judul: 'Kitab & Nabi', icon: '📖', ket: 'Cocokkan kitab dengan nabinya', jumlah: 4,
      ask: 'Cocokkan kitab dengan nabi yang menerimanya!',
      pasangan: [
        { a: { main: 'Taurat' }, b: { main: 'Nabi Musa' } },
        { a: { main: 'Zabur' }, b: { main: 'Nabi Daud' } },
        { a: { main: 'Injil' }, b: { main: 'Nabi Isa' } },
        { a: { main: "Al-Qur'an" }, b: { main: 'Nabi Muhammad', small: "Shallallahu 'alaihi wa sallam" } },
      ],
      lesson: () => "Allah menurunkan 4 kitab: Taurat, Zabur, Injil, dan Al-Qur'an.",
    },
    {
      id: 'malaikat', judul: 'Malaikat & Tugasnya', icon: '✨', ket: 'Cocokkan malaikat dengan tugasnya', jumlah: 6,
      ask: 'Cocokkan malaikat dengan tugasnya!',
      pasangan: [
        { a: { main: 'Jibril' }, b: { main: 'Menyampaikan wahyu' } },
        { a: { main: 'Mikail' }, b: { main: 'Menurunkan hujan dan membagi rezeki' } },
        { a: { main: 'Israfil' }, b: { main: 'Meniup sangkakala' } },
        { a: { main: 'Izrail' }, b: { main: 'Mencabut nyawa' } },
        { a: { main: 'Munkar dan Nakir' }, b: { main: 'Bertanya di alam kubur' } },
        { a: { main: 'Raqib' }, b: { main: 'Mencatat amal baik' } },
        { a: { main: 'Atid' }, b: { main: 'Mencatat amal buruk' } },
        { a: { main: 'Malik' }, b: { main: 'Menjaga neraka' } },
        { a: { main: 'Ridwan' }, b: { main: 'Menjaga surga' } },
      ],
      lesson: (p) => 'Setiap malaikat punya tugas dari Allah. Contohnya ' + p[0].a.main + ': ' + p[0].b.main.toLowerCase() + '.',
    },
    {
      id: 'asmaul', judul: 'Asmaul Husna', icon: '🌟', ket: 'Cocokkan nama dengan artinya', jumlah: 6,
      ask: 'Cocokkan nama Allah yang indah dengan artinya!',
      pasangan: [
        { a: { main: 'Ar-Rahman', ar: 'الرحمن' }, b: { main: 'Maha Pengasih' } },
        { a: { main: 'Ar-Rahim', ar: 'الرحيم' }, b: { main: 'Maha Penyayang' } },
        { a: { main: 'Al-Malik', ar: 'الملك' }, b: { main: 'Maha Merajai' } },
        { a: { main: 'Al-Quddus', ar: 'القدوس' }, b: { main: 'Maha Suci' } },
        { a: { main: 'As-Salam', ar: 'السلام' }, b: { main: 'Maha Memberi Keselamatan' } },
        { a: { main: 'Al-Khaliq', ar: 'الخالق' }, b: { main: 'Maha Pencipta' } },
        { a: { main: "Al-'Alim", ar: 'العليم' }, b: { main: 'Maha Mengetahui' } },
        { a: { main: "As-Sami'", ar: 'السميع' }, b: { main: 'Maha Mendengar' } },
        { a: { main: 'Al-Bashir', ar: 'البصير' }, b: { main: 'Maha Melihat' } },
        { a: { main: 'Al-Ghaffar', ar: 'الغفار' }, b: { main: 'Maha Pengampun' } },
        { a: { main: 'Ar-Razzaq', ar: 'الرزاق' }, b: { main: 'Maha Pemberi Rezeki' } },
        { a: { main: 'Al-Karim', ar: 'الكريم' }, b: { main: 'Maha Mulia' } },
      ],
      lesson: (p) => 'Asmaul Husna adalah nama-nama Allah yang indah. Contohnya ' + p[0].a.main + ' artinya ' + p[0].b.main + '.',
    },
  ];

  // ---------- gaya ----------
  const CSS = `
    & .kt-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
    & .kt-status { margin: 0; }
    & .kt-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); gap: 10px; width: 100%; max-width: 660px; }
    & .kt-grid.is-lock { pointer-events: none; }
    & .kt-card {
      position: relative; display: block; padding: 0; margin: 0; border: 0; background: none;
      -webkit-appearance: none; appearance: none; cursor: pointer; border-radius: 18px;
      aspect-ratio: 1 / 1.05; perspective: 700px;
      transition: transform var(--dur-press) var(--ease-out);
    }
    & .kt-grid[data-cols="2"] .kt-card { aspect-ratio: 1.35 / 1; }
    & .kt-card:active:not([aria-disabled="true"]) { transform: scale(0.96); }
    & .kt-card[aria-disabled="true"] { cursor: default; }
    & .kt-card.is-done { animation: kt-yay var(--dur-ui-max) var(--ease-pop); }
    @keyframes kt-yay { 50% { transform: scale(1.06); } }
    & .kt-inner { position: absolute; inset: 0; display: block; transform-style: preserve-3d; transition: transform 250ms var(--ease-in-out); }
    & .kt-card.is-open .kt-inner { transform: rotateY(180deg); }
    & .kt-face {
      position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 3px; padding: 6px; border-radius: 18px; text-align: center; overflow: hidden;
      backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 5px 0 var(--shadow);
    }
    & .kt-back {
      color: #fff; font-size: 2.4rem; font-weight: 800;
      background:
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.28) 0 22%, transparent 23%),
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.13) 0 9px, transparent 9px 18px),
        linear-gradient(150deg, #1f8a5b, var(--c));
      border: 3px solid rgba(255, 255, 255, 0.55);
    }
    & .kt-front { transform: rotateY(180deg); background: #fff; border: 3px solid var(--line); font-weight: 800; }
    & .kt-front.is-twin { background: #fffdf5; border-color: #f2c94c; }
    & .kt-front.is-a { background: #e6f0ff; border-color: #2f6fed; color: #173a8a; }
    & .kt-front.is-b { background: #fff1d9; border-color: #ff9f1c; color: #7a4600; }
    & .kt-card.is-done .kt-front { border-color: var(--good); }
    & .kt-card.is-done .kt-front::after { content: "✓"; position: absolute; top: 3px; right: 8px; font-size: 1.05rem; color: var(--good); }
    & .kt-ic { font-size: 2.5rem; line-height: 1; }
    & .kt-main { font-size: 0.95rem; line-height: 1.15; overflow-wrap: break-word; max-width: 100%; }
    & .kt-ar { font-size: 1.3rem; line-height: 1.3; }
    & .kt-small { font-size: 0.66rem; line-height: 1.15; font-weight: 700; opacity: 0.8; }
    & .kt-grid[data-lv="sd"][data-cols="3"] .kt-face { padding: 4px; }
    & .kt-grid[data-lv="sd"][data-cols="3"] .kt-main { font-size: 0.9rem; }
    & .kt-grid[data-lv="sd"][data-cols="3"] .kt-main.is-panjang { font-size: 0.78rem; }
    & .kt-grid[data-lv="sd"][data-cols="3"] .kt-front.is-a .kt-main { font-size: 1rem; }
    & .kt-grid[data-cols="4"] .kt-ic { font-size: 3.2rem; }
    & .kt-grid[data-cols="4"] .kt-main { font-size: 1.12rem; }
    & .kt-grid[data-cols="4"] .kt-ar { font-size: 1.6rem; }
    & .kt-grid[data-cols="4"] .kt-small { font-size: 0.76rem; }
    & .kt-grid[data-cols="2"] .kt-main { font-size: 1.4rem; }
    & .kt-grid[data-cols="2"] .kt-ar { font-size: 1.9rem; }
    & .kt-grid[data-cols="2"] .kt-small { font-size: 0.86rem; }
    & .kt-decks { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 560px; }
    & .kt-deck { justify-content: flex-start; gap: 16px; width: 100%; min-height: 96px; text-align: left; }
    & .kt-deck-ic { display: grid; place-items: center; width: 64px; height: 64px; flex: none; border-radius: 18px; background: color-mix(in srgb, var(--c) 14%, #fff); font-size: 2.2rem; line-height: 1; }
    & .kt-deck-tx { display: flex; flex-direction: column; gap: 2px; }
    & .kt-deck-tx b { font-size: 1.3rem; }
    & .kt-deck-tx small { font-size: 0.95rem; font-weight: 700; color: var(--muted); }
    @media (prefers-reduced-motion: reduce) {
      & .kt-inner { transform: none !important; transition: none; }
      & .kt-face { backface-visibility: visible; -webkit-backface-visibility: visible; transition: opacity var(--dur-ui) var(--ease-out); }
      & .kt-front { transform: none; opacity: 0; }
      & .kt-back { opacity: 1; }
      & .kt-card.is-open .kt-front { opacity: 1; }
      & .kt-card.is-open .kt-back { opacity: 0; }
      & .kt-card.is-done { animation: none; }
    }
  `.replace(/&/g, '.play[data-game="kartu"]');

  // ---------- bantu ----------
  const sempit = () => window.innerWidth < 600;
  const kolom = (n) => (n <= 8 ? (sempit() ? 2 : 4) : (sempit() ? 3 : 4));

  // Susun kartu: TK = dua kartu kembar per benda, SD = sisi nama (a) dan sisi arti (b).
  function susunKartu(pasangan, tk) {
    const kartu = [];
    pasangan.forEach((p, i) => {
      if (tk) {
        for (let k = 0; k < 2; k++) kartu.push({ pair: i, sisi: 'twin', icon: p.icon, main: p.nama, say: p.nama });
      } else {
        for (const s of ['a', 'b']) {
          const c = p[s];
          kartu.push({ pair: i, sisi: s, main: c.main, ar: c.ar, small: c.small, say: c.main + (c.small ? ' ' + c.small : '') });
        }
      }
    });
    return shuffle(kartu);
  }

  function mukaKartu(c) {
    return h('span', { class: 'kt-face kt-front is-' + c.sisi },
      c.icon ? h('span', { class: 'kt-ic', 'aria-hidden': 'true' }, c.icon) : null,
      h('span', { class: 'kt-main' + (Math.max(...c.main.split(/\s+/).map((k) => k.length)) >= 11 ? ' is-panjang' : '') }, c.main),
      c.ar ? h('span', { class: 'kt-ar ti-arabic', lang: 'ar' }, c.ar) : null,
      c.small ? h('span', { class: 'kt-small' }, c.small) : null);
  }

  // Satu permainan: ctx sudah bersih, data = daftar kartu, jumlah = banyak pasangan.
  function main(ctx, { data, jumlah, ask, lesson, ucapPasangan }) {
    ctx.clear();
    ctx.ask(ask);
    ctx.progress(0, jumlah);

    const status = h('p', { class: 'ti-label kt-status', 'aria-live': 'polite' });
    const grid = h('div', { class: 'kt-grid', 'data-lv': ctx.level });
    const wrap = h('div', { class: 'kt-wrap' }, status, grid);
    const info = (n) => { status.textContent = 'Pasangan ketemu: ' + n + ' dari ' + jumlah; };
    info(0);

    const atur = () => { const k = kolom(data.length); grid.style.setProperty('--cols', k); grid.dataset.cols = String(k); };
    atur();
    ctx.on(window, 'resize', atur);

    let pertama = null, kunci = false, ketemu = 0, salah = 0;

    const kartu = data.map((c, i) => {
      const btn = h('button', { type: 'button', class: 'kt-card pop-in', style: '--i:' + i, 'aria-label': 'Kartu tertutup nomor ' + (i + 1) },
        h('span', { class: 'kt-inner' },
          h('span', { class: 'kt-face kt-back', 'aria-hidden': 'true' }, '?'),
          mukaKartu(c)));
      const k = { c, btn, buka: false, selesai: false, no: i + 1 };
      btn.addEventListener('click', () => ketuk(k));
      grid.append(btn);
      return k;
    });
    ctx.el.append(wrap);

    function buka(k) {
      k.buka = true;
      k.btn.classList.add('is-open');
      k.btn.setAttribute('aria-disabled', 'true');
      k.btn.setAttribute('aria-label', k.c.say);
      ctx.sfx('flip');
      ctx.say(k.c.say);
    }
    function tutup(k) {
      k.buka = false;
      k.btn.classList.remove('is-open');
      k.btn.removeAttribute('aria-disabled');
      k.btn.setAttribute('aria-label', 'Kartu tertutup nomor ' + k.no);
    }
    const kuncikan = (ya) => { kunci = ya; grid.classList.toggle('is-lock', ya); };

    async function ketuk(k) {
      if (kunci || k.selesai || k.buka) return;
      buka(k);
      if (!pertama) { pertama = k; return; }
      const a = pertama, b = k;
      pertama = null;
      kuncikan(true);
      if (a.c.pair === b.c.pair) {
        await ctx.wait(330); // biarkan balik kartu selesai dulu
        for (const x of [a, b]) { x.selesai = true; x.btn.classList.add('is-done'); }
        ketemu++;
        ctx.progress(ketemu, jumlah);
        info(ketemu);
        ctx.sfx('benar');
        ctx.say(ucapPasangan(a.c, b.c));
        if (ketemu === jumlah) {
          await ctx.wait(1300);
          // Bintang dihitung dari salah buka, bukan ctx.wrong (terlalu sering untuk game ini).
          ctx.finish({ stars: salah <= jumlah ? 3 : salah <= jumlah * 2 ? 2 : 1, lesson, total: jumlah });
          return;
        }
        await ctx.wait(300);
      } else {
        salah++;
        await ctx.wait(ctx.isTK ? 1100 : 950);
        tutup(a); tutup(b);
      }
      kuncikan(false);
    }
  }

  TI.register({
    id: 'kartu',
    title: 'Kartu Pasangan',
    cat: 'islam',
    icon: '🎴',
    desc: 'Balik kartu dan temukan pasangannya.',
    async start(ctx) {
      TI.style('kartu', CSS);

      if (ctx.isTK) {
        main(ctx, {
          data: susunKartu(TK_KARTU, true),
          jumlah: TK_KARTU.length,
          ask: 'Cari dua kartu yang sama! Ketuk kartunya.',
          lesson: LESSON_TK,
          ucapPasangan: (a) => 'Cocok! ' + a.say + '.',
        });
        return;
      }

      // SD: pilih dek dulu.
      ctx.ask('Pilih kartu yang mau kamu mainkan!');
      const dek = await new Promise((selesai) => {
        const daftar = h('div', { class: 'kt-decks' }, DEK.map((d, i) => h('button', {
          type: 'button', class: 'choice kt-deck pop-in', style: '--i:' + i,
          on: { click: () => { ctx.sfx('tap'); selesai(d); } },
        },
        h('span', { class: 'kt-deck-ic', 'aria-hidden': 'true' }, d.icon),
        h('span', { class: 'kt-deck-tx' }, h('b', null, d.judul), h('small', null, d.ket)))));
        ctx.el.append(daftar);
      });
      if (!ctx.alive) return;
      const pasangan = sample(dek.pasangan, dek.jumlah);
      main(ctx, {
        data: susunKartu(pasangan, false),
        jumlah: dek.jumlah,
        ask: dek.ask,
        lesson: dek.lesson(pasangan),
        ucapPasangan: (a, b) => {
          const p = pasangan[a.pair];
          return p.a.main + ', ' + p.b.main + (p.b.small ? ' ' + p.b.small : '') + '. Cocok!';
        },
      });
    },
  });
})();
