/* 100 Raja Taman. Ujian terakhir: 10 soal campuran 4 kategori, 3 nyawa. Fakta hanya dari bank SPEC dan game lama.
   Kategori selang-seling seimbang. Tiap soal teks ada ikon kategorinya. Perisai: salah pertama dapat petunjuk samar + satu opsi salah disingkirkan, nyawa hilang kalau salah 2x.
   HP Raja: 10, berkurang 1 tiap jawaban benar (firstTry maupun lolos) + bunyi damage; nol = Raja kalah. */
(function () {
  const { h, shuffle, sample } = TI;

  const CSS = `
.play[data-game="raja-taman"] .rj-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="raja-taman"] .rj-hud { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.play[data-game="raja-taman"] .rj-chip { padding: 5px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.1rem; }
.play[data-game="raja-taman"] .rj-chip.is-hati { font-size: 1.3rem; letter-spacing: 2px; }
.play[data-game="raja-taman"] .rj-card { padding: 14px 22px; border-radius: 22px; background: var(--card); box-shadow: 0 5px 0 var(--shadow); border-left: 8px solid var(--shadow); }
.play[data-game="raja-taman"] .rj-big { margin: 0; font-size: 4rem; line-height: 1; text-align: center; }
.play[data-game="raja-taman"] .rj-bank { margin: 4px 0 0; font-size: .85rem; font-weight: 700; text-align: center; opacity: .65; }
.play[data-game="raja-taman"] .rj-bank-hijaiyah { border-left-color: #8b5cf6; }
.play[data-game="raja-taman"] .rj-bank-hitung { border-left-color: #3b82f6; }
.play[data-game="raja-taman"] .rj-bank-langit { border-left-color: #f59e0b; }
.play[data-game="raja-taman"] .rj-bank-lawan { border-left-color: #22c55e; }
.play[data-game="raja-taman"] .rj-bos { display: inline-flex; align-items: center; gap: 6px; }
.play[data-game="raja-taman"] .rj-bos-luar { display: inline-block; width: 90px; height: 12px; border-radius: 999px; background: var(--shadow); overflow: hidden; }
.play[data-game="raja-taman"] .rj-bos-isi { display: block; height: 100%; width: 100%; border-radius: 999px; background: linear-gradient(90deg, #ff6b6b, #c92a2a); transition: width var(--dur-ui) var(--ease-out); }
.play[data-game="raja-taman"] .rj-intro { max-width: 430px; text-align: center; }
.play[data-game="raja-taman"] .rj-intro p { margin: 6px 0; font-weight: 700; }
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
    desc: 'Kalahkan HP Raja: 10 soal, 3 nyawa, kesempatan kedua.',
    start(ctx) {
      TI.style('raja-taman', CSS);
      const tk = ctx.isTK;
      const nOpsi = tk ? 3 : 4;
      let tanyaTerakhir = '';
      const tanya = (t) => { tanyaTerakhir = t; ctx.ask(t); };

      const ambil = (bank, n, tag) => sample(bank, n).map((s) => ({ ...s, bank: tag }));
      const grup = [ambil(HIJAIYAH, 3, 'hijaiyah'), ambil(HITUNG, 3, 'hitung'), ambil(LANGIT, 2, 'langit'), ambil(LAWAN, 2, 'lawan')];
      // Selang-seling kategori supaya ujian seimbang (bukan menumpuk acak).
      const soal = [];
      for (let g = 0; g < 3; g++) for (const bank of grup) if (bank[g]) soal.push(bank[g]);
      const IKON = { hijaiyah: '📜', hitung: '🔢', langit: '🌤️', lawan: '🔀' };
      const BANK_NAMA = { hijaiyah: 'Huruf Hijaiyah', hitung: 'Berhitung', langit: 'Langit', lawan: 'Lawan Kata' };
      // Petunjuk samar per bank: mengarah tanpa membocorkan jawaban.
      const PETUNJUK = {
        hijaiyah: 'Ingat-ingat lagi pelajarannya.',
        hitung: 'Hitung pelan-pelan dengan jarimu.',
        langit: 'Ingat-ingat lagi langitnya.',
        lawan: 'Bayangkan kebalikannya.',
      };

      const main = async () => {
        let nyawa = 3, benar = 0, beruntun = 0;
        const hud = h('div', { class: 'rj-hud' });
        const hati = h('span', { class: 'rj-chip is-hati', 'aria-label': 'Nyawa' });
        const chipSoal = h('span', { class: 'rj-chip' });
        // Rekor jawaban benar per jenjang: alasan balik main lagi.
        const kunciRekor = 'raja-taman-' + (tk ? 'tk' : 'sd');
        const bacaRekor = () => { try { return JSON.parse(localStorage.getItem('tamanIlmu.rekor.v1') || '{}')[kunciRekor] | 0; } catch (e) { return 0; } };
        let rekor = bacaRekor();
        const chipRekor = h('span', { class: 'rj-chip', 'aria-live': 'polite' }, 'Rekor: ' + rekor + '/' + soal.length);
        const ulang = h('button', { type: 'button', class: 'ti-btn is-ghost', 'aria-label': 'Ulangi pertanyaan' }, '🔊');
        // HP Raja: penuh di awal, -1 tiap benar percobaan pertama.
        const bosIsi = h('span', { class: 'rj-bos-isi' });
        const bos = h('span', { class: 'rj-chip rj-bos', 'aria-label': 'Nyawa Raja: ' + soal.length },
          '👑', h('span', { class: 'rj-bos-luar' }, bosIsi));
        let bosHP = soal.length, rajaKalah = false;
        const gambarBos = () => {
          bosHP = Math.max(0, bosHP);
          bosIsi.style.width = (bosHP / soal.length) * 100 + '%';
          bos.setAttribute('aria-label', 'Nyawa Raja: ' + bosHP);
        };
        const perisai = h('span', { class: 'rj-chip', role: 'img', 'aria-label': 'Perisai: salah pertama tidak mengurangi nyawa', title: 'Perisai: salah pertama aman' }, '🛡️');
        hud.append(hati, chipSoal, chipRekor, ulang, bos, perisai);
        ulang.addEventListener('click', () => { if (tanyaTerakhir) ctx.say(tanyaTerakhir); });
        // Kibor: angka 1-4 memilih jawaban (aksesibilitas desktop).
        ctx.on(document, 'keydown', (e) => {
          if (!ctx.alive || e.ctrlKey || e.metaKey || e.altKey) return;
          const i = ['1', '2', '3', '4'].indexOf(e.key);
          if (i < 0) return;
          const b = ctx.el.querySelectorAll('.choice')[i];
          if (b) b.click();
        });
        const gambarHati = () => { hati.textContent = '❤️'.repeat(nyawa) + '🤍'.repeat(3 - nyawa); };
        gambarHati();
        // Kartu intro: jelaskan Perisai sebelum soal 1 agar tak kaget.
        tanya('Dengarkan dulu aturan Raja!');
        ctx.el.append(h('div', { class: 'rj-wrap' },
          h('div', { class: 'rj-card pop-in rj-intro' },
            h('p', { class: 'rj-big', 'aria-hidden': 'true' }, '🛡️'),
            h('p', null, 'Perisai Raja melindungimu!'),
            h('p', null, 'Salah pertama tidak mengurangi nyawa.'),
            h('p', null, '1 jawaban salah hilang, lalu coba lagi!'))));
        await ctx.next('Mulai!');
        if (!ctx.alive) return;

        for (let i = 0; i < soal.length && ctx.alive; i++) {
          if (nyawa <= 0) break;
          ctx.progress(i, soal.length);
          ctx.clear();
          ctx.el.append(h('div', { class: 'rj-wrap' }, hud));
          gambarHati();
          chipSoal.textContent = 'Soal ' + (i + 1) + ' dari ' + soal.length;
          const hasilSoal = await satu(soal[i]); // 'benar' | 'lolos' | 'salah'
          const damage = () => {
            bosHP--; gambarBos(); ctx.sfx('pop');
            if (bosHP <= 0 && !rajaKalah) { rajaKalah = true; ctx.correct(null, { say: 'Raja kalah! Kamu pemenangnya!' }); }
          };
          if (hasilSoal === 'benar') {
            benar++;
            beruntun++;
            damage();
            if (benar > rekor) { rekor = benar; chipRekor.textContent = 'Rekor baru!'; }
            if (beruntun === 3) ctx.correct(null, { say: 'Tiga benar beruntun! Hebat!' });
          } else {
            beruntun = 0;
            if (hasilSoal === 'lolos') damage();
            else if (hasilSoal === 'salah') {
              nyawa--;
              gambarHati();
              if (nyawa <= 0) { await ctx.wait(600); break; }
            }
          }
          if (i === 4 && nyawa > 0) ctx.correct(null, { say: 'Bagus! Setengah jalan!' });
          ctx.progress(i + 1, soal.length);
        }
        if (!ctx.alive) return;
        ctx.progress(soal.length, soal.length);
        if (benar > bacaRekor()) { try { const semua = JSON.parse(localStorage.getItem('tamanIlmu.rekor.v1') || '{}'); semua[kunciRekor] = benar; localStorage.setItem('tamanIlmu.rekor.v1', JSON.stringify(semua)); } catch (e) { /* mode privat */ } }
        ctx.finish({
          stars: benar >= 9 ? 3 : benar >= 6 ? 2 : 1,
          message: (rajaKalah ? 'Raja Taman kalah! ' : '') + benar + ' dari ' + soal.length + ' benar!' + (benar > bacaRekor() ? ' Rekor baru! Kamu luar biasa!' : ''),
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
        // Perisai: salah pertama tidak membocorkan jawaban. Anak dapat petunjuk
        // samar + satu opsi salah disingkirkan, lalu coba lagi. Nyawa hilang
        // hanya jika salah 2x.
        async function duaKesempatan(opsiAwal, bikin, petunjuk) {
          const r1 = await bikin(opsiAwal);
          if (r1.firstTry) return 'benar';
          petunjuk();
          const buang = opsiAwal.find((o) => o !== s.jawab);
          const r2 = await bikin(opsiAwal.filter((o) => o !== buang));
          return r2.firstTry ? 'lolos' : 'salah';
        }

        if (s.kind === 'lihat') {
          tanya('Huruf apa ini?');
          ctx.el.append(h('div', { class: 'rj-card pop-in rj-bank-' + s.bank }, h('p', { class: 'rj-big ti-arabic' }, s.ar), h('p', { class: 'rj-bank' }, BANK_NAMA[s.bank])));
          const box = h('div');
          ctx.el.append(box);
          const out = await duaKesempatan(opsi, (ops) => {
            box.replaceChildren();
            return ctx.choose({ options: shuffle(ops), answer: s.jawab, speakLabel: true, retry: false, into: box });
          }, () => ctx.say('Lihat lagi bentuk hurufnya. Satu jawaban salah sudah hilang. Coba lagi!'));
          box.remove();
          return out;
        }
        if (s.kind === 'dengar') {
          tanya('Mana huruf ' + s.nama + '?');
          const NAMA = { 'ا': 'Alif', 'ب': 'Ba', 'ت': 'Ta', 'م': 'Mim', 'ن': 'Nun', 'و': 'Wau', 'ل': 'Lam' };
          const box2 = h('div');
          ctx.el.append(box2);
          const out2 = await duaKesempatan(opsi, (ops) => {
            box2.replaceChildren();
            return ctx.choose({
              options: shuffle(ops.map((o) => ({ node: arab(o), value: o, say: 'Huruf ' + (NAMA[o] || o), aria: 'Huruf ' + (NAMA[o] || o) }))),
              answer: s.jawab,
              speakLabel: true,
              retry: false,
              into: box2,
            });
          }, () => ctx.say('Dengarkan lagi baik-baik. Satu jawaban salah sudah hilang. Coba lagi!'));
          box2.remove();
          return out2;
        }
        tanya(s.soal);
        ctx.el.append(h('div', { class: 'rj-card pop-in rj-bank-' + s.bank }, h('p', { class: 'rj-big', 'aria-hidden': 'true' }, IKON[s.bank]), h('p', { class: 'rj-bank' }, BANK_NAMA[s.bank])));
        ctx.sfx('pop');
        const box3 = h('div');
        ctx.el.append(box3);
        const out3 = await duaKesempatan(opsi, (ops) => {
          box3.replaceChildren();
          return ctx.choose({ options: shuffle(ops), answer: s.jawab, speakLabel: true, retry: false, into: box3 });
        }, () => ctx.say((PETUNJUK[s.bank] || 'Pikirkan lagi.') + ' Satu jawaban salah sudah hilang. Coba lagi!'));
        box3.remove();
        return out3;
      }

      return main();
    },
  });
})();
