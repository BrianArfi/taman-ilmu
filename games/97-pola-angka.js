/* 97 Pola Angka. Barisan angka, tebak lanjutannya dan tebak aturannya. */
(function () {
  const { h, shuffle, rand } = TI;

  const CSS = `
.play[data-game="pola-angka"] .pa-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.play[data-game="pola-angka"] .pa-bar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; width: min(100%, 460px); }
.play[data-game="pola-angka"] .pa-n { display: grid; place-items: center; min-width: 64px; min-height: 64px; padding: 6px 10px; border-radius: 16px; background: var(--card); box-shadow: 0 4px 0 var(--shadow); font-weight: 800; font-size: 1.6rem; }
.play[data-game="pola-angka"] .pa-n.is-tanya { background: #fff0b3; box-shadow: 0 4px 0 var(--shadow), inset 0 0 0 3px #f5b301; color: var(--c); }
.play[data-game="pola-angka"] .pa-n.is-jawab { background: #d3f9d8; }
`;

  function barisan(awal, aturan, n) {
    const out = [awal];
    for (let i = 1; i < n; i++) out.push(aturan(out[i - 1], i));
    return out;
  }
  const AT = {
    tambah1: { f: (x) => x + 1, nama: 'tambah 1' },
    tambah2: { f: (x) => x + 2, nama: 'tambah 2' },
    tambah3: { f: (x) => x + 3, nama: 'tambah 3' },
    kurang2: { f: (x) => x - 2, nama: 'kurang 2' },
    kali2: { f: (x) => x * 2, nama: 'kali 2' },
  };

  TI.register({
    id: 'pola-angka',
    title: 'Pola Angka',
    cat: 'logika',
    icon: '🔟',
    desc: 'Tebak angka berikutnya.',
    start(ctx) {
      TI.style('pola-angka', CSS);
      const tk = ctx.isTK;

      const soal = [];
      if (tk) {
        const kunci = ['tambah1', 'tambah2'];
        for (let i = 0; i < 6; i++) {
          const id = kunci[i % 2];
          const awal = rand(1, 8);
          soal.push({ id, awal, tanyaAturan: false });
        }
      } else {
        const kunci = ['tambah3', 'kurang2', 'kali2', 'tambah3', 'kurang2', 'kali2'];
        const awalSD = [2, 20, 1, 4, 14, 3];
        kunci.forEach((id, i) => soal.push({ id, awal: awalSD[i], tanyaAturan: false }));
        soal.push({ id: 'kali2', awal: 2, tanyaAturan: true });
        soal.push({ id: 'kurang2', awal: 18, tanyaAturan: true });
      }

      ctx.series(soal, async ({ id, awal, tanyaAturan }) => {
        const at = AT[id];
        const deret = barisan(awal, at.f, 5);
        const jawab = deret[4];
        const bar = h('div', { class: 'pa-bar' });
        deret.slice(0, 4).forEach((x) => bar.append(h('span', { class: 'pa-n pop-in' }, String(x))));
        const kotak = h('span', { class: 'pa-n is-tanya' }, '?');
        bar.append(kotak);
        ctx.el.append(h('div', { class: 'pa-wrap' }, bar));

        if (!tanyaAturan) {
          ctx.ask('Angka berapa lanjutannya? Lihat aturannya!');
          const pool = new Set([jawab]);
          [1, 2, 3, -1, -2].forEach((d) => pool.add(jawab + d));
          pool.delete(jawab);
          const opsi = shuffle([jawab].concat(shuffle([...pool]).slice(0, (tk ? 3 : 4) - 1)));
          await ctx.choose({ options: opsi, answer: jawab, speakLabel: true });
          kotak.textContent = jawab;
          kotak.classList.add('is-jawab');
          await ctx.wait(400);
        } else {
          ctx.ask('Hebat! Sekarang tebak aturannya. Barisan ini pakai aturan apa?');
          const semua = ['tambah 1', 'tambah 2', 'tambah 3', 'kurang 2', 'kali 2'];
          const opsi = shuffle([at.nama].concat(shuffle(semua.filter((x) => x !== at.nama)).slice(0, 3)));
          await ctx.choose({ options: opsi, answer: at.nama, speakLabel: true, layout: 'is-col' });
          kotak.textContent = jawab;
          kotak.classList.add('is-jawab');
          await ctx.wait(400);
        }
      }, {
        lesson: tk
          ? 'Angka bisa berurutan dengan aturan. Tambah 1 atau tambah 2, lanjutannya bisa ditebak.'
          : 'Setiap barisan punya aturan: tambah, kurang, atau kali. Kalau tahu aturannya, lanjutan dan aturannya bisa ditebak.',
      });
    },
  });
})();
