/* 34 Domino Hitung. Kartu domino digambar dengan titik berpola dadu (0 sampai 6).
   TK: cari domino dengan jumlah titik tertentu dan hitung titik di satu domino.
   SD: sambung rantai domino (domino meluncur, berputar, lalu menyambung), lalu cari domino dengan jumlah titik tertentu. */
(function () {
  const { h, rand, pick, shuffle } = TI;

  const POLA = { 0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const NAMA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas', 'dua belas'];
  const TOTAL = 8;

  const CSS = `
.play[data-game="domino"] { --s: clamp(36px, 10.2vw, 56px); }
.play[data-game="domino"] .dm {
  display: flex; flex: none; width: fit-content; margin-inline: auto; border: 3px solid #2b2d42; border-radius: 12px; overflow: hidden;
  background: linear-gradient(160deg, #fffdf2, #fbf0cf); box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
}
.play[data-game="domino"] .dm-h { flex-direction: row; }
.play[data-game="domino"] .dm-v { flex-direction: column; }
.play[data-game="domino"] .dm.is-md { --s: 54px; }
.play[data-game="domino"] .dm.is-lg { --s: clamp(60px, 19vw, 88px); border-radius: 18px; }
.play[data-game="domino"] .dm-half {
  position: relative; display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr);
  width: var(--s); height: var(--s); padding: calc(var(--s) * 0.13);
}
.play[data-game="domino"] .dm-h .dm-half + .dm-half { border-left: 3px solid #2b2d42; }
.play[data-game="domino"] .dm-v .dm-half + .dm-half { border-top: 3px solid #2b2d42; }
.play[data-game="domino"] .dm-half i { display: block; place-self: center; width: 74%; aspect-ratio: 1; border-radius: 50%; }
.play[data-game="domino"] .dm-half i.on { background: #2b2d42; }
.play[data-game="domino"] .dm-half.is-open::after {
  content: ""; position: absolute; inset: 2px; border-radius: 9px; border: 4px solid #ff9f1c; pointer-events: none;
  animation: dm-pulse 900ms var(--ease-in-out) infinite alternate;
}
.play[data-game="domino"] .dm-table {
  position: relative; flex: none; width: 100%; max-width: 860px; overflow: hidden; border-radius: var(--radius);
  height: calc(var(--s) + 44px); background: radial-gradient(circle at 50% 40%, #3da56f 0, #2f8f5b 100%); box-shadow: inset 0 4px 0 rgba(0, 0, 0, 0.14), 0 5px 0 var(--shadow);
}
.play[data-game="domino"] .dm-chain { position: absolute; top: 50%; right: calc(var(--s) * 2 + 24px); display: flex; gap: 6px; margin-top: calc(var(--s) * -0.5 - 3px); will-change: transform; }
.play[data-game="domino"] .dm-fly { position: fixed; left: 0; top: 0; z-index: 40; pointer-events: none; will-change: transform; }
.play[data-game="domino"] .dm-hint { margin: 0; color: var(--muted); font-weight: 800; font-size: 1rem; text-align: center; }
.play[data-game="domino"] .dm-hand { display: grid; gap: 8px; width: 100%; max-width: 560px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.play[data-game="domino"] .dm-hand .choice { min-width: 0; min-height: 0; padding: 10px 4px; }
.play[data-game="domino"] .dm-hand .choice.is-gone { visibility: hidden; }
.play[data-game="domino"] .dm-row3 { display: grid; gap: 10px; width: 100%; max-width: 480px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.play[data-game="domino"] .dm-row3 .choice { min-width: 0; min-height: 0; padding: 12px 4px; }
.play[data-game="domino"] .dm-row3.is-num .choice { min-height: 124px; font-size: 2.6rem; }
.play[data-game="domino"] .dm-opts4 { display: grid; gap: 8px; width: 100%; max-width: 560px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.play[data-game="domino"] .dm-opts4 .choice { min-width: 0; min-height: 0; padding: 10px 4px; }
.play[data-game="domino"] .dm-num { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.play[data-game="domino"] .dm-target { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; padding: 10px 16px; }
.play[data-game="domino"] .dm-target b { font-size: 2.6rem; line-height: 1; color: var(--c); }
.play[data-game="domino"] .dm-target .ti-dots { font-size: 1.2rem; max-width: 7em; }
@keyframes dm-pulse { from { opacity: 0.35; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="domino"] .dm-half.is-open::after { animation: none; }
}`;

  // ---------- gambar domino ----------
  function separuh(n, buka) {
    const w = h('div', { class: 'dm-half' + (buka ? ' is-open' : '') });
    for (let i = 0; i < 9; i++) w.append(h('i', { class: POLA[n].includes(i) ? 'on' : '' }));
    return w;
  }
  // o: 'h' (mendatar) atau 'v' (tegak), ukuran: '' | 'is-md' | 'is-lg'
  function domino(a, b, o, ukuran, bukaKanan) {
    return h('div', { class: 'dm dm-' + o + (ukuran ? ' ' + ukuran : ''), role: 'img', 'aria-label': 'Domino ' + a + ' dan ' + b }, separuh(a), separuh(b, bukaKanan));
  }
  const ketemuTotal = (t) => {
    const a = rand(Math.max(0, t - 6), Math.min(6, t));
    return Math.random() < 0.5 ? [a, t - a] : [t - a, a];
  };
  const kunci = (d) => Math.min(d[0], d[1]) + '-' + Math.max(d[0], d[1]);

  // empat atau tiga domino dengan jumlah titik berbeda, salah satunya = T (indeks jawaban dikembalikan lewat nilai)
  function himpunanTotal(T, n, lo, hi) {
    const tot = new Set([T]);
    const calon = shuffle([T - 3, T - 2, T - 1, T + 1, T + 2, T + 3].filter((v) => v >= lo && v <= hi));
    calon.forEach((v) => { if (tot.size < n) tot.add(v); });
    for (let v = lo; tot.size < n && v <= hi; v++) tot.add(v);
    const hasil = shuffle([...tot]).map((t) => ({ t, d: ketemuTotal(t) }));
    return hasil;
  }

  TI.register({
    id: 'domino',
    title: 'Domino Hitung',
    cat: 'mat',
    icon: '🎲',
    desc: 'Hitung titik domino, lalu sambung rantai domino yang cocok!',
    async start(ctx) {
      TI.style('domino', CSS);
      const reduced = TI.reduced();
      const lesson = 'Menghitung titik dengan cepat: kenali pola titik seperti pada dadu.';

      if (ctx.isTK) await mainTK();
      else await mainSD();
      if (ctx.alive) ctx.finish({ total: TOTAL, lesson });

      // ---------- TK ----------
      async function mainTK() {
        // dua jenis soal bergantian; empat soal pertama jumlahnya kecil, empat terakhir lebih besar
        const jumlah = [...shuffle([2, 3, 4, 5, 6]).slice(0, 4), ...shuffle([5, 6, 7, 8, 9, 10]).slice(0, 4)];
        const urut = jumlah.map((T, i) => ({ jenis: i % 2 === 0 ? 'hitung' : 'cari', T }));
        for (let i = 0; i < TOTAL; i++) {
          if (!ctx.alive) return;
          ctx.progress(i, TOTAL);
          ctx.clear();
          const { jenis, T } = urut[i];
          if (jenis === 'hitung') {
            const d = ketemuTotal(T);
            ctx.ask('Berapa titik di domino ini?');
            ctx.el.append(h('div', { class: 'ti-panel pop-in' }, domino(d[0], d[1], 'h', 'is-lg')));
            const wrapN = h('div', { class: 'dm-row3 is-num' });
            ctx.el.append(wrapN);
            await ctx.choose({
              into: wrapN,
              options: TI.numChoices(T, 3, 1, 12).sort((x, y) => x - y).map((v) => ({
                value: v, say: NAMA[v], aria: v + ' titik',
                node: h('span', { class: 'dm-num' }, h('span', null, v), TI.dots(v)),
              })),
              answer: T,
            });
          } else {
            const set = himpunanTotal(T, 3, 1, 12);
            ctx.ask('Mana domino yang titiknya ada ' + T + '?', { say: 'Mana domino yang titiknya ada ' + NAMA[T] + '?' });
            ctx.el.append(h('div', { class: 'ti-panel dm-target pop-in', 'aria-hidden': 'true' }, h('b', null, T), TI.dots(T)));
            const wrap = h('div', { class: 'dm-row3' });
            ctx.el.append(wrap);
            await ctx.choose({
              options: set.map((x) => ({ value: x.t, say: NAMA[x.t], aria: 'Domino ' + x.d[0] + ' dan ' + x.d[1], node: domino(x.d[0], x.d[1], 'v', 'is-md') })),
              answer: T, into: wrap,
            });
          }
        }
        ctx.progress(TOTAL, TOTAL);
      }

      // ---------- SD ----------
      async function mainSD() {
        ctx.ask('Sambungkan domino ke ujung yang menyala!', { say: 'Sambungkan domino! Cari sisi yang titiknya sama dengan ujung yang menyala.' });
        const chain = h('div', { class: 'dm-chain' });
        const table = h('div', { class: 'dm-table' }, chain);
        const hint = h('p', { class: 'dm-hint' }, 'Ketuk domino yang bisa disambung.');
        const handBox = h('div');
        ctx.el.append(table, hint, handBox);

        // domino pertama di meja
        const mulai = [rand(1, 6), rand(1, 6)];
        let X = mulai[1];
        let ujung = domino(mulai[0], mulai[1], 'h', '', true);
        ujung.classList.add('pop-in');
        chain.append(ujung);

        for (let step = 0; step < 5; step++) {
          if (!ctx.alive) return;
          ctx.progress(step, TOTAL);
          hint.textContent = step === 0 ? 'Ketuk domino yang bisa disambung.' : 'Tersambung! Cari lagi untuk ujung yang menyala.';
          const benar = [X, rand(1, 6)];
          if (Math.random() < 0.5) benar.reverse();
          const lain = [0, 1, 2, 3, 4, 5, 6].filter((v) => v !== X);
          const pakai = new Set([kunci(benar)]);
          const tangan = [{ d: benar, ok: true }];
          for (let g = 0; tangan.length < 4 && g < 60; g++) {
            const d = [pick(lain), pick(lain)];
            if (pakai.has(kunci(d))) continue;
            pakai.add(kunci(d)); tangan.push({ d, ok: false });
          }
          const urut = shuffle(tangan);
          const hasil = await langkah(urut);
          X = hasil;
        }

        // tiga soal jumlah titik
        const totals = shuffle([7, 8, 9, 10, 11]).slice(0, 3).sort((a, b) => a - b);
        for (let i = 0; i < totals.length; i++) {
          if (!ctx.alive) return;
          ctx.progress(5 + i, TOTAL);
          ctx.clear();
          const T = totals[i];
          const set = himpunanTotal(T, 4, 2, 12);
          ctx.ask('Domino mana yang jumlah titiknya ' + T + '?', { say: 'Domino mana yang jumlah titiknya ' + NAMA[T] + '?' });
          ctx.el.append(h('div', { class: 'ti-panel dm-target pop-in', 'aria-hidden': 'true' }, h('b', null, T), ' titik'));
          const wrap = h('div', { class: 'dm-opts4' });
          ctx.el.append(wrap);
          await ctx.choose({
            options: set.map((x) => ({ value: x.t, say: String(x.t), aria: 'Domino ' + x.d[0] + ' dan ' + x.d[1], node: domino(x.d[0], x.d[1], 'v') })),
            answer: T, into: wrap, speakLabel: false,
          });
        }
        ctx.progress(TOTAL, TOTAL);

        // satu langkah sambung: resolve nilai ujung baru
        function langkah(tangan) {
          return new Promise((resolve) => {
            let salah = 0, sibuk = false;
            handBox.replaceChildren();
            const hand = h('div', { class: 'dm-hand' });
            const tombol = tangan.map((t, i) => {
              const b = h('button', { type: 'button', class: 'choice pop-in', style: '--i:' + i, 'aria-label': 'Domino ' + t.d[0] + ' dan ' + t.d[1] }, domino(t.d[0], t.d[1], 'v'));
              b.addEventListener('click', () => ketuk(i));
              hand.append(b);
              return b;
            });
            handBox.append(hand);

            async function ketuk(i) {
              if (sibuk || tombol[i].disabled) return;
              const t = tangan[i];
              if (t.ok) { sibuk = true; await pasang(t, tombol[i]); resolve(t.d[0] === X ? t.d[1] : t.d[0]); return; }
              salah++;
              const lisan = salah === 1 ? 'Belum cocok. Cari sisi yang titiknya sama dengan ujung yang menyala.' : undefined;
              sibuk = true;
              await ctx.wrong(tombol[i], { say: lisan });
              sibuk = false;
              tombol[i].disabled = true;
              if (salah >= 3 && !sibuk) { // tunjukkan cara benar
                sibuk = true;
                const k = tangan.findIndex((x) => x.ok);
                tombol[k].classList.add('is-hint');
                await ctx.sayWait('Ini yang cocok.');
                await pasang(tangan[k], tombol[k]);
                resolve(tangan[k].d[0] === X ? tangan[k].d[1] : tangan[k].d[0]);
              }
            }

            // domino meluncur ke ujung rantai: diputar bila perlu, lalu rantai bergeser
            async function pasang(t, btn) {
              ctx.sfx('benar');
              ctx.say('Tersambung! ' + NAMA[X] + ' bertemu ' + NAMA[X] + '.');
              hint.textContent = 'Titik ' + X + ' bertemu titik ' + X + '!';
              const lain = t.d[0] === X ? t.d[1] : t.d[0];
              const baru = domino(X, lain, 'h', '', true);
              ujung.querySelectorAll('.is-open').forEach((e) => e.classList.remove('is-open'));
              const w0 = chain.offsetWidth;
              baru.style.visibility = 'hidden';
              chain.append(baru);
              const dw = chain.offsetWidth - w0;
              tombol.forEach((b) => { if (b !== btn) b.disabled = true; });
              if (reduced) {
                baru.style.visibility = '';
                btn.classList.add('is-gone');
                ujung = baru;
                await ctx.wait(300);
                return;
              }
              chain.style.transition = 'none';
              chain.style.transform = 'translateX(' + dw + 'px)';
              void chain.offsetWidth;
              const dari = btn.firstElementChild.getBoundingClientRect(), ke = baru.getBoundingClientRect();
              const klon = domino(X, lain, 'h', '', false);
              klon.classList.add('dm-fly');
              ctx.el.append(klon);
              const kw = klon.offsetWidth, kh = klon.offsetHeight;
              const putar = t.d[0] === X ? 90 : -90;
              const pos = (r, deg) => 'translate3d(' + (r.left + r.width / 2 - kw / 2).toFixed(1) + 'px,' + (r.top + r.height / 2 - kh / 2).toFixed(1) + 'px,0) rotate(' + deg + 'deg)';
              klon.style.transform = pos(dari, putar);
              btn.classList.add('is-gone');
              void klon.offsetWidth;
              klon.style.transition = 'transform 380ms var(--ease-in-out)'; /* motion-ok: domino meluncur dan berputar ke rantai */
              klon.style.transform = pos(ke, 0);
              await ctx.wait(400);
              baru.style.visibility = '';
              klon.remove();
              ctx.sfx('klik');
              chain.style.transition = 'transform 260ms var(--ease-in-out)';
              chain.style.transform = '';
              ujung = baru;
              await ctx.wait(420);
            }
          });
        }
      }
    },
  });
})();
