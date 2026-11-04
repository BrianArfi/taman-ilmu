/* 100 Raja Taman. Ujian terakhir: 10 soal campuran 4 kategori, 3 nyawa. Fakta hanya dari bank SPEC dan game lama. */
(function () {
  const { h, shuffle, sample } = TI;

  const CSS = `
.play[data-game="raja-taman"] .rj-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="raja-taman"] .rj-hud { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.play[data-game="raja-taman"] .rj-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.1rem; }
.play[data-game="raja-taman"] .rj-chip.is-hati { font-size: 1.3rem; letter-spacing: 2px; }
.play[data-game="raja-taman"] .rj-card { padding: 14px 22px; border-radius: 22px; background: var(--card); box-shadow: 0 5px 0 var(--shadow); }
.play[data-game="raja-taman"] .rj-big { margin: 0; font-size: 4rem; line-height: 1; text-align: center; }
`;

  const arab = (x) => h('span', { class: 'ti-arabic' }, x);

  // Fakta dari bank SPEC dan game lama: hijaiyah (01), hitung kecil (08), langit dan matahari (04), lawan kata (98).
  const HIJAIYAH = [
    { kind: 'lihat', ar: 'ب', jawab: 'Ba', opsi: ['Ba', 'Ta', 'Tsa'] },
    { kind: 'lihat', ar: 'م', jawab: 'Mim', opsi: ['Mim', 'Nun', 'Lam'] },
    { kind: 'lihat', ar: 'ن', jawab: 'Nun', opsi: ['Nun', 'Mim', 'Wau'] },
    { kind: 'dengar', nama: 'Alif', jawab: 'ا', opsi: ['ا', 'ب', 'ت'] },
    { kind: 'dengar', nama: 'Ba', jawab: 'ب', opsi: ['ب', 'ت', 'ن'] },
    { kind: 'teks', soal: 'Huruf hijaiyah ada berapa?', jawab: '28', opsi: ['25', '28', '30'] },
  ];
  const HITUNG = [
    { kind: 'teks', soal: '3 tambah 2 sama dengan?', jawab: '5', opsi: ['4', '5', '6'] },
    { kind: 'teks', soal: '10 kurang 4 sama dengan?', jawab: '6', opsi: ['5', '6', '7'] },
    { kind: 'teks', soal: 'Ada 4 kue, tambah 3 kue. Berapa semua?', jawab: '7', opsi: ['6', '7', '8'] },
    { kind: 'teks', soal: '8 kurang 5 sama dengan?', jawab: '3', opsi: ['2', '3', '4'] },
    { kind: 'teks', soal: '2 kali 3 sama dengan?', jawab: '6', opsi: ['5', '6', '9'] },
  ];
  const LANGIT = [
    { kind: 'teks', soal: 'Kapan matahari terbit?', jawab: 'Pagi hari', opsi: ['Pagi hari', 'Siang hari', 'Malam hari'] },
    { kind: 'teks', soal: 'Langit di siang hari berwarna?', jawab: 'Biru', opsi: ['Biru', 'Hitam', 'Merah'] },
    { kind: 'teks', soal: 'Bintang terlihat saat?', jawab: 'Malam hari', opsi: ['Pagi hari', 'Siang hari', 'Malam hari'] },
    { kind: 'teks', soal: 'Shalat Maghrib dikerjakan saat?', jawab: 'Matahari terbenam', opsi: ['Matahari terbit', 'Matahari terbenam', 'Tengah malam'] },
  ];
  const LAWAN = [
    { kind: 'teks', soal: 'Apa lawan kata panas?', jawab: 'dingin', opsi: ['dingin', 'hangat', 'sejuk'] },
    { kind: 'teks', soal: 'Apa lawan kata besar?', jawab: 'kecil', opsi: ['kecil', 'luas', 'tinggi'] },
    { kind: 'teks', soal: 'Apa lawan kata tinggi?', jawab: 'rendah', opsi: ['rendah', 'panjang', 'besar'] },
    { kind: 'teks', soal: 'Apa lawan kata cepat?', jawab: 'lambat', opsi: ['lambat', 'kilat', 'gesit'] },
    { kind: 'teks', soal: 'Apa lawan kata terang?', jawab: 'gelap', opsi: ['gelap', 'silau', 'redup'] },
    { kind: 'teks', soal: 'Apa lawan kata basah?', jawab: 'kering', opsi: ['kering', 'lembap', 'dingin'] },
  ];
  const TAMBAH_SD = {
    'Ba': 'Ja', 'Ta': 'Tsa', 'Mim': 'Sin', 'Nun': 'Qof', 'Alif': 'Dal',
    '4': '3', '5': '7', '6': '8', '7': '9', '3': '2', '2': '4', '9': '10', '8': '11',
    'Pagi hari': 'Sore hari', 'Siang hari': 'Pagi hari', 'Malam hari': 'Siang hari',
    'Biru': 'Abu-abu', 'Hitam': 'Putih', 'Merah': 'Jingga',
    'Matahari terbit': 'Bulan terbit', 'Matahari terbenam': 'Bulan terbenam', 'Tengah malam': 'Tengah hari',
    'dingin': 'panas', 'hangat': 'panas', 'sejuk': 'gerah', 'kecil': 'mungil', 'luas': 'sempit',
    'tinggi': 'jorok', 'rendah': 'tengadah', 'panjang': 'pendek', 'besar': 'raksasa',
    'lambat': 'lelet', 'kilat': 'petir', 'gesit': 'sigap', 'gelap': 'remang', 'silau': 'pudar',
    'redup': 'suram', 'kering': 'gersang', 'lembap': 'basah', '25': '20', '28': '29', '30': '32',
    'ا': 'و', 'ب': 'ي', 'ت': 'ث', 'م': 'ه', 'ن': 'ل',
  };

  TI.register({
    id: 'raja-taman',
    title: 'Raja Taman',
    cat: 'logika',
    icon: '🏆',
    desc: 'Ujian terakhir: 10 soal, 3 nyawa.',
    start(ctx) {
      TI.style('raja-taman', CSS);
      const tk = ctx.isTK;
      const nOpsi = tk ? 3 : 4;

      const ambil = (bank, n) => sample(bank, n);
      const soal = shuffle(ambil(HIJAIYAH, 3).concat(ambil(HITUNG, 3), ambil(LANGIT, 2), ambil(LAWAN, 2)));

      const main = async () => {
        let nyawa = 3, benar = 0;
        const hud = h('div', { class: 'rj-hud' });
        const hati = h('span', { class: 'rj-chip is-hati', 'aria-label': 'Nyawa' });
        const chipSoal = h('span', { class: 'rj-chip' });
        hud.append(hati, chipSoal);
        const gambarHati = () => { hati.textContent = '❤️'.repeat(nyawa) + '🤍'.repeat(3 - nyawa); };
        gambarHati();

        for (let i = 0; i < soal.length && ctx.alive; i++) {
          if (nyawa <= 0) break;
          ctx.progress(i, soal.length);
          ctx.clear();
          ctx.el.append(h('div', { class: 'rj-wrap' }, hud));
          gambarHati();
          chipSoal.textContent = 'Soal ' + (i + 1) + ' dari ' + soal.length;
          const ok = await satu(soal[i]);
          if (ok) benar++;
          else {
            nyawa--;
            gambarHati();
            if (nyawa <= 0) { await ctx.wait(600); break; }
          }
          ctx.progress(i + 1, soal.length);
        }
        if (!ctx.alive) return;
        ctx.progress(soal.length, soal.length);
        ctx.finish({
          stars: benar >= 9 ? 3 : benar >= 6 ? 2 : 1,
          message: benar + ' dari ' + soal.length + ' benar!',
          celebrate: true,
          lesson: 'Kamu sudah belajar huruf hijaiyah, berhitung, langit ciptaan Allah, dan lawan kata. Kamu Raja Taman!',
        });
      };

      async function satu(s) {
        let opsi = s.opsi.slice();
        if (!tk) {
          for (const o of s.opsi) {
            if (opsi.length >= nOpsi) break;
            const t = TAMBAH_SD[o];
            if (t && !opsi.includes(t) && t !== s.jawab) opsi.push(t);
          }
          opsi = opsi.slice(0, nOpsi);
        }
        if (s.kind === 'lihat') {
          ctx.ask('Huruf apa ini?');
          ctx.el.append(h('div', { class: 'rj-card pop-in' }, h('p', { class: 'rj-big ti-arabic' }, s.ar)));
          const r = await ctx.choose({ options: shuffle(opsi), answer: s.jawab, speakLabel: true, retry: false });
          return r.firstTry;
        }
        if (s.kind === 'dengar') {
          ctx.ask('Mana huruf ' + s.nama + '?');
          const NAMA = { 'ا': 'Alif', 'ب': 'Ba', 'ت': 'Ta', 'م': 'Mim', 'ن': 'Nun', 'و': 'Wau', 'ل': 'Lam' };
          const r = await ctx.choose({
            options: shuffle(opsi.map((o) => ({ node: arab(o), value: o, say: 'Huruf ' + (NAMA[o] || o), aria: 'Huruf ' + (NAMA[o] || o) }))),
            answer: s.jawab,
            speakLabel: true,
            retry: false,
          });
          return r.firstTry;
        }
        ctx.ask(s.soal);
        const r = await ctx.choose({ options: shuffle(opsi), answer: s.jawab, speakLabel: true, retry: false });
        return r.firstTry;
      }

      return main();
    },
  });
})();
