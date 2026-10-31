/* 49 Menara Hanoi (logika, ada tombol Bantu).
   Tiga tiang = tiga tombol besar. Ketuk tiang asal (cakram teratas terangkat), ketuk tiang tujuan (cakram turun).
   TK: 2 cakram lalu 3 cakram. SD: 3 cakram lalu 4 cakram.
   Bantu: langkah optimal dari keadaan sekarang (BFS dari keadaan tujuan, 3^n keadaan); ketukan ke-3 = selesai otomatis. */
(function () {
  const { h } = TI;

  // [isi, garis] dari cakram terkecil ke terbesar
  const WARNA = [['#ff6b6b', '#c92a2a'], ['#ffb703', '#c77d00'], ['#51cf66', '#2b8a3e'], ['#4dabf7', '#1c6fb8'], ['#b197fc', '#6f48c8']];

  const CSS = `
    & .hn-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
    & .hn-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    & .hn-chip { padding: 6px 12px; border-radius: 999px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1rem; }
    & .hn-chip b { color: var(--c); }
    & .hn-board { --dh: 40px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; width: min(100%, 540px); }
    & .hn-peg {
      position: relative; display: block; padding: 0; margin: 0; border: 3px solid transparent; border-radius: 22px;
      height: calc(var(--dh) * (var(--n) + 2.6)); background: rgba(255, 255, 255, 0.75); box-shadow: 0 5px 0 var(--shadow);
      cursor: pointer; -webkit-appearance: none; appearance: none; touch-action: manipulation;
      transition: transform var(--dur-press) var(--ease-out), border-color var(--dur-ui) ease, background-color var(--dur-ui) ease;
    }
    & .hn-peg::before {
      content: ""; position: absolute; left: 50%; bottom: 12px; width: 14px; margin-left: -7px; border-radius: 8px 8px 0 0;
      height: calc(var(--dh) * (var(--n) + 1.4)); background: linear-gradient(90deg, #a8742d, #d9a05b 45%, #a8742d);
    }
    & .hn-peg::after { content: ""; position: absolute; left: 8%; right: 8%; bottom: 0; height: 14px; border-radius: 9px; background: #b7791f; }
    & .hn-peg:active { transform: scale(0.98); }
    & .hn-peg.is-from { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, #fff); }
    & .hn-peg.is-goal { background: #f1fbe9; }
    & .hn-peg.is-wrong { animation: ti-shake var(--dur-ui-max) var(--ease-in-out); border-color: var(--bad); }
    & .hn-flag { position: absolute; left: 50%; top: 4px; margin-left: -0.6em; font-size: 1.5rem; line-height: 1; pointer-events: none; }
    & .hn-disc {
      display: block; position: absolute; height: var(--dh); border-radius: 12px; pointer-events: none; z-index: 2; will-change: transform;
      bottom: calc(14px + var(--dh) * var(--i)); background: var(--dc); border: 3px solid var(--dl);
      box-shadow: inset 0 5px 0 rgba(255, 255, 255, 0.32);
      transition: transform 150ms var(--ease-out);
    }
    & .hn-disc.is-lift { transform: translateY(calc(var(--dh) * var(--lift) * -1)); z-index: 5; }
    & .hn-disc.is-dance { animation: hn-dance 520ms var(--ease-in-out) both; animation-delay: calc(var(--k) * 90ms); } /* motion-ok: perayaan selesai level, jarang terjadi */
    @keyframes hn-dance { 50% { transform: translateY(-14px); } }
    & .hn-rule { margin: 0; max-width: 540px; padding: 8px 14px; border-radius: 16px; background: #fff4cc; font-size: 0.98rem; line-height: 1.35; text-align: center; font-weight: 700; }
    @media (max-width: 560px) {
      & .hn-board { --dh: 32px; gap: 6px; }
      & .hn-flag { font-size: 1.3rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .hn-disc.is-dance { animation: none; }
      & .hn-peg.is-wrong { animation: none; }
    }
  `.replace(/&/g, '.play[data-game="hanoi"]');

  // ---------- solver: BFS dari keadaan tujuan; keadaan = posisi tiap cakram (0 = terkecil), 3^n keadaan ----------
  function pemecah(n) {
    const total = 3 ** n;
    const kunci = (pos) => pos.reduce((a, p, k) => a + p * 3 ** k, 0);
    const dariKunci = (kk) => Array.from({ length: n }, (_, k) => Math.floor(kk / 3 ** k) % 3);
    function langkahDari(pos) {
      const atas = [-1, -1, -1];
      for (let k = n - 1; k >= 0; k--) atas[pos[k]] = k; // cakram terkecil di tiap tiang = yang teratas
      const out = [];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
        if (a === b || atas[a] < 0) continue;
        if (atas[b] >= 0 && atas[b] < atas[a]) continue;
        const np = pos.slice(); np[atas[a]] = b;
        out.push({ k: atas[a], dari: a, ke: b, pos: np });
      }
      return out;
    }
    const jarak = new Array(total).fill(-1);
    const tujuan = kunci(Array(n).fill(2));
    jarak[tujuan] = 0;
    const antre = [tujuan];
    for (let q = 0; q < antre.length; q++) {
      const kk = antre[q];
      for (const m of langkahDari(dariKunci(kk))) {
        const nk = kunci(m.pos);
        if (jarak[nk] < 0) { jarak[nk] = jarak[kk] + 1; antre.push(nk); }
      }
    }
    return {
      terbaik: jarak[kunci(Array(n).fill(0))],
      langkahDari,
      kunci,
      jarak,
      berikut(pos) {
        const d = jarak[kunci(pos)];
        return langkahDari(pos).find((m) => jarak[kunci(m.pos)] === d - 1) || null;
      },
    };
  }

  TI.register({
    id: 'hanoi',
    title: 'Menara Hanoi',
    cat: 'logika',
    icon: '🥞',
    desc: 'Pindahkan semua cakram ke tiang kanan. Pikir dulu, baru pindah!',
    async start(ctx) {
      TI.style('hanoi', CSS);
      const levels = ctx.isTK ? [2, 3] : [3, 4];
      const nilai = []; // bintang per level
      const reduced = TI.reduced();

      const mainkan = (n, idx) => new Promise((resolve) => {
        const solver = pemecah(n);
        const pos = Array(n).fill(0);
        let langkah = 0, bantu = 0, gagal = 0, sel = null, sibuk = true, selesai = false;

        // ---------- tampilan ----------
        const chipLevel = h('span', { class: 'hn-chip' }, 'Menara ' + (idx + 1) + ': ', h('b', null, n + ' cakram'));
        const chipLangkah = h('span', { class: 'hn-chip' });
        const chipTerbaik = h('span', { class: 'hn-chip' }, 'Terbaik: ', h('b', null, solver.terbaik));
        const pegs = [0, 1, 2].map((p) => {
          const b = h('button', { type: 'button', class: 'hn-peg' + (p === 2 ? ' is-goal' : ''), style: '--n:' + n, 'aria-label': 'Tiang ' + (p === 0 ? 'kiri' : p === 1 ? 'tengah' : 'kanan') });
          if (p === 2) b.append(h('span', { class: 'hn-flag', 'aria-hidden': 'true' }, '🏁'));
          b.addEventListener('click', () => ketukTiang(p));
          return b;
        });
        const papan = h('div', { class: 'hn-board' }, pegs);
        const discs = Array.from({ length: n }, (_, k) => {
          const lebar = n === 1 ? 80 : 40 + (k * 52) / (n - 1);
          const [isi, garis] = WARNA[k];
          return h('span', { class: 'hn-disc', style: 'width:' + lebar + '%;left:' + (50 - lebar / 2) + '%;--dc:' + isi + ';--dl:' + garis });
        });
        const bantuBtn = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
        const aturan = h('p', { class: 'hn-rule' }, 'Satu cakram sekali pindah. Cakram besar tidak boleh di atas cakram kecil.');
        ctx.el.append(h('div', { class: 'hn-wrap' }, h('div', { class: 'hn-info' }, chipLevel, chipLangkah, chipTerbaik), papan, aturan, h('div', { class: 'ti-toolbar' }, bantuBtn)));

        const infoLangkah = () => { chipLangkah.replaceChildren('Langkah: ', h('b', null, langkah)); };
        infoLangkah();

        // indeks tumpukan cakram k = banyak cakram lebih besar di tiang yang sama
        const idxDi = (k) => { let c = 0; for (let j = k + 1; j < n; j++) if (pos[j] === pos[k]) c++; return c; };
        const atasDi = (p) => { for (let k = 0; k < n; k++) if (pos[k] === p) return k; return -1; };
        function taruh(k) {
          const el = discs[k];
          el.style.setProperty('--i', idxDi(k));
          el.style.setProperty('--lift', n + 0.6 - idxDi(k));
          pegs[pos[k]].append(el);
        }
        for (let k = n - 1; k >= 0; k--) taruh(k);

        function angkat(k, ya) {
          const el = discs[k];
          el.style.setProperty('--lift', n + 0.6 - idxDi(k));
          el.classList.toggle('is-lift', ya);
        }
        function batalPilih() {
          if (sel === null) return;
          const k = atasDi(sel);
          if (k >= 0) angkat(k, false);
          pegs[sel].classList.remove('is-from');
          sel = null;
        }

        // pindahkan cakram k ke tiang ke dengan animasi (naik, geser, turun)
        async function pindah(k, ke) {
          const el = discs[k];
          const dari = pos[k];
          const idxLama = idxDi(k);
          const dh = el.offsetHeight;
          const terangkat = el.classList.contains('is-lift');
          const r1 = el.getBoundingClientRect();
          el.style.transition = 'none';
          el.classList.remove('is-lift');
          const restLama = el.getBoundingClientRect();
          pos[k] = ke;
          taruh(k);
          const r2 = el.getBoundingClientRect();
          void el.offsetWidth;
          el.style.transition = '';
          pegs[dari].classList.remove('is-from');
          let dur = 0;
          if (!reduced && el.animate) {
            const naik = (n + 0.6 - idxLama) * dh;
            const lsx = restLama.left - r2.left, lsy = restLama.top - naik - r2.top;
            const bx = r1.left - r2.left, by = r1.top - r2.top;
            const T = (x, y) => 'translate(' + x + 'px,' + y + 'px)';
            const frames = terangkat
              ? [{ transform: T(bx, by) }, { transform: T(0, lsy), offset: 0.62 }, { transform: T(0, 0) }]
              : [{ transform: T(bx, by) }, { transform: T(lsx, lsy), offset: 0.2 }, { transform: T(0, lsy), offset: 0.62 }, { transform: T(0, 0) }];
            dur = terangkat ? 230 : 280;
            el.animate(frames, { duration: dur, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
          }
          await ctx.wait(dur + 20);
          ctx.sfx('klik');
        }

        function perbarui() {
          if (pos.every((p) => p === 2)) { selesai = true; }
        }

        async function akhiri() {
          pegs.forEach((p) => { p.disabled = true; });
          bantuBtn.disabled = true;
          discs.forEach((d, k) => { d.style.setProperty('--k', k); d.classList.add('is-dance'); });
          const lev = bantu === 0 && langkah <= solver.terbaik + 3 ? 3 : bantu <= 1 ? 2 : 1;
          nilai.push(lev);
          await ctx.correct(null, { say: 'Menara sudah pindah semua! Hebat!', min: 900 });
          resolve();
        }

        async function ketukTiang(p) {
          if (sibuk || selesai) return;
          if (sel === null) {
            const k = atasDi(p);
            if (k < 0) { ctx.sfx('tap'); return; }
            sel = p;
            angkat(k, true);
            pegs[p].classList.add('is-from');
            ctx.sfx('klik');
            return;
          }
          if (sel === p) { batalPilih(); ctx.sfx('tap'); return; }
          const k = atasDi(sel), t = atasDi(p);
          if (t >= 0 && t < k) {
            // pelanggaran: besar di atas kecil
            sibuk = true;
            batalPilih();
            gagal++;
            await ctx.wrong(pegs[p], { say: 'Cakram besar tidak boleh di atas cakram kecil.', min: 700 });
            sibuk = false;
            if (gagal >= 3) { gagal = 0; await langkahBantuan(); }
            return;
          }
          sibuk = true;
          gagal = 0;
          const asal = sel;
          sel = null;
          await pindah(k, p);
          langkah++;
          infoLangkah();
          pegs[asal].classList.remove('is-from');
          perbarui();
          if (selesai) await akhiri(); else sibuk = false;
        }

        // satu langkah optimal dari keadaan sekarang
        async function langkahBantuan() {
          batalPilih();
          const m = solver.berikut(pos);
          if (!m) return;
          sibuk = true;
          pegs[m.dari].classList.add('is-from');
          angkat(m.k, true);
          await ctx.wait(reduced ? 200 : 260);
          await pindah(m.k, m.ke);
          langkah++;
          infoLangkah();
          perbarui();
          if (selesai) await akhiri(); else sibuk = false;
        }

        bantuBtn.addEventListener('click', async () => {
          if (sibuk || selesai) return;
          bantu++;
          ctx.mistakes++;
          ctx.sfx('tap');
          if (bantu <= 2) {
            ctx.say('Ini langkah yang bagus.');
            await langkahBantuan();
          } else {
            sibuk = true;
            batalPilih();
            bantuBtn.disabled = true;
            ctx.say('Lihat ya, aku bantu sampai selesai.');
            await ctx.wait(800);
            while (ctx.alive && !pos.every((p) => p === 2)) {
              const m = solver.berikut(pos);
              if (!m) break;
              pegs[m.dari].classList.add('is-from');
              await pindah(m.k, m.ke);
              langkah++;
              infoLangkah();
              await ctx.wait(140);
            }
            perbarui();
            await akhiri();
          }
        });

        // ---------- pengenalan aturan (hanya level pertama) ----------
        ctx.ask(idx === 0 ? 'Pindahkan semua cakram ke tiang kanan!' : 'Menara baru! Pindahkan semua cakram ke tiang kanan.');
        (async () => {
          if (idx === 0) {
            await ctx.wait(700);
            ctx.say('Satu cakram sekali pindah. Cakram besar tidak boleh di atas cakram kecil. Lihat contohnya.');
            await ctx.wait(1300);
            const k = 0, ke = n % 2 === 0 ? 1 : 2;
            angkat(k, true);
            pegs[0].classList.add('is-from');
            await ctx.wait(reduced ? 300 : 450);
            await pindah(k, ke);
            await ctx.wait(700);
            await pindah(k, 0);
            await ctx.wait(200);
          }
          sibuk = false;
        })();
      });

      for (let i = 0; i < levels.length; i++) {
        if (!ctx.alive) return;
        ctx.progress(i, levels.length);
        ctx.clear();
        await mainkan(levels[i], i);
      }
      if (!ctx.alive) return;
      ctx.progress(levels.length, levels.length);
      const rata = Math.floor(nilai.reduce((a, b) => a + b, 0) / Math.max(1, nilai.length));
      ctx.finish({
        stars: Math.max(1, rata),
        total: levels.length,
        lesson: 'Masalah besar bisa diselesaikan dengan memecahnya menjadi langkah-langkah kecil.',
      });
    },
  });
})();
