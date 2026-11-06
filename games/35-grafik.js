/* 35 Panen Buah & Grafik. Babak panen: ketuk buah di keranjang, buah terbang ke kolomnya di piktogram dan menumpuk ke atas.
   Babak soal: baca piktogram (TK) atau diagram batang yang tumbuh dari piktogram (SD). */
(function () {
  const { h, rand, shuffle, sample } = TI;

  const BUAH = [
    { k: 'apel', e: '🍎', n: 'apel', c: '#e5484d' },
    { k: 'pisang', e: '🍌', n: 'pisang', c: '#f2b705' },
    { k: 'jeruk', e: '🍊', n: 'jeruk', c: '#f76707' },
    { k: 'anggur', e: '🍇', n: 'anggur', c: '#9775fa' },
  ];
  const RONDE = 2;

  const CSS = `
.play[data-game="grafik"] .pg-wrap { --cell: 44px; display: grid; gap: 12px; width: 100%; max-width: 860px; grid-template-columns: minmax(0, 1fr); justify-items: center; }
.play[data-game="grafik"].lvl-sd .pg-wrap { --cell: 32px; }
.play[data-game="grafik"] .pg-wrap > * { width: 100%; }
@media (min-width: 720px) {
  .play[data-game="grafik"] .pg-wrap.is-harvest { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
  .play[data-game="grafik"] .pg-wrap { --cell: 48px; }
  .play[data-game="grafik"].lvl-sd .pg-wrap { --cell: 36px; }
}
.play[data-game="grafik"] .pg-basket {
  position: relative; display: flex; flex-wrap: wrap; justify-content: center; align-content: flex-start; gap: 4px; padding: 14px 10px 18px;
  border: 5px solid #c98a3d; border-radius: 26px 26px 34px 34px; background: linear-gradient(180deg, #fff3d6, #ffe7b3); box-shadow: 0 5px 0 #a8692a;
}
.play[data-game="grafik"] .pg-fruit {
  position: relative; display: grid; place-items: center; width: 64px; height: 64px; padding: 0; border: 0; background: transparent;
  font-size: 2.5rem; line-height: 1; cursor: pointer; transition: transform var(--dur-press) var(--ease-out);
}
.play[data-game="grafik"].lvl-sd .pg-fruit { width: 62px; height: 62px; font-size: 2.25rem; }
.play[data-game="grafik"] .pg-fruit:active { transform: scale(0.95); }
.play[data-game="grafik"] .pg-fruit.is-gone { visibility: hidden; }
.play[data-game="grafik"] .pg-pic { display: grid; gap: 8px; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); padding: 12px 10px 10px; }
.play[data-game="grafik"] .pg-col { display: grid; gap: 6px; justify-items: center; min-width: 0; }
.play[data-game="grafik"] .pg-stack {
  display: flex; flex-direction: column-reverse; align-items: center; width: 100%; height: calc(var(--rows) * var(--cell) + 8px); padding: 4px 0;
  border-radius: 14px; background: color-mix(in srgb, var(--fc) 14%, #fff); box-shadow: inset 0 -4px 0 color-mix(in srgb, var(--fc) 32%, transparent);
}
.play[data-game="grafik"] .pg-tok { position: relative; display: grid; place-items: center; width: 100%; height: var(--cell); font-size: calc(var(--cell) * 0.72); line-height: 1; }
.play[data-game="grafik"] .pg-tok.is-in { animation: ti-pop var(--dur-ui) var(--ease-out) both; }
.play[data-game="grafik"] .pg-n {
  position: absolute; right: 8%; bottom: 4%; display: grid; place-items: center; min-width: 22px; height: 22px; padding: 0 4px; border-radius: 999px;
  background: var(--fc); color: #fff; font-size: 0.8rem; font-weight: 800; opacity: 0; transition: opacity var(--dur-ui) var(--ease-out);
}
.play[data-game="grafik"] .pg-tok.is-count .pg-n { opacity: 1; }
.play[data-game="grafik"] .pg-lab {
  display: grid; place-items: center; width: 100%; min-height: 60px; padding: 2px; border: 3px solid color-mix(in srgb, var(--fc) 40%, #fff); border-radius: 16px;
  background: #fff; font-size: 2rem; line-height: 1; cursor: pointer; box-shadow: 0 3px 0 var(--shadow);
  transition: transform var(--dur-press) var(--ease-out);
}
.play[data-game="grafik"] .pg-lab:active { transform: scale(0.95); }
.play[data-game="grafik"] .pg-fly { position: fixed; left: 0; top: 0; z-index: 40; line-height: 1; pointer-events: none; will-change: transform; }
.play[data-game="grafik"] .pg-chart { --ch: 168px; display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 4px 6px; padding: 14px 12px 10px; }
@media (min-width: 720px) { .play[data-game="grafik"] .pg-chart { --ch: 200px; } }
.play[data-game="grafik"] .pg-axis { position: relative; height: var(--ch); }
.play[data-game="grafik"] .pg-axis span { position: absolute; right: 0; bottom: calc(var(--v) / var(--max) * 100%); transform: translateY(50%); font-size: 0.9rem; font-weight: 800; color: var(--muted); line-height: 1; }
.play[data-game="grafik"] .pg-plot {
  display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 14%; align-items: end; height: var(--ch); padding: 0 8px;
  border-left: 3px solid #2b2d42; border-bottom: 3px solid #2b2d42;
  background-image: linear-gradient(to top, rgba(43, 45, 66, 0.12) 1px, transparent 1px); background-size: 100% calc(100% / var(--max));
}
.play[data-game="grafik"] .pg-bar {
  height: calc(var(--v) / var(--max) * 100%); background: linear-gradient(180deg, color-mix(in srgb, var(--fc) 80%, #fff), var(--fc));
  border-radius: 8px 8px 0 0; transform-origin: 50% 100%; box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.35);
  animation: pg-grow 560ms var(--ease-out) both; animation-delay: calc(var(--i) * 90ms); /* motion-ok: batang diagram tumbuh dari dasar */
}
.play[data-game="grafik"] .pg-xl { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 14%; padding: 0 8px; text-align: center; font-size: 1.9rem; line-height: 1.1; }
.play[data-game="grafik"] .pg-opts { display: grid; gap: 10px; width: 100%; max-width: 560px; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
.play[data-game="grafik"] .pg-opts .choice { min-width: 0; min-height: 84px; padding: 6px 2px; font-size: 2.6rem; }
.play[data-game="grafik"] .pg-opts .choice.is-num { font-size: 1.9rem; }
.play[data-game="grafik"] .pg-num { display: flex; flex-direction: column; align-items: center; gap: 6px; }
@keyframes pg-grow { from { transform: scaleY(0.04); } }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="grafik"] .pg-bar { animation-name: ti-fade !important; }
  .play[data-game="grafik"] .pg-tok.is-in { animation-name: ti-fade !important; }
}`;

  // jumlah buah per jenis. TK: 3 jenis, jumlah beda semua. SD: 4 jenis, terbanyak dan tersedikit hanya satu.
  function bikinJumlah(n, tk) {
    for (let g = 0; g < 800; g++) {
      const c = Array.from({ length: n }, () => rand(1, tk ? 6 : 8));
      const total = c.reduce((a, b) => a + b, 0);
      const mx = Math.max(...c), mn = Math.min(...c);
      if (tk) { if (total < 6 || total > 9 || new Set(c).size !== n) continue; } else if (total < 12 || total > 20) continue;
      if (c.filter((v) => v === mx).length !== 1 || c.filter((v) => v === mn).length !== 1) continue;
      if (!tk && c[0] === c[1]) continue; // selisih apel dan pisang tidak boleh nol
      return c;
    }
    return tk ? [4, 2, 1] : [7, 4, 5, 2];
  }

  TI.register({
    id: 'grafik',
    title: 'Panen Buah & Grafik',
    cat: 'mat',
    icon: '📊',
    desc: 'Panen buah ke dalam grafik, lalu jawab pertanyaan dari grafiknya!',
    async start(ctx) {
      TI.style('grafik', CSS);
      const reduced = TI.reduced();
      const perRonde = ctx.isTK ? 4 : 5; // 1 panen + soal
      const UNIT = RONDE * perRonde;
      const NSOAL = RONDE * (ctx.isTK ? 3 : 4);
      ctx.progress(0, UNIT);

      for (let r = 0; r < RONDE; r++) {
        if (!ctx.alive) return;
        await ronde(r); if (r < RONDE - 1 && ctx.alive) ctx.correct(null, { say: 'Bagus! Terus naik ke ronde ' + (r + 2) + '!' });
      }
      if (!ctx.alive) return;
      ctx.progress(UNIT, UNIT);
      ctx.finish({ total: NSOAL, lesson: 'Grafik membantu kita membandingkan banyak benda dengan sekali lihat.' });

      async function ronde(r) {
        ctx.clear();
        const jenis = ctx.isTK ? sample(BUAH, 3) : BUAH.slice();
        const n = jenis.length;
        const jml = bikinJumlah(n, ctx.isTK);
        const total = jml.reduce((a, b) => a + b, 0);
        const rows = Math.max(...jml);
        const dasar = r * perRonde;

        // ---------- tampilan panen ----------
        const basket = h('div', { class: 'pg-basket' });
        const cols = jenis.map((b, i) => {
          const stack = h('div', { class: 'pg-stack' });
          const lab = h('button', { type: 'button', class: 'pg-lab', 'aria-label': 'Hitung ' + b.n }, b.e);
          const col = h('div', { class: 'pg-col', style: '--fc:' + b.c }, stack, lab);
          const o = { b, stack, lab, col, tok: [] };
          lab.addEventListener('click', () => hitungKolom(o));
          return o;
        });
        const pic = h('div', { class: 'ti-panel pg-pic', style: '--n:' + n + ';--rows:' + rows }, cols.map((c) => c.col));
        const wrap = h('div', { class: 'pg-wrap is-harvest' }, basket, pic);
        ctx.el.append(wrap);

        const urut = [];
        jenis.forEach((b, i) => { for (let k = 0; k < jml[i]; k++) urut.push(i); });
        shuffle(urut).forEach((i, k) => {
          const btn = h('button', { type: 'button', class: 'pg-fruit pop-in', style: '--i:' + Math.min(k, 8), 'aria-label': jenis[i].n }, jenis[i].e);
          btn.addEventListener('click', () => petik(btn, i));
          basket.append(btn);
        });

        ctx.ask(ctx.isTK ? 'Ketuk buah untuk memetiknya!' : 'Petik semua buah dan susun jadi grafik!');
        let mendarat = 0, sibukHitung = false, selesaiPanen;
        const panen = new Promise((res) => { selesaiPanen = res; });

        function petik(btn, i) {
          if (btn.disabled) return;
          btn.disabled = true;
          const o = cols[i];
          const tok = h('span', { class: 'pg-tok' }, o.b.e, h('b', { class: 'pg-n' }, o.tok.length + 1));
          tok.style.visibility = 'hidden';
          o.stack.append(tok);
          o.tok.push(tok);
          ctx.sfx('tap');
          const selesai = () => {
            tok.style.visibility = '';
            tok.classList.add('is-in');
            mendarat++;
            ctx.sfx('pop');
            ctx.progress(dasar + mendarat / total, UNIT);
            if (mendarat === total) selesaiPanen();
          };
          if (reduced) { btn.classList.add('is-gone'); selesai(); return; }
          const dari = btn.getBoundingClientRect(), ke = tok.getBoundingClientRect();
          const px = Math.round(parseFloat(getComputedStyle(tok).fontSize));
          const klon = h('span', { class: 'pg-fly', 'aria-hidden': 'true', style: 'font-size:' + px + 'px' }, o.b.e);
          ctx.el.append(klon);
          const kw = klon.offsetWidth, kh = klon.offsetHeight;
          const skala = Math.max(1, (dari.width * 0.6) / Math.max(1, px));
          const pos = (rc, sk) => 'translate3d(' + (rc.left + rc.width / 2 - kw / 2).toFixed(1) + 'px,' + (rc.top + rc.height / 2 - kh / 2).toFixed(1) + 'px,0) scale(' + sk.toFixed(2) + ')';
          klon.style.transform = pos(dari, skala);
          btn.classList.add('is-gone');
          void klon.offsetWidth;
          klon.style.transition = 'transform 340ms var(--ease-in-out)'; /* motion-ok: buah terbang ke kolom piktogram */
          klon.style.transform = pos(ke, 1);
          ctx.after(360, () => { klon.remove(); selesai(); });
        }
        await panen;

        // ---------- hitung satu per satu bila kolom diketuk ----------
        async function hitungKolom(o) {
          if (sibukHitung || !o.tok.length) return;
          sibukHitung = true;
          for (const t of o.tok) { t.classList.add('is-count'); ctx.sfx('klik'); await ctx.wait(240); }
          await ctx.wait(1000);
          o.tok.forEach((t) => t.classList.remove('is-count'));
          sibukHitung = false;
        }

        // ---------- babak soal ----------
        await ctx.wait(450);
        basket.remove();
        wrap.classList.remove('is-harvest');
        let tampil = pic;
        if (ctx.isSD) {
          tampil = grafikBatang(jenis, jml);
          pic.replaceWith(tampil);
          ctx.ask('Ini diagram batangnya! Baca angkanya di sebelah kiri.');
          await ctx.wait(1100);
        } else {
          ctx.ask('Hebat, semua buah sudah dipanen!');
          await ctx.wait(900);
        }

        const iMax = jml.indexOf(Math.max(...jml)), iMin = jml.indexOf(Math.min(...jml));
        const soal = [];
        const ikon = (teks, ans) => ({ teks, tipe: 'ikon', ans });
        if (ctx.isTK) {
          const x = rand(0, n - 1);
          soal.push(ikon('Buah apa yang paling banyak?', iMax));
          soal.push({ teks: 'Ada berapa ' + jenis[x].n + '? ' + jenis[x].e, tipe: 'angka', ans: jml[x], say: 'Ada berapa ' + jenis[x].n + '?' });
          soal.push(ikon('Buah apa yang paling sedikit?', iMin));
        } else {
          let a = 0, b = 1;
          if (r > 0) { const pil = shuffle([[0, 2], [1, 3], [2, 3], [0, 3], [1, 2]]).find(([p, q]) => jml[p] !== jml[q]) || [0, 1]; [a, b] = pil; }
          soal.push(ikon('Buah apa yang paling banyak?', iMax));
          soal.push(ikon('Buah apa yang paling sedikit?', iMin));
          soal.push({ teks: 'Berapa selisih ' + jenis[a].n + ' dan ' + jenis[b].n + '?', tipe: 'angka', ans: Math.abs(jml[a] - jml[b]) });
          soal.push({ teks: 'Berapa jumlah semua buah?', tipe: 'angka', ans: total, besar: true });
        }

        for (let q = 0; q < soal.length; q++) {
          if (!ctx.alive) return;
          const s = soal[q];
          ctx.ask(s.teks, s.say ? { say: s.say } : undefined);
          const kotak = h('div', { class: 'pg-opts pop-in' });
          let opsi;
          if (s.tipe === 'ikon') {
            kotak.style.setProperty('--n', n);
            opsi = jenis.map((b, i) => ({ value: i, say: b.n, aria: b.n, node: h('span', { 'aria-hidden': 'true' }, b.e) }));
          } else {
            const pilih = TI.numChoices(s.ans, ctx.isTK ? 3 : 4, 1, s.ans + (s.besar ? 8 : 6)).sort((x, y) => x - y);
            kotak.style.setProperty('--n', pilih.length);
            opsi = pilih.map((v) => ({
              value: v, say: String(v), aria: String(v), cls: 'is-num',
              node: ctx.isTK ? h('span', { class: 'pg-num' }, h('span', null, v), TI.dots(v)) : h('span', null, v),
            }));
          }
          ctx.el.append(kotak);
          await ctx.choose({ options: opsi, answer: s.ans, into: kotak });
          kotak.remove();
          ctx.progress(dasar + 1 + q + 1, UNIT);
        }
      }
    },
  });

  // diagram batang: batang tumbuh dari dasar (scaleY), sumbu angka di kiri
  function grafikBatang(jenis, jml) {
    const max = Math.max(4, Math.ceil(Math.max(...jml) / 2) * 2);
    const axis = h('div', { class: 'pg-axis' });
    for (let v = 0; v <= max; v += 2) axis.append(h('span', { style: '--v:' + v }, v));
    const plot = h('div', { class: 'pg-plot' }, jenis.map((b, i) => h('div', { class: 'pg-bar', style: '--v:' + jml[i] + ';--fc:' + b.c + ';--i:' + i, role: 'img', 'aria-label': 'Batang ' + b.n })));
    const xl = h('div', { class: 'pg-xl', 'aria-hidden': 'true' }, jenis.map((b) => h('span', null, b.e)));
    const chart = h('div', { class: 'ti-panel pg-chart pop-in', style: '--max:' + max + ';--n:' + jenis.length, role: 'img', 'aria-label': 'Diagram batang buah' },
      axis, plot, h('span'), xl);
    return chart;
  }
})();
