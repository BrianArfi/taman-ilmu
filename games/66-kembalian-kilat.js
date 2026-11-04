/* 66 Kembalian Kilat. Harga dan uang bayar tampil, ketuk koin atau lembaran sampai pas.
   Waktu hanya memengaruhi bintang, tidak pernah menggagalkan sesi.
   TK: total kecil. SD: sampai puluhan ribu + 2 lembaran. */
(function () {
  const { h, rand, sample } = TI;
  const rupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

  const DENOM = [
    { v: 500, koin: true, warna: '#ffd23f' },
    { v: 1000, koin: true, warna: '#ffb703' },
    { v: 2000, koin: false, warna: '#95d5b2' },
    { v: 5000, koin: false, warna: '#74c69d' },
    { v: 10000, koin: false, warna: '#f4a261' },
    { v: 20000, koin: false, warna: '#e76f51' },
  ];

  const CSS = `
.play[data-game="kembalian-kilat"] .kk-wrap { width: 100%; max-width: 600px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="kembalian-kilat"] .kk-tagihan { display: flex; gap: 10px 26px; flex-wrap: wrap; justify-content: center; padding: 10px 18px; font-size: 1.25rem; font-weight: 800; }
.play[data-game="kembalian-kilat"] .kk-tagihan b { color: var(--c); }
.play[data-game="kembalian-kilat"] .kk-waktu { font-size: 1.05rem; color: var(--muted); font-weight: 800; }
.play[data-game="kembalian-kilat"] .kk-nampan { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; min-height: 76px; width: 100%; padding: 10px; }
.play[data-game="kembalian-kilat"] .kk-chip { min-width: 72px; min-height: 64px; border-radius: 14px; border: 3px solid rgba(0,0,0,0.15); font-weight: 800; font-size: 1rem; padding: 6px 10px; }
.play[data-game="kembalian-kilat"] .kk-dompet { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; width: 100%; }
.play[data-game="kembalian-kilat"] .kk-dompet .choice { min-width: 88px; min-height: 88px; font-weight: 800; flex-direction: column; gap: 4px; }
.play[data-game="kembalian-kilat"] .kk-koin { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; border: 3px solid rgba(0,0,0,0.25); font-size: 0.85rem; }
.play[data-game="kembalian-kilat"] .kk-lembar { display: grid; place-items: center; width: 76px; height: 48px; border-radius: 8px; border: 3px solid rgba(0,0,0,0.25); font-size: 0.95rem; }
.play[data-game="kembalian-kilat"] .kk-total { font-size: 1.6rem; font-weight: 800; }
.play[data-game="kembalian-kilat"] .kk-total.is-pas { color: var(--good); }
.play[data-game="kembalian-kilat"] .kk-cek { min-width: 200px; min-height: 72px; font-size: 1.6rem; }
.play[data-game="kembalian-kilat"] .kk-pesan { min-height: 1.6em; font-weight: 800; color: #e5484d; }`;

  function uangNode(d) {
    return d.koin
      ? h('span', { class: 'kk-koin', style: { background: d.warna }, 'aria-hidden': 'true' }, String(d.v))
      : h('span', { class: 'kk-lembar', style: { background: d.warna }, 'aria-hidden': 'true' }, String(d.v));
  }

  // Susun kembalian C dari denominasi yang tersedia (rakus, selalu bisa).
  function susun(C, pakai) {
    const out = [];
    const ds = pakai.slice().sort((a, b) => b.v - a.v);
    let sisa = C;
    for (const d of ds) {
      while (sisa >= d.v) { out.push(d); sisa -= d.v; }
    }
    return out;
  }

  TI.register({
    id: 'kembalian-kilat',
    title: 'Kembalian Kilat',
    cat: 'mat',
    icon: '💸',
    desc: 'Beri kembalian yang pas secepat kilat.',
    async start(ctx) {
      TI.style('kembalian-kilat', CSS);
      const TK = ctx.isTK;
      const pakai = TK ? DENOM.slice(0, 2) : DENOM.slice(0, 5);
      const ronde = [];
      const jumlah = 4;
      for (let i = 0; i < jumlah; i++) {
        let C, Q;
        if (TK) {
          C = sample([500, 1000, 1500, 2000, 2500, 3000], 1)[0];
          Q = 5000;
        } else {
          // Bangun kembalian dari 1 lembaran + receh, bayar dengan 1 lembaran lebih besar.
          const besar = [2000, 5000, 5000, 10000][i % 4];
          const receh = sample([0, 500, 1000, 1500], 1)[0];
          C = besar + receh;
          Q = C <= 10000 ? 20000 : 50000;
        }
        ronde.push({ harga: Q - C, bayar: Q, kembali: C });
      }

      const mulai = Date.now();
      const waktuEl = h('span', { class: 'kk-waktu' }, 'Waktu: 0 dtk');
      ctx.el.append(waktuEl);
      ctx.every(1000, () => {
        if (!ctx.alive) return;
        waktuEl.textContent = 'Waktu: ' + Math.round((Date.now() - mulai) / 1000) + ' dtk';
      });

      ctx.progress(0, ronde.length);
      for (let r = 0; r < ronde.length; r++) {
        if (!ctx.alive) return;
        const { harga, bayar, kembali } = ronde[r];
        ctx.ask('Kembaliannya ' + rupiah(kembali) + '. Ketuk uang sampai pas, lalu tekan Cek!');

        const wrap = h('div', { class: 'kk-wrap' });
        const totalEl = h('div', { class: 'kk-total' }, 'Nampan: Rp0');
        const pesan = h('p', { class: 'kk-pesan', 'aria-live': 'polite' });
        const nampan = h('div', { class: 'ti-panel kk-nampan' });
        const dompet = h('div', { class: 'kk-dompet' });
        const cek = h('button', { type: 'button', class: 'ti-btn kk-cek' }, 'Cek');
        wrap.append(
          h('div', { class: 'ti-panel kk-tagihan' },
            h('span', null, 'Harga ', h('b', null, rupiah(harga))),
            h('span', null, 'Bayar ', h('b', null, rupiah(bayar))),
            h('span', null, 'Kembali ', h('b', null, rupiah(kembali)))),
          totalEl, nampan, dompet, pesan, cek);
        ctx.el.append(wrap);

        const isi = []; // denominasi di nampan
        const jumlahkan = () => isi.reduce((s, d) => s + d.v, 0);
        const segarkan = () => {
          nampan.replaceChildren();
          isi.forEach((d, i) => {
            const c = h('button', {
              type: 'button', class: 'kk-chip', style: { background: d.warna },
              'aria-label': rupiah(d.v) + ', ketuk untuk mengambil kembali',
            }, rupiah(d.v));
            c.addEventListener('click', () => { isi.splice(i, 1); ctx.sfx('tap'); segarkan(); });
            nampan.append(c);
          });
          const s = jumlahkan();
          totalEl.textContent = 'Nampan: ' + rupiah(s);
          totalEl.classList.toggle('is-pas', s === kembali);
        };
        pakai.forEach((d) => {
          const b = h('button', { type: 'button', class: 'choice', 'aria-label': rupiah(d.v) }, uangNode(d), h('span', null, rupiah(d.v)));
          b.addEventListener('click', () => { isi.push(d); ctx.sfx('klik'); segarkan(); });
          dompet.append(b);
        });
        segarkan();

        let gagal = 0, lanjut = false;
        cek.addEventListener('click', async () => {
          if (lanjut || cek.disabled) return;
          const s = jumlahkan();
          if (s === kembali) {
            lanjut = true;
            cek.disabled = true;
            await ctx.correct(cek);
          } else {
            gagal++;
            if (s > kembali && isi.length) {
              // Kelebihan: keluarkan uang terakhir supaya cepat pas.
              isi.pop();
              segarkan();
            }
            pesan.textContent = s < kembali ? 'Kurang ' + rupiah(kembali - s) + '.' : 'Kelebihan ' + rupiah(s - kembali) + '.';
            await ctx.wrong(cek, { say: pesan.textContent + ' Coba lagi.' });
            if (gagal >= 3) {
              // Isi otomatis dengan cara yang benar.
              lanjut = true;
              cek.disabled = true;
              isi.length = 0;
              susun(kembali, pakai).forEach((d) => isi.push(d));
              segarkan();
              pesan.textContent = '';
              ctx.say('Ini caranya: ' + rupiah(kembali) + ' pas. Lanjut!');
              await ctx.wait(2200);
            }
          }
        });
        while (!lanjut && ctx.alive) await ctx.wait(300);
        if (!ctx.alive) return;
        await ctx.wait(300);
        ctx.clear();
        ctx.progress(r + 1, ronde.length);
      }
      const dtk = Math.round((Date.now() - mulai) / 1000);
      const perRonde = dtk / ronde.length;
      ctx.finish({
        stars: ctx.mistakes === 0 ? (perRonde < 30 ? 3 : 2) : ctx.mistakes <= 2 ? 2 : 1,
        total: ronde.length,
        lesson: 'Kembalian adalah uang bayar dikurang harga. Hitung dengan teliti sebelum memberi.',
      });
    },
  });
})();
