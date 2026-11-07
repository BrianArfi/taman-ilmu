/* 04 Shalat 5 Waktu.
   Gambar langit dibuat sendiri (SVG, tanpa wajah): matahari, bulan, bintang, awan, siluet masjid.
   TK: 3 soal "waktu shalat apa?" + 3 soal rakaat. SD: 8 soal acak (langit, rakaat, urutan, hitung). */
(function () {
  const { h, shuffle, sample, optionsFrom, numChoices } = TI;

  const SHALAT = [
    { id: 'subuh', nama: 'Subuh', rakaat: 2 },
    { id: 'zuhur', nama: 'Zuhur', rakaat: 4 },
    { id: 'ashar', nama: 'Ashar', rakaat: 4 },
    { id: 'maghrib', nama: 'Maghrib', rakaat: 3 },
    { id: 'isya', nama: 'Isya', rakaat: 4 },
  ];
  const byId = (id) => SHALAT.find((s) => s.id === id);

  const LESSON = 'Shalat wajib ada 5 waktu: Subuh, Zuhur, Ashar, Maghrib, Isya. Jumlahnya 17 rakaat sehari.';

  // ---------- gambar langit ----------
  // Warna langit dari atas ke bawah, warna tanah/siluet masjid, dan warna cahaya di ufuk.
  const LANGIT = {
    subuh: { stops: [[0, '#0f1a47'], [0.5, '#34468f'], [0.82, '#b97db5'], [1, '#ffb0b5']], tanah: '#0c1233', cahaya: '#ff9bb0' },
    zuhur: { stops: [[0, '#2c8be6'], [1, '#a9ddff']], tanah: '#27497c', cahaya: '#fff6c0' },
    ashar: { stops: [[0, '#58a4e4'], [0.6, '#f6e2a0'], [1, '#ffc66e']], tanah: '#5b3d2e', cahaya: '#ffe29a' },
    maghrib: { stops: [[0, '#352c6b'], [0.5, '#c4456a'], [0.85, '#ff8a3d'], [1, '#ffc35c']], tanah: '#27102b', cahaya: '#ffb066' },
    isya: { stops: [[0, '#060a22'], [1, '#1c2866']], tanah: '#04071a', cahaya: '#b8c4ff' },
  };
  // Posisi bintang (x, y) pada kotak 100 x 60.
  const BINTANG = [[8, 6], [20, 14], [33, 5], [47, 12], [60, 6], [66, 14], [86, 7], [94, 18], [14, 24], [41, 22], [66, 27], [82, 30], [63, 22], [92, 34]];
  const kilau = (x, y, r, o) => '<path d="M' + x + ' ' + (y - r) + 'L' + (x + r * 0.28) + ' ' + (y - r * 0.28) + 'L' + (x + r) + ' ' + y + 'L' + (x + r * 0.28) + ' ' + (y + r * 0.28) +
    'L' + x + ' ' + (y + r) + 'L' + (x - r * 0.28) + ' ' + (y + r * 0.28) + 'L' + (x - r) + ' ' + y + 'L' + (x - r * 0.28) + ' ' + (y - r * 0.28) + 'Z" fill="#fff" opacity="' + o + '"/>';
  const bintang = (n, o) => BINTANG.slice(0, n).map(([x, y], i) => (i % 3 === 0 ? kilau(x, y, 1.7, o) : '<circle cx="' + x + '" cy="' + y + '" r="0.7" fill="#fff" opacity="' + o + '"/>')).join('');
  const awan = (x, y, s, w) => '<g fill="#fff" opacity="' + w + '"><ellipse cx="' + x + '" cy="' + y + '" rx="' + 9 * s + '" ry="' + 3 * s + '"/><ellipse cx="' + (x + 5 * s) + '" cy="' + (y - 2 * s) + '" rx="' + 5.5 * s + '" ry="' + 3.4 * s + '"/><ellipse cx="' + (x - 4 * s) + '" cy="' + (y - 1.4 * s) + '" rx="' + 4.5 * s + '" ry="' + 2.8 * s + '"/></g>';
  const masjid = (c) => '<g fill="' + c + '">' +
    '<rect x="0" y="51" width="100" height="9"/><rect x="14" y="43" width="36" height="8"/>' +
    '<path d="M20 43A12 12 0 0 1 44 43Z"/><rect x="31.6" y="25.5" width="0.8" height="5.5"/><circle cx="32" cy="25" r="1.2"/>' +
    '<rect x="6" y="30" width="4.4" height="21"/><path d="M5.4 30L8.2 23L11 30Z"/><circle cx="8.2" cy="22" r="0.9"/>' +
    '<rect x="53.6" y="30" width="4.4" height="21"/><path d="M53 30L55.8 23L58.6 30Z"/><circle cx="55.8" cy="22" r="0.9"/></g>';
  const matahari = (x, y, r, warna, gs) => '<circle cx="' + x + '" cy="' + y + '" r="' + r * 2.1 + '" fill="url(#' + gs + ')"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + warna + '"/>';
  const bulan = '<circle cx="78" cy="17" r="11" fill="#fff" opacity="0.12"/><g transform="translate(70.5 8.5) scale(0.85)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#ffe27a"/></g>';

  let hitung = 0; // id gradien harus unik per gambar
  function isiLangit(id, gs) {
    if (id === 'subuh') return '<circle cx="82" cy="52" r="26" fill="url(#' + gs + ')"/>' + bintang(6, 0.65);
    if (id === 'zuhur') return matahari(78, 13, 6.5, '#ffd93b', gs) + awan(26, 15, 1, 0.95) + awan(66, 36, 0.7, 0.85);
    if (id === 'ashar') return matahari(80, 30, 6.5, '#ffb830', gs) + awan(30, 12, 0.9, 0.9) + awan(72, 12, 0.6, 0.8);
    if (id === 'maghrib') return matahari(80, 51, 9, '#ff7a3d', gs) + awan(66, 20, 0.7, 0.35);
    return bintang(14, 0.95) + bulan;
  }
  // Satu gambar langit. kelas: 'is-kecil' untuk versi mini.
  function langit(id, kelas) {
    const g = LANGIT[id], n = ++hitung, gb = 'skg' + n, gs = 'sks' + n;
    const stops = g.stops.map(([o, c]) => '<stop offset="' + o + '" stop-color="' + c + '"/>').join('');
    const svg = '<svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + gb + '" x1="0" y1="0" x2="0" y2="1">' + stops + '</linearGradient>' +
      '<radialGradient id="' + gs + '"><stop offset="0" stop-color="' + g.cahaya + '" stop-opacity="0.85"/><stop offset="1" stop-color="' + g.cahaya + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="100" height="60" fill="url(#' + gb + ')"/>' + isiLangit(id, gs) + masjid(g.tanah) + '</svg>';
    return h('span', { class: 'sk' + (kelas ? ' ' + kelas : ''), role: 'img', 'aria-label': 'Gambar langit', html: svg });
  }
  // Langit mini + nama di bawahnya (untuk soal hitung).
  const kecil = (s) => h('span', { class: 'sk-item' }, langit(s.id, 'is-kecil'), h('span', { class: 'sk-lab' }, s.nama));

  const CSS = `
    & .sk { display: block; width: 100%; aspect-ratio: 5 / 3; border-radius: 16px; overflow: hidden; background: #1c2866; }
    & .sk svg { display: block; width: 100%; height: 100%; }
    & .sk-card { width: min(100%, 440px); padding: 8px; }
    & .sk.is-kecil { width: 56px; border-radius: 9px; }
    & .sk-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    & .sk-lab { font-size: 0.78rem; font-weight: 800; line-height: 1; }
    & .sk-baris { width: min(100%, 440px); display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; padding: 12px; }
    & .sk-plus { font-size: 2rem; font-weight: 800; color: var(--c); line-height: 1; }
    & .choice.sk-pilih { padding: 6px; min-width: 0; min-height: 0; }
    & .choice.sk-pilih .sk { border-radius: 14px; }
    & .rk-angka { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    & .rk-angka b { font-size: 2.4rem; line-height: 1; }
    & .ti-piece .sk { width: 100px; border-radius: 10px; }
    & .ti-slot .sk { width: 56px; border-radius: 8px; }
    @media (min-width: 561px) {
      & .ti-piece { flex: 0 0 auto; width: 168px; }
    }
    @media (max-width: 560px) {
      & .ti-choices:not(.is-col):not(.is-grid2) .choice:not(.is-big) { min-width: 76px; }
      & .ti-order { gap: 12px; }
      & .ti-track { gap: 6px; }
      & .ti-slot { min-width: 0; padding: 4px 8px 4px 4px; gap: 4px; }
      & .ti-slot .sk { width: 44px; }
      & .ti-pool { gap: 8px; }
      & .ti-piece { min-width: 0; flex: 1 1 calc(50% - 8px); max-width: calc(50% - 4px); padding: 8px; }
      & .ti-piece .sk { width: 100%; }
    }
  `.replace(/&/g, '.play[data-game="shalat"]');

  // Pilihan angka: angka besar + titik-titik.
  const angka = (n) => h('span', { class: 'rk-angka' }, h('b', null, String(n)), TI.dots(n));

  // ---------- jenis soal ----------
  // Tampilkan langit, pilih nama shalatnya.
  async function langitKeNama(ctx, s, nOpsi) {
    ctx.ask('Ini waktu shalat apa?');
    ctx.el.append(h('div', { class: 'ti-card sk-card pop-in' }, langit(s.id)));
    await ctx.choose({
      options: optionsFrom(s, SHALAT, nOpsi).map((x) => ({ label: x.nama, value: x.id })),
      answer: s.id,
      layout: ctx.isTK ? 'is-col' : 'is-grid2',
    });
  }
  // Sebut nama shalat, pilih gambar langitnya (SD).
  async function namaKeLangit(ctx, s) {
    ctx.ask('Mana langit waktu shalat ' + s.nama + '?');
    const opsi = optionsFrom(s, SHALAT, 4);
    await ctx.choose({
      options: opsi.map((x, i) => ({ node: langit(x.id), value: x.id, aria: 'Gambar langit ' + (i + 1), cls: 'sk-pilih' })),
      answer: s.id,
      layout: 'is-grid2',
    });
  }
  // Berapa rakaat?
  async function soalRakaat(ctx, s) {
    ctx.ask('Shalat ' + s.nama + ' berapa rakaat?');
    ctx.el.append(h('div', { class: 'ti-card sk-card pop-in' }, langit(s.id)));
    if (ctx.isTK) {
      await ctx.choose({
        options: [2, 3, 4].map((n) => ({ node: angka(n), value: n, say: String(n), aria: n + ' rakaat', cls: 'is-big' })),
        answer: s.rakaat,
      });
    } else {
      await ctx.choose({ options: [2, 3, 4, 5], answer: s.rakaat });
    }
  }
  // Urutkan 5 shalat dari pagi (SD).
  async function urutkan(ctx) {
    ctx.ask('Urutkan shalat wajib dari pagi sampai malam!');
    await ctx.order({
      items: SHALAT.map((s) => ({ label: s.nama, node: langit(s.id), say: s.nama })),
      guide: 'after-wrong',
      label: 'Shalat',
    });
  }
  // Soal hitung rakaat (SD). ids = shalat yang ditampilkan.
  async function soalHitung(ctx, teks, ucap, ids, jawab, min, max, tambah = true) {
    ctx.ask(teks, { say: ucap });
    const isi = [];
    ids.forEach((id, i) => { if (i && tambah) isi.push(h('span', { class: 'sk-plus', 'aria-hidden': 'true' }, '+')); isi.push(kecil(byId(id))); });
    ctx.el.append(h('div', { class: 'ti-card sk-baris pop-in' }, isi)); ctx.sfx('pop');
    await ctx.choose({ options: numChoices(jawab, 4, min, max).sort((a, b) => a - b), answer: jawab });
  }

  TI.register({
    id: 'shalat',
    title: 'Shalat 5 Waktu',
    cat: 'islam',
    icon: '🕌',
    desc: 'Kenali langit tiap waktu shalat dan jumlah rakaatnya.',
    start(ctx) {
      TI.style('shalat', CSS);
      let soal;
      if (ctx.isTK) {
        // 3 soal gambar langit + 3 soal rakaat (Subuh, Maghrib, dan satu shalat 4 rakaat).
        const empat = sample(SHALAT.filter((s) => s.rakaat === 4), 1);
        const rakaat = shuffle([byId('subuh'), byId('maghrib'), ...empat]);
        soal = [
          ...sample(SHALAT, 3).map((s) => () => langitKeNama(ctx, s, 3)),
          ...rakaat.map((s) => () => soalRakaat(ctx, s)),
        ];
      } else {
        const [r1, r2] = sample(SHALAT, 2);
        const [l1, l2] = sample(SHALAT, 2);
        soal = [ // urut gampang dulu: kenali, hitung, lalu urutkan
          () => langitKeNama(ctx, l1, 4),
          () => namaKeLangit(ctx, l2),
          () => soalRakaat(ctx, r1),
          () => soalRakaat(ctx, r2),
          () => soalHitung(ctx, 'Rakaat Subuh + Maghrib = ?', 'Rakaat Subuh ditambah Maghrib sama dengan berapa?', ['subuh', 'maghrib'], 5, 3, 10),
          () => soalHitung(ctx, 'Rakaat Zuhur + Ashar = ?', 'Rakaat Zuhur ditambah Ashar sama dengan berapa?', ['zuhur', 'ashar'], 8, 5, 12),
          () => soalHitung(ctx, 'Berapa jumlah rakaat shalat wajib dalam sehari?', null, SHALAT.map((s) => s.id), 17, 13, 22, false),
          () => urutkan(ctx),
        ];
      }
      return ctx.series(soal, (jalankan, i) => { if (i === 3) ctx.correct(null, { say: ctx.isTK ? 'Bagus! Setengah jalan!' : 'Bagus! Terus naik ke yang sulit.' }); ctx.sfx('pop'); const m0 = ctx.mistakes; return jalankan().then(() => { const salah = ctx.mistakes - m0; if (salah >= 3) { ctx.el.append(h('p', { class: 'ti-label' }, 'Kamu salah ' + salah + ' kali, tidak apa. Ingat-ingat lagi ya!')); ctx.say('Ingat-ingat lagi ya!'); } }); }, { lesson: LESSON });
    },
  });
})();
