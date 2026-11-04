/* 81 Tebak Bunyi. Dengar kata dibacakan TI.say dengan pitch/rate beda, lalu pilah.
   TK: TINGGI vs RENDAH (6 soal). SD: tambah CEPAT vs LAMBAT (10 soal).
   Tanpa file audio, semua lewat suara TTS. */
(function () {
  const { h, sample, shuffle } = TI;

  const KATA = ['balon', 'apel', 'roti', 'bola', 'awan', 'buku', 'susu', 'topi', 'meja', 'kopi'];
  const SUARA = {
    tinggi: { pitch: 1.7, rate: 1 },
    rendah: { pitch: 0.6, rate: 1 },
    cepat: { pitch: 1.1, rate: 1.6 },
    lambat: { pitch: 1.1, rate: 0.6 },
  };
  const BIN_META = {
    tinggi: { label: 'Tinggi', icon: '⬆️' },
    rendah: { label: 'Rendah', icon: '⬇️' },
    cepat: { label: 'Cepat', icon: '⏩' },
    lambat: { label: 'Lambat', icon: '⏪' },
  };

  const CSS = `
.play[data-game="tebak-bunyi"] .tb-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.play[data-game="tebak-bunyi"] .tb-hear { min-height: 88px; min-width: 200px; font-size: 1.5rem; }
.play[data-game="tebak-bunyi"] .tb-bins { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; width: 100%; }
.play[data-game="tebak-bunyi"] .tb-bin { flex: 1 1 140px; max-width: 220px; min-height: 96px; font-size: 1.4rem; }
.play[data-game="tebak-bunyi"] .tb-word { font-size: 1.1rem; font-weight: 800; color: var(--muted); }
.play[data-game="tebak-bunyi"] .tb-bin.is-show { outline: 4px solid var(--good); outline-offset: 3px; }
`;

  function mainkan(soal, kunci, sumbu) {
    // soal: kata yang dibaca, kunci: 'tinggi'/'rendah'/'cepat'/'lambat', sumbu: ['tinggi','rendah'] atau ['cepat','lambat']
    return async (ctx) => {
      let gagal = 0;
      for (;;) {
        if (!ctx.alive) return;
        ctx.clear();
        const tanya = sumbu[0] === 'tinggi' ? 'Dengar baik-baik. Suaranya tinggi atau rendah?' : 'Dengar baik-baik. Suaranya cepat atau lambat?';
        ctx.ask(tanya);
        const wrap = h('div', { class: 'tb-wrap' });
        const hear = h('button', { type: 'button', class: 'ti-btn tb-hear pop-in', 'aria-label': 'Dengar suaranya' }, '🔊 Dengar');
        const word = h('p', { class: 'tb-word', 'aria-hidden': 'true' }, 'Suara misteri');
        const bins = h('div', { class: 'tb-bins' });
        wrap.append(word, hear, bins);
        ctx.el.append(wrap);
        const putar = () => { TI.say(soal, SUARA[kunci]); };
        hear.addEventListener('click', () => { ctx.sfx('tap'); putar(); });
        ctx.after(400, putar);
        const hasil = await new Promise((selesai) => {
          sumbu.forEach((b, i) => {
            const m = BIN_META[b];
            const btn = h('button', {
              type: 'button', class: 'choice tb-bin pop-in', style: '--i:' + i,
              'aria-label': m.label,
            }, m.icon + ' ' + m.label);
            btn.addEventListener('click', async () => {
              if (btn.disabled) return;
              if (b === kunci) {
                btn.disabled = true;
                await ctx.correct(btn);
                selesai(true);
              } else {
                gagal++;
                await ctx.wrong(btn);
                if (gagal >= 3) {
                  const benar = [...bins.children].find((x) => x.getAttribute('aria-label') === BIN_META[kunci].label);
                  if (benar) benar.classList.add('is-show');
                  await ctx.sayWait('Jawabannya ' + BIN_META[kunci].label + '. ' + soal + ' dibaca dengan suara ' + BIN_META[kunci].label.toLowerCase() + '.');
                  selesai(false);
                }
              }
            });
            bins.append(btn);
          });
        });
        if (hasil) return;
        return;
      }
    };
  }

  TI.register({
    id: 'tebak-bunyi',
    title: 'Tebak Bunyi',
    cat: 'sains',
    icon: '🎺',
    desc: 'Dengar baik-baik: tinggi atau rendah?',
    start(ctx) {
      TI.style('tebak-bunyi', CSS);
      const isTK = ctx.isTK;
      const kata = sample(KATA, isTK ? 6 : 10);
      const items = kata.map((w, i) => {
        if (isTK) return { soal: w, kunci: i % 2 === 0 ? 'tinggi' : 'rendah', sumbu: ['tinggi', 'rendah'] };
        if (i % 2 === 0) return { soal: w, kunci: Math.random() < 0.5 ? 'tinggi' : 'rendah', sumbu: ['tinggi', 'rendah'] };
        return { soal: w, kunci: Math.random() < 0.5 ? 'cepat' : 'lambat', sumbu: ['cepat', 'lambat'] };
      });
      // Acak urutan tampil, sumbu tetap menempel pada soalnya.
      const urutan = shuffle(items.map((it, i) => i));
      return (async () => {
        for (let k = 0; k < urutan.length && ctx.alive; k++) {
          ctx.progress(k, urutan.length);
          const it = items[urutan[k]];
          await mainkan(it.soal, it.kunci, it.sumbu)(ctx);
        }
        if (!ctx.alive) return;
        ctx.progress(urutan.length, urutan.length);
        ctx.finish({ lesson: 'Suara tinggi terdengar melengking, suara rendah terdengar berat. Suara cepat terdengar buru-buru, suara lambat terdengar santai.' });
      })();
    },
  });
})();
