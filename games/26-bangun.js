/* 26 Bangun Masjid.
   Setiap jawaban benar menurunkan satu bagian masjid ke lahan kosong: fondasi, lantai, dinding, pintu, jendela,
   kubah, menara, bulan sabit. Gambar SVG buatan sendiri (tanpa wajah, tanpa orang). Bagian berikutnya tampil
   sebagai garis putus-putus supaya anak tahu apa yang sedang dibangun. Setelah 8 bagian, langit jadi malam. */
(function () {
  const { h, shuffle, sample } = TI;

  // Bank soal persis dari SPEC bagian 7.2 (tk = boleh dipakai di TK).
  const BANK = [
    { q: 'Ada berapa rukun Islam?', a: 5, w: [4, 6], tk: true },
    { q: 'Ada berapa rukun Iman?', a: 6, w: [5, 7] },
    { q: 'Kitab suci umat Islam adalah?', a: "Al-Qur'an", w: ['Taurat', 'Zabur'], tk: true },
    { q: 'Shalat Subuh berapa rakaat?', a: 2, w: [3, 4], tk: true },
    { q: 'Shalat Maghrib berapa rakaat?', a: 3, w: [2, 4], tk: true },
    { q: 'Sebelum shalat kita berwudhu dengan?', a: 'Air bersih', w: ['Susu', 'Jus'], tk: true },
    { q: 'Huruf hijaiyah pertama adalah?', a: 'Alif', w: ['Ba', 'Ya'], tk: true },
    { q: 'Huruf hijaiyah terakhir adalah?', a: 'Ya', w: ['Alif', 'Mim'] },
    { q: 'Malaikat yang menyampaikan wahyu adalah?', a: 'Jibril', w: ['Mikail', 'Israfil'] },
    { q: 'Nabi terakhir adalah?', a: 'Nabi Muhammad', w: ['Nabi Isa', 'Nabi Adam'], tk: true,
      fact: "Nabi Muhammad Shallallahu 'alaihi wa sallam adalah nabi terakhir." },
    { q: 'Puasa wajib di bulan?', a: 'Ramadhan', w: ['Syawal', 'Rajab'], tk: true },
    { q: 'Kiblat umat Islam adalah?', a: "Ka'bah", w: ['Masjid Istiqlal', 'Masjid Nabawi'], tk: true },
    { q: 'Sebelum makan kita membaca?', a: 'Bismillah', w: ['Alhamdulillah', 'Astaghfirullah'], tk: true },
    { q: 'Shalat wajib sehari ada berapa waktu?', a: 5, w: [3, 7], tk: true },
    { q: 'Kitab Zabur diturunkan kepada?', a: 'Nabi Daud', w: ['Nabi Musa', 'Nabi Isa'] },
    { q: 'Hari raya setelah puasa Ramadhan adalah?', a: 'Idul Fitri', w: ['Idul Adha', 'Tahun Baru'] },
    { q: 'Zakat fitrah dibayar pada bulan?', a: 'Ramadhan', w: ['Muharram', 'Rajab'] },
    { q: 'Ibadah haji dilaksanakan di kota?', a: 'Makkah', w: ['Madinah', 'Jakarta'] },
  ];

  const PARTS = [
    { id: 'fondasi', nama: 'Fondasi', dust: [[90, 226], [200, 226], [310, 226]], sfx: 'klik' },
    { id: 'lantai', nama: 'Lantai', dust: [[90, 212], [200, 212], [310, 212]], sfx: 'klik' },
    { id: 'dinding', nama: 'Dinding', dust: [[100, 202], [200, 202], [300, 202]], sfx: 'klik' },
    { id: 'pintu', nama: 'Pintu', dust: [[188, 202], [212, 202]], sfx: 'klik' },
    { id: 'jendela', nama: 'Jendela', dust: [[112, 176], [148, 176], [252, 176], [288, 176]], sfx: 'klik' },
    { id: 'kubah', nama: 'Kubah', dust: [[166, 124], [200, 124], [234, 124]], sfx: 'pop' },
    { id: 'menara', nama: 'Menara', dust: [[40, 226], [360, 226]], sfx: 'pop' },
    { id: 'bulan', nama: 'Bulan sabit', dust: [[192, 44], [208, 44]], sfx: 'pop' },
  ];

  // Satu menara (kiri atau kanan), cx = sumbu tengah.
  const menara = (cx) => `<g>
    <rect x="${cx - 16}" y="208" width="32" height="18" rx="2" fill="#e8d6ae"/>
    <rect x="${cx - 9}" y="92" width="18" height="118" fill="#fff1d6"/>
    <rect x="${cx - 9}" y="92" width="5" height="118" fill="#f1dcae"/>
    <rect x="${cx - 2.5}" y="134" width="5" height="14" rx="2.5" fill="#6aa7c8"/>
    <rect x="${cx - 2.5}" y="160" width="5" height="14" rx="2.5" fill="#6aa7c8"/>
    <rect x="${cx - 2.5}" y="186" width="5" height="14" rx="2.5" fill="#6aa7c8"/>
    <rect x="${cx - 14}" y="114" width="28" height="7" rx="3" fill="#e9b44c"/>
    <rect x="${cx - 12}" y="87" width="24" height="6" rx="3" fill="#e9b44c"/>
    <rect x="${cx - 7}" y="72" width="14" height="16" fill="#fff1d6"/>
    <path d="M${cx - 12} 74L${cx} 46L${cx + 12} 74Z" fill="url(#bmDome)"/>
    <rect x="${cx - 1.5}" y="36" width="3" height="12" fill="#e9b44c"/>
    <circle cx="${cx}" cy="35" r="3.6" fill="#e9b44c"/></g>`;

  const jendelaDay = (cx) => `<path d="M${cx - 10} 176V152A10 10 0 0 1 ${cx + 10} 152V176Z" fill="#9fd8ff" stroke="#e9b44c" stroke-width="3"/>
    <path d="M${cx} 142V176M${cx - 10} 160H${cx + 10}" stroke="#fff" stroke-width="2"/>`;
  const jendelaNight = (cx) => `<path d="M${cx - 10} 176V152A10 10 0 0 1 ${cx + 10} 152V176Z" fill="#ffd84a" stroke="#e9b44c" stroke-width="3"/>
    <path d="M${cx} 142V176M${cx - 10} 160H${cx + 10}" stroke="#fff3b0" stroke-width="2"/>`;
  const JX = [112, 148, 252, 288];

  const BINTANG = [[28, 24], [76, 40], [112, 78], [128, 22], [176, 14], [232, 16], [262, 44], [296, 24], [318, 66], [352, 20], [386, 44], [300, 96], [120, 112], [64, 96]];
  const kilau = (x, y, r) => `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="#fff"/>`;
  const awan = (x, y, s) => `<g class="bm-cloud" data-x="${x}" data-y="${y}" fill="#fff" opacity="0.92"><ellipse cx="${x}" cy="${y}" rx="${19 * s}" ry="${7 * s}"/><ellipse cx="${x + 9 * s}" cy="${y - 5 * s}" rx="${11 * s}" ry="${7 * s}"/><ellipse cx="${x - 9 * s}" cy="${y - 3 * s}" rx="${9 * s}" ry="${5.6 * s}"/></g>`;

  const SCENE = `<svg viewBox="0 0 400 270" class="bm-svg" role="img" aria-label="Lahan kosong tempat masjid dibangun" focusable="false">
  <defs>
    <linearGradient id="bmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52b0f0"/><stop offset="1" stop-color="#d8f1ff"/></linearGradient>
    <linearGradient id="bmNightG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080e3a"/><stop offset="1" stop-color="#2c3b92"/></linearGradient>
    <linearGradient id="bmDome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52d690"/><stop offset="1" stop-color="#0c7a4e"/></linearGradient>
    <linearGradient id="bmGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93e07e"/><stop offset="1" stop-color="#58b65c"/></linearGradient>
    <radialGradient id="bmSunG"><stop offset="0" stop-color="#fff3a8" stop-opacity="0.9"/><stop offset="1" stop-color="#fff3a8" stop-opacity="0"/></radialGradient>
    <radialGradient id="bmGlowG"><stop offset="0" stop-color="#ffe27a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="270" fill="url(#bmSky)"/>
  <rect class="bm-nightsky" width="400" height="270" fill="url(#bmNightG)"/>
  <g class="bm-sun"><circle cx="104" cy="48" r="38" fill="url(#bmSunG)"/><circle cx="104" cy="48" r="17" fill="#ffd93b"/></g>
  <g class="bm-moon"><circle cx="104" cy="48" r="36" fill="#fff" opacity="0.1"/><g transform="translate(104 50) rotate(-25) scale(1.5)"><path d="M-11.93 -7.33A14 14 0 1 0 11.93 -7.33A12 12 0 1 1 -11.93 -7.33Z" fill="#ffe27a"/></g></g>
  <g class="bm-stars">${BINTANG.map(([x, y], i) => (i % 3 === 0 ? kilau(x, y, 4.5) : `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`)).join('')}</g>
  <g class="bm-clouds">${awan(300, 52, 1)}${awan(70, 130, 0.8)}</g>
  <rect x="0" y="224" width="400" height="46" fill="url(#bmGrass)"/>
  <rect x="30" y="222" width="340" height="30" rx="12" fill="#cfa66f"/>
  <rect x="30" y="222" width="340" height="6" rx="3" fill="#dcb783"/>
  <g class="bm-lot">
    <path d="M44 214V238" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><path d="M44 214L62 220L44 226Z" fill="#ff8a3d"/>
    <path d="M356 214V238" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><path d="M356 214L338 220L356 226Z" fill="#ff8a3d"/>
    <rect x="310" y="240" width="20" height="8" rx="1.5" fill="#d1583d"/><rect x="318" y="233" width="20" height="8" rx="1.5" fill="#e0654a"/><rect x="334" y="241" width="18" height="7" rx="1.5" fill="#c44e35"/>
    <rect x="70" y="240" width="40" height="10" rx="3" fill="#b8b8c6"/>
  </g>
  <g class="bm-parts">
    <g data-part="menara" class="bm-part">${menara(40)}${menara(360)}</g>
    <g data-part="fondasi" class="bm-part">
      <rect x="58" y="212" width="284" height="14" rx="3" fill="#a7a7b8"/><rect x="58" y="212" width="284" height="4" rx="2" fill="#cbcbd8"/>
      <path d="M86 216V226M120 216V226M154 216V226M188 216V226M222 216V226M256 216V226M290 216V226M324 216V226" stroke="#8a8a9c" stroke-width="1.5"/>
    </g>
    <g data-part="lantai" class="bm-part">
      <rect x="68" y="202" width="264" height="10" rx="2" fill="#f5e4c2"/><rect x="68" y="202" width="264" height="3" fill="#fff7e2"/>
      <path d="M100 205V212M132 205V212M164 205V212M196 205V212M228 205V212M260 205V212M292 205V212" stroke="#d9c397" stroke-width="1.5"/>
    </g>
    <g data-part="dinding" class="bm-part">
      <rect x="80" y="124" width="240" height="78" fill="#fff1d6"/>
      <rect x="80" y="124" width="12" height="78" fill="#f1dcae"/><rect x="308" y="124" width="12" height="78" fill="#f1dcae"/>
      <rect x="80" y="190" width="240" height="12" fill="#cfeedd"/>
      <rect x="76" y="118" width="248" height="9" rx="3" fill="#e9b44c"/><rect x="76" y="118" width="248" height="3" rx="1.5" fill="#f6d27a"/>
    </g>
    <g data-part="pintu" class="bm-part">
      <path d="M177 202V170A23 23 0 0 1 223 170V202Z" fill="#e9b44c"/>
      <path d="M182 202V170A18 18 0 0 1 218 170V202Z" fill="#7a4a21"/>
      <path d="M200 152V202" stroke="#5e3716" stroke-width="2"/>
      <path d="M186 170A14 14 0 0 1 214 170" stroke="#9a6431" stroke-width="2" fill="none"/>
      <circle cx="195" cy="186" r="2.3" fill="#f6d27a"/><circle cx="205" cy="186" r="2.3" fill="#f6d27a"/>
    </g>
    <g data-part="jendela" class="bm-part">${JX.map(jendelaDay).join('')}</g>
    <g data-part="kubah" class="bm-part">
      <rect x="156" y="98" width="88" height="26" fill="#fff1d6"/><rect x="156" y="98" width="10" height="26" fill="#f1dcae"/>
      <path d="M176 118V108A5 5 0 0 1 186 108V118Z M194 118V108A5 5 0 0 1 206 108V118Z M214 118V108A5 5 0 0 1 224 108V118Z" fill="#9fd8ff"/>
      <rect x="152" y="94" width="96" height="8" rx="3.5" fill="#e9b44c"/>
      <path d="M154 96A46 50 0 0 1 246 96Z" fill="url(#bmDome)"/>
      <path d="M163 88A39 42 0 0 1 186 58" stroke="#fff" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round" fill="none"/>
      <rect x="198.5" y="38" width="3" height="12" fill="#e9b44c"/>
    </g>
    <g data-part="bulan" class="bm-part">
      <path d="M188.07 22.67A14 14 0 1 0 211.93 22.67A12 12 0 1 1 188.07 22.67Z" fill="#f2b632" stroke="#c98a12" stroke-width="1.2" stroke-linejoin="round"/>
    </g>
  </g>
  <g class="bm-ghostbox"></g>
  <rect class="bm-dusk" width="400" height="270" fill="#0a1245"/>
  <g class="bm-glow">${JX.map((x) => `<circle cx="${x}" cy="160" r="26" fill="url(#bmGlowG)"/>${jendelaNight(x)}`).join('')}
    <circle cx="200" cy="120" r="34" fill="url(#bmGlowG)" opacity="0.5"/></g>
  <g class="bm-dust"></g>
</svg>`;

  const CSS = `
    & .bm-top { width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 10px; flex: none; }
    & .bm-scene { flex: none; min-height: 0; aspect-ratio: 400 / 270; background: #52b0f0; }
    & .bm-svg { display: block; width: 100%; height: 100%; }
    & .bm-part { visibility: hidden; }
    & .bm-ghostbox g { opacity: 0.9; }
    & .bm-ghostbox * { fill: rgba(255, 255, 255, 0.4); stroke: #1d5fd1; stroke-width: 1.8; stroke-dasharray: 5 4; }
    & .bm-nightsky, & .bm-moon, & .bm-stars, & .bm-dusk, & .bm-glow { opacity: 0; transition: opacity 1600ms var(--ease-out); } /* motion-ok: langit berubah jadi malam, sekali di akhir game */
    & .bm-sun { transition: opacity 1100ms var(--ease-out); } /* motion-ok: matahari memudar saat malam tiba */
    & .is-night .bm-nightsky, & .is-night .bm-moon, & .is-night .bm-stars, & .is-night .bm-glow { opacity: 1; }
    & .is-night .bm-dusk { opacity: 0.34; }
    & .is-night .bm-sun { opacity: 0; }
    & .bm-debu { transform-box: fill-box; transform-origin: center; animation: bm-debu 560ms var(--ease-out) both; } /* motion-ok: debu sesaat saat bagian mendarat */
    @keyframes bm-debu { from { opacity: 0.85; transform: translate(0, 0) scale(0.6); } to { opacity: 0; transform: translate(var(--dx, 0px), -12px) scale(1.7); } }
    & .bm-bar { display: flex; align-items: center; gap: 12px; padding: 0 4px; }
    & .bm-pips { display: flex; gap: 5px; flex: none; }
    & .bm-pips i { width: 16px; height: 16px; border-radius: 5px; background: var(--line); box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.06); }
    & .bm-pips i.is-on { background: var(--c); }
    & .bm-pips i.is-new { animation: ti-pop var(--dur-ui-max) var(--ease-out); }
    & .bm-cap { flex: 1; min-width: 0; margin: 0; font-weight: 800; font-size: 1.05rem; line-height: 1.2; }
    & .bm-cap.pop-in { animation-duration: var(--dur-ui); }
    & .bm-angka { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    & .bm-angka b { font-size: 2.4rem; line-height: 1; }
    & .bm-q .ti-choices { margin-top: 2px; }
    @media (max-width: 560px) {
      & .bm-pips i { width: 13px; height: 13px; }
      & .bm-pips { gap: 4px; }
    }
  `.replace(/&/g, '.play[data-game="bangun"]');

  const angka = (n) => h('span', { class: 'bm-angka' }, h('b', null, String(n)), TI.dots(n));

  // Panggung atas: gambar, ghost bagian berikutnya, bagian yang sudah terpasang.
  function buatPanggung(ctx) {
    const box = h('div', { class: 'ti-scene bm-scene', html: SCENE });
    const root = box.querySelector('svg');
    const partEl = {};
    PARTS.forEach((p) => { partEl[p.id] = root.querySelector('[data-part="' + p.id + '"]'); });
    const ghostBox = root.querySelector('.bm-ghostbox');
    const dustBox = root.querySelector('.bm-dust');
    const pips = h('span', { class: 'bm-pips', 'aria-hidden': 'true' }, PARTS.map(() => h('i')));
    const cap = h('p', { class: 'bm-cap', 'aria-live': 'polite' });
    const el = h('div', { class: 'bm-top' }, box, h('div', { class: 'bm-bar' }, pips, cap));
    const reduced = TI.reduced();

    const setCap = (t) => { cap.textContent = t; cap.classList.remove('pop-in'); void cap.offsetWidth; cap.classList.add('pop-in'); };

    // Awan melayang pelan (hiasan, mati saat reduced motion).
    const clouds = [...root.querySelectorAll('.bm-cloud')];
    if (!reduced) {
      let t = 0;
      /* motion-ok: awan hiasan melayang sangat pelan, transform saja */
      ctx.loop((dt) => {
        t += dt;
        clouds.forEach((c, i) => { c.style.transform = 'translate(' + (Math.sin(t * 0.25 + i * 2) * 14).toFixed(2) + 'px,0px)'; });
      });
    }

    function debu(titik) {
      if (reduced) return;
      titik.forEach(([x, y]) => {
        for (let k = 0; k < 2; k++) {
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', x + (k ? 6 : -6)); c.setAttribute('cy', y - 2); c.setAttribute('r', 5);
          c.setAttribute('fill', '#f4ead7'); c.setAttribute('class', 'bm-debu');
          c.style.setProperty('--dx', (k ? 14 : -14) + 'px');
          dustBox.append(c);
          ctx.after(640, () => c.remove());
        }
      });
    }

    return {
      el,
      // Garis putus-putus bagian berikutnya.
      ghost(i) {
        ghostBox.replaceChildren();
        if (i >= PARTS.length) return;
        const g = partEl[PARTS[i].id].cloneNode(true);
        g.removeAttribute('data-part'); g.removeAttribute('class'); g.removeAttribute('style');
        ghostBox.append(g);
        setCap('Berikutnya: ' + PARTS[i].nama);
      },
      // Turunkan bagian ke-i. Promise selesai saat mendarat.
      drop(i) {
        const p = PARTS[i], g = partEl[p.id];
        pips.children[i].classList.add('is-on', 'is-new');
        ctx.after(400, () => pips.children[i].classList.remove('is-new'));
        ghostBox.replaceChildren();
        g.style.visibility = 'visible';
        setCap(p.nama + ' terpasang! (' + (i + 1) + '/8)');
        if (reduced) {
          g.style.opacity = '0';
          return new Promise((res) => {
            ctx.after(16, () => { g.style.transition = 'opacity 220ms ease'; g.style.opacity = '1'; });
            ctx.sfx(p.sfx);
            ctx.after(260, res);
          });
        }
        return new Promise((res) => {
          let y = -210, v = 0, pantul = false;
          g.style.transform = 'translate(0px,' + y + 'px)';
          /* motion-ok: bagian masjid jatuh ke tempatnya (gerak permainan), transform saja */
          ctx.loop((dt) => {
            v += 2900 * dt; y += v * dt;
            if (y >= 0) {
              y = 0;
              if (!pantul) { pantul = true; v = -v * 0.24; ctx.sfx(p.sfx); debu(p.dust); }
              else { g.style.transform = ''; res(); return false; }
            }
            g.style.transform = 'translate(0px,' + y.toFixed(1) + 'px)';
          });
        });
      },
      // Langit berubah malam, jendela menyala, bintang berkelip.
      malam() {
        el.querySelector('.bm-scene').classList.add('is-night');
        setCap('Masjidnya sudah jadi!');
        if (!reduced) {
          const bintang = [...root.querySelectorAll('.bm-stars > *')];
          let t = 0;
          /* motion-ok: bintang berkelip lembut (opacity saja) */
          ctx.loop((dt) => {
            t += dt;
            bintang.forEach((b, i) => { b.style.opacity = (0.62 + 0.38 * Math.sin(t * 1.6 + i * 1.7)).toFixed(2); });
          });
        }
        return ctx.wait(reduced ? 1200 : 2200);
      },
    };
  }

  TI.register({
    id: 'bangun',
    title: 'Bangun Masjid',
    cat: 'islam',
    icon: '🏗️',
    desc: 'Jawab soal, setiap jawaban benar memasang satu bagian masjid.',
    start(ctx) {
      TI.style('bangun', CSS);
      const panggung = buatPanggung(ctx);
      // TK: 8 dari soal TK. SD: 8 dari semua, soal TK (lebih mudah) lebih dulu supaya makin menantang.
      let soal;
      if (ctx.isTK) soal = sample(BANK.filter((x) => x.tk), 8);
      else soal = sample(BANK, 8).sort((a, b) => (a.tk ? 0 : 1) - (b.tk ? 0 : 1)); // soal TK dulu

      return ctx.series(soal, async (q, i) => {
        ctx.el.append(panggung.el);
        panggung.ghost(i);
        if (i === 4) ctx.correct(null, { say: ctx.isTK ? 'Bagus! Setengah jalan!' : 'Bagus! Terus naik ke yang sulit.' }); ctx.ask(q.q);
        const opsi = shuffle([q.a, ...q.w]).map((v) => {
          if (typeof v === 'number') {
            return ctx.isTK ? { node: angka(v), value: v, say: String(v), aria: v + ' ', cls: 'is-big' } : { label: String(v), value: v };
          }
          return { label: v, value: v };
        });
        let mendarat = null;
        await ctx.choose({
          options: opsi,
          answer: (v) => {
            if (v !== q.a) return false;
            if (!mendarat) mendarat = panggung.drop(i); // bagian jatuh begitu jawaban benar diketuk
            return true;
          },
          praise: PARTS[i].nama + ' terpasang!',
        });
        await mendarat;
        if (q.fact) {
          ctx.note(q.fact, { title: 'Tahukah kamu?' });
          await ctx.next();
        }
        if (i === PARTS.length - 1) {
          ctx.say('Masya Allah, masjidnya sudah jadi!');
          await panggung.malam();
        }
      }, {
        lesson: 'Setiap ilmu yang kamu pelajari seperti batu bata. Sedikit demi sedikit menjadi bangunan yang kokoh.',
      });
    },
  });
})();
