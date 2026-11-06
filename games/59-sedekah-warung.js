/* 59 Warung Sedekah. Beli jajan dengan uang pas (pola 14-warung.js,
   barang dan harga beda), lalu sisihkan sedekah sekitar 10 persen.
   TK: harga kecil. SD: harga besar + kembalian. */
(function () {
  const { h, rand, pick, shuffle, sample, rupiah } = TI;

  const SAT = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const kata = (n) => (n < 12 ? SAT[n] : n < 20 ? SAT[n - 10] + ' belas' : SAT[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SAT[n % 10] : ''));
  function ucapRp(n) {
    const ribu = Math.floor(n / 1000), sisa = n % 1000, bagian = [];
    if (ribu) bagian.push(ribu === 1 ? 'seribu' : kata(ribu) + ' ribu');
    if (sisa === 500) bagian.push('lima ratus');
    return (bagian.join(' ') || 'nol') + ' rupiah';
  }

  // Barang beda dari 14-warung.js.
  const BARANG = [
    ['🍩', 'Donat'], ['🧁', 'Kue mangkuk'], ['🍿', 'Popcorn'], ['🥜', 'Kacang'],
    ['📏', 'Penggaris'], ['🖍️', 'Krayon'], ['🧦', 'Kaus kaki'], ['🥤', 'Susu cokelat'],
  ];
  const UANG = [
    { v: 500, k: 'koin' }, { v: 1000, k: 'koin' }, { v: 2000, k: 'kertas' },
    { v: 5000, k: 'kertas' }, { v: 10000, k: 'kertas' }, { v: 20000, k: 'kertas' },
  ];

  function uang(u, kecil) {
    const angka = u.v >= 1000 ? u.v / 1000 + '.000' : String(u.v);
    return h('span', { class: 'sw-uang sw-' + u.k + ' u' + u.v + (kecil ? ' is-kecil' : ''), 'aria-hidden': 'true' },
      h('small', null, 'Rp'), h('b', null, angka));
  }
  function caraPas(total, dompet) {
    const hasil = [];
    let sisa = total;
    for (const u of dompet.slice().sort((a, b) => b.v - a.v)) while (sisa >= u.v) { hasil.push(u); sisa -= u.v; }
    return hasil;
  }

  const P = '.play[data-game="sedekah-warung"]';
  const CSS = `
${P} .sw-toko { width: 100%; max-width: 520px; }
${P} .sw-atap { height: 20px; border-radius: 16px 16px 0 0; border-bottom: 5px solid #2f6fed; background: repeating-linear-gradient(90deg, #4c8dff 0 28px, #fff 28px 56px); }
${P} .sw-rak { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 22px; padding: 8px 12px 6px; background: #e6f0ff; border-left: 4px solid #bcd3f7; border-right: 4px solid #bcd3f7; }
${P} .sw-barang { display: grid; justify-items: center; gap: 4px; }
${P} .sw-em { font-size: 2.9rem; line-height: 1; }
${P} .sw-tag { padding: 3px 14px; border: 2px dashed #8fb4ec; border-radius: 12px; background: #fff; font-size: 1.15rem; font-weight: 800; line-height: 1.15; text-align: center; }
${P} .sw-tag small { display: block; font-size: 0.78rem; font-weight: 700; color: var(--muted); }
${P} .sw-meja { height: 14px; border-radius: 0 0 14px 14px; background: #4a7ec9; box-shadow: 0 4px 0 #35619c; }
${P} .sw-nampan { width: 100%; max-width: 520px; padding: 10px 12px 12px; border-radius: 20px; background: var(--card); box-shadow: 0 5px 0 var(--shadow); }
${P} .sw-kepala { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-weight: 800; color: var(--muted); }
${P} .sw-kepala b { color: var(--ink); font-size: 1.3rem; }
${P} .sw-baki { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2px; min-height: 72px; margin-top: 6px; padding: 4px; border: 3px dashed var(--line); border-radius: 16px; background: #fffaf0; }
${P} .sw-baki.is-lunas { border-color: var(--good); background: var(--good-bg); }
${P} .sw-dompet { display: grid; justify-items: center; gap: 2px; width: 100%; }
${P} .sw-isi { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 6px; }
${P} .sw-btn { display: grid; place-items: center; padding: 5px; border: 0; border-radius: 18px; background: transparent; cursor: pointer; transition: transform var(--dur-press) var(--ease-out); }
${P} .sw-btn:active:not(:disabled) { transform: scale(0.95); }
${P} .sw-msg { min-height: 1.5em; margin: 0; font-size: 1.1rem; font-weight: 800; text-align: center; }
${P} .sw-msg.is-salah { color: var(--bad); }
${P} .sw-uang { display: grid; place-items: center; align-content: center; color: #fff; font-weight: 800; line-height: 1; text-shadow: 0 1px 0 rgba(0,0,0,0.3); user-select: none; }
${P} .sw-uang small { font-size: 0.62rem; opacity: 0.9; }
${P} .sw-uang b { font-size: 1.25rem; }
${P} .sw-koin { width: 72px; height: 72px; border-radius: 50%; border: 4px solid var(--k3); background: radial-gradient(circle at 35% 30%, var(--k1), var(--k2)); box-shadow: inset 0 0 0 4px rgba(255,255,255,0.35), 0 3px 0 rgba(0,0,0,0.18); }
${P} .sw-kertas { position: relative; width: 112px; height: 68px; border-radius: 10px; border: 3px solid var(--n3); background: linear-gradient(135deg, var(--n1), var(--n2)); box-shadow: 0 3px 0 rgba(0,0,0,0.18); }
${P} .sw-kertas::before { content: ''; position: absolute; inset: 5px; border: 2px dashed rgba(255,255,255,0.7); border-radius: 6px; }
${P} .sw-kertas small, ${P} .sw-kertas b { position: relative; }
${P} .sw-koin.is-kecil { width: 58px; height: 58px; }
${P} .sw-koin.is-kecil b { font-size: 1rem; }
${P} .sw-kertas.is-kecil { width: 90px; height: 56px; }
${P} .sw-kertas.is-kecil b { font-size: 1.05rem; }
${P} .u500 { --k1: #f4f6f8; --k2: #b9c0c8; --k3: #8d959e; color: #2b2d42; text-shadow: none; }
${P} .u1000 { --k1: #ffe27a; --k2: #f0ad00; --k3: #b8860b; color: #4a3500; text-shadow: none; }
${P} .u500 { --k1: #f4f6f8; }
${P} .u2000 { --n1: #b8c2cc; --n2: #8e9aa7; --n3: #66748a; }
${P} .u5000 { --n1: #d9a878; --n2: #b07a4c; --n3: #84552f; }
${P} .u10000 { --n1: #bf9cef; --n2: #8f61cf; --n3: #6838ab; }
${P} .u20000 { --n1: #7fd6a2; --n2: #3fa56b; --n3: #277a4c; }
${P} .sw-sedekah { width: 100%; max-width: 520px; padding: 12px; border-radius: 20px; background: #fff8e6; border: 3px solid #f2c94c; text-align: center; }
${P} .sw-celeng { font-size: 3.4rem; line-height: 1; }
@media (prefers-reduced-motion: reduce) {
  ${P} .sw-btn:active:not(:disabled) { transform: none; }
}
@media (max-width: 560px) {
  ${P} .sw-em { font-size: 2.8rem; }
  ${P} .sw-koin { width: 66px; height: 66px; }
  ${P} .sw-kertas { width: 98px; height: 62px; }
}`;

  function toko(barang) {
    return h('div', { class: 'sw-toko pop-in' },
      h('div', { class: 'sw-atap', 'aria-hidden': 'true' }),
      h('div', { class: 'sw-rak' }, barang.map((b) => h('div', { class: 'sw-barang' },
        h('span', { class: 'sw-em', 'aria-hidden': 'true' }, b.em),
        h('span', { class: 'sw-tag' }, h('small', null, b.nama), rupiah(b.harga))))),
      h('div', { class: 'sw-meja', 'aria-hidden': 'true' }));
  }

  // Bayar pas seperti warung, lalu resolve dengan total harga.
  function bayarPas(ctx, barang, dompet) {
    const harga = barang.reduce((s, b) => s + b.harga, 0);
    const baki = h('div', { class: 'sw-baki', 'aria-label': 'Nampan uang' });
    const kosong = h('span', { class: 'ti-label' }, 'Ketuk uang untuk menaruhnya di sini');
    baki.append(kosong);
    const totalEl = h('b', null, rupiah(0));
    const msg = h('p', { class: 'sw-msg', 'aria-live': 'polite' });
    const bayar = h('button', { type: 'button', class: 'ti-btn', disabled: true }, 'Bayar');
    const dompetEl = h('div', { class: 'sw-isi' });
    ctx.el.append(
      toko(barang),
      h('div', { class: 'sw-nampan' }, h('div', { class: 'sw-kepala' }, h('span', null, 'Nampan'), h('span', null, 'Total ', totalEl)), baki),
      h('div', { class: 'sw-dompet' }, h('span', { class: 'ti-label' }, 'Dompetmu'), dompetEl),
      msg, bayar);

    return new Promise((resolve) => {
      const isi = [];
      let sibuk = false, ketukan = 0, salah = 0;
      const jumlah = () => isi.reduce((s, x) => s + x.u.v, 0);
      const tombolDompet = dompet.map((u) => h('button', {
        type: 'button', class: 'sw-btn', 'aria-label': 'Uang ' + rupiah(u.v), on: { click: () => taruh(u) },
      }, uang(u)));
      dompetEl.append(...tombolDompet);

      function segarkan() {
        totalEl.textContent = rupiah(jumlah());
        kosong.hidden = isi.length > 0;
        bayar.disabled = isi.length === 0 || sibuk;
      }
      function kunci(ya) {
        sibuk = ya;
        tombolDompet.forEach((b) => { b.disabled = ya; });
        isi.forEach((x) => { x.btn.disabled = ya; });
        segarkan();
      }
      function taruh(u) {
        if (sibuk) return;
        ketukan++;
        const btn = h('button', { type: 'button', class: 'sw-btn pop-in', 'aria-label': 'Ambil kembali uang ' + rupiah(u.v) }, uang(u, true));
        const item = { u, btn };
        btn.addEventListener('click', () => {
          if (sibuk) return;
          ketukan++;
          isi.splice(isi.indexOf(item), 1);
          btn.remove();
          ctx.sfx('klik');
          msg.textContent = '';
          segarkan();
          if (ketukan >= 14) bantu();
        });
        isi.push(item);
        baki.append(btn);
        ctx.sfx('tap');
        msg.textContent = '';
        segarkan();
        if (ctx.isTK) ctx.say(ucapRp(jumlah()));
        if (ketukan >= 14) bantu();
      }
      async function bantu() {
        if (sibuk) return;
        kunci(true);
        msg.textContent = 'Ini caranya ya.';
        isi.splice(0).forEach((x) => x.btn.remove());
        segarkan();
        for (const u of caraPas(harga, dompet)) {
          await ctx.wait(420);
          if (!ctx.alive) { resolve(harga); return; }
          const btn = h('button', { type: 'button', class: 'sw-btn pop-in', tabindex: '-1', 'aria-label': 'Uang ' + rupiah(u.v) }, uang(u, true));
          btn.disabled = true;
          isi.push({ u, btn });
          baki.append(btn);
          ctx.sfx('tap');
          segarkan();
        }
        await ctx.wait(500);
        kunci(true);
        baki.classList.add('is-lunas');
        msg.textContent = 'Pas! Lanjut ke sedekah ya.';
        await ctx.correct(null, { say: 'Nah, sekarang uangnya pas.', min: 900 });
        resolve(harga);
      }
      bayar.addEventListener('click', async () => {
        if (sibuk || !isi.length) return;
        const t = jumlah();
        if (t === harga) {
          kunci(true);
          baki.classList.add('is-lunas');
          msg.textContent = 'Pas! Lunas.';
          await ctx.correct(null, { say: 'Pas! Terima kasih sudah membayar dengan jujur.', min: 900 });
          resolve(harga);
          return;
        }
        salah++;
        msg.textContent = t < harga ? 'Uangnya kurang ' + rupiah(harga - t) : 'Kelebihan ' + rupiah(t - harga) + ', warung sedekah bayar pas ya';
        msg.className = 'sw-msg is-salah';
        if (salah >= 3) { kunci(true); await ctx.wrong(baki, { say: false }); sibuk = false; bantu(); }
        else ctx.wrong(baki, { say: t < harga ? 'Uangnya kurang. Tambah lagi.' : 'Kelebihan. Bayar pas ya.' });
      });
      segarkan();
    });
  }

  // Pilih celengan sedekah sekitar 10 persen dari harga.
  async function sedekah(ctx, harga) {
    const tepat = Math.round(harga / 10);
    const opsi = new Set([tepat]);
    for (const d of [500, 1000, 1500, 2000]) {
      if (opsi.size >= 3) break;
      if (tepat + d <= harga) opsi.add(tepat + d);
      if (opsi.size >= 3) break;
      if (tepat - d > 0) opsi.add(tepat - d);
    }
    ctx.ask('Tahap sedekah: harga ' + rupiah(harga) + '. Sisihkan sedekah 10 persen. Berapa rupiah?',
      { say: 'Tahap sedekah: harga ' + ucapRp(harga) + '. Sisihkan sedekah 10 persen. Berapa rupiah?' });
    ctx.el.append(h('div', { class: 'sw-sedekah pop-in' },
      h('div', { class: 'sw-celeng', 'aria-hidden': 'true' }, '📦'),
      h('p', { class: 'ti-label' }, 'Celengan sedekah: 10 persen dari ' + rupiah(harga))));
    await ctx.choose({
      options: shuffle([...opsi]).map((x) => ({ label: rupiah(x), value: x, say: ucapRp(x) })),
      answer: tepat,
      layout: 'is-grid2',
    });
    ctx.note('Sedekah 10 persen artinya tiap Rp10.000 sisihkan Rp1.000 untuk yang membutuhkan.', { title: 'Hebat!' });
    await ctx.next();
  }

  async function kembalian(ctx, b, bayarUang) {
    const kembali = bayarUang - b.harga;
    ctx.ask('Tahap kembalian: harga ' + rupiah(b.harga) + ', kamu bayar ' + rupiah(bayarUang) + '. Berapa kembaliannya?',
      { say: 'Tahap kembalian: harga ' + ucapRp(b.harga) + ', kamu bayar ' + ucapRp(bayarUang) + '. Berapa kembaliannya?' });
    ctx.el.append(toko([b]));
    const kandidat = shuffle([kembali + 500, kembali + 1000, kembali + 2000, kembali - 500, kembali - 1000, kembali - 1500])
      .filter((x) => x > 0 && x <= bayarUang && x !== kembali);
    const opsi = shuffle([kembali, ...kandidat.slice(0, 3)]);
    await ctx.choose({
      options: opsi.map((x) => ({ label: rupiah(x), value: x, say: ucapRp(x) })),
      answer: kembali,
      layout: 'is-grid2',
    });
  }

  const acak = (n) => sample(BARANG, n).map(([em, nama]) => ({ em, nama }));
  const kelipatan = (a, z) => 500 * rand(a / 500, z / 500);

  TI.register({
    id: 'sedekah-warung',
    title: 'Warung Sedekah',
    cat: 'islam',
    icon: '🏪',
    desc: 'Belanja jajan lalu sisihkan sedekah.',
    start(ctx) {
      TI.style('sedekah-warung', CSS);
      const lesson = 'Sedekah membuat harta berkah. Sisihkan sebagian uang jajan untuk sedekah.';
      const DOMPET_TK = [{ v: 1000, k: 'koin' }, { v: 2000, k: 'kertas' }];

      if (ctx.isTK) {
        const soal = [
          [{ em: '🍩', nama: 'Donat', harga: 2000 }],
          [{ em: '🧁', nama: 'Kue mangkuk', harga: 3000 }],
          [{ em: '🥤', nama: 'Susu cokelat', harga: 1000 }],
        ];
        ctx.series(soal, async (barang) => {
          ctx.ask('Tahap bayar: ' + barang[0].nama + ' harganya ' + rupiah(barang[0].harga) + '. Bayar pas, lalu tahap sedekah!',
            { say: 'Tahap bayar: ' + barang[0].nama + ' harganya ' + ucapRp(barang[0].harga) + '. Bayar pas, lalu tahap sedekah!' });
          const harga = await bayarPas(ctx, barang, DOMPET_TK);
          if (!ctx.alive) return;
          ctx.clear();
          await sedekah(ctx, harga);
        }, { lesson });
      } else {
        const [a, b, c] = acak(3);
        const soal = [
          { tipe: 'A', barang: [{ ...a, harga: kelipatan(2500, 9500) }] },
          { tipe: 'A', barang: [{ ...b, harga: kelipatan(10000, 20000) }, { ...c, harga: kelipatan(2000, 9000) }] },
          { tipe: 'B', b: { em: '🖍️', nama: 'Krayon', harga: 7000 }, bayar: 10000 },
          { tipe: 'A', barang: [{ em: '🧦', nama: 'Kaus kaki', harga: kelipatan(12000, 22000) }] },
        ];
        ctx.series(soal, async (s) => {
          let harga;
          if (s.tipe === 'A') {
            const sebut = s.barang.map((x) => x.nama + ' ' + rupiah(x.harga)).join(' dan ');
            ctx.ask('Tahap bayar: kamu beli ' + sebut + '. Bayar dengan uang pas!',
              { say: 'Tahap bayar: kamu beli ' + s.barang.map((x) => x.nama + ' ' + ucapRp(x.harga)).join(' dan ') + '. Bayar dengan uang pas!' });
            harga = await bayarPas(ctx, s.barang, UANG);
          } else {
            await kembalian(ctx, s.b, s.bayar);
            if (!ctx.alive) return;
            harga = s.b.harga;
            ctx.clear();
          }
          if (!ctx.alive) return;
          ctx.clear();
          await sedekah(ctx, harga);
        }, { lesson });
      }
    },
  });
})();
