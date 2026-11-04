/* 70 Bagi Permen. Seret permen ke toples sama rata (pembagian).
   Ketuk permen lalu ketuk toples. Tombol Bagi Rata mengecek, tidak sama boleh coba lagi.
   TK: 4-6 permen, 2 toples. SD: 12-24 permen, 3-4 toples + tebak isi tiap toples dulu. */
(function () {
  const { h, shuffle } = TI;
  const PERMEN = ['🍬', '🍭', '🍫'];

  const CSS = `
.play[data-game="bagi-permen"] .bp-wrap { width: 100%; max-width: 600px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.play[data-game="bagi-permen"] .bp-nampan { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; min-height: 88px; width: 100%; padding: 10px; }
.play[data-game="bagi-permen"] .bp-permen { min-width: 72px; min-height: 72px; font-size: 2.2rem; line-height: 1; border-radius: 18px; background: #fff; border: 3px solid rgba(0,0,0,0.12); }
.play[data-game="bagi-permen"] .bp-permen.is-selected { border-color: var(--c); background: #e7f0ff; }
.play[data-game="bagi-permen"] .bp-toples { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; width: 100%; }
.play[data-game="bagi-permen"] .bp-toples.is-1 .bp-jar { flex-basis: 44%; }
.play[data-game="bagi-permen"] .bp-jar { flex: 1 1 0; min-width: 150px; min-height: 150px; border-radius: 22px; background: linear-gradient(180deg, #e3f4ff 0, #cde9fb 100%); border: 4px solid #7cc6f5; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px 12px; }
.play[data-game="bagi-permen"] .bp-jar::before { content: ""; width: 60%; height: 12px; border-radius: 6px; background: #4a90c2; }
.play[data-game="bagi-permen"] .bp-jar.is-selected { border-color: var(--good); }
.play[data-game="bagi-permen"] .bp-isi { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; min-height: 44px; font-size: 1.8rem; line-height: 1; }
.play[data-game="bagi-permen"] .bp-cap { font-weight: 800; font-size: 1.1rem; }
.play[data-game="bagi-permen"] .bp-cap b { color: var(--c); }
.play[data-game="bagi-permen"] .bp-cek { min-width: 200px; min-height: 72px; font-size: 1.6rem; }
.play[data-game="bagi-permen"] .bp-pesan { min-height: 1.6em; font-weight: 800; color: #e5484d; }`;

  TI.register({
    id: 'bagi-permen',
    title: 'Bagi Permen',
    cat: 'mat',
    icon: '🍬',
    desc: 'Bagi permen sama rata ke tiap toples.',
    async start(ctx) {
      TI.style('bagi-permen', CSS);
      const ronde = ctx.isTK
        ? [{ permen: 4, toples: 2 }, { permen: 6, toples: 2 }]
        : [{ permen: 12, toples: 3 }, { permen: 16, toples: 4 }];

      ctx.progress(0, ronde.length);
      for (let r = 0; r < ronde.length; r++) {
        if (!ctx.alive) return;
        const { permen, toples } = ronde[r];
        const tiap = permen / toples;

        // SD: tebak dulu isi tiap toples.
        if (ctx.isSD) {
          ctx.ask(permen + ' permen untuk ' + toples + ' toples. Tiap toples dapat berapa?');
          const opsi = [];
          const set = new Set([tiap]);
          [tiap + 1, tiap - 1, tiap + 2, tiap + toples].forEach((v) => { if (set.size < 4 && v > 0) set.add(v); });
          for (let g = tiap + 3; set.size < 4; g++) set.add(g);
          await ctx.choose({
            options: [...set].sort((a, b) => a - b).map((v) => ({ label: String(v), value: v, say: v + ' permen' })),
            answer: tiap,
            speakLabel: true,
          });
          if (!ctx.alive) return;
          ctx.clear();
        }

        ctx.ask('Bagi ' + permen + ' permen sama rata ke ' + toples + ' toples! Ketuk toples untuk mengambil permen.');
        const wrap = h('div', { class: 'bp-wrap' });
        const pesan = h('p', { class: 'bp-pesan', 'aria-live': 'polite' });
        const nampan = h('div', { class: 'ti-panel bp-nampan' });
        const deret = h('div', { class: 'bp-toples' + (toples === 2 ? ' is-1' : '') });
        const cek = h('button', { type: 'button', class: 'ti-btn bp-cek' }, 'Bagi Rata');
        wrap.append(nampan, deret, pesan, cek);
        ctx.el.append(wrap);

        // Permen: {el, jar} jar = -1 nampan, atau indeks toples.
        const semua = [];
        const wadah = [];
        for (let j = 0; j < toples; j++) {
          const isi = h('div', { class: 'bp-isi' });
          const cap = h('div', { class: 'bp-cap' }, 'Toples ' + (j + 1) + ': ', h('b', null, '0'));
          const jar = h('div', {
            class: 'bp-jar', 'data-tap': '', tabindex: '0', role: 'button',
            'aria-label': 'Toples ' + (j + 1),
          }, cap, isi);
          const w = { jar, isi, capB: cap.querySelector('b'), daftar: [] };
          const taruh = () => { pilih(w); };
          jar.addEventListener('click', taruh);
          jar.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); taruh(); } });
          wadah.push(w);
          deret.append(jar);
        }
        let pilihPermen = null;
        function segarkan() {
          wadah.forEach((w) => {
            w.isi.replaceChildren();
            w.daftar.forEach((p) => w.isi.append(p.el));
            w.capB.textContent = String(w.daftar.length);
          });
        }
        function ambilDariNampan(w) {
          // Ambil satu permen dari nampan ke toples ini.
          const p = semua.find((q) => q.jar < 0);
          if (!p) return false;
          nampan.querySelectorAll('.is-selected').forEach((x) => x.classList.remove('is-selected'));
          if (pilihPermen === p) pilihPermen = null;
          p.el.classList.remove('is-selected');
          p.jar = wadah.indexOf(w);
          w.daftar.push(p);
          return true;
        }
        function pilih(w) {
          if (pilihPermen) {
            // Pindahkan permen terpilih ke toples ini.
            const p = pilihPermen;
            pilihPermen = null;
            nampan.querySelectorAll('.is-selected').forEach((x) => x.classList.remove('is-selected'));
            p.el.classList.remove('is-selected');
            if (p.jar >= 0) {
              const dari = wadah[p.jar];
              dari.daftar.splice(dari.daftar.indexOf(p), 1);
            }
            p.jar = wadah.indexOf(w);
            w.daftar.push(p);
            ctx.sfx('klik');
            segarkan();
          } else if (ambilDariNampan(w)) {
            // Ketuk toples langsung mengambil satu permen dari nampan.
            ctx.sfx('klik');
            segarkan();
          } else {
            ctx.say('Pilih permennya dulu ya.');
          }
        }
        const jenis = shuffle(Array.from({ length: permen }, (_, i) => PERMEN[i % PERMEN.length]));
        jenis.forEach((ic) => {
          const el = h('button', { type: 'button', class: 'bp-permen', 'aria-label': 'Permen' }, ic);
          const p = { el, jar: -1 };
          el.addEventListener('click', () => {
            if (p.jar >= 0) {
              // Permen di toples: kembalikan ke nampan.
              const dari = wadah[p.jar];
              dari.daftar.splice(dari.daftar.indexOf(p), 1);
              p.jar = -1;
              nampan.append(el);
              ctx.sfx('tap');
              segarkan();
            } else if (pilihPermen === p) {
              pilihPermen = null;
              el.classList.remove('is-selected');
            } else {
              nampan.querySelectorAll('.is-selected').forEach((x) => x.classList.remove('is-selected'));
              pilihPermen = p;
              el.classList.add('is-selected');
              ctx.sfx('tap');
            }
          });
          semua.push(p);
          nampan.append(el);
        });

        let gagal = 0, lanjut = false;
        cek.addEventListener('click', async () => {
          if (lanjut || cek.disabled) return;
          const diToples = semua.filter((p) => p.jar >= 0).length;
          const rata = wadah.every((w) => w.daftar.length === tiap);
          if (diToples === permen && rata) {
            lanjut = true;
            cek.disabled = true;
            await ctx.correct(cek);
          } else {
            gagal++;
            let info = '';
            if (diToples < permen) info = 'Masih ada ' + (permen - diToples) + ' permen di nampan.';
            else if (wadah.some((w) => w.daftar.length === 0)) info = 'Ada toples yang masih kosong.';
            else info = 'Belum sama banyak. Pindahkan lagi ya.';
            pesan.textContent = info;
            await ctx.wrong(cek, { say: info });
            if (gagal >= 3) {
              // Bagi otomatis sama rata.
              lanjut = true;
              cek.disabled = true;
              pesan.textContent = '';
              wadah.forEach((w) => { w.daftar.length = 0; });
              semua.forEach((p) => { p.jar = -1; });
              nampan.replaceChildren();
              let k = 0;
              shuffle(semua).forEach((p) => {
                const w = wadah[k % toples];
                p.jar = k % toples;
                w.daftar.push(p);
                k++;
              });
              pilihPermen = null;
              segarkan();
              ctx.say('Ini caranya: tiap toples dapat ' + tiap + ' permen.');
              await ctx.wait(2400);
            }
          }
        });
        while (!lanjut && ctx.alive) await ctx.wait(300);
        if (!ctx.alive) return;
        await ctx.wait(300);
        ctx.clear();
        ctx.progress(r + 1, ronde.length);
      }
      ctx.finish({ lesson: 'Membagi sama rata artinya tiap toples dapat sama banyak. Itu namanya pembagian.' });
    },
  });
})();
