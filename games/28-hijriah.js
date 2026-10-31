/* 28 Kereta Bulan Hijriah.
   Lokomotif SVG (tampak samping, tanpa wajah) di atas rel. Gerbong berwarna bertuliskan nama bulan menunggu di
   stasiun. Ketuk gerbong berikutnya sesuai urutan: gerbong terbang dan tersambung di belakang kereta, kamera
   bergeser supaya gerbong terakhir selalu terlihat. Setelah lengkap, kereta berjalan keluar layar. */
(function () {
  const { h, shuffle, sample } = TI;

  // Urutan bulan persis dari SPEC.
  const BULAN = [
    { n: 1, nama: 'Muharram', c: '#e5484d' },
    { n: 2, nama: 'Safar', c: '#f08c00' },
    { n: 3, nama: 'Rabiul Awal', c: '#e0a100' },
    { n: 4, nama: 'Rabiul Akhir', c: '#74b52b' },
    { n: 5, nama: 'Jumadil Awal', c: '#2fb36d' },
    { n: 6, nama: 'Jumadil Akhir', c: '#14a3b8' },
    { n: 7, nama: 'Rajab', c: '#2f8be6' },
    { n: 8, nama: "Sya'ban", c: '#5b6ee1' },
    { n: 9, nama: 'Ramadhan', c: '#8e4fd9' },
    { n: 10, nama: 'Syawal', c: '#c157e8' },
    { n: 11, nama: "Dzulqa'dah", c: '#e8559c' },
    { n: 12, nama: 'Dzulhijjah', c: '#b5651d' },
  ];
  const NAMA = BULAN.map((b) => b.nama);

  // Fakta persis dari SPEC (tiap fakta jadi satu soal "bulan apa?").
  const FAKTA = [
    { q: 'Tahun baru Islam tanggal 1 bulan?', a: 'Muharram', fakta: 'Tahun baru Islam tanggal 1 Muharram.' },
    { q: "Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di bulan?", a: 'Rabiul Awal', fakta: "Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di bulan Rabiul Awal." },
    { q: 'Puasa wajib dilakukan di bulan?', a: 'Ramadhan', fakta: 'Puasa wajib di bulan Ramadhan.' },
    { q: 'Idul Fitri tanggal 1 bulan?', a: 'Syawal', fakta: 'Idul Fitri tanggal 1 Syawal.' },
    { q: 'Idul Adha tanggal 10 bulan?', a: 'Dzulhijjah', fakta: 'Idul Adha tanggal 10 Dzulhijjah.' },
    { q: 'Ibadah haji dilaksanakan di bulan?', a: 'Dzulhijjah', fakta: 'Ibadah haji di bulan Dzulhijjah.' },
  ];

  const CW = 106, LOCO_W = 138, PAD = 10; // lebar gerbong, lokomotif, jarak kiri kereta (px)

  // Gerbong SVG: badan berwarna, papan nama putih, dua roda. viewBox 110 x 90.
  function gerbong(b) {
    const dua = b.nama.includes(' ');
    const [a, c] = dua ? b.nama.split(' ') : [b.nama, ''];
    const fs = dua ? 15 : b.nama.length <= 7 ? 17 : b.nama.length <= 8 ? 15 : 14;
    const teks = dua
      ? `<text x="55" y="42" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#2b2d42" font-family="inherit">${a}</text><text x="55" y="59" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#2b2d42" font-family="inherit">${c}</text>`
      : `<text x="55" y="52" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="800" fill="#2b2d42" font-family="inherit">${a}</text>`;
    return `<svg viewBox="0 0 110 90" aria-hidden="true" focusable="false">
      <rect x="0" y="62" width="11" height="5" rx="2" fill="#5b5f73"/><rect x="99" y="62" width="11" height="5" rx="2" fill="#5b5f73"/>
      <rect x="6" y="12" width="98" height="62" rx="10" fill="${b.c}" stroke="rgba(0,0,0,0.28)" stroke-width="3"/>
      <rect x="9" y="15" width="92" height="12" rx="6" fill="rgba(255,255,255,0.3)"/>
      <rect x="7.5" y="64" width="95" height="9" fill="rgba(0,0,0,0.2)"/>
      <rect x="12" y="29" width="86" height="36" rx="8" fill="#fff" fill-opacity="0.95"/>
      ${teks}
      <circle cx="29" cy="80" r="9.5" fill="#394055"/><circle cx="29" cy="80" r="3.6" fill="#c3c9d9"/>
      <circle cx="81" cy="80" r="9.5" fill="#394055"/><circle cx="81" cy="80" r="3.6" fill="#c3c9d9"/></svg>`;
  }

  // Lokomotif uap menghadap kiri, tanpa wajah. viewBox 150 x 100.
  const LOKO = `<svg viewBox="0 0 150 100" aria-hidden="true" focusable="false">
    <path d="M2 88L20 88L20 72Z" fill="#4a4f66"/>
    <rect x="16" y="80" width="130" height="9" rx="3" fill="#3a3f55"/>
    <rect x="18" y="36" width="80" height="44" rx="16" fill="#e5484d" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
    <rect x="22" y="42" width="72" height="9" rx="4.5" fill="rgba(255,255,255,0.28)"/>
    <rect x="40" y="36" width="5" height="44" fill="#f2b632"/><rect x="66" y="36" width="5" height="44" fill="#f2b632"/>
    <rect x="12" y="42" width="14" height="32" rx="6" fill="#4a4f66"/>
    <path d="M24 36V28H38L40 36Z" fill="#ffd93b" stroke="#c98a12" stroke-width="2" stroke-linejoin="round"/>
    <path d="M34 36V26H30L27 18H53L50 26H46V36Z" fill="#3a3f55"/>
    <path d="M56 36V33A10 8 0 0 1 76 33V36Z" fill="#f2b632" stroke="#c98a12" stroke-width="2"/>
    <rect x="96" y="22" width="46" height="58" rx="6" fill="#b92f35" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
    <rect x="92" y="14" width="54" height="10" rx="4" fill="#3a3f55"/>
    <rect x="106" y="32" width="26" height="24" rx="4" fill="#bfe6ff" stroke="#f2b632" stroke-width="3"/>
    <path d="M119 32V56M106 44H132" stroke="#fff" stroke-width="2"/>
    <rect x="142" y="84" width="8" height="5" rx="2" fill="#5b5f73"/>
    <path d="M36 88H66" stroke="#cfd5e3" stroke-width="4" stroke-linecap="round"/>
    <circle cx="36" cy="88" r="12" fill="#2f3347"/><circle cx="36" cy="88" r="4.5" fill="#cfd5e3"/>
    <circle cx="66" cy="88" r="12" fill="#2f3347"/><circle cx="66" cy="88" r="4.5" fill="#cfd5e3"/>
    <circle cx="112" cy="88" r="12" fill="#2f3347"/><circle cx="112" cy="88" r="4.5" fill="#cfd5e3"/>
  </svg>`;

  const BUKIT = `<svg viewBox="0 0 1500 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 160V96Q150 30 300 90T600 80T900 92T1200 70T1500 96V160Z" fill="#bfe8c9"/>
    <path d="M0 160V122Q200 74 380 118T760 112T1120 104T1500 122V160Z" fill="#a1dcb0"/>
    <g fill="#fff" opacity="0.9"><ellipse cx="180" cy="34" rx="46" ry="14"/><ellipse cx="210" cy="26" rx="26" ry="14"/><ellipse cx="620" cy="46" rx="40" ry="12"/><ellipse cx="646" cy="38" rx="22" ry="12"/><ellipse cx="1010" cy="30" rx="48" ry="14"/><ellipse cx="1040" cy="22" rx="26" ry="13"/><ellipse cx="1350" cy="50" rx="40" ry="12"/></g>
  </svg>`;

  const CSS = `
    & .hj-wrap { width: 100%; max-width: 860px; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none; }
    & .hj-rail { flex: none; min-height: 0; height: 146px; background: linear-gradient(#bfe6ff, #eaf7ff 70%); }
    & .hj-hills { position: absolute; left: 0; bottom: 30px; width: 1500px; height: 130px; transition: transform 480ms var(--ease-in-out); } /* motion-ok: kamera mengikuti ujung kereta, benda yang pindah di layar */
    & .hj-hills svg { display: block; width: 100%; height: 100%; }
    & .hj-ground { position: absolute; left: 0; bottom: 0; width: 3200px; height: 36px; transition: transform 480ms var(--ease-in-out); /* motion-ok: kamera mengikuti ujung kereta */
      background:
        linear-gradient(#7a8194, #7a8194) 0 8px / 100% 4px no-repeat,
        repeating-linear-gradient(90deg, #8a6a4a 0 10px, transparent 10px 28px) 0 12px / 100% 9px no-repeat,
        linear-gradient(#d9ccaa, #cdbd95); }
    & .hj-train { position: absolute; left: ${PAD}px; bottom: 28px; height: ${Math.round(LOCO_W * 100 / 150)}px; display: flex; align-items: flex-end; will-change: transform; transition: transform 480ms var(--ease-in-out); } /* motion-ok: kereta bergeser agar gerbong terakhir terlihat */
    & .hj-loko { flex: none; width: ${LOCO_W}px; line-height: 0; }
    & .hj-loko svg, & .hj-car svg, & .hj-card svg { display: block; width: 100%; height: auto; }
    & .hj-car { position: relative; flex: none; width: ${CW}px; line-height: 0; }
    & .hj-num { position: absolute; top: -4px; left: 8px; z-index: 2; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%;
      background: #fff; border: 3px solid var(--mc, var(--c)); font-size: 0.85rem; font-weight: 800; line-height: 1; color: #2b2d42; animation: ti-pop var(--dur-ui-max) var(--ease-out); }
    & .hj-puff { position: absolute; left: 22px; top: -4px; width: 18px; height: 18px; border-radius: 50%; background: #fff; opacity: 0; pointer-events: none;
      animation: hj-puff 1200ms var(--ease-out) forwards; } /* motion-ok: kepulan asap hiasan, naik pelan lalu hilang */
    @keyframes hj-puff { from { opacity: 0.9; transform: translate(0, 0) scale(0.6); } to { opacity: 0; transform: translate(-34px, -38px) scale(1.8); } }
    & .hj-cap { margin: 0; min-height: 1.5em; font-size: 1.1rem; font-weight: 800; text-align: center; }
    & .hj-station { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; width: 100%; padding: 14px 10px 16px; border-radius: var(--radius);
      background: #fff; box-shadow: 0 5px 0 var(--shadow); border-bottom: 10px solid #c9b88e; }
    & .hj-st-title { width: 100%; margin: 0 0 -2px; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); text-align: center; }
    & .hj-card { flex: none; width: ${CW}px; padding: 0; border: 0; background: transparent; cursor: pointer; line-height: 0; border-radius: 14px;
      transition: transform var(--dur-press) var(--ease-out); }
    & .hj-card:active:not(:disabled) { transform: scale(0.96); }
    & .hj-card.is-wrong { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .hj-card.is-hint { outline: 4px solid var(--sun); outline-offset: 2px; animation: ti-hint 900ms var(--ease-in-out) 3; } /* motion-ok: petunjuk berkedip lembut, muncul jarang */
    & .hj-fly { position: fixed; z-index: 40; width: ${CW}px; margin: 0; line-height: 0; pointer-events: none; will-change: transform; filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.22)); }
    & .hj-opsi { font-size: 1.35rem; }
    @media (max-width: 560px) {
      & .hj-rail { height: 146px; }
      & .hj-station { gap: 8px; padding: 12px 6px 14px; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .hj-puff { display: none; }
    }
  `.replace(/&/g, '.play[data-game="hijriah"]');

  // Satu babak kereta. idx = indeks bulan (0-11) yang harus disambung berurutan.
  async function babakKereta(ctx, { idx, guide, ucapSelesai, i: urut, tot }) {
    const daftar = idx.map((i) => BULAN[i]);
    const reduced = TI.reduced();
    const rail = h('div', { class: 'ti-scene hj-rail' });
    const hills = h('div', { class: 'hj-hills', html: BUKIT });
    const ground = h('div', { class: 'hj-ground' });
    const train = h('div', { class: 'hj-train' }, h('div', { class: 'hj-loko', html: LOKO }));
    rail.append(hills, ground, train);
    const cap = h('p', { class: 'hj-cap', 'aria-live': 'polite' }, ' ');
    const station = h('div', { class: 'hj-station' }, h('p', { class: 'hj-st-title' }, '🚉 Stasiun'));
    const wrap = h('div', { class: 'hj-wrap' }, rail, cap, station);
    ctx.el.append(wrap);

    let acak = shuffle(daftar);
    for (let g = 0; g < 20 && acak.length > 2 && acak.every((b, i) => b === daftar[i]); g++) acak = shuffle(daftar);
    const kartu = new Map();
    acak.forEach((b, i) => {
      const btn = h('button', { type: 'button', class: 'hj-card pop-in', style: '--i:' + i, 'aria-label': 'Gerbong ' + b.nama, html: gerbong(b) });
      kartu.set(b, btn);
      station.append(btn);
    });

    let pasang = 0, shift = 0, salahDisini = 0, sibuk = true;
    const tanyaBerikut = (terakhir) => {
      const b = daftar[pasang];
      const depan = terakhir ? terakhir.nama + ', bulan ke-' + terakhir.n + '. ' : '';
      if (guide) ctx.ask('Sambungkan gerbong ' + b.nama + '!', { say: depan + 'Sambungkan gerbong ' + b.nama + '!' });
      else ctx.ask('Sambungkan gerbong bulan ke-' + b.n + '!', { say: depan + 'Sambungkan gerbong bulan ke-' + b.n + '!' });
    };

    // Asap dari cerobong.
    const berhenti = reduced ? () => {} : ctx.every(700, () => {
      if (!train.isConnected) return;
      const p = h('span', { class: 'hj-puff', 'aria-hidden': 'true' });
      train.append(p);
      ctx.after(1250, () => p.remove());
    });

    // Kereta datang dari kanan.
    if (!reduced) {
      const w = rail.clientWidth || 360;
      train.style.transition = 'none';
      train.style.transform = 'translateX(' + (w + 40) + 'px)';
      void train.offsetWidth;
      /* motion-ok: kereta masuk stasiun, gerak sekali di awal babak */
      train.style.transition = 'transform 800ms var(--ease-out)';
      train.style.transform = 'translateX(0px)';
      ctx.sfx('whoosh');
      await ctx.wait(820);
      train.style.transition = '';
    }
    sibuk = false;
    tanyaBerikut();

    function geser(baru) {
      shift = baru;
      train.style.transform = 'translateX(' + -baru + 'px)';
      ground.style.transform = 'translateX(' + -baru + 'px)';
      hills.style.transform = 'translateX(' + -Math.round(baru * 0.4) + 'px)';
    }

    // Gerbong terbang dari stasiun dan tersambung di belakang kereta.
    async function sambung(b, btn) {
      sibuk = true;
      const car = h('div', { class: 'hj-car', html: gerbong(b), style: '--mc:' + b.c }, h('span', { class: 'hj-num', 'aria-hidden': 'true' }, b.n));
      car.style.visibility = 'hidden';
      train.append(car);
      const lebar = rail.clientWidth;
      const butuh = PAD + LOCO_W + (pasang + 1) * CW + 14;
      const geserBaru = Math.max(0, butuh - lebar);
      const tr = train.getBoundingClientRect(), rr = rail.getBoundingClientRect();
      const akhirX = rr.left + PAD - geserBaru + car.offsetLeft, akhirY = tr.top + car.offsetTop;
      const mulai = btn.getBoundingClientRect();
      const terbang = h('div', { class: 'hj-fly', html: gerbong(b), style: 'left:' + mulai.left + 'px;top:' + mulai.top + 'px' });
      wrap.append(terbang);
      btn.style.visibility = 'hidden';
      btn.disabled = true;
      ctx.sfx('whoosh');
      if (reduced) {
        terbang.remove();
        car.style.visibility = '';
        geser(geserBaru);
        await ctx.wait(250);
      } else {
        void terbang.offsetWidth;
        /* motion-ok: gerbong terbang ke ujung kereta (gerak permainan), transform saja */
        terbang.style.transition = 'transform 480ms var(--ease-in-out)';
        terbang.style.transform = 'translate(' + (akhirX - mulai.left) + 'px,' + (akhirY - mulai.top) + 'px)';
        geser(geserBaru);
        await ctx.wait(500);
        car.style.visibility = '';
        terbang.remove();
      }
      pasang++; salahDisini = 0;
      ctx.sfx('klik');
      cap.textContent = b.nama + ', bulan ke-' + b.n;
      ctx.progress(urut + pasang / daftar.length, tot);
    }

    await new Promise((resolve) => {
      daftar.forEach((b) => {
        const btn = kartu.get(b);
        btn.addEventListener('click', async () => {
          if (sibuk || btn.disabled) return;
          const benar = daftar[pasang];
          if (b === benar) {
            await sambung(b, btn);
            if (pasang < daftar.length) { sibuk = false; tanyaBerikut(b); } else resolve();
            return;
          }
          salahDisini++;
          sibuk = true;
          if (salahDisini >= 3) {
            // Tiga kali salah: gerbong yang benar tersambung sendiri.
            await ctx.wrong(btn, { say: 'Ini gerbongnya, ' + benar.nama + '.', min: 700 });
            await sambung(benar, kartu.get(benar));
            if (pasang < daftar.length) { sibuk = false; tanyaBerikut(benar); } else resolve();
            return;
          }
          await ctx.wrong(btn, { say: guide ? 'Bukan. Cari gerbong ' + benar.nama + '.' : 'Belum tepat. Coba lagi ya.' });
          if (salahDisini >= 2) {
            kartu.get(benar).classList.add('is-hint');
            ctx.say('Petunjuk: bulan ke-' + benar.n + ' adalah ' + benar.nama);
          }
          sibuk = false;
        });
      });
    });

    // Lengkap: kereta berjalan keluar layar.
    kartu.forEach((btn) => btn.classList.remove('is-hint'));
    station.hidden = true;
    ctx.sfx('benar');
    ctx.ask('Kereta sudah lengkap!', { say: ucapSelesai });
    if (reduced) {
      train.style.transition = 'opacity 400ms ease';
      train.style.opacity = '0';
      await ctx.wait(1000);
    } else {
      const jauh = shift + rail.clientWidth + LOCO_W + daftar.length * CW + 60;
      ctx.sfx('whoosh');
      /* motion-ok: kereta berjalan keluar layar 1,5 detik sebagai perayaan */
      train.style.transition = 'transform 1500ms var(--ease-in-out)';
      train.style.transform = 'translateX(' + -jauh + 'px)';
      await ctx.wait(1750);
    }
    berhenti();
  }

  const opsiBulan = (benar, lain) => TI.shuffle([benar, ...lain]).map((v) => ({ label: v, value: v }));

  TI.register({
    id: 'hijriah',
    title: 'Kereta Bulan Hijriah',
    cat: 'islam',
    icon: '🚂',
    desc: 'Sambungkan gerbong bulan Hijriah sesuai urutan.',
    start(ctx) {
      TI.style('hijriah', CSS);
      const soal = [];
      if (ctx.isTK) {
        soal.push((i, tot) => babakKereta(ctx, { i, tot, idx: [7, 8, 9], guide: true, ucapSelesai: 'Kereta lengkap! Hebat!' }));
        soal.push(async () => {
          ctx.ask('Bulan puasa adalah bulan?');
          await ctx.choose({ options: opsiBulan('Ramadhan', ['Syawal', 'Muharram']), answer: 'Ramadhan', layout: 'is-col' });
        });
        soal.push(async () => {
          ctx.ask('Idul Fitri di bulan?');
          await ctx.choose({ options: opsiBulan('Syawal', ['Ramadhan', 'Rajab']), answer: 'Syawal', layout: 'is-col' });
        });
        soal.push(async () => {
          ctx.ask('Ada berapa bulan dalam setahun?');
          await ctx.choose({ options: TI.shuffle([12, 7, 30]).map((n) => ({ label: String(n), value: n, cls: 'is-big' })), answer: 12 });
        });
      } else {
        soal.push(async (i, tot) => {
          await babakKereta(ctx, { i, tot, idx: [0, 1, 2, 3, 4, 5], guide: false, ucapSelesai: 'Gerbong satu sampai enam lengkap!' });
          ctx.note("Kalender Hijriah dimulai dari hijrah Nabi Muhammad Shallallahu 'alaihi wa sallam dari Makkah ke Madinah.", { title: 'Tahukah kamu?' });
          await ctx.next();
        });
        soal.push(async (i, tot) => {
          await babakKereta(ctx, { i, tot, idx: [6, 7, 8, 9, 10, 11], guide: false, ucapSelesai: 'Gerbong tujuh sampai dua belas lengkap!' });
          ctx.note('Satu tahun Hijriah ada 12 bulan, dari Muharram sampai Dzulhijjah.', { title: 'Tahukah kamu?' });
          await ctx.next();
        });
        sample(FAKTA, 4).forEach((f) => soal.push(async () => {
          ctx.ask(f.q);
          const lain = sample(NAMA.filter((x) => x !== f.a), 2);
          await ctx.choose({ options: opsiBulan(f.a, lain), answer: f.a });
          ctx.note(f.fakta, { title: 'Ingat' });
          await ctx.next();
        }));
      }
      return ctx.series(soal, (jalankan, i) => jalankan(i, soal.length), {
        lesson: 'Kalender Hijriah punya 12 bulan, dimulai dari Muharram dan diakhiri Dzulhijjah.',
      });
    },
  });
})();
