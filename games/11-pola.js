/* 11 Lanjutkan Pola. Baris pola dengan kotak "?" di akhir, anak memilih kelanjutannya.
   TK: pola gambar AB, AAB, ABB, ABC. SD: pola angka, pola bentuk, pola bertumbuh. */
(function () {
  const { h, rand, shuffle, sample } = TI;

  // Nama gambar untuk dibacakan (TK).
  const NAMA = {
    '🍎': 'apel', '🍌': 'pisang', '🍇': 'anggur', '🔴': 'lingkaran merah', '🔵': 'lingkaran biru', '🟢': 'lingkaran hijau',
    '🟡': 'lingkaran kuning', '🟣': 'lingkaran ungu', '⭐': 'bintang', '🌙': 'bulan', '☀️': 'matahari', '🔺': 'segitiga merah',
    '🟦': 'persegi biru', '🟩': 'persegi hijau', '🔷': 'belah ketupat biru', '🔶': 'belah ketupat oranye', '🍓': 'stroberi', '🍊': 'jeruk',
  };
  const SEMUA = Object.keys(NAMA);

  const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  function kata(n) {
    if (n < 10) return SATUAN[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return SATUAN[n - 10] + ' belas';
    if (n < 100) return SATUAN[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SATUAN[n % 10] : '');
    return String(n);
  }

  const CSS = `
.play[data-game="pola"] .pol-row {
  display: flex; align-items: stretch; justify-content: center; gap: 6px; width: 100%; max-width: 780px; padding: 14px 10px;
}
.play[data-game="pola"] .pol-cell {
  flex: 1 1 0; min-width: 0; max-width: 76px; aspect-ratio: 1; display: grid; place-items: center; border-radius: 16px;
  background: #f6f1e6; border: 3px solid var(--line); font-size: clamp(1.25rem, 5.6vw, 2.4rem); line-height: 1; font-weight: 800;
}
.play[data-game="pola"].lvl-sd .pol-cell { font-size: clamp(1.05rem, 4.6vw, 1.9rem); }
.play[data-game="pola"] .pol-cell.is-q { border: 3px dashed var(--c); background: color-mix(in srgb, var(--c) 8%, #fff); color: var(--c); font-size: clamp(1.5rem, 6vw, 2.4rem); }
.play[data-game="pola"] .pol-cell.is-ans { border: 3px solid var(--good); background: var(--good-bg); color: var(--ink); animation: ti-pop var(--dur-ui) var(--ease-out) both; }
.play[data-game="pola"] .pol-opts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 600px; }
.play[data-game="pola"] .pol-opts .choice { min-width: 0; min-height: 96px; font-size: 2.2rem; }
.play[data-game="pola"].lvl-tk .ti-choices.pol-opts3 { max-width: 460px; }
.play[data-game="pola"] .pol-opt { font-size: 3.1rem; line-height: 1; }
.play[data-game="pola"] .pol-aturan { text-align: center; font-size: 1.1rem; }
.play[data-game="pola"] .pol-blocks { display: grid; grid-template-columns: repeat(3, var(--b)); gap: 2px; --b: 9px; }
.play[data-game="pola"] .pol-blocks i { display: block; width: var(--b); height: var(--b); border-radius: 2px; background: #2f6fed; }
.play[data-game="pola"] .pol-opts .pol-blocks { --b: 16px; gap: 3px; }
@media (min-width: 700px) {
  .play[data-game="pola"] .pol-blocks { --b: 12px; gap: 3px; }
  .play[data-game="pola"] .pol-opts .pol-blocks { --b: 18px; }
}
@media (max-width: 560px) {
  .play[data-game="pola"] .pol-row { gap: 4px; padding: 12px 6px; }
  .play[data-game="pola"] .pol-cell { border-radius: 12px; border-width: 2px; }
  .play[data-game="pola"] .pol-opts { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 320px; }
  .play[data-game="pola"] .pol-opt { font-size: 2.6rem; }
}`;

  // ---------- pembantu tampilan ----------
  function blok(n) {
    const w = h('span', { class: 'pol-blocks', 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) w.append(h('i'));
    return w;
  }
  function isiToken(t) {
    return typeof t === 'object' ? blok(t.n) : document.createTextNode(String(t));
  }
  function baris(tampil) {
    const q = h('span', { class: 'pol-cell is-q', 'aria-hidden': 'true' }, '?');
    const row = h('div', { class: 'ti-card pol-row pop-in', role: 'img', 'aria-label': 'Pola dengan satu kotak kosong di akhir' },
      tampil.map((t) => h('span', { class: 'pol-cell', 'aria-hidden': 'true' }, isiToken(t))), q);
    return { row, q };
  }
  function jawabKotak(q, tok) {
    q.classList.remove('is-q');
    q.classList.add('is-ans');
    q.replaceChildren(isiToken(tok));
  }
  const sama = (a, b) => (typeof a === 'object' ? typeof b === 'object' && a.n === b.n : a === b);
  const nilaiOf = (t) => (typeof t === 'object' ? 'b' + t.n : String(t));

  // ---------- TK ----------
  const SET2 = [['🍎', '🍌'], ['🔴', '🔵'], ['⭐', '🌙'], ['☀️', '🌙'], ['🔺', '🟦']];
  const SET3 = [['🟢', '🟡', '🟣'], ['🔴', '🔵', '🟡'], ['🍎', '🍌', '🍇']];
  const UNIT = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2] };

  function soalTK() {
    const urut = ['AB', 'AB', 'AAB', 'ABB', 'AAB', 'ABB', 'ABC', 'ABC'];
    const dua = [...shuffle(SET2), ...shuffle(SET2)];
    const tiga = shuffle(SET3);
    let i2 = 0, i3 = 0;
    return urut.map((tipe) => {
      let set = tipe === 'ABC' ? tiga[i3++ % tiga.length] : dua[i2++ % dua.length];
      if (Math.random() < 0.5) set = set.slice().reverse();
      const unit = UNIT[tipe];
      const L = unit.length === 2 ? rand(5, 6) : rand(6, 7);
      const seq = Array.from({ length: L + 1 }, (_, k) => set[unit[k % unit.length]]);
      const jawab = seq[L];
      const lain = SEMUA.filter((e) => !set.includes(e));
      const pengecoh = [...set.filter((e) => e !== jawab), ...shuffle(lain)].slice(0, 2);
      return { tampil: seq.slice(0, L), jawab, opsi: shuffle([jawab, ...pengecoh]) };
    });
  }

  // ---------- SD ----------
  const ATURAN_ANGKA = [
    { aturan: 'setiap angka ditambah 2', ucap: 'setiap angka ditambah dua', mulai: () => rand(1, 6), langkah: (x) => x + 2, beda: 2, L: [4, 5] },
    { aturan: 'setiap angka ditambah 5', ucap: 'setiap angka ditambah lima', mulai: () => (Math.random() < 0.5 ? 5 : rand(2, 9)), langkah: (x) => x + 5, beda: 5, L: [4, 5] },
    { aturan: 'setiap angka ditambah 10', ucap: 'setiap angka ditambah sepuluh', mulai: () => (Math.random() < 0.5 ? 10 : rand(3, 26)), langkah: (x) => x + 10, beda: 10, L: [4, 5] },
    { aturan: 'setiap angka dikurangi 3', ucap: 'setiap angka dikurangi tiga', mulai: () => rand(20, 30), langkah: (x) => x - 3, beda: 3, L: [4, 5] },
    { aturan: 'setiap angka dikali 2', ucap: 'setiap angka dikali dua', mulai: () => rand(1, 3), langkah: (x) => x * 2, beda: 0, L: [4] },
  ];
  const SET4 = [['🔺', '🟦', '⭐', '🔴'], ['🟩', '🔷', '🟡', '🔶'], ['⭐', '🟣', '🔺', '🟢']];
  const SET_AABB = [['🔺', '🟦'], ['⭐', '🔴'], ['🟩', '🔶'], ['🍎', '🍌']];

  function polaAngka(r) {
    const seq = [Math.max(1, r.mulai())];
    for (let i = 0; i < 5; i++) seq.push(r.langkah(seq[i]));
    const L = r.L[rand(0, r.L.length - 1)];
    const jawab = seq[L];
    const beda = r.beda || jawab - seq[L - 1];
    const pool = [jawab + 1, jawab - 1, jawab + beda, jawab - beda, jawab + 2, jawab - 2, jawab + 10, jawab * 2].filter((v) => v > 0 && v !== jawab);
    const pengecoh = [...new Set(shuffle(pool))].slice(0, 3);
    return { tampil: seq.slice(0, L), jawab, opsi: shuffle([jawab, ...pengecoh]), aturan: r.aturan, ucap: r.ucap, angka: true };
  }
  function polaABCD() {
    const set = SET4[rand(0, SET4.length - 1)];
    const seq = Array.from({ length: 8 }, (_, k) => set[k % 4]);
    return { tampil: seq.slice(0, 7), jawab: seq[7], opsi: shuffle(set), aturan: 'empat gambar ini berulang terus', ucap: 'empat gambar ini berulang terus' };
  }
  function polaAABB() {
    const set = shuffle(SET_AABB[rand(0, SET_AABB.length - 1)]);
    const unit = [0, 0, 1, 1];
    const seq = Array.from({ length: 7 }, (_, k) => set[unit[k % 4]]);
    const lain = SEMUA.filter((e) => !set.includes(e));
    return { tampil: seq.slice(0, 6), jawab: seq[6], opsi: shuffle([seq[6], set.find((e) => e !== seq[6]), ...shuffle(lain).slice(0, 2)]), aturan: 'setiap gambar muncul dua kali berturut-turut', ucap: 'setiap gambar muncul dua kali berturut-turut' };
  }
  function polaTumbuhAngka() {
    const v = Math.random() < 0.5 ? [1, 3, 6, 10, 15] : [2, 4, 7, 11, 16];
    const L = 4;
    const d = [v[1] - v[0], v[2] - v[1], v[3] - v[2], v[4] - v[3]];
    const jawab = v[L];
    const pool = [jawab - 1, jawab + 1, jawab - 2, jawab + 2, jawab + 5, jawab - 5, v[L - 1] + 4, v[L - 1] + 6].filter((x) => x > 0 && x !== jawab);
    return { tampil: v.slice(0, L), jawab, opsi: shuffle([jawab, ...[...new Set(shuffle(pool))].slice(0, 3)]),
      aturan: 'tambahannya naik satu: +' + d.join(', +'), ucap: 'tambahannya naik satu: tambah ' + d.map(kata).join(', tambah '), angka: true };
  }
  function polaTumbuhBlok() {
    const mulai = rand(1, 2);
    const tampil = [0, 1, 2].map((k) => ({ n: mulai + k }));
    const jawab = { n: mulai + 3 };
    const ns = [...new Set([jawab.n, jawab.n - 1, jawab.n + 1, jawab.n + 2, jawab.n - 2].filter((x) => x > 0))];
    const pengecoh = shuffle(ns.filter((x) => x !== jawab.n)).slice(0, 3);
    return { tampil, jawab, opsi: shuffle([jawab, ...pengecoh.map((n) => ({ n }))]), aturan: 'setiap langkah ditambah satu kotak', ucap: 'setiap langkah ditambah satu kotak' };
  }

  function soalSD() {
    const angka = sample(ATURAN_ANGKA, 4).map(polaAngka);
    return [...angka, polaABCD(), polaAABB(), polaTumbuhAngka(), polaTumbuhBlok()];
  }

  TI.register({
    id: 'pola',
    title: 'Lanjutkan Pola',
    cat: 'mat',
    icon: '🔷',
    desc: 'Lihat pola yang berulang, lalu tebak apa yang datang selanjutnya.',
    start(ctx) {
      TI.style('pola', CSS);
      const soal = ctx.isTK ? soalTK() : soalSD();

      return ctx.series(soal, async (s, i) => {
        ctx.ask(ctx.isTK ? 'Apa selanjutnya?' : 'Lanjutkan pola ini.', {
          say: i === 0 ? 'Lihat polanya. Apa yang datang selanjutnya?' : (ctx.isTK ? 'Apa selanjutnya?' : 'Lanjutkan pola ini. Apa yang datang selanjutnya?'),
        });
        const { row, q } = baris(s.tampil);
        ctx.el.append(row);

        let terbuka = false;
        const jawabNilai = nilaiOf(s.jawab);
        const opsi = s.opsi.map((o) => {
          if (ctx.isTK) return { node: h('span', { class: 'pol-opt', 'aria-hidden': 'true' }, o), value: o, say: NAMA[o] || '', aria: NAMA[o] || 'gambar', cls: 'is-big' };
          if (typeof o === 'object') return { node: blok(o.n), value: nilaiOf(o), aria: o.n + ' kotak', say: String(o.n) + ' kotak' };
          if (s.angka) return { label: String(o), value: String(o), say: kata(o) };
          return { node: h('span', { class: 'pol-opt', 'aria-hidden': 'true' }, o), value: String(o), say: NAMA[o] || '', aria: NAMA[o] || 'gambar' };
        });
        const p = ctx.choose({
          options: opsi,
          answer: (v) => {
            const ok = v === jawabNilai;
            if (ok && !terbuka) { terbuka = true; jawabKotak(q, s.jawab); }
            return ok;
          },
          layout: ctx.isTK ? 'pol-opts3' : 'pol-opts',
        });
        await p;
        if (!ctx.isTK && s.aturan) {
          ctx.el.append(h('p', { class: 'ti-note pol-aturan pop-in' }, h('b', null, 'Aturannya: '), s.aturan + '.'));
          ctx.say('Aturannya, ' + s.ucap + '.');
          await ctx.wait(1500);
        }
      }, { lesson: 'Pola adalah sesuatu yang berulang dengan aturan. Kalau tahu aturannya, kita bisa menebak lanjutannya.' });
    },
  });
})();
