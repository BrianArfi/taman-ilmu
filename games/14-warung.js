/* 14 Warung Jujur. Bayar pas dengan koin dan lembaran uang, lalu hitung kembalian.
   Uang digambar sebagai koin bulat dan kertas persegi panjang berwarna, hanya angka nominal. */
(function () {
  const { h, rand, pick, shuffle, sample, rupiah } = TI;

  const SAT = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const kata = (n) => (n < 12 ? SAT[n] : n < 20 ? SAT[n - 10] + ' belas' : SAT[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SAT[n % 10] : ''));
  // 3500 -> "tiga ribu lima ratus rupiah" (kelipatan 500)
  function ucapRp(n) {
    const ribu = Math.floor(n / 1000), sisa = n % 1000, bagian = [];
    if (ribu) bagian.push(ribu === 1 ? 'seribu' : kata(ribu) + ' ribu');
    if (sisa === 500) bagian.push('lima ratus');
    return (bagian.join(' ') || 'nol') + ' rupiah';
  }

  const BARANG = [
    ['🍞', 'Roti'], ['🥛', 'Susu'], ['🍌', 'Pisang'], ['✏️', 'Pensil'],
    ['📒', 'Buku'], ['🧃', 'Jus'], ['🍪', 'Kue'], ['🍉', 'Semangka'],
  ];
  const UANG = [
    { v: 500, k: 'koin' }, { v: 1000, k: 'koin' }, { v: 2000, k: 'kertas' },
    { v: 5000, k: 'kertas' }, { v: 10000, k: 'kertas' }, { v: 20000, k: 'kertas' },
  ];
  const DOMPET_TK = [UANG[1]];

  function uang(u, kecil) {
    const angka = u.v >= 1000 ? u.v / 1000 + '.000' : String(u.v);
    return TI.h('span', { class: 'wj-uang wj-' + u.k + ' u' + u.v + (kecil ? ' is-kecil' : ''), 'aria-hidden': 'true' },
      TI.h('small', null, 'Rp'), TI.h('b', null, angka));
  }

  // Cara bayar pas dengan jumlah uang paling sedikit.
  function caraPas(total, dompet) {
    const hasil = [];
    let sisa = total;
    for (const u of dompet.slice().sort((a, b) => b.v - a.v)) while (sisa >= u.v) { hasil.push(u); sisa -= u.v; }
    return hasil;
  }

  function toko(barang) {
    return h('div', { class: 'wj-toko pop-in' },
      h('div', { class: 'wj-atap', 'aria-hidden': 'true' }),
      h('div', { class: 'wj-rak' }, barang.map((b) => h('div', { class: 'wj-barang' },
        h('span', { class: 'wj-em', 'aria-hidden': 'true' }, b.em),
        h('span', { class: 'wj-tag' }, h('small', null, b.nama), rupiah(b.harga))))),
      h('div', { class: 'wj-meja', 'aria-hidden': 'true' }));
  }

  const CSS = `
.play[data-game="warung"] .wj-toko { width: 100%; max-width: 520px; }
.play[data-game="warung"] .wj-atap {
  height: 20px; border-radius: 16px 16px 0 0; border-bottom: 5px solid #d94848;
  background: repeating-linear-gradient(90deg, #ff6b6b 0 28px, #fff 28px 56px);
}
.play[data-game="warung"] .wj-rak {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 22px; padding: 8px 12px 6px;
  background: #fff3d6; border-left: 4px solid #e7c98f; border-right: 4px solid #e7c98f;
}
.play[data-game="warung"] .wj-barang { display: grid; justify-items: center; gap: 4px; }
.play[data-game="warung"] .wj-em { font-size: 2.9rem; line-height: 1; }
.play[data-game="warung"] .wj-tag {
  padding: 3px 14px; border: 2px dashed #e0b45a; border-radius: 12px; background: #fff;
  font-size: 1.15rem; font-weight: 800; line-height: 1.15; text-align: center;
}
.play[data-game="warung"] .wj-tag small { display: block; font-size: 0.78rem; font-weight: 700; color: var(--muted); }
.play[data-game="warung"] .wj-meja { height: 14px; border-radius: 0 0 14px 14px; background: #c98b4a; box-shadow: 0 4px 0 #a06a30; }

.play[data-game="warung"] .wj-nampan { width: 100%; max-width: 520px; padding: 10px 12px 12px; border-radius: 20px; background: var(--card); box-shadow: 0 5px 0 var(--shadow); }
.play[data-game="warung"] .wj-kepala { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-weight: 800; color: var(--muted); }
.play[data-game="warung"] .wj-kepala b { color: var(--ink); font-size: 1.3rem; }
.play[data-game="warung"] .wj-baki {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2px; min-height: 72px; margin-top: 6px; padding: 4px;
  border: 3px dashed var(--line); border-radius: 16px; background: #fffaf0;
}
.play[data-game="warung"] .wj-kosong { color: var(--muted); font-weight: 700; font-size: 0.95rem; }
.play[data-game="warung"] .wj-baki.is-lunas { border-color: var(--good); background: var(--good-bg); }
.play[data-game="warung"] .wj-baki.is-wrong { border-color: var(--bad); background: var(--bad-bg); animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }

.play[data-game="warung"] .wj-dompet { display: grid; justify-items: center; gap: 2px; width: 100%; max-width: 700px; }
.play[data-game="warung"] .wj-isi { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 6px; }
.play[data-game="warung"] .wj-btn {
  display: grid; place-items: center; padding: 5px; border: 0; border-radius: 18px; background: transparent; cursor: pointer;
  transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease;
}
.play[data-game="warung"] .wj-btn:active:not(:disabled) { transform: scale(0.95); }
.play[data-game="warung"] .wj-btn:disabled { cursor: default; }
.play[data-game="warung"] .wj-msg { min-height: 1.5em; margin: 0; font-size: 1.1rem; font-weight: 800; text-align: center; }
.play[data-game="warung"] .wj-msg.is-salah { color: var(--bad); }
.play[data-game="warung"] .wj-msg.is-benar { color: var(--good); }

.play[data-game="warung"] .wj-uang { display: grid; place-items: center; align-content: center; color: #fff; font-weight: 800; line-height: 1; text-shadow: 0 1px 0 rgba(0,0,0,0.3); user-select: none; }
.play[data-game="warung"] .wj-uang small { font-size: 0.62rem; opacity: 0.9; }
.play[data-game="warung"] .wj-uang b { font-size: 1.25rem; }
.play[data-game="warung"] .wj-koin {
  width: 72px; height: 72px; border-radius: 50%; border: 4px solid var(--k3);
  background: radial-gradient(circle at 35% 30%, var(--k1), var(--k2));
  box-shadow: inset 0 0 0 4px rgba(255,255,255,0.35), 0 3px 0 rgba(0,0,0,0.18);
}
.play[data-game="warung"] .wj-kertas {
  position: relative; width: 112px; height: 68px; border-radius: 10px; border: 3px solid var(--n3);
  background: linear-gradient(135deg, var(--n1), var(--n2)); box-shadow: 0 3px 0 rgba(0,0,0,0.18);
}
.play[data-game="warung"] .wj-kertas::before { content: ''; position: absolute; inset: 5px; border: 2px dashed rgba(255,255,255,0.7); border-radius: 6px; }
.play[data-game="warung"] .wj-kertas small, .play[data-game="warung"] .wj-kertas b { position: relative; }
.play[data-game="warung"] .wj-koin.is-kecil { width: 58px; height: 58px; }
.play[data-game="warung"] .wj-koin.is-kecil b { font-size: 1rem; }
.play[data-game="warung"] .wj-kertas.is-kecil { width: 90px; height: 56px; }
.play[data-game="warung"] .wj-kertas.is-kecil b { font-size: 1.05rem; }
.play[data-game="warung"] .u500 { --k1: #f4f6f8; --k2: #b9c0c8; --k3: #8d959e; color: #2b2d42; text-shadow: none; }
.play[data-game="warung"] .u1000 { --k1: #ffe27a; --k2: #f0ad00; --k3: #b8860b; color: #4a3500; text-shadow: none; }
.play[data-game="warung"] .u2000 { --n1: #b8c2cc; --n2: #8e9aa7; --n3: #66748a; }
.play[data-game="warung"] .u5000 { --n1: #d9a878; --n2: #b07a4c; --n3: #84552f; }
.play[data-game="warung"] .u10000 { --n1: #bf9cef; --n2: #8f61cf; --n3: #6838ab; }
.play[data-game="warung"] .u20000 { --n1: #7fd6a2; --n2: #3fa56b; --n3: #277a4c; }
.play[data-game="warung"] .wj-kembali { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
.play[data-game="warung"] .wj-kembali .ti-label { font-size: 1.05rem; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="warung"] .wj-baki.is-wrong { animation: none !important; }
}
@media (max-width: 560px) {
  .play[data-game="warung"] .wj-em { font-size: 2.8rem; }
  .play[data-game="warung"] .wj-koin { width: 66px; height: 66px; }
  .play[data-game="warung"] .wj-kertas { width: 98px; height: 62px; }
  .play[data-game="warung"] .wj-isi { gap: 0 2px; }
}`;

  const HELP_TAP = 14; // setelah sekian ketukan di nampan tanpa bayar, kita bantu

  // Tipe A: bayar pas. Selesai kalau uang di nampan pas (atau setelah dibantu).
  function bayarPas(ctx, barang, dompet) {
    const harga = barang.reduce((s, b) => s + b.harga, 0);
    const baki = h('div', { class: 'wj-baki', 'aria-label': 'Nampan uang' });
    const kosong = h('span', { class: 'wj-kosong' }, ctx.isTK ? 'Ketuk koin untuk menaruhnya di sini' : 'Taruh uangmu di sini');
    baki.append(kosong);
    const totalEl = h('b', null, rupiah(0));
    const msg = h('p', { class: 'wj-msg', 'aria-live': 'polite' });
    const bayar = h('button', { type: 'button', class: 'ti-btn', disabled: true }, 'Bayar');
    const dompetEl = h('div', { class: 'wj-isi' });
    ctx.el.append(
      toko(barang),
      h('div', { class: 'wj-nampan' }, h('div', { class: 'wj-kepala' }, h('span', null, 'Nampan'), h('span', null, 'Total ', totalEl)), baki),
      h('div', { class: 'wj-dompet' }, h('span', { class: 'ti-label' }, 'Dompetmu'), dompetEl),
      msg, bayar);

    return new Promise((resolve) => {
      const isi = []; // { u, btn }
      let sibuk = false, ketukan = 0, salah = 0;
      const jumlah = () => isi.reduce((s, x) => s + x.u.v, 0);
      const tombolDompet = dompet.map((u) => h('button', {
        type: 'button', class: 'wj-btn', 'aria-label': 'Uang ' + rupiah(u.v), on: { click: () => taruh(u) },
      }, uang(u)));
      dompetEl.append(...tombolDompet);

      function segarkan() {
        totalEl.textContent = rupiah(jumlah());
        kosong.hidden = isi.length > 0;
        bayar.disabled = isi.length === 0 || sibuk;
      }
      // Selama pemberitahuan atau bantuan berjalan, semua tombol dikunci.
      function kunci(ya) {
        sibuk = ya;
        tombolDompet.forEach((b) => { b.disabled = ya; });
        isi.forEach((x) => { x.btn.disabled = ya; });
        segarkan();
      }
      const bersih = () => { msg.textContent = ''; msg.className = 'wj-msg'; };

      function taruh(u) {
        if (sibuk) return;
        ketukan++;
        const btn = h('button', { type: 'button', class: 'wj-btn pop-in', 'aria-label': 'Ambil kembali uang ' + rupiah(u.v) }, uang(u, true));
        const item = { u, btn };
        btn.addEventListener('click', () => {
          if (sibuk) return;
          ketukan++;
          isi.splice(isi.indexOf(item), 1);
          btn.remove();
          ctx.sfx('klik');
          bersih();
          segarkan();
          if (ketukan >= HELP_TAP) bantu();
        });
        isi.push(item);
        baki.append(btn);
        ctx.sfx('tap');
        bersih();
        segarkan();
        if (ctx.isTK) ctx.say(ucapRp(jumlah()));
        if (ketukan >= HELP_TAP) bantu();
      }

      async function selesaiBenar(teks) {
        kunci(true);
        baki.classList.add('is-lunas');
        msg.textContent = 'Pas! Lunas.'; msg.className = 'wj-msg is-benar';
        await ctx.correct(null, { say: teks || 'Pas! Terima kasih sudah membayar dengan jujur.', min: 900 });
        resolve();
      }

      // Sudah beberapa kali salah: nampan diisi dengan cara yang benar.
      async function bantu() {
        if (sibuk) return;
        kunci(true);
        msg.textContent = 'Ini caranya ya.'; msg.className = 'wj-msg';
        isi.splice(0).forEach((x) => x.btn.remove());
        segarkan();
        ctx.say('Ini caranya. Harganya ' + ucapRp(harga) + '.');
        for (const u of caraPas(harga, dompet)) {
          await ctx.wait(420);
          const btn = h('button', { type: 'button', class: 'wj-btn pop-in', tabindex: '-1', 'aria-label': 'Uang ' + rupiah(u.v) }, uang(u, true));
          btn.disabled = true;
          isi.push({ u, btn });
          baki.append(btn);
          ctx.sfx('tap');
          segarkan();
        }
        await ctx.wait(500);
        await selesaiBenar('Nah, sekarang uangnya pas.');
      }

      bayar.addEventListener('click', async () => {
        if (sibuk || !isi.length) return;
        const t = jumlah();
        if (t === harga) { selesaiBenar(); return; }
        salah++;
        const kurang = t < harga;
        const selisih = Math.abs(harga - t);
        msg.textContent = kurang ? 'Uangnya kurang ' + rupiah(selisih) : 'Kelebihan ' + rupiah(selisih) + ', warung jujur bayar pas ya';
        msg.className = 'wj-msg is-salah';
        const ucapan = kurang ? 'Uangnya kurang ' + ucapRp(selisih) : 'Kelebihan ' + ucapRp(selisih) + '. Warung jujur, bayar pas ya.';
        if (salah >= 3) { kunci(true); ctx.wrong(baki, { say: false }); await ctx.sayWait(ucapan); sibuk = false; bantu(); }
        else ctx.wrong(baki, { say: ucapan });
      });
      segarkan();
    });
  }

  // Tipe B (SD): hitung kembalian.
  async function kembalian(ctx, b, bayarUang) {
    const kembali = bayarUang - b.harga;
    ctx.ask('Harga ' + rupiah(b.harga) + ', kamu bayar ' + rupiah(bayarUang) + '. Berapa kembaliannya?',
      { say: 'Harga ' + ucapRp(b.harga) + ', kamu bayar ' + ucapRp(bayarUang) + '. Berapa kembaliannya?' });
    const bayarNode = caraPas(bayarUang, UANG).map((u) => uang(u, true));
    ctx.el.append(
      toko([b]),
      h('div', { class: 'wj-kembali pop-in' }, h('span', { class: 'ti-label' }, 'Uang yang kamu bayar:'), bayarNode));
    const kandidat = shuffle([kembali + 500, kembali + 1000, kembali + 2000, kembali - 500, kembali - 1000, kembali - 2000, kembali + 1500])
      .filter((x) => x > 0 && x <= bayarUang && x !== kembali);
    const opsi = shuffle([kembali, ...kandidat.slice(0, 3)]);
    await ctx.choose({
      options: opsi.map((x) => ({ label: rupiah(x), value: x, say: ucapRp(x) })),
      answer: kembali,
      layout: 'is-grid2',
    });
    ctx.note('Kembalian = uang yang dibayar dikurangi harga. ' + rupiah(bayarUang) + ' dikurangi ' + rupiah(b.harga) + ' sama dengan ' + rupiah(kembali) + '.', { title: 'Cara hitung' });
    await ctx.next();
  }

  const acakBarang = (n) => sample(BARANG, n).map(([em, nama]) => ({ em, nama }));
  const kelipatan = (a, z) => 500 * rand(a / 500, z / 500);

  function buatSoalSD() {
    // Lima soal bayar pas dengan tingkat naik, tiga soal kembalian, diselang-seling.
    const pas = [
      () => { const [b] = acakBarang(1); return [{ ...b, harga: kelipatan(2500, 9500) }]; },
      () => { const [b] = acakBarang(1); return [{ ...b, harga: kelipatan(10000, 20000) }]; },
      () => { const [a, b] = acakBarang(2); return [{ ...a, harga: kelipatan(2000, 9000) }, { ...b, harga: kelipatan(2500, 11000) }]; },
      () => { const [a, b] = acakBarang(2); return [{ ...a, harga: kelipatan(5000, 14000) }, { ...b, harga: kelipatan(5000, 16000) }]; },
      () => { const [a, b] = acakBarang(2); return [{ ...a, harga: kelipatan(10000, 18000) }, { ...b, harga: kelipatan(10000, 17000) }]; },
    ];
    const bayar = shuffle([5000, 10000, 20000]);
    const kembaliSoal = bayar.map((p) => {
      const [b] = acakBarang(1);
      const maks = p === 5000 ? 3000 : p === 10000 ? 7000 : 9000;
      const min = p === 5000 ? 500 : p === 10000 ? 1000 : 2000;
      return { tipe: 'B', b: { ...b, harga: p - kelipatan(min, maks) }, bayar: p };
    });
    const urut = ['A', 'A', 'B', 'A', 'B', 'A', 'B', 'A'];
    let ia = 0, ib = 0;
    return urut.map((t) => (t === 'A' ? { tipe: 'A', barang: pas[ia++]() } : kembaliSoal[ib++]));
  }

  TI.register({
    id: 'warung',
    title: 'Warung Jujur',
    cat: 'mat',
    icon: '🪙',
    desc: 'Belanja di warung: bayar pas dan hitung kembalian.',
    start(ctx) {
      TI.style('warung', CSS);
      const lesson = 'Pedagang dan pembeli yang jujur disukai Allah. Bayar dengan uang yang pas dan hitung kembalian dengan teliti.';

      if (ctx.isTK) {
        const soal = sample(BARANG, 6).map(([em, nama]) => ({ tipe: 'A', barang: [{ em, nama, harga: rand(1, 5) * 1000 }] }));
        ctx.series(soal, async (s) => {
          const b = s.barang[0];
          ctx.ask(b.nama + ' harganya ' + rupiah(b.harga) + '. Ayo bayar pas!', { say: b.nama + ' harganya ' + ucapRp(b.harga) + '. Ayo bayar pas!' });
          await bayarPas(ctx, s.barang, DOMPET_TK);
        }, { lesson });
      } else {
        ctx.series(buatSoalSD(), async (s) => {
          if (s.tipe === 'A') {
            const sebut = s.barang.map((b) => b.nama + ' ' + rupiah(b.harga)).join(' dan ');
            const ucap = s.barang.map((b) => b.nama + ' ' + ucapRp(b.harga)).join(' dan ');
            ctx.ask(s.barang.length > 1 ? 'Kamu beli ' + sebut + '. Bayar dengan uang pas!' : sebut + '. Bayar dengan uang pas!',
              { say: s.barang.length > 1 ? 'Kamu beli ' + ucap + '. Bayar dengan uang pas!' : ucap + '. Bayar dengan uang pas!' });
            await bayarPas(ctx, s.barang, UANG);
          } else {
            await kembalian(ctx, s.b, s.bayar);
          }
        }, { lesson });
      }
    },
  });
})();
