/* 47 Ingat Urutan (logika). Gaya Simon: empat bantalan menyala berurutan, anak mengulang.
   Tanpa nada musik: tiap bantalan punya efek suara berbeda (tap, pop, klik, flip).
   TK: panjang 2-5 (4 ronde), nyala 700 ms. SD: panjang 3-8 (6 ronde), nyala 550 ms lalu makin cepat (maks 380 ms).
   2 kali salah di satu ronde = ronde dilewati, jadi selalu bisa selesai. */
(function () {
  const { h, rand } = TI;

  const PADS = [
    { icon: '⭐', nama: 'Bintang', sfx: 'tap', warna: '#ffc93c', gelap: '#d99a00' },
    { icon: '🌙', nama: 'Bulan', sfx: 'pop', warna: '#4dabf7', gelap: '#1c6fb8' },
    { icon: '☀️', nama: 'Matahari', sfx: 'klik', warna: '#ff9f43', gelap: '#c96a0a' },
    { icon: '💧', nama: 'Air', sfx: 'flip', warna: '#51cf66', gelap: '#2b8a3e' },
  ];

  const CSS = `
    & .ing-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
    & .ing-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
    & .ing-chip { padding: 6px 16px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.05rem; }
    & .ing-status { margin: 0; min-height: 1.5em; font-weight: 800; font-size: 1.3rem; text-align: center; color: var(--c); }
    & .ing-dots { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; min-height: 26px; }
    & .ing-dots i {
      display: block; width: 22px; height: 22px; border-radius: 50%; border: 3px solid var(--c); background: #fff;
      transition: transform var(--dur-ui) var(--ease-out), background-color var(--dur-ui) ease, border-color var(--dur-ui) ease;
    }
    & .ing-dots i.is-on { background: var(--good); border-color: var(--good); transform: scale(1.18); }
    & .ing-board { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: min(100%, 440px); }
    & .ing-pad {
      position: relative; display: grid; place-items: center; aspect-ratio: 1 / 0.88; padding: 0; margin: 0;
      border: 0; border-radius: 30px; background: var(--pc); box-shadow: 0 8px 0 var(--pd);
      cursor: pointer; overflow: hidden; -webkit-appearance: none; appearance: none;
      transition: transform 90ms var(--ease-out);
    }
    & .ing-pad::before, & .ing-pad::after {
      content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
      transition: opacity 90ms var(--ease-out);
    }
    & .ing-pad::before { background: radial-gradient(circle at 50% 40%, #fff 0, rgba(255, 255, 255, 0.55) 55%, rgba(255, 255, 255, 0.1) 100%); }
    & .ing-pad::after { background: #e5484d; }
    & .ing-pad:disabled { cursor: default; }
    & .ing-pad:active:not(:disabled) { transform: translateY(4px) scale(0.98); }
    & .ing-pad.is-lit { transform: scale(1.06); z-index: 2; }
    & .ing-pad.is-lit::before { opacity: 0.85; }
    & .ing-pad.is-bad::after { opacity: 0.8; }
    & .ing-pad.is-bad { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); }
    & .ing-ic {
      position: relative; z-index: 1; display: grid; place-items: center; width: clamp(66px, 24vw, 96px); aspect-ratio: 1;
      border-radius: 50%; background: rgba(255, 255, 255, 0.88); box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.08);
      font-size: clamp(2.4rem, 10vw, 3.6rem); line-height: 1; pointer-events: none;
    }
    & .ing-board.is-locked .ing-pad:not(.is-lit) { opacity: 0.9; }
    @media (prefers-reduced-motion: reduce) {
      & .ing-pad.is-lit { transform: none; }
      & .ing-pad.is-bad { animation: none; }
      & .ing-pad:active:not(:disabled) { transform: none; }
      & .ing-dots i.is-on { transform: none; }
    }
  `.replace(/&/g, '.play[data-game="ingat"]');

  // Urutan acak; tidak ada bantalan yang sama tiga kali berturut-turut.
  function buatUrutan(n) {
    const s = [];
    while (s.length < n) {
      const i = rand(0, 3);
      if (s.length >= 2 && s[s.length - 1] === i && s[s.length - 2] === i) continue;
      s.push(i);
    }
    return s;
  }

  TI.register({
    id: 'ingat',
    title: 'Ingat Urutan',
    cat: 'logika',
    icon: '🧠',
    desc: 'Lihat bantalan menyala, lalu ulangi urutannya.',
    async start(ctx) {
      TI.style('ingat', CSS);
      const tk = ctx.isTK;
      const ronde = tk ? 4 : 6;
      const panjangAwal = tk ? 2 : 3;
      const seqPenuh = buatUrutan(panjangAwal + ronde - 1);

      // ---------- tampilan ----------
      const chipRonde = h('span', { class: 'ing-chip', 'aria-live': 'polite' });
      const chipPanjang = h('span', { class: 'ing-chip' });
      const status = h('p', { class: 'ing-status', 'aria-live': 'polite' });
      const dots = h('div', { class: 'ing-dots', 'aria-hidden': 'true' });
      const board = h('div', { class: 'ing-board' });
      const pads = PADS.map((p, i) => {
        const b = h('button', {
          type: 'button', class: 'ing-pad pop-in', style: '--pc:' + p.warna + ';--pd:' + p.gelap + ';--i:' + i, 'aria-label': p.nama,
        }, h('span', { class: 'ing-ic', 'aria-hidden': 'true' }, p.icon));
        b.addEventListener('click', () => ketukPad(i));
        board.append(b);
        return b;
      });
      const ulang = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '🔁 Lihat lagi');
      ulang.addEventListener('click', () => { if (ulangiMinta) ulangiMinta(); });
      ctx.el.append(h('div', { class: 'ing-wrap' },
        h('div', { class: 'ing-info' }, chipRonde, chipPanjang), status, dots, board,
        h('div', { class: 'ti-toolbar' }, ulang)));

      // ---------- bantu ----------
      const kunci = (ya) => {
        pads.forEach((b) => { b.disabled = ya; });
        ulang.disabled = ya;
        board.classList.toggle('is-locked', ya);
      };
      const teks = (t) => { status.textContent = t; };
      const isiDots = (n, total) => {
        dots.replaceChildren();
        for (let i = 0; i < total; i++) dots.append(h('i', { class: i < n ? 'is-on' : '' }));
      };
      const tandai = (n) => { [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i < n)); };
      async function nyala(i, ms, kelas) {
        const b = pads[i];
        b.classList.add(kelas || 'is-lit');
        if (!kelas) ctx.sfx(PADS[i].sfx);
        await ctx.wait(ms);
        b.classList.remove(kelas || 'is-lit');
      }
      async function putar(seq, lit, jeda) {
        kunci(true);
        teks('Perhatikan...');
        await ctx.wait(450);
        for (const i of seq) {
          if (!ctx.alive) return;
          await nyala(i, lit);
          await ctx.wait(jeda);
        }
      }

      let penangan = null; // fungsi yang menerima nomor bantalan saat giliran anak
      let ulangiMinta = null;
      function ketukPad(i) { if (penangan) penangan(i); }
      function bacaJawaban(seq) {
        return new Promise((selesai) => {
          let pos = 0;
          isiDots(0, seq.length);
          kunci(false);
          teks('Giliran kamu!');
          ulangiMinta = () => { penangan = null; ulangiMinta = null; kunci(true); selesai('lagi'); };
          penangan = (i) => {
            if (i === seq[pos]) {
              pos++;
              tandai(pos);
              nyala(i, 170);
              if (pos === seq.length) { penangan = null; ulangiMinta = null; kunci(true); selesai(true); }
            } else {
              penangan = null; ulangiMinta = null; kunci(true);
              nyala(i, 450, 'is-bad');
              selesai(false);
            }
          };
        });
      }

      // ---------- jalannya permainan ----------
      ctx.ask(tk ? 'Lihat bantalan yang menyala, lalu ketuk urutan yang sama!' : 'Hafalkan urutan nyalanya, lalu ulangi!');
      kunci(true);
      await ctx.wait(tk ? 1800 : 1400);

      for (let r = 0; r < ronde; r++) {
        if (!ctx.alive) return;
        const panjang = panjangAwal + r;
        const seq = seqPenuh.slice(0, panjang);
        const lit = tk ? 700 : Math.max(380, 550 - r * 40);
        const jeda = tk ? 280 : Math.max(150, Math.round(lit * 0.45));
        ctx.progress(r, ronde);
        chipRonde.textContent = 'Ronde ' + (r + 1) + ' dari ' + ronde;
        chipPanjang.textContent = 'Urutan: ' + panjang; if (r === Math.floor(ronde / 2) && ctx.alive) ctx.correct(null, { say: 'Bagus! Setengah jalan, terus naik ke yang lebih panjang!' });
        isiDots(0, panjang);
        if (r > 0) ctx.ask(tk ? 'Ronde ' + (r + 1) + '. Lihat baik-baik!' : 'Ronde ' + (r + 1) + '. Hafalkan urutannya!', { speak: tk });

        let salah = 0, lulus = false;
        await putar(seq, lit, jeda);
        while (ctx.alive && !lulus) {
          const hasil = await bacaJawaban(seq);
          if (!ctx.alive) return;
          if (hasil === true) {
            lulus = true;
            teks('Benar semua!');
            await ctx.correct(null, { say: tk ? 'Hebat! Kamu ingat semuanya!' : 'Benar semua!', min: 600 });
          } else if (hasil === 'lagi') {
            await putar(seq, lit, jeda);
          } else {
            salah++;
            tandai(0);
            if (salah >= 2) {
              teks('Tidak apa-apa, kita lanjut!');
              await ctx.wrong(null, { say: 'Tidak apa-apa, kita lanjut ya!', min: 900 });
              break;
            }
            teks('Ups, lihat sekali lagi ya!');
            await ctx.wrong(null, { say: 'Ups! Lihat sekali lagi ya.', min: 700 });
            await putar(seq, lit, jeda);
          }
        }
      }

      if (!ctx.alive) return;
      ctx.progress(ronde, ronde);
      const m = ctx.mistakes;
      ctx.finish({
        stars: m <= 1 ? 3 : m <= (tk ? 3 : 5) ? 2 : 1,
        total: ronde,
        lesson: 'Mengingat urutan melatih fokus. Seperti menghafal surat pendek: sedikit demi sedikit, lama-lama hafal.',
      });
    },
  });
})();
