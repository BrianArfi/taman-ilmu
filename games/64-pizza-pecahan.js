/* 64 Pizza Pecahan. Lingkaran pizza dibagi juring sama besar (SVG, tanpa wajah).
   Ketuk potongan sesuai pecahan target lalu tekan Cek. TK: 1/2 dan 1/4. SD: tambah 1/3, 3/4, 1/6. */
(function () {
  const { h, svg } = TI;

  const CSS = `
.play[data-game="pizza-pecahan"] .pz-wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="pizza-pecahan"] .pz-target { display: flex; align-items: center; gap: 10px; font-size: 1.5rem; font-weight: 800; }
.play[data-game="pizza-pecahan"] .pz-frac { display: inline-flex; flex-direction: column; align-items: center; font-size: 1.9rem; line-height: 1; color: var(--c); }
.play[data-game="pizza-pecahan"] .pz-frac > span:first-child { padding: 0 0.3em 0.08em; border-bottom: 0.12em solid currentColor; }
.play[data-game="pizza-pecahan"] .pz-pic { width: min(100%, 320px); line-height: 0; }
.play[data-game="pizza-pecahan"] .pz-pic svg { display: block; width: 100%; height: auto; overflow: visible; }
.play[data-game="pizza-pecahan"] .pz-slc { cursor: pointer; }
.play[data-game="pizza-pecahan"] .pz-ov { opacity: 0; transition: opacity var(--dur-ui) var(--ease-out); }
.play[data-game="pizza-pecahan"] .pz-slc.is-sel .pz-ov { opacity: 0.5; }
.play[data-game="pizza-pecahan"] .pz-slc.is-hint .pz-base { animation: pz-hint 800ms var(--ease-in-out) 3; } /* motion-ok: petunjuk berkedip lembut */
@keyframes pz-hint { 50% { opacity: 0.45; } }
.play[data-game="pizza-pecahan"] .pz-slc:focus-visible { outline: 4px solid #ffb703; outline-offset: -2px; }
.play[data-game="pizza-pecahan"] .pz-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; font-weight: 800; font-size: 1.2rem; }
.play[data-game="pizza-pecahan"] .pz-cek { min-width: 200px; min-height: 72px; font-size: 1.6rem; }
.play[data-game="pizza-pecahan"] .pz-salah { color: #e5484d; font-weight: 800; min-height: 1.6em; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="pizza-pecahan"] .pz-slc.is-hint .pz-base { animation: none !important; }
}`;

  const KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam'];
  function ucap(n, d) {
    if (n === 1 && d === 2) return 'setengah';
    if (n === 1 && d === 3) return 'sepertiga';
    if (n === 1 && d === 4) return 'seperempat';
    if (n === 1 && d === 6) return 'seperenam';
    return (KATA[n] || n) + ' per ' + (d === 4 ? 'empat' : d === 3 ? 'tiga' : d);
  }

  const CX = 150, CY = 150, R = 120;
  const rad = (deg) => ((deg - 90) * Math.PI) / 180;
  const pt = (deg, r) => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))];
  function pathJuring(a0, a1, r) {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    return 'M' + CX + ' ' + CY + 'L' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
      'A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + 'Z';
  }

  TI.register({
    id: 'pizza-pecahan',
    title: 'Pizza Pecahan',
    cat: 'mat',
    icon: '🍕',
    desc: 'Seret potongan pizza sesuai pecahan target.',
    async start(ctx) {
      TI.style('pizza-pecahan', CSS);
      const ronde = ctx.isTK
        ? [{ n: 1, d: 2 }, { n: 1, d: 4 }]
        : [{ n: 1, d: 3 }, { n: 3, d: 4 }, { n: 1, d: 6 }];

      ctx.progress(0, ronde.length);
      for (let r = 0; r < ronde.length; r++) {
        if (!ctx.alive) return;
        const { n, d } = ronde[r];
        const kata = ucap(n, d);
        ctx.ask('Ambil ' + kata + ' pizza! Ketuk ' + (KATA[n] || n) + ' potong, lalu tekan Cek.');

        const wrap = h('div', { class: 'pz-wrap' });
        const frac = h('span', { class: 'pz-frac', 'aria-hidden': 'true' }, h('span', null, String(n)), h('span', null, String(d)));
        const info = h('div', { class: 'pz-info' }, 'Terpilih: ', h('b', null, '0'), ' dari ' + n);
        const infoB = info.querySelector('b');
        const salah = h('p', { class: 'pz-salah', 'aria-live': 'polite' });
        const cek = h('button', { type: 'button', class: 'ti-btn pz-cek' }, 'Cek');
        const pic = h('div', { class: 'pz-pic' });

        // Gambar pizza: kerak + keju + garis potong + toping.
        const g = svg('svg', { viewBox: '0 0 300 300', role: 'group', 'aria-label': 'Pizza dibagi ' + d + ' potong sama besar' });
        g.append(svg('circle', { cx: CX, cy: CY, r: R + 12, fill: '#e8a33d' }));
        g.append(svg('circle', { cx: CX, cy: CY, r: R + 12, fill: 'none', stroke: '#c97e1e', 'stroke-width': 3 }));
        const toping = [[120, 110], [180, 120], [140, 170], [175, 185], [110, 155], [155, 135]];
        const slcEls = [];
        for (let i = 0; i < d; i++) {
          const a0 = (360 * i) / d, a1 = (360 * (i + 1)) / d;
          const s = svg('g', {
            class: 'pz-slc', 'data-tap': '', tabindex: '0', role: 'button',
            'aria-label': 'Potong ' + (i + 1),
          });
          s.append(svg('path', { class: 'pz-base', d: pathJuring(a0, a1, R), fill: '#f7cd63', stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
          s.append(svg('path', { class: 'pz-ov', d: pathJuring(a0, a1, R), fill: '#37b24d' }));
          pic._s = pic._s || [];
          slcEls.push(s);
          g.append(s);
        }
        toping.slice(0, d + 2).forEach(([x, y]) => {
          g.append(svg('circle', { cx: x, cy: y, r: 9, fill: '#e5484d', stroke: '#fff', 'stroke-width': 2 }));
        });
        pic.append(g);

        const dipilih = new Set();
        const segarkan = () => { infoB.textContent = String(dipilih.size); };
        const toggle = (i) => {
          if (dipilih.has(i)) { dipilih.delete(i); slcEls[i].classList.remove('is-sel'); }
          else { dipilih.add(i); slcEls[i].classList.add('is-sel'); }
          ctx.sfx('tap');
          segarkan();
        };
        slcEls.forEach((s, i) => {
          s.addEventListener('click', () => toggle(i));
          s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } });
        });

        wrap.append(
          h('div', { class: 'pz-target' }, 'Ambil ', frac, h('span', null, '(' + kata + ')')),
          pic, info, salah, cek);
        ctx.el.append(wrap);

        let gagal = 0, lanjut = false;
        cek.addEventListener('click', async () => {
          if (lanjut || cek.disabled) return;
          if (dipilih.size === n) {
            lanjut = true;
            cek.disabled = true;
            slcEls.forEach((s) => s.removeAttribute('data-tap'));
            await ctx.correct(cek);
          } else {
            gagal++;
            await ctx.wrong(cek);
            if (gagal >= 3) {
              // Tunjukkan caranya: pilih N potong pertama otomatis.
              lanjut = true;
              cek.disabled = true;
              dipilih.clear();
              slcEls.forEach((s, i) => s.classList.toggle('is-sel', i < n));
              for (let i = 0; i < n; i++) dipilih.add(i);
              segarkan();
              slcEls.forEach((s) => s.removeAttribute('data-tap'));
              salah.textContent = '';
              ctx.say(kata + ' artinya ' + (KATA[n] || n) + ' potong dari ' + d + ' potong. Ini jawabannya!');
              await ctx.wait(2200);
            } else {
              salah.textContent = dipilih.size < n ? 'Kurang ' + (n - dipilih.size) + ' potong lagi.' : 'Kelebihan, kurangi ' + (dipilih.size - n) + ' potong.';
              ctx.say(salah.textContent);
            }
          }
        });
        while (!lanjut && ctx.alive) await ctx.wait(300);
        if (!ctx.alive) return;
        await ctx.wait(300);
        ctx.clear();
        ctx.progress(r + 1, ronde.length);
      }
      ctx.finish({ lesson: 'Pecahan artinya bagian dari yang utuh. Setengah artinya satu dari dua potong sama besar.' });
    },
  });
})();
