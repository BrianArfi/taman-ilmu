/* 15 Timbangan Seimbang. Timbangan SVG: lengan berputar ke sisi yang lebih berat, piring tetap tegak.
   Caranya: lengan dan tiap piring diputar dengan sudut yang sama tapi berlawanan arah (transition transform).
   SD: 6 soal seimbang menanjak, lalu 2 soal satuan sebagai babak akhir. */
(function () {
  const { h, svg, rand, pick, shuffle, sample, numChoices } = TI;

  // ---------- ukuran gambar (satuan viewBox) ----------
  const LEBAR = 420, TINGGI = 330, PX = 210, PY = 84, LENGAN = 140, TALI = 112, MAKS = 14;
  const WARNA_BALOK = { 1: '#ff6b6b', 2: '#ff9f1c', 3: '#e6a800', 4: '#2fb36d', 5: '#14a3b8', 6: '#4d8dff', 7: '#7c5cff', 8: '#c157e8', 9: '#ec5a9e', 10: '#e5484d', 11: '#7f8c2f', 12: '#5b6b7a' };
  const sudut = (kiri, kanan) => {
    const d = kanan - kiri; // kanan lebih berat: lengan berputar searah jarum jam (ujung kanan turun)
    if (d === 0) return 0;
    const a = Math.min(MAKS, 4 + Math.abs(d) * 2.2);
    return d > 0 ? a : -a;
  };

  // Susunan balok dalam satu piring (dx, dy dari titik tengah permukaan piring).
  const SUSUN = {
    1: [[0, 0]],
    2: [[-24, 0], [24, 0]],
    3: [[-24, 0], [24, 0], [0, -36]],
    4: [[-24, 0], [24, 0], [-24, -36], [24, -36]],
  };

  function buatTimbangan() {
    const piringY = PY + TALI;
    const ujung = { kiri: PX - LENGAN, kanan: PX + LENGAN };
    const piring = {}; // sisi -> { g (piring), isi (g tempat benda) }
    const lengan = svg('g', { class: 'tb-lengan', style: 'transform-origin:' + PX + 'px ' + PY + 'px' },
      svg('rect', { x: PX - LENGAN - 10, y: PY - 8, width: 2 * LENGAN + 20, height: 16, rx: 8, fill: '#f59e0b', stroke: '#b45309', 'stroke-width': 3 }),
      svg('circle', { cx: ujung.kiri, cy: PY, r: 8, fill: '#fbbf24', stroke: '#b45309', 'stroke-width': 3 }),
      svg('circle', { cx: ujung.kanan, cy: PY, r: 8, fill: '#fbbf24', stroke: '#b45309', 'stroke-width': 3 }));
    for (const sisi of ['kiri', 'kanan']) {
      const x = ujung[sisi];
      const isi = svg('g', { class: 'tb-isi' });
      const g = svg('g', { class: 'tb-piring', style: 'transform-origin:' + x + 'px ' + PY + 'px' },
        svg('line', { x1: x, y1: PY, x2: x - 52, y2: piringY, stroke: '#7b6f8f', 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
        svg('line', { x1: x, y1: PY, x2: x + 52, y2: piringY, stroke: '#7b6f8f', 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
        isi,
        svg('path', { d: 'M' + (x - 60) + ' ' + piringY + ' H' + (x + 60) + ' Q' + (x + 56) + ' ' + (piringY + 32) + ' ' + x + ' ' + (piringY + 32) + ' Q' + (x - 56) + ' ' + (piringY + 32) + ' ' + (x - 60) + ' ' + piringY + ' Z', fill: '#4dabf7', stroke: '#1c6fb8', 'stroke-width': 4, 'stroke-linejoin': 'round' }),
        svg('rect', { x: x - 62, y: piringY - 4, width: 124, height: 8, rx: 4, fill: '#74c0fc', stroke: '#1c6fb8', 'stroke-width': 3 }));
      lengan.append(g);
      piring[sisi] = { g, isi, x };
    }
    const tanya = svg('g', { class: 'tb-tanya' },
      svg('circle', { cx: PX, cy: PY, r: 15, fill: '#fff', stroke: '#9b4dde', 'stroke-width': 3 }),
      svg('text', { x: PX, y: PY, dy: '.36em', 'text-anchor': 'middle', 'font-size': 20, class: 'tb-teks', fill: '#9b4dde', text: '?' }));
    const el = svg('svg', { viewBox: '0 0 ' + LEBAR + ' ' + TINGGI, class: 'tb-svg', role: 'img', 'aria-label': 'Timbangan', focusable: 'false' },
      svg('rect', { x: PX - 80, y: TINGGI - 34, width: 160, height: 24, rx: 12, fill: '#b45309' }),
      svg('rect', { x: PX - 60, y: TINGGI - 42, width: 120, height: 16, rx: 8, fill: '#d97706' }),
      svg('rect', { x: PX - 9, y: PY, width: 18, height: TINGGI - PY - 36, fill: '#f59e0b', stroke: '#b45309', 'stroke-width': 3 }),
      lengan,
      svg('circle', { cx: PX, cy: PY, r: 13, fill: '#fbbf24', stroke: '#b45309', 'stroke-width': 4 }),
      tanya);

    const api = {
      el, piring, piringY, sudutNow: 0,
      miring(deg) {
        api.sudutNow = deg;
        lengan.style.transform = 'rotate(' + deg + 'deg)';
        piring.kiri.g.style.transform = 'rotate(' + -deg + 'deg)';
        piring.kanan.g.style.transform = 'rotate(' + -deg + 'deg)';
      },
      tampilTanya(ya) { tanya.style.display = ya ? '' : 'none'; },
      kosongkan(sisi) { piring[sisi].isi.replaceChildren(); },
    };
    api.miring(0);
    return api;
  }

  // Satu balok berlabel kg, titik tengah-bawah di (cx, bawah).
  function balok(kg, cx, bawah) {
    const warna = WARNA_BALOK[kg] || '#7c5cff';
    return svg('g', { class: 'tb-balok' },
      svg('rect', { x: cx - 21, y: bawah - 32, width: 42, height: 32, rx: 7, fill: warna, stroke: 'rgba(0,0,0,0.28)', 'stroke-width': 2.5 }),
      svg('rect', { x: cx - 16, y: bawah - 28, width: 32, height: 5, rx: 2.5, fill: 'rgba(255,255,255,0.35)' }),
      svg('text', { x: cx, y: bawah - 14, dy: '.36em', 'text-anchor': 'middle', 'font-size': 15, class: 'tb-teks', fill: '#fff', text: kg + ' kg' }));
  }
  const tempatBalok = (jumlah, i) => { const [dx, dy] = SUSUN[jumlah][i]; return [dx, dy]; };

  // Gambar balok-balok (dan kotak "?") di satu piring. Mengembalikan elemen kotak "?".
  function isiBalok(tim, sisi, daftar, tanda) {
    const p = tim.piring[sisi], total = daftar.length + (tanda ? 1 : 0);
    p.isi.replaceChildren();
    daftar.forEach((kg, i) => {
      const [dx, dy] = tempatBalok(total, i);
      p.isi.append(balok(kg, p.x + dx, tim.piringY - 2 + dy));
    });
    if (!tanda) return null;
    const [dx, dy] = tempatBalok(total, daftar.length);
    const cx = p.x + dx, bawah = tim.piringY - 2 + dy;
    const q = svg('g', { class: 'tb-tanda' },
      svg('rect', { x: cx - 21, y: bawah - 32, width: 42, height: 32, rx: 7, fill: 'rgba(255,255,255,0.7)', stroke: '#9b4dde', 'stroke-width': 3, 'stroke-dasharray': '6 5' }),
      svg('text', { x: cx, y: bawah - 15, dy: '.36em', 'text-anchor': 'middle', 'font-size': 22, class: 'tb-teks', fill: '#9b4dde', text: '?' }));
    p.isi.append(q);
    q._pos = { cx, bawah };
    return q;
  }

  // Benda berbentuk emoji di piring (TK dan soal kapas/besi).
  function isiEmoji(tim, sisi, emoji, label) {
    const p = tim.piring[sisi];
    const isi = [svg('text', { x: p.x, y: tim.piringY - 8, 'text-anchor': 'middle', 'font-size': 50, class: 'tb-emoji', text: emoji })];
    if (label) isi.push(svg('text', { x: p.x, y: tim.piringY + 22, 'text-anchor': 'middle', 'font-size': 15, class: 'tb-teks', fill: '#fff', text: label }));
    p.isi.replaceChildren(...isi);
  }

  const CSS = `
.play[data-game="timbangan"] .tb-scene { flex: none; min-height: 0; display: grid; place-items: center; padding: 6px 4px 0; background: linear-gradient(#f1e8ff, #fdf6ff); }
.play[data-game="timbangan"] .tb-svg { display: block; width: 100%; max-width: 440px; height: auto; overflow: visible; }
.play[data-game="timbangan"] .tb-lengan, .play[data-game="timbangan"] .tb-piring { transition: transform var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="timbangan"] .tb-teks { font-family: var(--font); font-weight: 800; }
.play[data-game="timbangan"] .tb-emoji { font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif; }
.play[data-game="timbangan"] .tb-tanda { transition: opacity var(--dur-ui) var(--ease-out); }
.play[data-game="timbangan"] .tb-tanya { transition: opacity var(--dur-ui) var(--ease-out); }
.play[data-game="timbangan"] .tb-pilih { flex-direction: column; gap: 2px; min-width: 128px; min-height: 124px; }
.play[data-game="timbangan"] .tb-pilih .tb-em { font-size: 3.2rem; line-height: 1.05; }
.play[data-game="timbangan"] .tb-pilih .tb-nama { font-size: 1.05rem; }
.play[data-game="timbangan"] .tb-cap { margin: 0; max-width: 560px; font-size: 1.15rem; font-weight: 800; text-align: center; line-height: 1.3; }
.play[data-game="timbangan"] .tb-kartu { display: grid; place-items: center; width: auto; padding: 16px 30px; }
.play[data-game="timbangan"] .tb-kartu .ti-big { font-size: clamp(2rem, 8vw, 3.2rem); font-weight: 800; }
@media (max-width: 560px) {
  .play[data-game="timbangan"] .tb-pilih { min-width: 120px; min-height: 112px; }
  .play[data-game="timbangan"] .tb-pilih .tb-em { font-size: 2.8rem; }
}
@media (prefers-reduced-motion: reduce) {
  .play[data-game="timbangan"] .tb-lengan, .play[data-game="timbangan"] .tb-piring { transition: none; }
}`;

  // ---------- TK ----------
  const PASANG_TK = [
    ['🍉', 'Semangka', '🍒', 'Ceri'], ['🧱', 'Batu bata', '🪶', 'Bulu'], ['📚', 'Tumpukan buku', '✏️', 'Pensil'],
    ['🥥', 'Kelapa', '🍇', 'Anggur'], ['🪨', 'Batu', '🍃', 'Daun'], ['🛞', 'Roda', '🔑', 'Kunci'],
    ['🍍', 'Nanas', '🍓', 'Stroberi'], ['🎒', 'Tas penuh buku', '🧦', 'Kaus kaki'],
  ];

  async function soalTK(ctx, [emB, namaB, emR, namaR]) {
    const beratKiri = Math.random() < 0.5; // sisi benda yang lebih berat
    const kiri = beratKiri ? { em: emB, nama: namaB } : { em: emR, nama: namaR };
    const kanan = beratKiri ? { em: emR, nama: namaR } : { em: emB, nama: namaB };
    const berat = beratKiri ? kiri : kanan, ringan = beratKiri ? kanan : kiri;
    ctx.ask('Mana yang lebih berat?');
    const tim = buatTimbangan();
    isiEmoji(tim, 'kiri', kiri.em);
    isiEmoji(tim, 'kanan', kanan.em);
    ctx.el.append(h('div', { class: 'ti-scene tb-scene pop-in' }, tim.el));
    const cap = h('p', { class: 'tb-cap', 'aria-live': 'polite', hidden: true });
    const baris = h('div', { class: 'ti-row' });
    ctx.el.append(baris, cap);

    await new Promise((resolve) => {
      let kunci = false;
      [['kiri', kiri], ['kanan', kanan]].forEach(([sisi, b]) => {
        const btn = h('button', { type: 'button', class: 'choice is-big tb-pilih pop-in', 'aria-label': b.nama },
          h('span', { class: 'tb-em', 'aria-hidden': 'true' }, b.em), h('span', { class: 'tb-nama' }, b.nama));
        btn._b = b;
        btn.addEventListener('click', async () => {
          if (kunci) return;
          kunci = true;
          const benar = b === berat;
          tim.tampilTanya(false);
          tim.miring(beratKiri ? -MAKS : MAKS); // sisi yang lebih berat turun
          [...baris.children].forEach((x) => { x.setAttribute('aria-disabled', 'true'); if (x._b === berat) x.classList.add('is-correct'); });
          const teks = berat.nama + ' lebih berat daripada ' + ringan.nama.toLowerCase() + '.';
          cap.textContent = teks; cap.hidden = false;
          if (benar) await ctx.correct(btn, { say: false, min: 500 });
          else await ctx.wrong(btn, { say: false });
          await ctx.sayWait((benar ? 'Benar! ' : 'Ayo lihat. ') + teks);
          resolve();
        });
        baris.append(btn);
      });
    });
  }

  // ---------- SD ----------
  // Soal seimbang: kiri berisi beberapa balok, kanan sebagian balok + "?".
  function buatSoalSeimbang(i) {
    for (let g = 0; g < 200; g++) {
      const nKiri = i < 2 ? rand(1, 2) : rand(2, 3);
      const kiri = Array.from({ length: nKiri }, () => rand(1, 6));
      const nKanan = i < 2 ? 1 : rand(1, 2);
      const kanan = Array.from({ length: nKanan }, () => rand(1, 4));
      const jawab = kiri.reduce((s, x) => s + x, 0) - kanan.reduce((s, x) => s + x, 0);
      if (jawab >= 1 && jawab <= 10 && !(kiri.length === 1 && kanan.length === 1 && kiri[0] === jawab)) return { tipe: 'seimbang', kiri, kanan, jawab };
    }
    return { tipe: 'seimbang', kiri: [5, 3], kanan: [2], jawab: 6 };
  }

  async function soalSeimbang(ctx, s) {
    const { kiri, kanan, jawab } = s;
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const L = sum(kiri), R0 = sum(kanan);
    ctx.ask('Berapa kg agar timbangan seimbang?');
    const tim = buatTimbangan();
    isiBalok(tim, 'kiri', kiri, false);
    let tanda = isiBalok(tim, 'kanan', kanan, true);
    tim.tampilTanya(false);
    const awal = sudut(L, R0);
    tim.miring(awal);
    ctx.el.append(h('div', { class: 'ti-scene tb-scene pop-in' }, tim.el));
    const cap = h('p', { class: 'tb-cap', 'aria-live': 'polite', hidden: true });
    const wrap = h('div', { class: 'ti-choices is-grid2' });
    ctx.el.append(wrap, cap);

    const opsi = shuffle(numChoices(jawab, 4, 1, 14));
    await new Promise((resolve) => {
      let sibuk = false, salah = 0;
      const tombol = new Map();

      // Balok jatuh ke piring kanan pada tempat "?".
      function jatuh(kg) {
        return new Promise((res) => {
          const { cx, bawah } = tanda._pos;
          const b = balok(kg, cx, bawah);
          tanda.style.opacity = '0';
          tim.piring.kanan.isi.append(b);
          if (TI.reduced()) { res(b); return; }
          let y = -72, v = 0;
          b.style.transform = 'translate(0px,' + y + 'px)';
          /* motion-ok: balok jatuh ke piring (gerak permainan), transform saja */
          ctx.loop((dt) => {
            v += 2600 * dt; y += v * dt;
            if (y >= 0) { b.style.transform = ''; res(b); return false; }
            b.style.transform = 'translate(0px,' + y.toFixed(1) + 'px)';
          });
        });
      }

      // Selama balok jatuh dan timbangan bergerak, tombol dikunci supaya ketukan tidak menumpuk.
      function kunci(ya) {
        sibuk = ya;
        tombol.forEach((t) => { if (!t.disabled) { if (ya) t.setAttribute('aria-disabled', 'true'); else t.removeAttribute('aria-disabled'); } });
      }

      async function pilih(kg, btn) {
        if (sibuk) return;
        kunci(true);
        ctx.sfx('tap');
        const b = await jatuh(kg);
        const a = sudut(L, R0 + kg);
        tim.miring(a);
        await ctx.wait(340);
        if (R0 + kg === L) {
          btn.setAttribute('aria-disabled', 'true');
          const teks = kiri.join(' + ') + ' = ' + L + ' kg. ' + kanan.join(' + ') + ' + ' + kg + ' = ' + L + ' kg. Seimbang!';
          cap.textContent = teks; cap.hidden = false;
          await ctx.correct(btn, { say: false, min: 500 });
          await ctx.sayWait(kiri.join(' ditambah ') + ' sama dengan ' + L + '. ' + kanan.join(' ditambah ') + ' ditambah ' + kg + ' juga sama dengan ' + L + '. Seimbang!');
          resolve();
          return;
        }
        salah++;
        const lebihBerat = a > 0 ? 'Sisi kanan terlalu berat.' : 'Sisi kiri masih lebih berat.';
        btn.disabled = true;
        await ctx.wrong(btn, { say: lebihBerat + ' Coba lagi ya.' });
        if (salah >= 3) {
          // Tunjukkan jawaban yang benar lalu lanjut.
          await ctx.wait(500);
          b.style.opacity = '0';
          tombol.forEach((t, k) => { t.disabled = true; if (k === jawab) { t.classList.add('is-correct'); t.removeAttribute('disabled'); t.setAttribute('aria-disabled', 'true'); } });
          const b2 = await jatuh(jawab);
          void b2;
          tim.miring(0);
          await ctx.wait(340);
          const teks = 'Jawabannya ' + jawab + ' kg. ' + kanan.join(' + ') + ' + ' + jawab + ' = ' + L + ' kg, sama dengan sisi kiri.';
          cap.textContent = teks; cap.hidden = false;
          await ctx.sayWait('Jawabannya ' + jawab + ' kilogram. ' + kanan.join(' ditambah ') + ' ditambah ' + jawab + ' sama dengan ' + L + '. Jadi seimbang.');
          resolve();
          return;
        }
        // Coba lagi: angkat balok, kembali ke posisi awal.
        b.remove();
        tanda.style.opacity = '1';
        tim.miring(awal);
        await ctx.wait(250);
        kunci(false);
      }

      opsi.forEach((kg, i) => {
        const btn = h('button', { type: 'button', class: 'choice pop-in', style: '--i:' + i, 'aria-label': kg + ' kilogram' }, kg + ' kg');
        btn.addEventListener('click', () => pilih(kg, btn));
        tombol.set(kg, btn);
        wrap.append(btn);
      });
    });
  }

  async function soalSatuan(ctx, s) {
    if (s.tipe === 'gram') {
      ctx.ask('1 kg sama dengan berapa gram?', { say: 'Satu kilogram sama dengan berapa gram?' });
      ctx.el.append(h('div', { class: 'ti-card tb-kartu pop-in' }, h('p', { class: 'ti-big' }, '1 kg = ? g')));
      await ctx.choose({
        options: shuffle([100, 1000, 10000]).map((x) => ({ label: x.toLocaleString('id-ID') + ' g', value: x, say: x.toLocaleString('id-ID') + ' gram' })),
        answer: 1000,
      });
      ctx.note('1 kilogram sama dengan 1.000 gram.', { title: 'Ingat' });
      await ctx.next();
    } else {
      ctx.ask('Mana yang lebih berat: 1 kg kapas atau 1 kg besi?', { say: 'Mana yang lebih berat: satu kilogram kapas, atau satu kilogram besi?' });
      const tim = buatTimbangan();
      isiEmoji(tim, 'kiri', '☁️', '1 kg');
      isiEmoji(tim, 'kanan', '🔩', '1 kg');
      tim.tampilTanya(true);
      ctx.el.append(h('div', { class: 'ti-scene tb-scene pop-in' }, tim.el));
      await ctx.choose({
        options: shuffle(['Kapas', 'Besi', 'Sama berat']),
        answer: 'Sama berat',
      });
      tim.tampilTanya(false);
      ctx.note('Sama-sama 1 kg, jadi beratnya sama. Kapas hanya terlihat lebih besar karena sangat ringan dan mengembang.', { title: 'Jawabannya' });
      await ctx.next();
    }
  }

  TI.register({
    id: 'timbangan',
    title: 'Timbangan Seimbang',
    cat: 'sains',
    icon: '⚖️',
    desc: 'Bandingkan berat benda dan buat timbangan jadi seimbang.',
    start(ctx) {
      TI.style('timbangan', CSS);
      const lesson = 'Timbangan seimbang kalau berat kedua sisi sama. Allah juga memerintahkan kita menimbang dengan adil.';
      if (ctx.isTK) {
        ctx.series(shuffle(PASANG_TK), (p) => soalTK(ctx, p), { lesson });
      } else {
        const soal = [0, 1, 2, 3, 4, 5].map(buatSoalSeimbang);
        soal.push({ tipe: 'gram' }, { tipe: 'kapas' });
        let ke = 0; ctx.series(soal, (s) => { ke++; if (ke === 5) ctx.correct(null, { say: 'Bagus! Terus naik ke babak soal!' }); if (ke === 7) ctx.correct(null, { say: 'Bagus! Babak soal dimulai!' }); return s.tipe === 'seimbang' ? soalSeimbang(ctx, s) : soalSatuan(ctx, s); }, { lesson });
      }
    },
  });
})();
