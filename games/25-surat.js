/* 25 Surat Pendek. Mekanik tarik garis: kolom kiri nama surat, kolom kanan pasangannya (diacak).
   Ketuk kartu kiri lalu kartu kanan, atau seret dari satu kartu ke kartu di seberang. Garis SVG melengkung mengikuti jari.
   Data hanya dari SPEC.md bagian 25. TK: 3 babak x 3 pasang (jumlah ayat). SD: 3 babak x 4 pasang + 1 soal. */
(function () {
  const { h, svg, shuffle, pick, sample } = TI;

  // nama, nomor, jumlah ayat, isi singkat (persis dari SPEC)
  const SURAT = [
    { nama: 'Al-Fatihah', no: 1, ayat: 7, isi: "Pembuka Al-Qur'an, dibaca di setiap rakaat shalat" },
    { nama: "Al-'Ashr", no: 103, ayat: 3, isi: 'Tentang pentingnya waktu' },
    { nama: 'Al-Fil', no: 105, ayat: 5, isi: 'Kisah pasukan bergajah' },
    { nama: 'Quraisy', no: 106, ayat: 4, isi: 'Tentang suku Quraisy' },
    { nama: "Al-Ma'un", no: 107, ayat: 7, isi: 'Peduli anak yatim dan orang miskin' },
    { nama: 'Al-Kautsar', no: 108, ayat: 3, isi: "Surat terpendek dalam Al-Qur'an" },
    { nama: 'Al-Kafirun', no: 109, ayat: 6, isi: 'Untukmu agamamu, untukku agamaku' },
    { nama: 'An-Nashr', no: 110, ayat: 3, isi: 'Pertolongan Allah dan kemenangan' },
    { nama: 'Al-Ikhlas', no: 112, ayat: 4, isi: 'Allah Maha Esa' },
    { nama: 'Al-Falaq', no: 113, ayat: 5, isi: 'Berlindung kepada Allah dari kejahatan' },
    { nama: 'An-Nas', no: 114, ayat: 6, isi: 'Surat terakhir dalam Al-Qur\'an' },
  ];
  const TK_NAMA = ['Al-Fatihah', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas', 'Al-Kautsar', "Al-'Ashr", 'An-Nashr'];
  const TK_SURAT = SURAT.filter((s) => TK_NAMA.includes(s.nama));
  const LESSON = "Al-Qur'an ada 114 surat. Ayo hafalkan surat-surat pendek, mulai dari Al-Fatihah sampai An-Nas.";
  const WARNA = ['#2f6fed', '#e8590c', '#0e9f6e', '#9b4dde', '#d6336c', '#d99a00'];
  const PUJI = ['Hebat, semua cocok!', 'Pintar, semua pasangan ketemu!', 'Keren, garisnya benar semua!'];
  const P = '.play[data-game="surat"]';

  const CSS = `
${P} .sp-count { margin: 0; flex: none; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 2px 16px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; color: var(--muted); }
${P} .sp-count b { color: var(--c); font-size: 1.25rem; }
${P} .sp-board { position: relative; width: 100%; max-width: 620px; flex: none; touch-action: none; user-select: none; -webkit-user-select: none; --gut: 44px; }
${P} .sp-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: var(--gut); row-gap: 12px; position: relative; z-index: 1; padding: 0 10px; }
${P} .sp-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; overflow: visible; }
${P} .sp-line { fill: none; stroke-width: 6; stroke-linecap: round; opacity: 0.95; animation: sp-in var(--dur-ui) var(--ease-out) both; }
${P} .sp-line.is-bad { stroke: #e5484d !important; animation: sp-bad 300ms var(--ease-out) both; }
${P} .sp-line.is-live { opacity: 0.7; animation: none; stroke-dasharray: 2 11; }
${P} .sp-dot { animation: sp-in var(--dur-ui) var(--ease-out) both; }
${P} .sp-card {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  min-height: 74px; padding: 8px 10px; border: 3px solid var(--line); border-radius: 18px; background: #fff;
  box-shadow: 0 4px 0 var(--shadow); font-weight: 800; line-height: 1.15; text-align: center; cursor: pointer; touch-action: none;
  transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-ui) ease, border-color var(--dur-ui) ease;
}
${P} .sp-card.is-left { background: #e8f0ff; border-color: #a9c2f5; color: #1c3d8a; font-size: 1.25rem; }
${P} .sp-card.is-right { background: #fff3dc; border-color: #f4cd8a; color: #6b3f00; font-size: 0.98rem; }
${P}.lvl-tk .sp-card { min-height: 84px; }
${P}.lvl-tk .sp-card.is-left { font-size: 1.45rem; }
${P} .sp-card.is-right.is-num { font-size: 1.7rem; }
${P} .sp-card.is-right .ti-dots { font-size: 0.85rem; max-width: 7.2em; }
${P} .sp-card::after {
  content: ""; position: absolute; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 50%;
  background: var(--lc, var(--c)); border: 3px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
${P} .sp-card.is-left::after { right: -13px; }
${P} .sp-card.is-right::after { left: -13px; }
${P} .sp-card:active:not(:disabled) { transform: scale(0.97); }
${P} .sp-card.is-sel { border-color: var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); transform: translateY(-3px); }
${P} .sp-card.is-over { border-color: var(--c); transform: scale(1.03); }
${P} .sp-card.is-ok, ${P} .sp-card.is-ok:disabled { background: var(--good-bg); border-color: var(--good); color: #0b6b4a; opacity: 1; cursor: default; animation: sp-yay var(--dur-ui-max) var(--ease-pop); }
${P} .sp-card.is-bad { animation: sp-shake var(--dur-ui-max) var(--ease-in-out); border-color: var(--bad); background: var(--bad-bg); }
${P} .sp-card:focus-visible { outline: 4px solid #ffb703; outline-offset: 3px; }
@keyframes sp-in { from { opacity: 0; } }
@keyframes sp-bad { 0% { opacity: 1; } 100% { opacity: 0; } }
@keyframes sp-yay { 50% { transform: scale(1.06); } }
@keyframes sp-shake { 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
@media (min-width: 700px) { ${P} .sp-board { --gut: 96px; } ${P}.lvl-tk .sp-card { min-height: 100px; } ${P} .sp-card.is-right { font-size: 1.08rem; } ${P} .sp-card.is-left { font-size: 1.35rem; } }
@media (max-width: 380px) { ${P} .sp-card.is-right { font-size: 0.9rem; } }
@media (prefers-reduced-motion: reduce) {
  ${P} .sp-card.is-ok, ${P} .sp-card.is-bad { animation: none; }
}`;

  const tanpaTitikSama = (arr) => {
    // acak sampai tidak ada kartu kanan yang sebaris dengan pasangannya (kalau lebih dari 2 pasang)
    let acak = shuffle(arr.map((_, i) => i));
    for (let k = 0; k < 40 && arr.length > 2 && acak.some((v, i) => v === i); k++) acak = shuffle(arr.map((_, i) => i));
    return acak;
  };

  TI.register({
    id: 'surat',
    title: 'Surat Pendek',
    cat: 'islam',
    icon: '📖',
    desc: 'Tarik garis untuk mencocokkan surat pendek dengan pasangannya.',
    start(ctx) {
      TI.style('surat', CSS);
      const TK = ctx.isTK;

      // ---------- bahan babak ----------
      const pakaiTK = {};
      function pasanganTK() {
        const urut = shuffle(TK_SURAT).sort((a, b) => (pakaiTK[a.nama] || 0) - (pakaiTK[b.nama] || 0));
        const dipilih = [], ayat = new Set();
        for (const s of urut) {
          if (ayat.has(s.ayat)) continue;
          ayat.add(s.ayat); dipilih.push(s);
          if (dipilih.length === 3) break;
        }
        dipilih.forEach((s) => { pakaiTK[s.nama] = (pakaiTK[s.nama] || 0) + 1; });
        return dipilih;
      }
      function pasanganAyatSD() {
        const perAyat = {};
        for (const s of SURAT) (perAyat[s.ayat] = perAyat[s.ayat] || []).push(s);
        return shuffle(Object.keys(perAyat)).slice(0, 4).map((k) => pick(perAyat[k]));
      }
      const BABAK = TK
        ? [0, 1, 2].map(() => ({
          ask: 'Tarik garis: surat dan jumlah ayatnya!', say: 'Cocokkan nama surat dengan jumlah ayatnya!',
          pasangan: pasanganTK(), kanan: (s) => ({ num: s.ayat, dots: s.ayat, say: s.ayat + ' ayat', aria: s.ayat + ' ayat' }),
        }))
        : [
          { ask: 'Tarik garis: surat dan jumlah ayatnya!', say: 'Cocokkan nama surat dengan jumlah ayatnya!', pasangan: pasanganAyatSD(), kanan: (s) => ({ teks: s.ayat + ' ayat', say: s.ayat + ' ayat', aria: s.ayat + ' ayat' }) },
          { ask: 'Tarik garis: surat dan isi singkatnya!', say: 'Cocokkan nama surat dengan isi singkatnya!', pasangan: sample(SURAT, 4), kanan: (s) => ({ teks: s.isi, say: s.isi, aria: s.isi }) },
          { ask: 'Tarik garis: surat dan nomor suratnya!', say: 'Cocokkan nama surat dengan nomor suratnya!', pasangan: sample(SURAT, 4), kanan: (s) => ({ teks: String(s.no), num: true, say: 'Surat nomor ' + s.no, aria: 'Surat nomor ' + s.no }) },
        ];
      const TOTAL = BABAK.length + (TK ? 0 : 1);

      // ---------- satu babak ----------
      async function babak(def, no) {
        ctx.clear();
        ctx.ask(def.ask, { say: def.say });
        const n = def.pasangan.length;
        const countB = h('b', null, '0');
        const count = h('p', { class: 'sp-count' }, 'Garis benar ', countB, ' dari ' + n);
        const cols = h('div', { class: 'sp-cols' });
        const garis = svg('svg', { class: 'sp-lines', 'aria-hidden': 'true' });
        const board = h('div', { class: 'sp-board' }, cols, garis);
        ctx.el.append(count, board);

        const kiri = [], kanan = [];
        const urutKanan = tanpaTitikSama(def.pasangan);
        def.pasangan.forEach((s, i) => {
          const c = h('button', { type: 'button', class: 'sp-card is-left', 'aria-label': 'Surat ' + s.nama }, s.nama);
          c._i = i; c._sisi = 'k'; c._say = s.nama;
          kiri.push(c);
        });
        urutKanan.forEach((idx) => {
          const s = def.pasangan[idx];
          const d = def.kanan(s);
          const isi = d.dots ? [h('b', { style: 'font-size:1.6rem;line-height:1' }, d.num), TI.dots(d.dots)] : d.teks;
          const c = h('button', { type: 'button', class: 'sp-card is-right' + (d.num === true ? ' is-num' : ''), 'aria-label': d.aria }, isi);
          c._i = idx; c._sisi = 'r'; c._say = d.say;
          kanan.push(c);
        });
        for (let i = 0; i < n; i++) cols.append(kiri[i], kanan[i]);

        let sel = null, drag = null, live = null, tadiSeret = 0, cocok = 0, salah = 0, tutup = false;
        const garisBenar = []; // untuk digambar ulang saat ukuran berubah

        const titik = (card) => {
          const r = card.getBoundingClientRect(), b = board.getBoundingClientRect();
          return { x: (card._sisi === 'k' ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top };
        };
        const bentuk = (a, b) => {
          const dx = Math.max(28, Math.abs(b.x - a.x) * 0.5);
          const ke = a.x <= b.x ? 1 : -1;
          return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' C' + (a.x + ke * dx).toFixed(1) + ' ' + a.y.toFixed(1) + ' ' + (b.x - ke * dx).toFixed(1) + ' ' + b.y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
        };
        function gambarGaris(kc, rc, warna, buruk) {
          const a = titik(kc), b = titik(rc);
          const p = svg('path', { class: 'sp-line' + (buruk ? ' is-bad' : ''), d: bentuk(a, b), stroke: warna });
          garis.append(p);
          if (buruk) { ctx.after(340, () => p.remove()); return p; }
          const d1 = svg('circle', { class: 'sp-dot', cx: a.x, cy: a.y, r: 6, fill: warna });
          const d2 = svg('circle', { class: 'sp-dot', cx: b.x, cy: b.y, r: 6, fill: warna });
          garis.append(d1, d2);
          garisBenar.push({ kc, rc, p, d1, d2 });
          return p;
        }
        function gambarUlang() {
          for (const g of garisBenar) {
            const a = titik(g.kc), b = titik(g.rc);
            g.p.setAttribute('d', bentuk(a, b));
            g.d1.setAttribute('cx', a.x); g.d1.setAttribute('cy', a.y);
            g.d2.setAttribute('cx', b.x); g.d2.setAttribute('cy', b.y);
          }
        }
        ctx.on(window, 'resize', gambarUlang);

        function pilih(card) {
          if (sel) sel.classList.remove('is-sel');
          sel = card;
          if (card) { card.classList.add('is-sel'); ctx.sfx('tap'); ctx.say(card._say); }
        }

        let selesaiBabak;
        const tunggu = new Promise((res) => { selesaiBabak = res; });

        function coba(kc, rc, bantu) {
          if (tutup || kc.disabled || rc.disabled) return;
          pilih(null);
          if (kc._i === rc._i) {
            const warna = WARNA[kc._i % WARNA.length];
            for (const c of [kc, rc]) {
              c.disabled = true; c.classList.add('is-ok'); c.classList.remove('is-over');
              c.style.setProperty('--lc', warna);
            }
            gambarGaris(kc, rc, warna, false);
            cocok++;
            countB.textContent = String(cocok);
            ctx.sfx('benar');
            ctx.say((bantu ? 'Ini pasangannya. ' : '') + def.pasangan[kc._i].nama);
            salah = 0;
            ctx.progress(no + cocok / n, TOTAL);
            if (cocok >= n) { tutup = true; ctx.after(900, selesaiBabak); }
          } else {
            gambarGaris(kc, rc, '#e5484d', true);
            for (const c of [kc, rc]) { c.classList.remove('is-bad'); void c.offsetWidth; c.classList.add('is-bad'); ctx.after(320, () => c.classList.remove('is-bad')); }
            ctx.wrong(null);
            salah++;
            if (salah >= 3) {
              salah = 0;
              ctx.after(900, () => {
                if (tutup) return;
                const k = kiri.find((c) => !c.disabled);
                if (!k) return;
                const r = kanan.find((c) => c._i === k._i);
                coba(k, r, true);
              });
            }
          }
        }
        function ketuk(card) {
          if (tutup || card.disabled) return;
          if (!sel) { pilih(card); return; }
          if (sel === card) { pilih(null); return; }
          if (sel._sisi === card._sisi) { pilih(card); return; }
          const [kc, rc] = sel._sisi === 'k' ? [sel, card] : [card, sel];
          coba(kc, rc, false);
        }
        for (const c of [...kiri, ...kanan]) {
          c.addEventListener('click', () => { if (performance.now() - tadiSeret < 350) return; ketuk(c); });
        }

        // seret: garis mengikuti jari
        board.addEventListener('pointerdown', (e) => {
          const card = e.target.closest && e.target.closest('.sp-card');
          if (!card || card.disabled || tutup) return;
          drag = { card, id: e.pointerId, x: e.clientX, y: e.clientY, on: false };
        });
        board.addEventListener('pointermove', (e) => {
          if (!drag || e.pointerId !== drag.id) return;
          if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10) {
            drag.on = true;
            try { board.setPointerCapture(e.pointerId); } catch (_) { /* tidak didukung */ }
            pilih(drag.card);
            live = svg('path', { class: 'sp-line is-live', stroke: '#4c8dff' });
            garis.append(live);
          }
          if (!drag.on) return;
          const b = board.getBoundingClientRect();
          live.setAttribute('d', bentuk(titik(drag.card), { x: e.clientX - b.left, y: e.clientY - b.top }));
          const bawah = document.elementFromPoint(e.clientX, e.clientY);
          const kartu = bawah && bawah.closest ? bawah.closest('.sp-card') : null;
          for (const c of [...kiri, ...kanan]) c.classList.toggle('is-over', c === kartu && c !== drag.card && c._sisi !== drag.card._sisi && !c.disabled);
        });
        const lepas = (e) => {
          if (!drag) return;
          const d = drag; drag = null;
          if (live) { live.remove(); live = null; }
          for (const c of [...kiri, ...kanan]) c.classList.remove('is-over');
          if (!d.on) return;
          tadiSeret = performance.now();
          const bawah = e && e.clientX != null ? document.elementFromPoint(e.clientX, e.clientY) : null;
          const kartu = bawah && bawah.closest ? bawah.closest('.sp-card') : null;
          if (kartu && kartu !== d.card && kartu._sisi !== d.card._sisi && !kartu.disabled) {
            const [kc, rc] = d.card._sisi === 'k' ? [d.card, kartu] : [kartu, d.card];
            coba(kc, rc, false);
          } else pilih(null);
        };
        board.addEventListener('pointerup', lepas);
        board.addEventListener('pointercancel', (e) => { lepas({ clientX: null }); });

        await tunggu;
        if (!ctx.alive) return;
        ctx.progress(no + 1, TOTAL);
        await ctx.correct(null, { say: pick(PUJI), min: 800 });
      }

      async function alur() {
        ctx.progress(0, TOTAL);
        for (let i = 0; i < BABAK.length; i++) {
          if (!ctx.alive) return;
          await babak(BABAK[i], i);
        }
        if (!ctx.alive) return;
        if (!TK) {
          ctx.clear();
          ctx.ask("Al-Qur'an terdiri dari berapa surat?");
          await ctx.choose({ options: shuffle([114, 99, 30]), answer: 114, speakLabel: true });
          ctx.note("Al-Qur'an terdiri dari 114 surat dan 30 juz.", { title: 'Tahukah kamu?' });
          await ctx.next();
          if (!ctx.alive) return;
          ctx.progress(TOTAL, TOTAL);
        }
        const m = ctx.mistakes;
        ctx.finish({ stars: m <= 3 ? 3 : m <= 8 ? 2 : 1, lesson: LESSON });
      }
      return alur();
    },
  });
})();
