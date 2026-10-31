/* 10 Lebih Besar, Lebih Kecil. TK: bandingkan banyak benda di dua kelompok (lebih banyak / lebih sedikit).
   SD: pilih tanda > < = untuk dua angka sampai 100 dan bentuk hitungan. */
(function () {
  const { h, rand, shuffle } = TI;

  const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  function kata(n) {
    if (n < 10) return SATUAN[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return SATUAN[n - 10] + ' belas';
    if (n < 100) return SATUAN[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + SATUAN[n % 10] : '');
    if (n === 100) return 'seratus';
    return String(n);
  }
  const EMO = ['🍎', '🍌', '🍊', '🍇', '🍓', '⭐', '🎈', '🍪', '⚽', '🌙'];
  const CATATAN = 'Ujung lancip menunjuk angka yang lebih kecil. Mulut yang terbuka menghadap angka yang lebih besar.';

  const CSS = `
.play[data-game="banding"] .ti-choices.ban-row { flex-wrap: nowrap; gap: 12px; max-width: 760px; }
.play[data-game="banding"] .ban-panel {
  flex: 1 1 0; min-width: 0; max-width: 360px; min-height: 150px; padding: 10px 6px 8px; flex-direction: column; gap: 6px;
}
.play[data-game="banding"] .ban-panel:not(.is-correct):not(.is-wrong):nth-child(1) { border-color: #a5d8ff; background: #f3faff; }
.play[data-game="banding"] .ban-panel:not(.is-correct):not(.is-wrong):nth-child(2) { border-color: #ffd8a8; background: #fff8ef; }
.play[data-game="banding"] .ban-group { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
.play[data-game="banding"] .ban-grid {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 4px 0;
  width: 100%; font-size: min(2.3rem, 6.2vw); line-height: 1.1;
}
.play[data-game="banding"] .ban-grid > span { flex: 0 0 20%; text-align: center; }
.play[data-game="banding"] .ban-count {
  display: grid; place-items: center; min-width: 38px; height: 38px; padding: 0 8px; border-radius: 999px; background: var(--c); color: #fff;
  font-size: 1.35rem; font-weight: 800; opacity: 0; transform: scale(0.95);
  transition: opacity var(--dur-ui) var(--ease-out), transform var(--dur-ui) var(--ease-out);
}
.play[data-game="banding"] .ban-row.is-revealed .ban-count { opacity: 1; transform: none; }
.play[data-game="banding"] .ban-tip { margin-top: 0; text-align: center; }
.play[data-game="banding"] .ban-tip:not(:last-child) { margin-bottom: 0; }

.play[data-game="banding"] .ban-eq {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 640px; padding: 18px 10px;
  font-size: clamp(2.2rem, 9.5vw, 3.6rem); font-weight: 800; line-height: 1;
}
.play[data-game="banding"] .ban-side { flex: 0 1 auto; min-width: 0; text-align: center; white-space: nowrap; }
.play[data-game="banding"] .ban-box {
  display: grid; place-items: center; flex: none; width: 1.35em; height: 1.35em; border: 4px dashed var(--c); border-radius: 18px;
  color: var(--c); background: color-mix(in srgb, var(--c) 8%, #fff);
}
.play[data-game="banding"] .ban-box.is-filled { border-style: solid; background: var(--good-bg); border-color: var(--good); color: var(--good); animation: ti-pop var(--dur-ui) var(--ease-out) both; }
.play[data-game="banding"] .ban-sym { font-size: 1em; }
.play[data-game="banding"] .ban-opts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; max-width: 460px; }
.play[data-game="banding"] .ban-opts .choice { min-width: 0; min-height: 100px; font-size: 3rem; }
.play[data-game="banding"] .ban-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 16px; margin-top: 0; }
.play[data-game="banding"] .ban-legend:not(:last-child) { margin-bottom: 0; }
.play[data-game="banding"] .ban-legend b { color: var(--c); font-size: 1.2em; }
.play[data-game="banding"] .ban-intro { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; max-width: 640px; }
.play[data-game="banding"] .ban-chip {
  display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 150px; padding: 10px 14px; border-radius: 18px;
  background: var(--card); box-shadow: 0 4px 0 var(--shadow); font-weight: 800; font-size: 1.9rem; line-height: 1.2;
}
.play[data-game="banding"] .ban-chip small { font-size: 0.95rem; color: var(--muted); font-weight: 700; }
@media (max-width: 560px) {
  .play[data-game="banding"] .ban-panel { min-height: 140px; }
  .play[data-game="banding"] .ban-opts .choice { font-size: 2.6rem; }
}`;

  TI.register({
    id: 'banding',
    title: 'Lebih Besar, Lebih Kecil',
    cat: 'mat',
    icon: '🆚',
    desc: 'Mana yang lebih banyak? Mana yang lebih besar? Belajar tanda > < =.',
    start(ctx) {
      TI.style('banding', CSS);
      return ctx.isTK ? mainTK(ctx) : mainSD(ctx);
    },
  });

  // ---------- TK ----------
  function kelompok(n, emo) {
    const g = h('span', { class: 'ban-grid', 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) g.append(h('span', null, emo));
    return h('span', { class: 'ban-group' }, g, h('span', { class: 'ban-count' }, String(n)));
  }

  function mainTK(ctx) {
    const soal = [];
    for (let i = 0; i < 8; i++) {
      const minBeda = i < 4 ? 2 : 1;
      let a, b;
      do { a = rand(1, 10); b = rand(1, 10); } while (Math.abs(a - b) < minBeda);
      soal.push({ a, b, banyak: Math.random() < 0.5, emo: EMO[(i * 3 + rand(0, 2)) % EMO.length] });
    }

    return ctx.series(soal, async ({ a, b, banyak, emo }) => {
      ctx.ask(banyak ? 'Mana yang lebih banyak?' : 'Mana yang lebih sedikit?');
      const benar = (banyak ? a > b : a < b) ? 'kiri' : 'kanan';
      let terbuka = false;
      const buka = () => { if (terbuka) return; terbuka = true; wrap.classList.add('is-revealed'); };
      const wrap = h('div', { class: 'ti-choices ban-row' });
      const p = ctx.choose({
        into: wrap,
        options: [
          { node: kelompok(a, emo), value: 'kiri', say: '', aria: 'Kelompok kiri' },
          { node: kelompok(b, emo), value: 'kanan', say: '', aria: 'Kelompok kanan' },
        ].map((o) => Object.assign(o, { cls: 'ban-panel' })),
        answer: (v) => { const ok = v === benar; if (ok) buka(); return ok; },
      });
      ctx.el.append(wrap, h('p', { class: 'ti-label ban-tip' }, 'Ketuk kelompok yang kamu pilih'));
      await p;
      const besar = Math.max(a, b), kecil = Math.min(a, b);
      const kalimat = banyak ? kata(besar) + ' lebih banyak dari ' + kata(kecil) : kata(kecil) + ' lebih sedikit dari ' + kata(besar);
      await bicara(ctx, kalimat, 1100);
    }, { lesson: 'Tanda > artinya lebih besar, < artinya lebih kecil, = artinya sama dengan.' });
  }

  // Bacakan lalu beri jeda tetap (kalau suara mati, jeda tetap berjalan).
  function bicara(ctx, teks, ms) {
    ctx.say(teks);
    return ctx.wait(ms);
  }

  // ---------- SD ----------
  function soalAngka() {
    const out = [];
    // 1) puluhan berbeda
    let a = rand(11, 60), b = a + rand(10, 35);
    out.push(Math.random() < 0.5 ? [a, b] : [b, a]);
    // 2) angka terbalik (mis. 63 dan 36)
    let t = rand(2, 9), u = rand(1, 9);
    while (u === t) u = rand(1, 9);
    out.push(Math.random() < 0.5 ? [t * 10 + u, u * 10 + t] : [u * 10 + t, t * 10 + u]);
    // 3) puluhan sama, satuan berbeda
    t = rand(2, 9);
    let u1 = rand(0, 9), u2 = rand(0, 9);
    while (u1 === u2) u2 = rand(0, 9);
    out.push([t * 10 + u1, t * 10 + u2]);
    // 4) sama banyak, atau dekat 100
    if (Math.random() < 0.5) { const n = rand(20, 95); out.push([n, n]); }
    else out.push(Math.random() < 0.5 ? [100, rand(90, 99)] : [rand(90, 99), 100]);
    return shuffle(out).map(([l, r]) => ({
      kiri: String(l), kanan: String(r), lv: l, rv: r, sayL: kata(l), sayR: kata(r),
    }));
  }

  function soalHitungan() {
    const mau = shuffle(['>', '<', '=', '=']);
    return mau.map((tanda) => {
      let teks, ucap, v;
      if (Math.random() < 0.5) {
        const x = rand(3, 12), y = rand(2, 12);
        v = x + y; teks = x + ' + ' + y; ucap = kata(x) + ' tambah ' + kata(y);
      } else {
        const x = rand(10, 20), y = rand(2, 9);
        v = x - y; teks = x + ' - ' + y; ucap = kata(x) + ' kurang ' + kata(y);
      }
      let r = v;
      if (tanda === '>') r = v - rand(1, 3);
      else if (tanda === '<') r = v + rand(1, 3);
      if (r < 1) { r = v + 1; tanda = '<'; }
      return { kiri: teks, kanan: String(r), lv: v, rv: r, sayL: ucap, sayR: kata(r) };
    });
  }

  const KATA_TANDA = { '>': 'lebih besar dari', '<': 'lebih kecil dari', '=': 'sama dengan' };

  async function mainSD(ctx) {
    // Petunjuk sekali di awal.
    ctx.progress(0, 8);
    ctx.ask('Ayo belajar tanda > < dan =', { speak: false });
    ctx.el.append(h('div', { class: 'ban-intro' },
      chip('9 > 4', 'lebih besar'), chip('4 < 9', 'lebih kecil'), chip('6 = 6', 'sama dengan')));
    ctx.note(CATATAN, { title: 'Petunjuk:' });
    await ctx.next('Mulai');
    if (!ctx.alive) return;

    const soal = [...soalAngka(), ...soalHitungan()];
    return ctx.series(soal, async (s) => {
      const tanda = s.lv > s.rv ? '>' : s.lv < s.rv ? '<' : '=';
      ctx.ask('Pilih tanda yang tepat.', { say: 'Pilih tanda yang tepat untuk ' + s.sayL + ' dan ' + s.sayR + '.' });
      const kotak = h('span', { class: 'ban-box', 'aria-hidden': 'true' }, '?');
      ctx.el.append(h('div', { class: 'ti-card ban-eq pop-in', role: 'img', 'aria-label': s.kiri + ' dan ' + s.kanan },
        h('span', { class: 'ban-side' }, s.kiri), kotak, h('span', { class: 'ban-side' }, s.kanan)));
      let terisi = false;
      const p = ctx.choose({
        options: [
          { label: '>', value: '>', aria: 'lebih besar dari', cls: 'is-big' },
          { label: '<', value: '<', aria: 'lebih kecil dari', cls: 'is-big' },
          { label: '=', value: '=', aria: 'sama dengan', cls: 'is-big' },
        ],
        answer: (v) => {
          const ok = v === tanda;
          if (ok && !terisi) { terisi = true; kotak.textContent = tanda; kotak.classList.add('is-filled'); }
          return ok;
        },
        layout: 'ban-opts',
      });
      ctx.el.append(h('p', { class: 'ti-label ban-legend' },
        h('span', null, h('b', null, '>'), ' lebih besar'), h('span', null, h('b', null, '<'), ' lebih kecil'), h('span', null, h('b', null, '='), ' sama dengan')));
      await p;
      await bicara(ctx, s.sayL + ' ' + KATA_TANDA[tanda] + ' ' + s.sayR, 1100);
    }, { lesson: 'Tanda > artinya lebih besar, < artinya lebih kecil, = artinya sama dengan.' });
  }

  function chip(isi, ket) {
    return h('div', { class: 'ban-chip', 'aria-hidden': 'true' }, isi, h('small', null, ket));
  }
})();
