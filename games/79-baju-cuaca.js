/* 79 Koper Cuaca. Isi koper sesuai cuaca hari ini.
   Babak berurutan: hujan dan panas dulu, lalu angin dan dingin. */
(function () {
  const { h, shuffle } = TI;

  const BARANG = {
    payung: { nama: 'Payung', icon: '🌂' },
    jas: { nama: 'Jas hujan', icon: '🧥' },
    boot: { nama: 'Sepatu boot', icon: '🥾' },
    kaos: { nama: 'Kaos kaki hangat', icon: '🧦' },
    topi: { nama: 'Topi', icon: '🧢' },
    kacamata: { nama: 'Kacamata hitam', icon: '🕶️' },
    botol: { nama: 'Botol minum', icon: '🥤' },
    semangka: { nama: 'Semangka', icon: '🍉' },
    syal: { nama: 'Syal', icon: '🧣' },
    jaket: { nama: 'Jaket', icon: '🧥' },
    sarung: { nama: 'Sarung tangan', icon: '🧤' },
    celana: { nama: 'Celana panjang', icon: '👖' },
  };

  const CUACA = [
    { id: 'hujan', nama: 'Hujan', icon: '🌧️', kata: 'Hari ini hujan. Benda apa saja yang dibawa?', bawa: ['payung', 'jas', 'boot'], tinggal: ['topi'] },
    { id: 'panas', nama: 'Panas', icon: '☀️', kata: 'Hari ini panas. Benda apa saja yang dibawa?', bawa: ['topi', 'kacamata', 'botol'], tinggal: ['jas'] },
  ];
  const CUACA_SD = [
    { id: 'hujan', nama: 'Hujan', icon: '🌧️', kata: 'Hari ini hujan. Benda apa saja yang dibawa?', bawa: ['payung', 'jas', 'boot', 'kaos'], tinggal: ['topi'] },
    { id: 'panas', nama: 'Panas', icon: '☀️', kata: 'Hari ini panas. Benda apa saja yang dibawa?', bawa: ['topi', 'kacamata', 'botol', 'semangka'], tinggal: ['jas'] },
    { id: 'angin', nama: 'Berangin', icon: '💨', kata: 'Hari ini berangin. Benda apa saja yang dibawa?', bawa: ['jaket', 'syal', 'topi', 'celana'], tinggal: ['botol'] },
    { id: 'dingin', nama: 'Dingin', icon: '❄️', kata: 'Hari ini dingin. Benda apa saja yang dibawa?', bawa: ['jaket', 'syal', 'sarung', 'boot'], tinggal: ['kacamata'] },
  ];

  const CSS = `
.play[data-game="baju-cuaca"] .bc-cuaca { display: flex; align-items: center; justify-content: center; gap: 12px; }
.play[data-game="baju-cuaca"] .bc-cuaca .bc-em { font-size: 3rem; line-height: 1; }
.play[data-game="baju-cuaca"] .bc-cuaca .bc-nama { font-size: 1.5rem; font-weight: 800; }
.play[data-game="baju-cuaca"] .bc-area { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 480px; }
.play[data-game="baju-cuaca"] .bc-slot { min-height: 120px; border-radius: 18px; padding: 10px; display: grid; gap: 6px;
  align-content: start; justify-items: center; border: 3px dashed #9aa3b8; background: rgba(255,255,255,0.7); }
.play[data-game="baju-cuaca"] .bc-slot .bc-judul { font-weight: 800; font-size: 0.95rem; }
.play[data-game="baju-cuaca"] .bc-slot.is-filled { border-style: solid; border-color: var(--good); }
.play[data-game="baju-cuaca"] .bc-slot .ti-chip { margin: 0; }
@media (max-width: 560px) {
  .play[data-game="baju-cuaca"] .bc-area { grid-template-columns: 1fr; }
  .play[data-game="baju-cuaca"] .bc-slot { min-height: 96px; }
}`;

  async function satuCuaca(ctx, c, no, total) {
    ctx.ask('Babak ' + (no + 1) + ' dari ' + total + ': ' + c.kata);
    ctx.el.append(h('div', { class: 'ti-card bc-cuaca pop-in' },
      h('span', { class: 'bc-em', 'aria-hidden': 'true' }, c.icon),
      h('span', { class: 'bc-nama' }, 'Hari ini: ' + c.nama)));
    const area = h('div', { class: 'bc-area' });
    const koper = h('div', { class: 'bc-slot' }, h('span', { class: 'bc-judul' }, '🧳 Koper'));
    const rak = h('div', { class: 'bc-slot' }, h('span', { class: 'bc-judul' }, '🏠 Biarkan di rumah'));
    area.append(koper, rak);
    const tray = h('div', { class: 'ti-tray' });
    ctx.el.append(area, tray);
    const pieces = shuffle([
      ...c.bawa.map((id) => ({ id: c.id + '-' + id, label: BARANG[id].nama, icon: BARANG[id].icon, target: 'koper', say: BARANG[id].nama })),
      ...c.tinggal.map((id) => ({ id: c.id + '-no-' + id, label: BARANG[id].nama, icon: BARANG[id].icon, target: 'rak', say: BARANG[id].nama })),
    ]);
    // Setelah 2 salah, tunjukkan satu pasangan yang benar.
    let m0 = ctx.mistakes;
    const tunjuk = ctx.every(400, () => {
      if (!ctx.alive || ctx.mistakes - m0 < 2) return;
      m0 = ctx.mistakes;
      const p = pieces.find((x) => !x.placed && x.btn && !x.btn.disabled);
      if (!p) return;
      ctx.say('Lihat, ' + p.label + ' taruh di sini ya.');
      p.btn.click();
      (p.target === 'koper' ? koper : rak).click();
    });
    await ctx.place({
      pieces,
      slots: [
        { id: 'koper', el: koper, label: 'Koper' },
        { id: 'rak', el: rak, label: 'Biarkan di rumah' },
      ],
      tray,
      multi: true,
      onStep: (done) => ctx.say(done + ' sudah terpasang.'),
    });
    tunjuk();
    await ctx.correct(null, { say: 'Koper siap untuk hari ' + c.nama.toLowerCase() + '!' });
  }

  TI.register({
    id: 'baju-cuaca',
    title: 'Koper Cuaca',
    cat: 'sains',
    icon: '🧥',
    desc: 'Isi koper sesuai cuaca hari ini.',
    start(ctx) {
      TI.style('baju-cuaca', CSS);
      const daftar = ctx.isTK ? CUACA : CUACA_SD;
      ctx.progress(0, daftar.length);
      let n = 0;
      ctx.series(daftar, async (c) => {
        await satuCuaca(ctx, c, n, daftar.length);
        n++;
        if (n === 1 && ctx.isTK) ctx.correct(null, { say: 'Bagus! Satu lagi!' });
        if (n === 2 && !ctx.isTK) ctx.correct(null, { say: 'Bagus! Setengah jalan, terus naik ke babak berikutnya!' });
        ctx.progress(n, daftar.length);
      }, {
        lesson: 'Kita memakai baju sesuai cuaca supaya badan tetap sehat. Hujan bawa payung, panas pakai topi.',
      });
    },
  });
})();
