/* 84 Katrol dan Tuas. Pilih alat yang tepat untuk tiap tugas (katrol, tuas, bidang miring),
   lalu SD mencoba tuas interaktif: geser beban pakai slider sampai seimbang. */
(function () {
  const { h, shuffle } = TI;

  const CSS = `
.play[data-game="katrol"] .kt-scene { font-size: 3.4rem; line-height: 1; text-align: center; }
.play[data-game="katrol"] .kt-why { margin: 0; font-size: 1rem; font-weight: 700; color: var(--muted); text-align: center; }
.play[data-game="katrol"] .kt-board { display: flex; flex-direction: column; align-items: center; gap: 10px; width: min(100%, 440px); }
.play[data-game="katrol"] .kt-board svg { width: 100%; height: auto; }
.play[data-game="katrol"] .kt-row { display: flex; gap: 10px; width: 100%; }
.play[data-game="katrol"] .kt-row .ti-btn { flex: 1 1 0; min-height: 72px; }
.play[data-game="katrol"] .kt-bal { font-weight: 800; min-height: 1.6em; text-align: center; }
`;

  const ALAT = [
    { id: 'katrol', label: 'Katrol', icon: '🛞', say: 'Katrol' },
    { id: 'tuas', label: 'Tuas', icon: '🪵', say: 'Tuas' },
    { id: 'ramp', label: 'Bidang miring', icon: '🛝', say: 'Bidang miring' },
  ];
  const TUGAS = [
    { Chow: '🪣', q: 'Ayah menimba air dari sumur yang dalam. Alat apa yang memudahkan?', jawab: 'katrol', why: 'Katrol dengan tali membuat ember mudah naik dari sumur.' },
    { Chow: '🪨', q: 'Ada batu besar di jalan. Alat apa untuk mencongkelnya?', jawab: 'tuas', why: 'Tuas membuat tenaga kecil bisa mengangkat batu besar.' },
    { Chow: '🛢️', q: 'Drum berat harus naik ke bak truk. Alat apa yang dipakai?', jawab: 'ramp', why: 'Bidang miring membuat drum bisa didorong naik pelan-pelan.' },
    { Chow: '🚩', q: 'Bendera harus naik ke ujung tiang yang tinggi. Alat apa yang dipakai?', jawab: 'katrol', why: 'Katrol di ujung tiang menarik bendera ke atas.' },
    { Chow: '🥫', q: 'Tutup kaleng susah dibuka. Alat apa untuk mencongkelnya?', jawab: 'tuas', why: 'Sendok atau obeng menjadi tuas untuk membuka tutup.' },
    { Chow: '📦', q: 'Kotak mainan berat harus naik ke mobil. Cara mudahnya?', jawab: 'ramp', why: 'Papan miring membuat kotak bisa didorong naik.' },
  ];

  TI.register({
    id: 'katrol',
    title: 'Katrol dan Tuas',
    cat: 'sains',
    icon: '⚙️',
    desc: 'Pilih alat yang memudahkan pekerjaan.',
    start(ctx) {
      TI.style('katrol', CSS);
      const tugas = ctx.isTK ? TUGAS.slice(0, 4) : TUGAS.slice();
      return (async () => {
        for (let i = 0; i < tugas.length && ctx.alive; i++) {
          ctx.progress(i, tugas.length + (ctx.isTK ? 0 : 1));
          const t = tugas[i];
          ctx.clear();
          ctx.ask(t.q);
          ctx.el.append(h('div', { class: 'ti-card kt-scene pop-in' }, t.Chow));
          await ctx.choose({
            options: shuffle(ALAT.map((a) => ({ label: a.icon + ' ' + a.label, value: a.id, say: a.label }))),
            answer: t.jawab,
            speakLabel: true,
          });
          if (!ctx.alive) return;
          ctx.el.append(h('p', { class: 'kt-why pop-in' }, t.why));
          await ctx.sayWait(t.why);
        }
        if (!ctx.alive) return;
        if (ctx.isSD) await tuasMini(ctx, tugas.length);
        if (!ctx.alive) return;
        ctx.progress(tugas.length + (ctx.isTK ? 0 : 1), tugas.length + (ctx.isTK ? 0 : 1));
        ctx.finish({ lesson: 'Katrol, tuas, dan bidang miring membuat pekerjaan berat menjadi ringan.' });
      })();

      // Tuas interaktif: beban di kiri, geser penyeimbang di kanan sampai seimbang.
      async function tuasMini(ctx, basis) {
        ctx.progress(basis, basis + 1);
        ctx.clear();
        ctx.ask('Geser kotak hijau sampai papan seimbang, lalu ketuk Timbang.');
        const target = 30 + Math.floor(Math.random() * 41); // 30..70 persen
        const board = h('div', { class: 'kt-board' });
        const NS = 'http://www.w3.org/2000/svg';
        const svgEl = document.createElementNS(NS, 'svg');
        svgEl.setAttribute('viewBox', '0 0 300 190');
        svgEl.setAttribute('role', 'img');
        svgEl.setAttribute('aria-label', 'Jungkat jungkit: beban di kiri, kotak hijau bisa digeser di kanan');
        const arm = document.createElementNS(NS, 'g');
        arm.innerHTML = '<rect x="20" y="86" width="260" height="12" rx="6" fill="#c7803d" stroke="#8a5a2b" stroke-width="2"/>'
          + '<g><rect x="34" y="56" width="34" height="30" rx="5" fill="#ef6b6b" stroke="#b83232" stroke-width="2"/><text x="51" y="77" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">5</text></g>'
          + '<g class="kt-load"><rect x="-17" y="-30" width="34" height="30" rx="5" fill="#2fbf8a" stroke="#16805a" stroke-width="2"/><text x="0" y="-9" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">5</text></g>';
        const load = arm.querySelector('.kt-load');
        svgEl.innerHTML = '<polygon points="150,190 128,120 172,120" fill="#9aa3b5"/>'
          + '<circle cx="150" cy="114" r="8" fill="#495057"/>';
        svgEl.append(arm);
        // Tanda jawaban TIDAK ditampilkan; anak mencoba sendiri.
        board.append(svgEl);
        const bal = h('p', { class: 'kt-bal', 'aria-live': 'polite' }, 'Papan masih miring.');
        const slider = h('input', { type: 'range', class: 'ti-slider', min: 10, max: 90, step: 1, value: 55, 'aria-label': 'Posisi kotak hijau' });
        const row = h('div', { class: 'kt-row' });
        const bantu = h('button', { type: 'button', class: 'ti-btn is-ghost' }, '💡 Bantu');
        const timbang = h('button', { type: 'button', class: 'ti-btn' }, '⚖️ Timbang');
        row.append(bantu, timbang);
        ctx.el.append(board, bal, slider, row);
        let pos = 55, gagal = 0;
        const susun = () => {
          // Beban kiri di x=51, fulkrum 150. Seimbang saat kotak kanan di 150 + (150-51) = 249 → 76%? Pakai target acak sebagai posisi benar.
          const x = 30 + (pos / 100) * 240;
          load.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 86)');
          const miring = Math.max(-14, Math.min(14, (pos - target) * 0.35));
          arm.setAttribute('transform', 'rotate(' + miring.toFixed(1) + ' 150 92)');
          arm.style.transition = 'transform 180ms var(--ease-out)';
        };
        susun();
        slider.addEventListener('input', () => { pos = +slider.value; susun(); ctx.sfx('klik'); });
        const selesai = await new Promise((res) => {
          timbang.addEventListener('click', async () => {
            if (Math.abs(pos - target) <= 4) {
              arm.setAttribute('transform', 'rotate(0 150 92)');
              bal.textContent = 'Seimbang! Hebat!';
              await ctx.correct(timbang, { say: 'Seimbang! Kotak hijau pas di tempatnya.' });
              res(true);
            } else {
              gagal++;
              bal.textContent = pos < target ? 'Belum seimbang, geser ke kanan.' : 'Belum seimbang, geser ke kiri.';
              await ctx.wrong(timbang, { say: pos < target ? 'Belum seimbang, geser ke kanan.' : 'Belum seimbang, geser ke kiri.' });
              if (gagal >= 3) {
                pos = target; slider.value = String(target); susun();
                arm.setAttribute('transform', 'rotate(0 150 92)');
                bal.textContent = 'Ini tempat yang pas.';
                await ctx.sayWait('Ini tempat yang pas. Beban sama berat harus sama jaraknya dari tengah.');
                res(false);
              }
            }
          });
          bantu.addEventListener('click', () => {
            ctx.sfx('tap');
            pos = Math.max(10, Math.min(90, pos + (pos < target ? 8 : -8)));
            slider.value = String(pos); susun();
            bal.textContent = 'Digeser sedikit, coba timbang lagi.';
          });
        });
        void selesai;
      }
    },
  });
})();
