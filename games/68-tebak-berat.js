/* 68 Tebak Berat. Bandingkan 2 benda (mana lebih berat) lalu tebak berat dalam kubus satuan.
   TK: 5 soal banding. SD: tambah tebakan angka (banding tricky + estimasi kubus).
   Urut gampang dulu (banding, jebakan sama, kubus). Jawaban terungkap. */
(function () {
  const { h, shuffle, sample, numChoices } = TI;

  const CSS = `
.play[data-game="tebak-berat"] .tb-wrap { width: 100%; max-width: 600px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.play[data-game="tebak-berat"] .tb-duo { display: flex; gap: 14px; width: 100%; justify-content: center; }
.play[data-game="tebak-berat"] .tb-duo .choice { flex: 1 1 0; max-width: 260px; min-height: 150px; flex-direction: column; gap: 6px; font-size: 1.25rem; font-weight: 800; }
.play[data-game="tebak-berat"] .tb-ic { font-size: 4rem; line-height: 1; }
.play[data-game="tebak-berat"] .tb-timbang { display: flex; align-items: flex-end; justify-content: center; gap: 26px; width: 100%; padding: 14px; }
.play[data-game="tebak-berat"] .tb-piring { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.play[data-game="tebak-berat"] .tb-kubus { display: grid; grid-template-columns: repeat(4, 34px); gap: 6px; justify-content: center; }
.play[data-game="tebak-berat"] .tb-kubus i { width: 34px; height: 34px; border-radius: 8px; background: #4c8dff; border: 3px solid #1c4fa0; }`;

  // Pasangan [berat, ringan]: yang berat selalu menang kecuali babak sama berat.
  const PASANGAN = [
    { berat: ['ðŸ‰', 'Semangka'], ringan: ['ðŸ’', 'Ceri'] },
    { berat: ['ðŸ§±', 'Bata'], ringan: ['ðŸª¶', 'Bulu'] },
    { berat: ['ðŸŽ’', 'Tas penuh buku'], ringan: ['ðŸ§¦', 'Kaus kaki'] },
    { berat: ['ðŸ¥¥', 'Kelapa'], ringan: ['ðŸ‡', 'Anggur'] },
    { berat: ['ðŸ“š', 'Buku tebal'], ringan: ['âœï¸', 'Pensil'] },
    { berat: ['ðŸŽ³', 'Bola bowling'], ringan: ['ðŸŽ¾', 'Bola tenis'] },
  ];
  const kartu = ([ic, nama]) => h('span', null, h('span', { class: 'tb-ic', 'aria-hidden': 'true' }, ic), h('span', null, nama));

  TI.register({
    id: 'tebak-berat',
    title: 'Tebak Berat',
    cat: 'mat',
    icon: 'ðŸŽ’',
    desc: 'Mana lebih berat? Tebak dengan kubus satuan.',
    async start(ctx) {
      TI.style('tebak-berat', CSS);
      const TK = ctx.isTK;
      const banding = TK ? sample(PASANGAN, 5) : sample(PASANGAN, 3);
      const ronde = banding.map((p) => ({ tipe: 'banding', sulit: 0, p }));
      if (!TK) {
        ronde.push({ tipe: 'sama', sulit: 1 });
        for (let i = 0; i < 2; i++) ronde.push({ tipe: 'kubus', sulit: 2 });
      }
      ronde.sort((a, b) => a.sulit - b.sulit); // banding dulu, kubus belakangan

      let ke = 0;
      // Kibor: angka 1-4 memilih jawaban (aksesibilitas desktop).
      ctx.on(document, 'keydown', (e) => {
        if (!ctx.alive || e.ctrlKey || e.metaKey || e.altKey) return;
        const i = ['1', '2', '3', '4'].indexOf(e.key);
        if (i < 0) return;
        const b = ctx.el.querySelectorAll('.ti-choices .choice')[i];
        if (b) b.click();
      });
      await ctx.series(ronde, async (r) => {
        ke++;
        const m0 = ctx.mistakes;
        if (ke === 3) ctx.correct(null, { say: TK ? 'Bagus! Setengah jalan!' : 'Bagus! Terus naik ke yang sulit.' });
        if (r.tipe === 'banding') {
          const { berat, ringan } = r.p;
          const opsi = shuffle([
            { node: kartu(berat), value: 'berat', say: berat[1] },
            { node: kartu(ringan), value: 'ringan', say: ringan[1] },
          ]);
          ctx.ask('Mana yang lebih berat?');
          await ctx.choose({
            options: opsi.map((o) => ({ ...o, cls: 'is-big' })),
            answer: 'berat',
          });
          ctx.el.append(h('p', { class: 'ti-label' }, 'Benar! ' + berat[1] + ' lebih berat.'));
          ctx.sfx('pop');
          await ctx.wait(350);
        } else if (r.tipe === 'sama') {
          ctx.ask('Mana yang lebih berat: 1 kg kapas atau 1 kg besi?');
          await ctx.choose({
            options: shuffle([
              { label: 'Kapas', value: 'kapas', say: 'kapas' },
              { label: 'Sama berat', value: 'sama', say: 'sama berat' },
              { label: 'Besi', value: 'besi', say: 'besi' },
            ]),
            answer: 'sama',
          });
          ctx.note('1 kg kapas dan 1 kg besi sama beratnya. Kapas hanya terlihat lebih besar.', { title: 'Tahukah kamu?' });
          await ctx.next();
        } else {
          // Estimasi: benda di timbangan setara K kubus.
          const K = 3 + Math.floor(Math.random() * 6); // 3-8
          const benda = sample([['ðŸ‰', 'semangka'], ['ðŸ“š', 'tumpukan buku'], ['ðŸŽ’', 'tas'], ['ðŸ¥¥', 'kelapa']], 1)[0];
          const kubus = h('div', { class: 'tb-kubus', role: 'img', 'aria-label': K + ' kubus' });
          for (let i = 0; i < K; i++) kubus.append(h('i'));
          const timbang = h('div', { class: 'ti-panel tb-timbang pop-in' },
            h('div', { class: 'tb-piring' }, h('span', { class: 'tb-ic', 'aria-hidden': 'true' }, benda[0]), h('span', null, benda[1])),
            h('b', { class: 'tb-ic', 'aria-hidden': 'true' }, '='),
            h('div', { class: 'tb-piring' }, kubus, h('span', null, 'kubus satuan')));
          ctx.el.append(h('div', { class: 'tb-wrap' }, timbang));
          ctx.ask('Berapa kubus berat ' + benda[1] + ' ini? Hitung kubusnya!');
          const opsi = numChoices(K, 4, Math.max(1, K - 3), K + 3);
          await ctx.choose({
            options: opsi.map((v) => ({ label: String(v), value: v, say: v + ' kubus' })),
            answer: K,
            speakLabel: true,
          });
          ctx.el.append(h('p', { class: 'ti-label' }, 'Beratnya ' + K + ' kubus.'));
          ctx.sfx('pop');
          await ctx.wait(350);
        }
        const salah = ctx.mistakes - m0;
        if (salah >= 3) {
          ctx.el.append(h('p', { class: 'ti-label' }, 'Kamu salah ' + salah + ' kali, tidak apa. Tips: bandingkan baik-baik!'));
          ctx.say('Tips. Bandingkan baik-baik!');
        }
      }, {
        lesson: 'Benda besar belum tentu lebih berat. Timbangan dan satuan kubus membantu kita menebak berat.',
      });
    },
  });
})();
