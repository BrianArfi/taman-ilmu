/* 54 Takar Zakat Fitrah. Ketuk cup untuk dituang ke timbangan sampai pas.
   TK: target 1-3. SD: sampai 5 + hitung total untuk 3 jiwa. */
(function () {
  const { h, shuffle } = TI;

  const P = '.play[data-game="zakat-fitrah"]';
  const CSS = `
${P} .zf-target { padding: 8px 22px; border-radius: 999px; background: color-mix(in srgb, var(--c) 12%, #fff); border: 3px solid var(--c); font-size: 1.35rem; font-weight: 800; color: var(--c); }
${P} .zf-timbang { width: 100%; max-width: 520px; padding: 12px; border-radius: 20px; background: #fff; border: 3px solid var(--line); box-shadow: 0 5px 0 var(--shadow); display: flex; flex-direction: column; align-items: center; gap: 6px; }
${P} .zf-isi { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; min-height: 64px; }
${P} .zf-cup { font-size: 2.6rem; line-height: 1; }
${P} .zf-hitung { font-size: 1.25rem; font-weight: 800; }
${P} .zf-baris { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
${P} .zf-baris .ti-btn { min-height: 64px; font-size: 1.1rem; }
${P} .zf-msg { min-height: 1.6em; font-weight: 800; font-size: 1.1rem; text-align: center; }
${P} .zf-msg.is-salah { color: var(--bad); }`;

  const CUP = '🍚';

  // Satu ronde takar: tuang cup sampai pas dengan target.
  function rondeTakar(ctx, target) {
    return new Promise((selesai) => {
      ctx.ask('Takar ' + target + ' cup beras untuk zakat!', { say: 'Takar ' + target + ' cup beras untuk zakat!' });
      ctx.el.append(h('div', { class: 'ti-panel' }, h('span', { class: 'zf-target pop-in' }, 'Target: ' + target + ' cup')));
      const isi = h('div', { class: 'zf-isi', 'aria-live': 'polite' });
      const hitung = h('p', { class: 'zf-hitung' }, 'Isi: 0 cup');
      const timbang = h('div', { class: 'zf-timbang pop-in' }, h('span', { class: 'ti-label' }, '⚖️ Timbangan'), isi, hitung);
      const msg = h('p', { class: 'zf-msg', 'aria-live': 'polite' });
      const bTuang = h('button', { type: 'button', class: 'ti-btn' }, '+ Tuang 1 cup');
      const bKurang = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '- Ambil 1 cup');
      const bPas = h('button', { type: 'button', class: 'ti-btn' }, 'Sudah pas!');
      ctx.el.append(timbang, h('div', { class: 'zf-baris' }, bTuang, bKurang), msg, bPas);

      let n = 0, gagal = 0, sibuk = false;
      const gambar = () => {
        isi.replaceChildren();
        for (let i = 0; i < n; i++) isi.append(h('span', { class: 'zf-cup pop-in', 'aria-hidden': 'true' }, CUP));
        hitung.textContent = 'Isi: ' + n + ' cup';
      };
      gambar();
      const kunci = (ya) => { sibuk = ya; bTuang.disabled = ya; bKurang.disabled = ya; bPas.disabled = ya; };

      bTuang.addEventListener('click', () => {
        if (sibuk || n >= 9) return;
        n++; ctx.sfx('tap'); ctx.say(String(n));
        gambar();
      });
      bKurang.addEventListener('click', () => {
        if (sibuk || n <= 0) return;
        n--; ctx.sfx('klik');
        gambar();
      });
      bPas.addEventListener('click', async () => {
        if (sibuk) return;
        if (n === target) {
          kunci(true);
          await ctx.correct(null, { say: 'Pas! ' + target + ' cup. Masya Allah!' });
          selesai();
        } else {
          gagal++;
          msg.textContent = n < target ? 'Kurang ' + (target - n) + ' cup lagi.' : 'Kelebihan ' + (n - target) + ' cup. Ambil lagi ya.';
          msg.className = 'zf-msg is-salah';
          if (gagal >= 3) {
            kunci(true);
            await ctx.wrong(null, { say: false });
            msg.textContent = 'Lihat caranya ya.';
            msg.className = 'zf-msg';
            await ctx.wait(600);
            n = target; gambar(); ctx.sfx('benar');
            await ctx.sayWait('Tuang sampai ' + target + ' cup. Nah, sekarang pas.');
            selesai();
          } else {
            await ctx.wrong(null, { say: n < target ? 'Kurang. Tambah lagi.' : 'Kelebihan. Ambil lagi.' });
          }
        }
      });
    });
  }

  TI.register({
    id: 'zakat-fitrah',
    title: 'Takar Zakat Fitrah',
    cat: 'islam',
    icon: '🍚',
    desc: 'Takar beras zakat dengan cangkir sampai pas.',
    async start(ctx) {
      TI.style('zakat-fitrah', CSS);
      const TK = ctx.isTK;

      if (TK) {
        await ctx.series([2, 1, 3], (t) => rondeTakar(ctx, t), {
          lesson: 'Zakat fitrah dibayar sebelum shalat Idul Fitri. Ayo ajak ayah dan ibu membayar zakat tepat waktu.',
        });
        return;
      }

      const takar = [3, 4, 5, 2];
      const total = takar.length + 1;
      ctx.progress(0, total);
      for (const t of takar) {
        ctx.clear();
        await rondeTakar(ctx, t);
        if (!ctx.alive) return;
        ctx.progress(takar.indexOf(t) + 1, total);
      }
      // Ronde akhir: total untuk 3 jiwa.
      ctx.clear();
      ctx.progress(takar.length, total);
      const perJiwa = 3;
      ctx.ask('Satu orang membayar ' + perJiwa + ' cup. Satu keluarga ada 3 orang. Berapa cup semuanya?',
        { say: 'Satu orang membayar ' + perJiwa + ' cup. Satu keluarga ada 3 orang. Berapa cup semuanya?' });
      await ctx.choose({
        options: shuffle([perJiwa * 3 - 1, perJiwa * 3, perJiwa * 3 + 1, perJiwa * 3 + 3]).map((n) => ({ label: n + ' cup', value: n, say: String(n) + ' cup' })),
        answer: perJiwa * 3,
        speakLabel: true,
      });
      if (!ctx.alive) return;
      ctx.progress(total, total);
      ctx.finish({ lesson: 'Zakat fitrah dibayar sebelum shalat Idul Fitri. Ayo ajak ayah dan ibu membayar zakat tepat waktu.' });
    },
  });
})();
