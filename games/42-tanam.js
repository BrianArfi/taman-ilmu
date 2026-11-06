/* 42 Ayo Menanam. Pot berisi tanah (potongan samping, akarnya kelihatan). Tiap hari: 💧 Siram sekali, ☀️ Jemur sekali, lalu 🌙 Tidur.
   Hari lengkap: malam sebentar, paginya tanaman tumbuh satu tahap (biji, kecambah, tunas, batang dan daun, bunga, buah tomat).
   Batas 12 hari supaya selalu selesai. Lalu panen tomat ke keranjang. SD: pasang 5 label bagian tumbuhan dengan ctx.place. Lalu soal. */
(function () {
  const { h, shuffle } = TI;

  const STAGE_NAME = ['Biji', 'Kecambah', 'Tunas', 'Berdaun', 'Berbunga', 'Berbuah']; // enam tahap tumbuh
  const STAGE_MSG = [
    '',
    'Hore! Bijimu berkecambah.',
    'Hore! Tunas dengan dua daun muncul.',
    'Hore! Batang tumbuh tinggi dan daunnya banyak.',
    'Hore! Bunga-bunga mekar.',
    'Hore! Bunganya menjadi buah tomat.',
  ];
  const CAP_MSG = 'Akhirnya tumbuh! Ingat, tumbuhan butuh air dan cahaya setiap hari.';
  const FRUITS = [[102, 146], [198, 130], [190, 190]]; // posisi tomat (satuan viewBox 300)
  const PARTS = [
    { id: 'bunga', label: 'Bunga', x: 150, y: 88, side: 'r', px: 228, py: 70 },
    { id: 'buah', label: 'Buah', x: 198, y: 130, side: 'r', px: 228, py: 130 },
    { id: 'batang', label: 'Batang', x: 150, y: 130, side: 'l', px: 74, py: 104 },
    { id: 'daun', label: 'Daun', x: 126, y: 172, side: 'l', px: 74, py: 192 },
    { id: 'akar', label: 'Akar', x: 150, y: 262, side: 'r', px: 228, py: 262 },
  ];

  // ---------- gambar tanaman (string SVG) ----------
  const leaf = (x, y, side, size, tilt) => `<g transform="translate(${x} ${y}) rotate(${-side * tilt}) scale(${side} 1)"><path d="M0 0 C${size * 0.3} ${-size * 0.55} ${size} ${-size * 0.5} ${size * 1.3} 0 C${size} ${size * 0.5} ${size * 0.3} ${size * 0.55} 0 0 Z" fill="#43b85a" stroke="#2f8f44" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 0 L${size * 1.1} 0" stroke="#2f8f44" stroke-width="1.4" stroke-linecap="round"/></g>`;
  const stem = (hh, w) => `<path d="M150 216 C148 ${216 - hh * 0.35} 152 ${216 - hh * 0.7} 150 ${216 - hh}" fill="none" stroke="#3a9d4a" stroke-width="${w}" stroke-linecap="round"/>`;
  const flower = (x, y, s) => {
    let p = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      p += `<circle cx="${(x + Math.cos(a) * 7 * s).toFixed(1)}" cy="${(y + Math.sin(a) * 7 * s).toFixed(1)}" r="${(5 * s).toFixed(1)}" fill="#ffe14d" stroke="#e0b400" stroke-width="1.2"/>`;
    }
    return p + `<circle cx="${x}" cy="${y}" r="${(4 * s).toFixed(1)}" fill="#f08a1c"/>`;
  };
  const tomato = (x, y) => `<g><circle cx="${x}" cy="${y}" r="19" fill="#e5484d" stroke="#b3262b" stroke-width="2.5"/><ellipse cx="${x - 7}" cy="${y - 7}" rx="5" ry="3" fill="#fff" opacity="0.55"/><path d="M${x - 9} ${y - 17} L${x} ${y - 12} L${x + 9} ${y - 17} L${x + 3} ${y - 21} L${x} ${y - 25} L${x - 3} ${y - 21} Z" fill="#3fa34d"/></g>`;
  const leaves3 = leaf(150, 192, 1, 24, 14) + leaf(150, 192, -1, 24, 14) + leaf(150, 170, 1, 26, 24) + leaf(150, 170, -1, 26, 24)
    + leaf(150, 148, 1, 24, 14) + leaf(150, 148, -1, 24, 14) + leaf(150, 126, 1, 22, 26) + leaf(150, 126, -1, 22, 26)
    + leaf(150, 106, 1, 18, 55) + leaf(150, 106, -1, 18, 55);
  const STAGES_SVG = [
    '',
    stem(26, 4) + leaf(150, 190, 1, 12, 28) + leaf(150, 190, -1, 12, 28),
    stem(52, 5) + leaf(150, 166, 1, 22, 22) + leaf(150, 166, -1, 22, 22) + '<circle cx="150" cy="160" r="4" fill="#7ed38a"/>',
    stem(112, 7) + leaves3,
    stem(112, 7) + leaves3 + flower(116, 118, 1.05) + flower(188, 134, 1) + flower(150, 92, 1.15),
    stem(112, 7) + leaves3 + flower(150, 92, 1.05)
      + '<g fill="none" stroke="#3a9d4a" stroke-width="3" stroke-linecap="round"><path d="M150 152 Q128 140 106 132"/><path d="M150 136 Q172 124 196 112"/><path d="M150 176 Q170 176 190 172"/></g>'
      + '<g class="tm-fruit-svg">' + FRUITS.map(([x, y]) => tomato(x, y)).join('') + '</g>',
  ];

  function sceneMarkup() {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const a = i * 45 * Math.PI / 180;
      return `<line x1="${(Math.cos(a) * 19).toFixed(1)}" y1="${(Math.sin(a) * 19).toFixed(1)}" x2="${(Math.cos(a) * 27).toFixed(1)}" y2="${(Math.sin(a) * 27).toFixed(1)}" stroke="#ffc933" stroke-width="3.5" stroke-linecap="round"/>`;
    }).join('');
    const drops = Array.from({ length: 5 }, (_, i) => `<circle cx="${i * 5 - 4}" cy="6" r="3.4" fill="#4aa3ff" style="--i:${i}"/>`).join('');
    return `<svg class="tm-svg" viewBox="0 0 300 300" role="img" aria-label="Pot berisi tanah dan tanaman tomat">
<defs>
<linearGradient id="tmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9ddff"/><stop offset="1" stop-color="#eefaff"/></linearGradient>
</defs>
<rect width="300" height="300" fill="url(#tmSky)"/>
<g fill="#fff" opacity="0.92"><circle cx="212" cy="46" r="11"/><circle cx="226" cy="40" r="14"/><circle cx="242" cy="47" r="10"/><rect x="204" y="46" width="46" height="11" rx="5"/><circle cx="118" cy="70" r="7"/><circle cx="128" cy="66" r="9"/><circle cx="140" cy="71" r="6"/><rect x="112" y="70" width="34" height="8" rx="4"/></g>
<g class="tm-beams"><polygon points="52,58 100,208 140,208" fill="rgba(255,236,130,0.4)"/><polygon points="40,62 66,208 100,208" fill="rgba(255,236,130,0.3)"/></g>
<g transform="translate(46 44)"><g class="tm-sunbody"><circle r="26" fill="#fff3a6" opacity="0.5"/>${rays}<circle r="15" fill="#ffd23f" stroke="#f3a400" stroke-width="2.5"/></g></g>
<path d="M0 262 Q60 236 120 258 T240 252 T300 258 V300 H0 Z" fill="#b5e48c"/>
<rect y="270" width="300" height="30" fill="#8ad46c"/>
<ellipse cx="150" cy="291" rx="58" ry="6" fill="rgba(0,0,0,0.14)"/>
<ellipse cx="150" cy="211" rx="58" ry="7" fill="#7a4e2a"/>
<ellipse class="tm-wetsoil" cx="150" cy="211" rx="54" ry="6" fill="#2e1c0d"/>
<g class="tm-plant">${STAGES_SVG.map((s, i) => `<g class="tm-st" data-st="${i}">${s}</g>`).join('')}</g>
<rect x="80" y="208" width="140" height="17" rx="6" fill="#d9774a" stroke="#b45a30" stroke-width="3"/>
<path d="M90 225 H210 L200 285 Q199 291 192 291 H108 Q101 291 100 285 Z" fill="#e08a5b" stroke="#b45a30" stroke-width="3" stroke-linejoin="round"/>
<path d="M97 229 H203 L195 283 Q194 285 190 285 H110 Q106 285 105 283 Z" fill="#6b4423"/>
<g fill="#8a5d33"><circle cx="118" cy="252" r="2.6"/><circle cx="182" cy="246" r="2.4"/><circle cx="168" cy="274" r="2.8"/><circle cx="126" cy="272" r="2.2"/><circle cx="190" cy="268" r="2"/></g>
<g class="tm-roots" fill="none" stroke="#f4e6c3" stroke-width="2.6" stroke-linecap="round">
<g class="tm-r" data-r="1"><path d="M150 236 Q147 250 143 262"/><path d="M150 242 Q156 252 160 258"/></g>
<g class="tm-r" data-r="2"><path d="M143 262 Q139 270 134 274"/><path d="M160 258 Q166 266 170 274"/><path d="M150 244 Q138 252 128 256"/></g>
<g class="tm-r" data-r="3"><path d="M134 274 Q130 278 126 280"/><path d="M170 274 Q176 278 180 279"/><path d="M128 256 Q120 258 114 264"/><path d="M156 250 Q168 254 180 252"/></g>
</g>
<g class="tm-seed"><ellipse cx="150" cy="240" rx="9" ry="6" fill="#c58a3c" stroke="#8a5a1c" stroke-width="2" transform="rotate(-25 150 240)"/><path d="M144 238 Q150 234 156 237" stroke="#e6b66b" stroke-width="2" fill="none" stroke-linecap="round"/></g>
<path class="tm-wetin" d="M97 229 H203 L195 283 Q194 285 190 285 H110 Q106 285 105 283 Z" fill="#2e1c0d"/>
<g transform="translate(178 132)"><g class="tm-can"><path d="M16 14 L2 2" stroke="#2b6fc0" stroke-width="6" stroke-linecap="round"/><circle r="4.5" fill="#2b6fc0"/><rect x="14" y="-4" width="40" height="34" rx="9" fill="#4aa3ff" stroke="#2b6fc0" stroke-width="3"/><path d="M54 4 Q70 10 54 26" fill="none" stroke="#2b6fc0" stroke-width="4" stroke-linecap="round"/><path d="M22 4 H44" stroke="#bfe3ff" stroke-width="4" stroke-linecap="round"/></g><g class="tm-drops">${drops}</g></g>
<rect class="tm-night" width="300" height="300" fill="#101a3a"/>
<g class="tm-sky-night"><path d="M236 34 a18 18 0 1 0 14 30 a14 14 0 1 1 -14 -30 z" fill="#fff3b0"/><g fill="#fff"><circle cx="196" cy="30" r="2.2"/><circle cx="262" cy="86" r="2"/><circle cx="90" cy="38" r="2.2"/><circle cx="270" cy="30" r="1.8"/><circle cx="60" cy="96" r="1.8"/></g></g>
<g class="tm-sparks" fill="#ffe14d">${Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return `<circle cx="150" cy="150" r="4" style="--dx:${(Math.cos(a) * 62).toFixed(0)}px;--dy:${(Math.sin(a) * 62).toFixed(0)}px"/>`; }).join('')}</g>
</svg>`;
  }

  const CSS = `
.play[data-game="tanam"] .tm-panel { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; width: min(100%, 440px); }
.play[data-game="tanam"] .tm-day { padding: 6px 16px; border-radius: 16px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-weight: 800; font-size: 1.2rem; }
.play[data-game="tanam"] .tm-day b { color: var(--c); }
.play[data-game="tanam"] .tm-chip { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 16px; background: var(--card); box-shadow: 0 3px 0 var(--shadow); font-size: 1.2rem; font-weight: 800; transition: background-color var(--dur-ui) ease; }
.play[data-game="tanam"] .tm-chip i { font-style: normal; color: #b9b3a3; font-size: 1rem; }
.play[data-game="tanam"] .tm-chip.is-done { background: var(--good-bg); }
.play[data-game="tanam"] .tm-chip.is-done i { color: var(--good); }
.play[data-game="tanam"] .tm-stage { padding: 6px 12px; border-radius: 16px; background: #fff4cc; font-weight: 800; font-size: 0.95rem; }
.play[data-game="tanam"] .ti-scene { flex: none; width: min(100%, var(--sw, 340px)); min-height: 0; aspect-ratio: 1; background: #bfe8ff; }
.play[data-game="tanam"] .tm-svg { display: block; width: 100%; height: 100%; }
.play[data-game="tanam"] .tm-st { opacity: 0; transform: scale(0.95); transform-box: view-box; transform-origin: 150px 214px; transition: opacity 300ms var(--ease-out), transform 300ms var(--ease-out); }
.play[data-game="tanam"] .tm-st.is-on { opacity: 1; transform: none; }
.play[data-game="tanam"] .tm-plant { transform-box: view-box; transform-origin: 150px 214px; transition: transform 300ms var(--ease-out); }
.play[data-game="tanam"] .tm-svg.is-droop .tm-plant { transform: rotate(9deg); }
.play[data-game="tanam"] .tm-svg.is-droop .tm-st.is-on { opacity: 0.8; }
.play[data-game="tanam"] .tm-r, .play[data-game="tanam"] .tm-seed { opacity: 0; transition: opacity 300ms var(--ease-out); }
.play[data-game="tanam"] .tm-r.is-on, .play[data-game="tanam"] .tm-seed.is-on { opacity: 1; }
.play[data-game="tanam"] .tm-wetsoil, .play[data-game="tanam"] .tm-wetin { opacity: 0; transition: opacity 300ms var(--ease-out); }
.play[data-game="tanam"] .tm-svg.is-wet .tm-wetsoil { opacity: 0.5; }
.play[data-game="tanam"] .tm-svg.is-wet .tm-wetin { opacity: 0.32; }
.play[data-game="tanam"] .tm-beams { opacity: 0; transition: opacity 250ms var(--ease-out); }
.play[data-game="tanam"] .tm-svg.is-sunny .tm-beams { opacity: 1; }
.play[data-game="tanam"] .tm-sunbody { transform-box: fill-box; transform-origin: center; transition: transform 250ms var(--ease-out); }
.play[data-game="tanam"] .tm-svg.is-sunny .tm-sunbody { transform: scale(1.5); }
.play[data-game="tanam"] .tm-can { opacity: 0; transform: translate(14px, -8px); transition: opacity 180ms var(--ease-out), transform 250ms var(--ease-out); }
.play[data-game="tanam"] .tm-svg.is-pour .tm-can { opacity: 1; transform: rotate(-22deg); }
.play[data-game="tanam"] .tm-drops circle { opacity: 0; }
.play[data-game="tanam"] .tm-svg.is-pour .tm-drops circle { animation: tm-drop 420ms var(--ease-out) 2; animation-delay: calc(var(--i) * 70ms); } /* motion-ok: air jatuh dari kaleng, perayaan kecil */
@keyframes tm-drop { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(74px); } }
.play[data-game="tanam"] .tm-night { opacity: 0; transition: opacity 500ms var(--ease-out); } /* motion-ok: langit malam pelan, bukan elemen antarmuka */
.play[data-game="tanam"] .tm-sky-night { opacity: 0; transition: opacity 500ms var(--ease-out); } /* motion-ok: bulan dan bintang muncul pelan */
.play[data-game="tanam"] .tm-svg.is-night .tm-night { opacity: 0.72; }
.play[data-game="tanam"] .tm-svg.is-night .tm-sky-night { opacity: 1; }
.play[data-game="tanam"] .tm-sparks circle { opacity: 0; }
.play[data-game="tanam"] .tm-svg.is-grow .tm-sparks circle { animation: tm-spark 600ms var(--ease-out); } /* motion-ok: percikan tanaman tumbuh, perayaan */
@keyframes tm-spark { from { opacity: 1; transform: translate(0, 0); } to { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
.play[data-game="tanam"] .tm-fruit-svg { display: none; }
.play[data-game="tanam"] .tm-svg.is-label .tm-fruit-svg { display: inline; }
.play[data-game="tanam"] .tm-fruit { position: absolute; left: calc(var(--x) * 1% - 28px); top: calc(var(--y) * 1% - 28px); display: grid; place-items: center; width: 56px; height: 56px; padding: 0; border: 0; background: none; cursor: pointer; will-change: transform; }
.play[data-game="tanam"] .tm-tom { position: relative; display: block; width: 40px; height: 36px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff9b92, #e5484d 58%, #b3262b); box-shadow: 0 3px 0 rgba(0, 0, 0, 0.2); }
.play[data-game="tanam"] .tm-tom::before { content: ''; position: absolute; left: 50%; top: -5px; width: 18px; height: 9px; margin-left: -9px; border-radius: 9px 9px 3px 3px; background: #3fa34d; }
.play[data-game="tanam"] .tm-fruit:active .tm-tom { transform: scale(0.94); }
.play[data-game="tanam"] .tm-basket { position: absolute; right: 8px; bottom: 6px; display: flex; align-items: flex-end; gap: 2px; font-size: 2.3rem; line-height: 1; pointer-events: none; }
.play[data-game="tanam"] .tm-basket b { font-size: 1.05rem; padding: 2px 8px; border-radius: 999px; background: var(--c); color: #fff; }
.play[data-game="tanam"] .tm-msg { margin: 0; width: min(100%, 460px); min-height: 2.7em; text-align: center; font-weight: 800; color: var(--muted); line-height: 1.3; }
.play[data-game="tanam"] .tm-ctl { display: flex; gap: 10px; width: min(100%, 460px); }
.play[data-game="tanam"] .tm-ctl .ti-btn { flex: 1 1 0; min-width: 0; min-height: 76px; padding: 8px 6px; flex-direction: column; gap: 0; font-size: 1.15rem; line-height: 1.15; }
.play[data-game="tanam"] .tm-ctl .ti-btn b { font-size: 1.9rem; line-height: 1.1; }
.play[data-game="tanam"] .tm-ctl .ti-btn.is-hint { outline: 4px solid var(--sun); outline-offset: 3px; }
.play[data-game="tanam"] .tm-ctl .ti-btn.is-wrong { animation: tm-shake var(--dur-ui-max) var(--ease-in-out); }
@keyframes tm-shake { 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
.play[data-game="tanam"] .tm-dot {
  position: absolute; left: calc(var(--x) * 1% - 27px); top: calc(var(--y) * 1% - 27px); display: grid; place-items: center; width: 54px; height: 54px;
  border: 4px dashed #fff; border-radius: 50%; background: rgba(255, 255, 255, 0.35); box-shadow: 0 0 0 3px var(--c); color: #fff; font-weight: 800; font-size: 1.4rem; cursor: pointer; transition: transform var(--dur-ui-max) var(--ease-out);
  animation: tm-pulse 1.4s var(--ease-in-out) infinite;
}
@keyframes tm-pulse { 50% { opacity: 0.55; } }
.play[data-game="tanam"] .tm-dot.is-filled { animation: none; transform: scale(0.5); border-style: solid; border-color: #fff; background: var(--good); box-shadow: 0 0 0 3px var(--good); transition: transform var(--dur-ui-max) var(--ease-out); }
.play[data-game="tanam"] .tm-dot.is-wrong { animation: tm-shake var(--dur-ui-max) var(--ease-in-out); }
.play[data-game="tanam"] .tm-pill { position: absolute; left: calc(var(--x) * 1%); top: calc(var(--y) * 1% - 16px); padding: 4px 10px; border-radius: 14px; border: 3px solid var(--good); background: #fff; font-weight: 800; font-size: 0.95rem; line-height: 1.2; white-space: nowrap; }
.play[data-game="tanam"] .tm-tray .ti-chip.is-gone { display: none; }
.play[data-game="tanam"] .tm-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.play[data-game="tanam"] .tm-opt { display: flex; align-items: center; justify-content: center; gap: 10px; }
.play[data-game="tanam"] .tm-em { flex: none; white-space: nowrap; font-size: 2.2rem; line-height: 1; }
@media (prefers-reduced-motion: reduce) {
  .play[data-game="tanam"] .tm-dot { animation: none; }
  .play[data-game="tanam"] .tm-st, .play[data-game="tanam"] .tm-plant { transform: none; }
}
`;

  // ---------- satu pemandangan ----------
  function makeScene(opts) {
    const box = h('div', { class: 'ti-scene', style: opts.width ? '--sw:' + opts.width + 'px' : null, html: sceneMarkup() });
    const svgEl = box.querySelector('.tm-svg');
    const q = (s) => svgEl.querySelector(s);
    const stages = [...svgEl.querySelectorAll('.tm-st')];
    const roots = [...svgEl.querySelectorAll('.tm-r')];
    const seed = q('.tm-seed');
    const flash = (cls, ms, ctx) => {
      svgEl.classList.remove(cls); void svgEl.getBoundingClientRect(); svgEl.classList.add(cls);
      if (ms) ctx.after(ms, () => svgEl.classList.remove(cls));
    };
    return {
      box, svgEl, flash,
      setStage(n) {
        stages.forEach((s, i) => s.classList.toggle('is-on', i === n));
        roots.forEach((r) => r.classList.toggle('is-on', n >= +r.dataset.r));
        seed.classList.toggle('is-on', n === 0);
      },
      cls(name, on) { svgEl.classList.toggle(name, on); },
    };
  }

  TI.register({
    id: 'tanam',
    title: 'Ayo Menanam',
    cat: 'sains',
    icon: '🌱',
    desc: 'Siram dan jemur tanamanmu setiap hari sampai berbuah tomat.',
    start(ctx) {
      TI.style('tanam', CSS);
      const reduced = TI.reduced();
      const total = ctx.isTK ? 8 : 9;

      // ---------- bagian 1: menanam dan panen ----------
      async function grow() {
        const sc = makeScene({});
        const dayEl = h('b', null, '1');
        const chipW = h('span', { class: 'tm-chip', 'aria-label': 'Air hari ini' }, '💧', h('i', null, '✓'));
        const chipS = h('span', { class: 'tm-chip', 'aria-label': 'Cahaya hari ini' }, '☀️', h('i', null, '✓'));
        const stageEl = h('span', { class: 'tm-stage' }, 'Biji');
        const panel = h('div', { class: 'tm-panel' }, h('span', { class: 'tm-day' }, 'Hari ke-', dayEl), chipW, chipS, stageEl);
        const msg = h('p', { class: 'tm-msg', 'aria-live': 'polite' }, 'Biji tomat sudah ditanam. Siram dan jemur dulu ya.');
        const bSiram = h('button', { type: 'button', class: 'ti-btn', style: '--c:#2f8fe0' }, h('b', null, '💧'), 'Siram');
        const bJemur = h('button', { type: 'button', class: 'ti-btn', style: '--c:#e8890c' }, h('b', null, '☀️'), 'Jemur');
        const bTidur = h('button', { type: 'button', class: 'ti-btn', style: '--c:#5b52c9' }, h('b', null, '🌙'), 'Tidur');
        const ctl = h('div', { class: 'tm-ctl' }, bSiram, bJemur, bTidur);
        const cnt = h('b', null, '0');
        const basket = h('div', { class: 'tm-basket', hidden: true, 'aria-label': 'Keranjang tomat' }, '🧺', cnt);
        const fruits = FRUITS.map(([x, y], i) => h('button', { type: 'button', class: 'tm-fruit', style: '--x:' + (x / 3).toFixed(2) + ';--y:' + (y / 3).toFixed(2), hidden: true, 'aria-label': 'Tomat ' + (i + 1) }, h('span', { class: 'tm-tom pop-in', style: '--i:' + i })));
        sc.box.append(...fruits, basket);
        ctx.el.append(panel, sc.box, msg, ctl);
        ctx.ask('Siram dan jemur tanamanmu setiap hari, lalu Tidur.');

        let day = 1, slept = 0, stage = 0, watered = false, sunned = false, busy = false, lastBad = false;
        sc.setStage(0);

        function refresh() {
          dayEl.textContent = String(Math.min(day, 12));
          chipW.classList.toggle('is-done', watered); chipS.classList.toggle('is-done', sunned);
          stageEl.textContent = STAGE_NAME[stage];
          [bSiram, bJemur, bTidur].forEach((b) => { b.disabled = busy; b.classList.remove('is-hint'); });
          if (!busy && (ctx.isTK || lastBad)) (!watered ? bSiram : !sunned ? bJemur : bTidur).classList.add('is-hint');
        }
        const say = (t) => { msg.textContent = t; };

        bSiram.addEventListener('click', () => {
          if (busy) return;
          if (watered) {
            say('Kebanyakan air, akarnya bisa busuk!');
            ctx.wrong(bSiram, { say: 'Kebanyakan air, akarnya bisa busuk!' });
            return;
          }
          watered = true;
          sc.cls('is-wet', true);
          sc.flash('is-pour', 1000, ctx);
          ctx.sfx('splash');
          say('Tanahnya jadi basah. Segar!');
          refresh();
        });
        bJemur.addEventListener('click', () => {
          if (busy) return;
          if (sunned) {
            say('Kepanasan, daunnya bisa kering!');
            ctx.wrong(bJemur, { say: 'Kepanasan, daunnya bisa kering!' });
            return;
          }
          sunned = true;
          sc.cls('is-sunny', true);
          ctx.after(1100, () => sc.cls('is-sunny', false));
          ctx.sfx('whoosh');
          say('Hangat! Tanamanmu kena cahaya matahari.');
          refresh();
        });

        // pesan pagi: ditampilkan dan dibacakan; kalau tanaman sudah berbuah, tunggu sampai selesai dibacakan
        async function announce(text) {
          say(text);
          if (stage >= 5) await ctx.sayWait(text); else ctx.say(text);
        }
        async function morningGrow(to) {
          if (to === 3) ctx.correct(null, { say: 'Hebat! Setengah jalan, terus naik ke tahap berbunga!' }); stage = to;
          sc.setStage(stage);
          sc.flash('is-grow', 700, ctx);
          ctx.sfx('benar');
        }

        bTidur.addEventListener('click', async () => {
          if (busy) return;
          busy = true; refresh();
          const ok = watered && sunned;
          say('Selamat malam. Tanamanmu tidur...');
          ctx.sfx('whoosh');
          sc.cls('is-sunny', false); sc.cls('is-pour', false);
          sc.cls('is-night', true);
          await ctx.wait(reduced ? 500 : 1100);
          if (!ctx.alive) return;
          sc.cls('is-night', false); sc.cls('is-wet', false);
          slept++; day = slept + 1;
          lastBad = !ok;
          const capped = slept >= 12 && stage < 5;
          if (ok) {
            sc.cls('is-droop', false);
            await morningGrow(capped ? 5 : stage + 1);
            await announce(capped ? CAP_MSG : STAGE_MSG[stage]);
          } else {
            const why = !watered && !sunned ? 'Tanamanmu belum diberi air dan cahaya, jadi layu dan tidak tumbuh.'
              : !watered ? 'Tanamanmu kurang air, jadi layu dan tidak tumbuh. Besok siram ya!'
                : 'Tanamanmu kurang cahaya matahari, jadi layu dan tidak tumbuh. Besok jemur ya!';
            sc.cls('is-droop', true);
            if (capped) {
              sc.cls('is-droop', false);
              await morningGrow(5);
              await announce(CAP_MSG);
            } else { say(why); ctx.wrong(null, { say: why }); }
          }
          watered = false; sunned = false;
          ctx.progress(stage, total);
          if (stage >= 5) { await ctx.wait(300); busy = false; refresh(); harvestMode(); return; }
          await ctx.wait(700);
          busy = false; refresh();
        });

        let doneHarvest = null;
        const harvested = new Promise((res) => { doneHarvest = res; });
        function harvestMode() {
          ctl.hidden = true; panel.hidden = true;
          basket.hidden = false;
          ctx.ask('Ayo panen! Ketuk tomatnya.');
          say('Tomatnya sudah matang. Ketuk satu per satu untuk dimasukkan ke keranjang.');
          let n = 0;
          fruits.forEach((f) => {
            f.hidden = false;
            f.addEventListener('click', async () => {
              if (f.dataset.done) return;
              f.dataset.done = '1';
              ctx.sfx('pop');
              const a = f.getBoundingClientRect(), b = basket.getBoundingClientRect();
              if (reduced) f.style.opacity = '0';
              else {
                f.style.transition = 'transform 450ms var(--ease-in-out), opacity 150ms ease 300ms'; // motion-ok: tomat jatuh ke keranjang, perayaan
                f.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2 - 4) + 'px) scale(0.7)';
                f.style.opacity = '0';
              }
              n++;
              cnt.textContent = String(n);
              ctx.progress(5 + n / FRUITS.length, total);
              if (n === FRUITS.length) { await ctx.wait(500); await ctx.correct(null, { say: 'Hore, panen berhasil!' }); doneHarvest(); }
            });
          });
        }
        refresh();
        ctx.progress(0, total);
        await harvested;
      }

      // ---------- bagian 2 (SD): pasang label bagian tumbuhan ----------
      async function labelParts() {
        ctx.clear();
        ctx.ask('Pasang label bagian tumbuhan. Ketuk label, lalu ketuk titiknya, atau seret.');
        const sc = makeScene({});
        sc.setStage(5); sc.cls('is-label', true);
        const lines = h('div', { class: 'tm-lines', 'aria-hidden': 'true', html: '<svg viewBox="0 0 300 300" width="100%" height="100%"></svg>' });
        const lineSvg = lines.firstChild;
        sc.box.append(lines);
        const slots = PARTS.map((p) => {
          const el = h('div', { class: 'tm-dot', style: '--x:' + (p.x / 3).toFixed(2) + ';--y:' + (p.y / 3).toFixed(2) });
          sc.box.append(el);
          return { id: p.id, el, label: 'Titik ' + p.label };
        });
        const tray = h('div', { class: 'ti-tray tm-tray' });
        ctx.el.append(sc.box, tray);
        await ctx.place({
          tray,
          pieces: PARTS.map((p) => ({ id: p.id, label: p.label, target: p.id, say: p.label })),
          slots,
          move: false,
          onStep: (done) => ctx.progress(6 + done / PARTS.length, total),
          onPlace: (piece, slot) => {
            const p = PARTS.find((x) => x.id === piece.id);
            slot.el.textContent = '✓';
            const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ln.setAttribute('x1', p.x); ln.setAttribute('y1', p.y); ln.setAttribute('x2', p.px);
            ln.setAttribute('y2', p.py); ln.setAttribute('stroke', '#0e9f6e'); ln.setAttribute('stroke-width', '3'); ln.setAttribute('stroke-linecap', 'round');
            lineSvg.append(ln);
            sc.box.append(h('span', { class: 'tm-pill pop-in', style: '--x:' + (p.side === 'r' ? (p.px / 3).toFixed(2) : '2') + ';--y:' + (p.py / 3).toFixed(2) }, p.label));
          },
        });
      }

      // ---------- bagian 3: soal ----------
      async function quiz() {
        const qs = ctx.isTK
          ? [
            { q: 'Tumbuhan butuh apa supaya tumbuh?', answer: 'air', opts: [{ value: 'air', node: h('span', { class: 'tm-opt' }, h('span', { class: 'tm-em' }, '💧☀️'), 'Air dan cahaya matahari'), say: 'Air dan cahaya matahari' }, { value: 'permen', node: h('span', { class: 'tm-opt' }, h('span', { class: 'tm-em' }, '🍬'), 'Permen'), say: 'Permen' }, { value: 'ponsel', node: h('span', { class: 'tm-opt' }, h('span', { class: 'tm-em' }, '📱'), 'Ponsel'), say: 'Ponsel' }], layout: 'is-col' },
            { q: 'Bagian tumbuhan yang ada di dalam tanah?', answer: 'Akar', opts: ['Akar', 'Bunga', 'Buah'] },
          ]
          : [
            { q: 'Daun membuat makanan dengan bantuan cahaya matahari. Proses ini disebut?', answer: 'Fotosintesis', opts: ['Fotosintesis', 'Penguapan', 'Pembekuan'], layout: 'is-col' },
            { q: 'Fungsi akar adalah?', answer: 'Menyerap air dari tanah', opts: ['Menyerap air dari tanah', 'Membuat bunga', 'Menangkap cahaya'], layout: 'is-col' },
          ];
        const base = ctx.isTK ? 6 : 7;
        for (let i = 0; i < qs.length && ctx.alive; i++) {
          ctx.progress(base + i, total);
          ctx.clear();
          const sc = makeScene({ width: 190 });
          sc.setStage(5); sc.cls('is-label', true);
          ctx.el.append(sc.box);
          ctx.ask(qs[i].q);
          await ctx.choose({ options: shuffle(qs[i].opts), answer: qs[i].answer, layout: qs[i].layout });
        }
      }

      return (async () => {
        await grow();
        if (!ctx.alive) return;
        if (ctx.isSD) await labelParts();
        if (!ctx.alive) return;
        await quiz();
        if (!ctx.alive) return;
        ctx.progress(total, total);
        ctx.finish({
          stars: ctx.mistakes <= 2 ? 3 : ctx.mistakes <= 6 ? 2 : 1,
          lesson: 'Tumbuhan butuh air, cahaya matahari, dan tanah yang baik. Dengan izin Allah, biji kecil bisa menjadi tanaman yang berbuah.',
        });
      })();
    },
  });
})();
