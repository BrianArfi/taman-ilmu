/* 88 Tebak Kode Warna. Mastermind junior: isi lingkaran dengan warna,
   ketuk Tebak. Titik hijau = tepat, kuning = warna benar posisi salah.
   TK: 3 warna, 6 tebakan. SD: 4 warna, 6 tebakan. 2 ronde. */
(function () {
  const { h, sample, shuffle } = TI;

  const CSS = `
.play[data-game="kode-warna"] .kw-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: min(100%, 440px); }
.play[data-game="kode-warna"] .kw-code { display: flex; gap: 8px; min-height: 64px; align-items: center; }
.play[data-game="kode-warna"] .kw-slot { width: 56px; height: 56px; border-radius: 50%; border: 4px dashed var(--line, #e3d9c2); background: #fff; display: grid; place-items: center; font-weight: 800; font-size: 1.1rem; }
.play[data-game="kode-warna"] .kw-slot.is-full { border-style: solid; border-color: #495057; }
.play[data-game="kode-warna"] .kw-pal { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.play[data-game="kode-warna"] .kw-c { width: 68px; height: 68px; min-height: 0; border-radius: 50%; border: 4px solid rgba(0,0,0,0.15); cursor: pointer; touch-action: manipulation; }
.play[data-game="kode-warna"] .kw-c:active { transform: scale(0.94); }
.play[data-game="kode-warna"] .kw-go { min-height: 72px; width: 100%; font-size: 1.3rem; }
.play[data-game="kode-warna"] .kw-hist { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.play[data-game="kode-warna"] .kw-try { display: flex; align-items: center; gap: 6px; justify-content: center; }
.play[data-game="kode-warna"] .kw-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.2); }
.play[data-game="kode-warna"] .kw-fb { display: flex; gap: 4px; margin-left: 8px; }
.play[data-game="kode-warna"] .kw-pip { width: 18px; height: 18px; border-radius: 50%; background: #e9e4d8; border: 2px solid #c9c2b2; }
.play[data-game="kode-warna"] .kw-pip.is-green { background: #0e9f6e; border-color: #0b6b4a; }
.play[data-game="kode-warna"] .kw-pip.is-yellow { background: #ffd23f; border-color: #c98a00; }
.play[data-game="kode-warna"] .kw-msg { margin: 0; min-height: 1.6em; font-weight: 800; color: var(--muted); text-align: center; }
`;

  const WARNA = [
    { id: 'merah', label: 'Merah', hex: '#e5484d' },
    { id: 'kuning', label: 'Kuning', hex: '#ffd23f' },
    { id: 'biru', label: 'Biru', hex: '#2f8fe0' },
    { id: 'hijau', label: 'Hijau', hex: '#0e9f6e' },
    { id: 'ungu', label: 'Ungu', hex: '#9b4dde' },
  ];

  function nilai(rahasia, tebak) {
    let hijau = 0;
    const sisaR = [], sisaT = [];
    for (let i = 0; i < rahasia.length; i++) {
      if (tebak[i] === rahasia[i]) hijau++;
      else { sisaR.push(rahasia[i]); sisaT.push(tebak[i]); }
    }
    let kuning = 0;
    sisaT.forEach((t) => {
      const j = sisaR.indexOf(t);
      if (j >= 0) { kuning++; sisaR.splice(j, 1); }
    });
    return { hijau, kuning };
  }

  TI.register({
    id: 'kode-warna',
    title: 'Tebak Kode Warna',
    cat: 'logika',
    icon: '🎛️',
    desc: 'Pecahkan kode warna tersembunyi.',
    start(ctx) {
      TI.style('kode-warna', CSS);
      const len = ctx.isTK ? 3 : 4;
      const palet = ctx.isTK ? WARNA.slice(0, 4) : WARNA.slice();
      const maks = 6;
      return (async () => {
        let gagalRonde = 0;
        for (let r = 0; r < 2 && ctx.alive; r++) {
          ctx.progress(r, 2);
          const ok = await ronde(r);
          if (!ok) gagalRonde++;
        }
        if (!ctx.alive) return;
        ctx.finish({
          stars: gagalRonde > 0 ? 1 : ctx.mistakes === 0 ? 3 : 2,
          total: 2,
          lesson: 'Titik hijau artinya warna dan posisi tepat. Titik kuning artinya warna benar tapi posisi salah.',
        });
      })();

      function ronde(r) {
        return new Promise((selesai) => {
          ctx.clear();
          ctx.ask(r === 0 ? 'Ketuk warna untuk mengisi lingkaran, lalu ketuk Tebak.' : 'Ronde kedua. Pecahkan kode yang baru.');
          const rahasia = sample(palet, len).map((w) => w.id);
          const olehId = (id) => palet.find((w) => w.id === id);
          const wrap = h('div', { class: 'kw-wrap' });
          const code = h('div', { class: 'kw-code' });
          const slots = [];
          let tutup = false, proses = false, pakai = 0, sentuh = 0;
          const batasi = () => {
            sentuh++;
            if (sentuh >= 30 && !tutup) { tutup = true; tunjuk(); return true; }
            return false;
          };
          for (let i = 0; i < len; i++) {
            const s = h('div', { class: 'kw-slot', role: 'img', 'aria-label': 'Lingkaran ' + (i + 1) + ', kosong' });
            s.textContent = String(i + 1);
            slots.push({ el: s, warna: null });
            code.append(s);
          }
          const pal = h('div', { class: 'kw-pal' });
          palet.forEach((w) => {
            const b = h('button', {
              type: 'button', class: 'kw-c', style: 'background:' + w.hex, 'aria-label': 'Warna ' + w.label,
            });
            b.addEventListener('click', () => {
              if (tutup) return;
              ctx.sfx('klik');
              const kosong = slots.find((s) => !s.warna);
              const t = kosong || slots[slots.length - 1];
              t.warna = w.id;
              t.el.classList.add('is-full');
              t.el.style.background = w.hex;
              t.el.textContent = '';
              t.el.setAttribute('aria-label', w.label);
              ctx.say(w.label);
              batasi();
            });
            pal.append(b);
          });
          const go = h('button', { type: 'button', class: 'ti-btn kw-go' }, 'Tebak!');
          const ulang = h('button', { type: 'button', class: 'ti-btn is-ghost kw-go' }, '🔄 Ulangi');
          ulang.addEventListener('click', () => {
            if (tutup) return;
            ctx.sfx('tap');
            slots.forEach((s, i) => {
              s.warna = null; s.el.classList.remove('is-full'); s.el.style.background = ''; s.el.textContent = String(i + 1);
            });
            msg.textContent = 'Dikosongkan. Isi lagi.';
            batasi();
          });
          const hist = h('div', { class: 'kw-hist' });
          const msg = h('p', { class: 'kw-msg', 'aria-live': 'polite' }, maks + ' tebakan. Hijau tepat, kuning hampir.');
          wrap.append(code, pal, go, ulang, msg, hist);
          ctx.el.append(wrap);

          const tunjuk = async () => {
            tutup = true;
            msg.textContent = 'Kodenya: ' + rahasia.map((id) => olehId(id).label).join(', ') + '.';
            slots.forEach((s, i) => {
              s.warna = rahasia[i];
              s.el.classList.add('is-full');
              s.el.style.background = olehId(rahasia[i]).hex;
              s.el.textContent = '';
            });
            await ctx.sayWait(msg.textContent);
            await ctx.wrong(null, { say: 'Belum ketemu. Tidak apa, coba ronde berikutnya.' });
            selesai(false);
          };

          go.addEventListener('click', async () => {
            if (tutup || proses || !ctx.alive) return;
            if (batasi()) return;
            if (slots.some((s) => !s.warna)) { msg.textContent = 'Isi semua lingkaran dulu.'; return; }
            proses = true;
            pakai++;
            const tb = slots.map((s) => s.warna);
            const { hijau, kuning } = nilai(rahasia, tb);
            const baris = h('div', { class: 'kw-try pop-in' });
            tb.forEach((id) => baris.append(h('span', { class: 'kw-dot', style: 'background:' + olehId(id).hex })));
            const fb = h('span', { class: 'kw-fb', 'aria-label': hijau + ' hijau, ' + kuning + ' kuning' });
            const pips = [];
            for (let i = 0; i < hijau; i++) pips.push('is-green');
            for (let i = 0; i < kuning; i++) pips.push('is-yellow');
            shuffle(pips).forEach((c) => fb.append(h('span', { class: 'kw-pip ' + c })));
            for (let i = pips.length; i < len; i++) fb.append(h('span', { class: 'kw-pip' }));
            baris.append(fb);
            hist.prepend(baris);
            slots.forEach((s, i) => {
              s.warna = null; s.el.classList.remove('is-full'); s.el.style.background = ''; s.el.textContent = String(i + 1);
            });
            if (hijau === len) {
              tutup = true;
              msg.textContent = 'Kode pecah! Hebat!';
              await ctx.correct(null, { say: 'Kode pecah! Kamu hebat!' });
              selesai(true);
            } else if (pakai >= maks) {
              await tunjuk();
            } else {
              msg.textContent = (maks - pakai) + ' tebakan lagi. ' + hijau + ' hijau, ' + kuning + ' kuning.';
              if (hijau + kuning === 0) await ctx.wrong(null, { say: 'Belum ada yang cocok. Coba warna lain.' });
              else { ctx.sfx('salah'); ctx.mistakes++; ctx.say(hijau + ' hijau, ' + kuning + ' kuning.'); }
              proses = false;
            }
          });
        });
      }
    },
  });
})();
